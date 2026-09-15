let generator;
let stopper;
const qwenChatTemplate = "{% for message in messages %}{{ '<|im_start|>' + message['role'] + '\n' + message['content'] + '<|im_end|>\n' }}{% endfor %}{% if add_generation_prompt %}{{ '<|im_start|>assistant\n' }}{% endif %}";

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
      await generator(data.messages, { max_new_tokens: data.profile.maxNewTokens, do_sample: true, temperature: data.profile.temperature, top_p: data.profile.topP, repetition_penalty: data.profile.repetitionPenalty, streamer, stopping_criteria: stopper, chat_template: qwenChatTemplate });
      self.postMessage({ type: "complete" });
      return;
    }

    if (data.type === "cancel") stopper?.interrupt();
    if (data.type === "release") { stopper?.interrupt(); generator = undefined; self.postMessage({ type: "released" }); }
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : "Transformers.js worker failed." });
  }
};
