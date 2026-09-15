export const providers = {
  transformers: {
    label: "Transformers.js",
    models: [
      { id: "onnx-community/Qwen2.5-0.5B-Instruct", label: "Qwen2.5 0.5B Instruct", tier: "Lightweight", downloadMiB: 750, source: "https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct", recommendedProfile: { temperature: 0.7, topP: 0.8, repetitionPenalty: 1.05, maxNewTokens: 256 } },
      { id: "onnx-community/Qwen2.5-1.5B-Instruct", label: "Qwen2.5 1.5B Instruct", tier: "Powerful", downloadMiB: 1700, source: "https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct", recommendedProfile: { temperature: 0.7, topP: 0.8, repetitionPenalty: 1.05, maxNewTokens: 256 } },
    ],
  },
  webllm: {
    label: "WebLLM",
    models: [
      { id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC", label: "Qwen2.5 0.5B Instruct (q4f16)", tier: "Lightweight", downloadMiB: 945, source: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC", recommendedProfile: { temperature: 0.7, topP: 0.8, repetitionPenalty: 1.05, maxNewTokens: 256 } },
      { id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", label: "Qwen2.5 1.5B Instruct (q4f16)", tier: "Powerful", downloadMiB: 1630, source: "https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC", recommendedProfile: { temperature: 0.7, topP: 0.8, repetitionPenalty: 1.05, maxNewTokens: 256 } },
    ],
  },
};

export function modelsFor(providerId) {
  return providers[providerId]?.models ?? [];
}

export function modelFor(providerId, modelId) {
  return modelsFor(providerId).find((model) => model.id === modelId);
}

export function modelOptionLabel(model) {
  return `${model.label} - ${model.tier} - approx. ${model.downloadMiB.toLocaleString()} MiB`;
}

export const generationProfileLimits = {
  temperature: { min: 0.1, max: 1.2, step: 0.05 },
  topP: { min: 0.1, max: 1, step: 0.05 },
  repetitionPenalty: { min: 1, max: 1.3, step: 0.01 },
  maxNewTokens: { min: 64, max: 512, step: 32 },
};

export function providerModelKey(providerId, modelId) {
  return `${providerId}:${modelId}`;
}

export function isValidGenerationProfileValue(name, value) {
  const limit = generationProfileLimits[name];
  return Boolean(limit) && Number.isFinite(value) && value >= limit.min && value <= limit.max;
}

export function effectiveGenerationProfile(providerId, modelId, overrides = {}) {
  const recommendedProfile = modelFor(providerId, modelId)?.recommendedProfile;
  if (!recommendedProfile) return null;
  return Object.fromEntries(Object.entries(recommendedProfile).map(([name, value]) => [name, isValidGenerationProfileValue(name, overrides[name]) ? overrides[name] : value]));
}
