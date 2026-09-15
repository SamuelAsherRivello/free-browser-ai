export const providers = {
  transformers: {
    label: "Transformers.js",
    models: [{
      id: "onnx-community/Qwen2.5-0.5B-Instruct",
      label: "Qwen2.5 0.5B Instruct",
      source: "https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct",
    }],
  },
  webllm: {
    label: "WebLLM",
    models: [{
      id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
      label: "Qwen2.5 0.5B Instruct (q4f16)",
      source: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    }],
  },
};

export function modelsFor(providerId) {
  return providers[providerId]?.models ?? [];
}

export function modelFor(providerId, modelId) {
  return modelsFor(providerId).find((model) => model.id === modelId);
}
