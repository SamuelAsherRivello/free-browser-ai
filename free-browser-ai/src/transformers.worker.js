let generator;
let stopper;

self.onmessage = async ({ data }) => {
  try {
    if (data.type === "prepare") {
      const { pipeline } = await import("@huggingface/transformers");
      generator = await pipeline("text-generation", data.modelId, {
        dtype: "q4",
        progress_callback: (event) => self.postMessage({ type: "progress", text: event.status === "progress" ? `Loading model: ${Math.round(event.progress ?? 0)}%` : "Preparing Transformers.js..." }),
      });
      self.postMessage({ type: "prepared" });
      return;
    }

    if (data.type === "generate") {
      const { TextStreamer, InterruptableStoppingCriteria } = await import("@huggingface/transformers");
      stopper = new InterruptableStoppingCriteria();
      const streamer = new TextStreamer(generator.tokenizer, { skip_prompt: true, callback_function: (text) => self.postMessage({ type: "token", text }) });
      await generator(data.messages, { max_new_tokens: 512, do_sample: true, temperature: 0.7, streamer, stopping_criteria: stopper });
      self.postMessage({ type: "complete" });
      return;
    }

    if (data.type === "cancel") stopper?.interrupt();
    if (data.type === "release") { stopper?.interrupt(); generator = undefined; self.postMessage({ type: "released" }); }
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : "Transformers.js worker failed." });
  }
};
