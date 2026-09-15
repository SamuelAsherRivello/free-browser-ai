export const storageKey = "free-browser-ai.state.v2";

export function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

export function restoreState(storage = localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(storageKey));
    if (!Array.isArray(saved?.providerModels) || !Array.isArray(saved?.conversations)) throw new Error("Invalid saved state");
    return {
      providerModels: saved.providerModels.map((item) => ({ ...item, status: "needs-preparation", progress: "Prepare this model to use it after reload.", error: "" })),
      conversations: saved.conversations,
      activeConversationId: saved.activeConversationId ?? saved.conversations[0]?.id ?? null,
      view: saved.view === "settings" ? "settings" : "chat",
    };
  } catch {
    return { providerModels: [], conversations: [], activeConversationId: null, view: "chat" };
  }
}

export function saveState(state, storage = localStorage) {
  storage.setItem(storageKey, JSON.stringify({
    providerModels: state.providerModels.map(({ progress, error, status, ...item }) => ({ ...item, status: "needs-preparation" })),
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    view: state.view,
  }));
}

export function addProviderModel(items, provider, model) {
  if (items.some((item) => item.provider === provider && item.model === model)) throw new Error("This Provider Model is already configured.");
  return [...items, { id: makeId(), provider, model, status: "loading", progress: "Preparing local runtime...", error: "" }];
}

export function removeProviderModel(providerModels, conversations, providerModelId) {
  return {
    providerModels: providerModels.filter((item) => item.id !== providerModelId),
    conversations: conversations.filter((item) => item.providerModelId !== providerModelId),
  };
}
