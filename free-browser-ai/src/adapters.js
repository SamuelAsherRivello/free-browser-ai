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
    generate(messages, onToken) {
      const task = new Promise((resolve, reject) => { generate = { resolve, reject, onToken }; worker.postMessage({ type: "generate", messages }); });
      return { task, cancel: () => worker.postMessage({ type: "cancel" }) };
    },
    release() { worker.postMessage({ type: "release" }); worker.terminate(); },
  };
}

function abortable(promise, signal, cancel) {
  if (!signal) return promise;
  return Promise.race([promise, new Promise((_, reject) => signal.addEventListener("abort", () => { cancel(); reject(new Error("Preparation cancelled.")); }, { once: true }))]);
}

export async function prepareAdapter(provider, modelId, onProgress, signal) {
  if (provider === "transformers") {
    const adapter = transformerAdapter(modelId, onProgress, signal);
    await adapter.prepare();
    return adapter;
  }

  if (provider === "webllm") {
    if (!navigator.gpu) throw new Error("WebLLM requires WebGPU, which is unavailable in this browser.");
    const [{ CreateWebWorkerMLCEngine }, worker] = await Promise.all([
      import("@mlc-ai/web-llm"),
      new Worker(new URL("./webllm.worker.js", import.meta.url), { type: "module" }),
    ]);
    try {
      const engine = await abortable(CreateWebWorkerMLCEngine(worker, modelId, { initProgressCallback: (report) => onProgress(report.text || "Preparing WebLLM...", report.progress * 100) }), signal, () => worker.terminate());
      return {
        async generate(messages, onToken) {
          const stream = await engine.chat.completions.create({ messages, stream: true });
          return { task: (async () => { for await (const chunk of stream) onToken(chunk.choices[0]?.delta?.content || ""); })(), cancel: () => engine.interruptGenerate() };
        },
        async release() { await engine.unload(); worker.terminate(); },
      };
    } catch (error) { worker.terminate(); throw error; }
  }

  throw new Error("The selected provider is not available.");
}
