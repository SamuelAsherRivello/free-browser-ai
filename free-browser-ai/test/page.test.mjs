import { readFile } from "node:fs/promises";
import test from "node:test";
import viteConfig from "../../vite.config.js";
import { addProviderModel, removeProviderModel, restoreState, saveState, storageKey } from "../src/state.js";
import { modelFor, modelsFor } from "../src/catalog.js";

const appRoot = new URL("../", import.meta.url);
const memoryStorage = () => { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; };

test("builds for the Free Browser AI GitHub Pages path", () => {
  if (viteConfig.base !== "/free-browser-ai/") throw new Error("The GitHub Pages build must use the Free Browser AI path.");
});

test("catalog exposes a separate validated model for each provider", () => {
  if (!modelFor("transformers", modelsFor("transformers")[0].id)) throw new Error("Missing Transformers.js model.");
  if (!modelFor("webllm", modelsFor("webllm")[0].id)) throw new Error("Missing WebLLM model.");
});

test("Provider Models reject duplicates and removal closes dependent conversations", () => {
  const [configuration] = addProviderModel([], "transformers", "onnx-community/Qwen2.5-0.5B-Instruct");
  if (!configuration.id) throw new Error("Provider Model needs an ID.");
  try { addProviderModel([configuration], configuration.provider, configuration.model); throw new Error("Duplicate was accepted."); } catch (error) { if (!error.message.includes("already configured")) throw error; }
  const remaining = removeProviderModel([configuration], [{ id: "a", providerModelId: configuration.id }, { id: "b", providerModelId: "other" }], configuration.id);
  if (remaining.providerModels.length || remaining.conversations.map((item) => item.id).join() !== "b") throw new Error("Removal must close only dependent conversations.");
});

test("saved Provider Models restore as needing preparation while conversations remain independent", () => {
  const storage = memoryStorage();
  saveState({ providerModels: [{ id: "model", provider: "webllm", model: "model-id", status: "ready", progress: "Ready", error: "" }], conversations: [{ id: "one", messages: [{ content: "one" }] }, { id: "two", messages: [{ content: "two" }] }], activeConversationId: "two", view: "settings" }, storage);
  const restored = restoreState(storage);
  if (restored.providerModels[0].status !== "needs-preparation" || restored.conversations[0].messages[0].content !== "one" || restored.activeConversationId !== "two") throw new Error("Persisted state was not restored correctly.");
  if (!storage.getItem(storageKey)) throw new Error("State was not saved.");
});

test("the selected workspace tab persists while Chat is the first-visit default", () => {
  const empty = restoreState(memoryStorage());
  if (empty.view !== "chat") throw new Error("Chat must be the default workspace tab.");
  const storage = memoryStorage();
  saveState({ providerModels: [], conversations: [], activeConversationId: null, view: "settings" }, storage);
  if (restoreState(storage).view !== "settings") throw new Error("The selected workspace tab was not restored.");
});

test("workspace declares the required accessible chat behavior", async () => {
  const [page, app, adapters, styles] = await Promise.all(["index.html", "src/App.jsx", "src/adapters.js", "src/style.css"].map((file) => readFile(new URL(file, appRoot), "utf8")));
  for (const text of ["<title>Free Browser AI</title>", 'id="content_layer"', 'id="ui_layer"']) if (!page.includes(text)) throw new Error(`Missing page shell: ${text}`);
  for (const role of ["corner_top_left", "corner_top_right", "corner_bottom_left", "corner_bottom_right"]) if (!app.includes(`corner ${role}`)) throw new Error(`Missing ${role} corner.`);
  for (const text of ["About", "Provider Models", "Add Conversation", "Submit (Enter)", "Shift+Enter adds a new line", "Retry original prompt", "clipboard.writeText", "Reset local workspace", "role=\"tablist\""]) if (!app.includes(text)) throw new Error(`Missing workspace behavior: ${text}`);
  for (const dependency of ["transformers.worker.js", "webllm.worker.js", "@mlc-ai/web-llm", "CreateWebWorkerMLCEngine", "navigator.gpu", "interruptGenerate"]) if (!adapters.includes(dependency)) throw new Error(`Missing runtime adapter behavior: ${dependency}`);
  if (!styles.includes("@media (max-width: 600px)")) throw new Error("The workspace needs a narrow viewport layout.");
});
