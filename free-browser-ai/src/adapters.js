import { modelFor } from "./catalog.js";

function transformerAdapter(modelId, onProgress, signal) {
  const worker = new Worker(new URL("./transformers.worker.js", import.meta.url), { type: "module" });
  let prepared;
  let generate;
  worker.onmessage = ({ data }) => {
    if (data.type === "progress") onProgress(data.text, Number.parseInt(data.text.match(/(\d{1,3})%/)?.[1], 10));
    if (data.type === "prepared") prepared?.resolve();
    if (data.type === "token") generate?.onToken(data.text);
    if (data.type === "complete") generate?.resolve();
    if (data.type === "error") { prepared?.reject(new Error(data.message)); generate?.reject(new Error(data.message)); }
  };
  signal?.addEventListener("abort", () => { prepared?.reject(new Error("Preparation cancelled.")); worker.terminate(); }, { once: true });
  return {
    async prepare() {
      await new Promise((resolve, reject) => { prepared = { resolve, reject }; worker.postMessage({ type: "prepare", modelId }); });
    },
    generate(messages, profile, onToken) {
      const task = new Promise((resolve, reject) => { generate = { resolve, reject, onToken }; worker.postMessage({ type: "generate", messages, profile }); });
      return { task, cancel: () => worker.postMessage({ type: "cancel" }) };
    },
    release() { worker.postMessage({ type: "release" }); worker.terminate(); },
  };
}

function abortable(promise, signal) {
  if (!signal) return promise;
  return Promise.race([promise, new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("Preparation cancelled.")), { once: true }))]);
}

export async function prepareAdapter(provider, modelId, onProgress, signal) {
  if (provider === "transformers") {
    const adapter = transformerAdapter(modelId, onProgress, signal);
    await adapter.prepare();
    return adapter;
  }

  if (provider === "webllm") {
    if (!navigator.gpu) throw new Error("WebLLM requires WebGPU, which is unavailable in this browser.");
    onProgress("Checking WebGPU support...");
    const gpuAdapter = await navigator.gpu.requestAdapter();
    if (!gpuAdapter) throw new Error("WebLLM could not access a WebGPU adapter. Enable hardware acceleration, then retry.");
    const [{ CreateWebWorkerMLCEngine, prebuiltAppConfig }, worker] = await Promise.all([
      import("@mlc-ai/web-llm"),
      new Worker(new URL("./webllm.worker.js", import.meta.url), { type: "module" }),
    ]);
    try {
      const model = prebuiltAppConfig.model_list.find((item) => item.model_id === modelId);
      if (!model) throw new Error("The selected WebLLM model is not available in this installed runtime.");
      const missingFeature = model?.required_features?.find((feature) => !gpuAdapter.features.has(feature));
      if (missingFeature) throw new Error(`WebLLM requires the WebGPU feature ${missingFeature}, which this device does not support.`);
      const downloadSize = modelFor(provider, modelId)?.downloadMiB;
      onProgress(`Downloading WebLLM model files${downloadSize ? ` (up to ${downloadSize} MiB)` : ""}...`, 0);
      const workerFailure = new Promise((_, reject) => {
        worker.onerror = (event) => reject(new Error(`WebLLM worker failed: ${event.error?.message || event.message || "unknown error"}`));
        worker.onmessageerror = () => reject(new Error("WebLLM worker returned an unreadable message."));
      });
      const engine = await abortable(Promise.race([CreateWebWorkerMLCEngine(worker, modelId, { initProgressCallback: (report) => {
        const percent = Math.round(report.progress * 100);
        const detail = downloadSize ? `${percent}% of setup; model download up to ${downloadSize} MiB` : `${percent}% of setup`;
        onProgress(`${report.text || "Preparing WebLLM..."} (${detail})`, percent);
      } }), workerFailure]), signal);
      return {
        async generate(messages, profile, onToken) {
          const stream = await engine.chat.completions.create({ messages, stream: true, temperature: profile.temperature, top_p: profile.topP, repetition_penalty: profile.repetitionPenalty, max_tokens: profile.maxNewTokens });
          return { task: (async () => { for await (const chunk of stream) onToken(chunk.choices[0]?.delta?.content || ""); })(), cancel: () => engine.interruptGenerate() };
        },
        async release() { await engine.unload(); worker.terminate(); },
      };
    } catch (error) { worker.terminate(); throw error; }
  }

  throw new Error("The selected provider is not available.");
}
