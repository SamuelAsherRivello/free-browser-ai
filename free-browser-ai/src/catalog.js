export const providers = {
  transformers: {
    label: "Transformers.js",
    models: [{
      id: "onnx-community/SmolLM2-135M-ONNX",
      label: "SmolLM2 135M Instruct",
      source: "https://huggingface.co/onnx-community/SmolLM2-135M-ONNX",
    }],
  },
  webllm: {
    label: "WebLLM",
    models: [{
      id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
      label: "SmolLM2 360M Instruct (q4f16)",
      source: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC",
    }],
  },
};

export function modelsFor(providerId) {
  return providers[providerId]?.models ?? [];
}

export function modelFor(providerId, modelId) {
  return modelsFor(providerId).find((model) => model.id === modelId);
}
