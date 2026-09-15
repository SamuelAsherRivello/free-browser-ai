import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import viteConfig from "../../vite.config.js";
import { addProviderModel, removeProviderModel, restoreState, saveState, storageKey } from "../src/state.js";
import { effectiveGenerationProfile, modelFor, modelsFor, providerModelKey } from "../src/catalog.js";
import { RichContent } from "../src/rich-content.js";

const appRoot = new URL("../", import.meta.url);
const memoryStorage = () => { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; };

test("builds for the Free Browser AI GitHub Pages path", () => {
  if (viteConfig.base !== "/free-browser-ai/") throw new Error("The GitHub Pages build must use the Free Browser AI path.");
});

test("catalog exposes a separate validated model for each provider", () => {
  if (!modelFor("transformers", modelsFor("transformers")[0].id)) throw new Error("Missing Transformers.js model.");
  if (!modelFor("webllm", modelsFor("webllm")[0].id)) throw new Error("Missing WebLLM model.");
  for (const [provider, model] of [["transformers", "onnx-community/Qwen2.5-0.5B-Instruct"], ["webllm", "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"]]) if (modelFor(provider, model)?.recommendedProfile.maxNewTokens !== 256) throw new Error("Catalog model profile is missing.");
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

test("generation profiles preserve valid model-specific overrides and discard invalid values", () => {
  const storage = memoryStorage();
  const key = providerModelKey("transformers", "onnx-community/Qwen2.5-0.5B-Instruct");
  storage.setItem(storageKey, JSON.stringify({ providerModels: [], conversations: [], generationProfiles: { [key]: { temperature: 0.45, topP: 2 } } }));
  const restored = restoreState(storage);
  const profile = effectiveGenerationProfile("transformers", "onnx-community/Qwen2.5-0.5B-Instruct", restored.generationProfiles[key]);
  if (profile.temperature !== 0.45 || profile.topP !== 0.8) throw new Error("Invalid or cross-model generation settings were not resolved safely.");
});

test("the selected workspace tab persists while Chat is the first-visit default", () => {
  const empty = restoreState(memoryStorage());
  if (empty.view !== "chat") throw new Error("Chat must be the default workspace tab.");
  const storage = memoryStorage();
  saveState({ providerModels: [], conversations: [], activeConversationId: null, view: "settings" }, storage);
  if (restoreState(storage).view !== "settings") throw new Error("The selected workspace tab was not restored.");
});

test("chat content renders supported Markdown and fenced code", () => {
  const content = ["# Heading", "", "- first", "- second", "", "> quoted", "", "`inline`", "", "| Name | Value |", "| --- | --- |", "| model | local |", "", "```js", "const answer = 42;", "```"].join("\n");
  const rendered = renderToStaticMarkup(createElement(RichContent, null, content));
  for (const text of ["<h1>Heading</h1>", "<li>first</li>", "<blockquote>", "<code>inline</code>", "<table>", 'class="code_language">js</span>', "const answer = 42;"]) if (!rendered.includes(text)) throw new Error(`Markdown content was not rendered: ${text}`);
});

test("chat content leaves raw HTML inert and removes unsafe links", () => {
  const rendered = renderToStaticMarkup(createElement(RichContent, null, '<script>alert("unsafe")</script>\n\n[unsafe](javascript:alert(1))'));
  const safeLink = renderToStaticMarkup(createElement(RichContent, null, "[safe](https://example.com)"));
  if (!rendered.includes("&lt;script&gt;")) throw new Error("Raw HTML must remain visible as text.");
  if (rendered.includes('href="javascript:')) throw new Error("Unsafe links must not be rendered as destinations.");
  if (!safeLink.includes('href="https://example.com"')) throw new Error("HTTPS links must remain navigable.");
});

test("workspace declares the required accessible chat behavior", async () => {
  const [page, app, adapters, transformerWorker, styles] = await Promise.all(["index.html", "src/App.jsx", "src/adapters.js", "src/transformers.worker.js", "src/style.css"].map((file) => readFile(new URL(file, appRoot), "utf8")));
  for (const text of ["<title>Free Browser AI</title>", 'id="content_layer"', 'id="ui_layer"']) if (!page.includes(text)) throw new Error(`Missing page shell: ${text}`);
  for (const role of ["corner_top_left", "corner_top_right", "corner_bottom_left", "corner_bottom_right"]) if (!app.includes(`corner ${role}`)) throw new Error(`Missing ${role} corner.`);
  for (const text of ["About", "Provider Models", "Add Conversation", "Submit (Enter)", "Shift+Enter adds a new line", "Retry original prompt", "clipboard.writeText", "Reset local workspace", "role=\"tablist\"", "<RichContent>{message.content}</RichContent>"]) if (!app.includes(text)) throw new Error(`Missing workspace behavior: ${text}`);
  for (const dependency of ["transformers.worker.js", "webllm.worker.js", "@mlc-ai/web-llm", "CreateWebWorkerMLCEngine", "navigator.gpu", "webLlmModelDownloadMiB", "interruptGenerate"]) if (!adapters.includes(dependency)) throw new Error(`Missing runtime adapter behavior: ${dependency}`);
  if (!transformerWorker.includes("qwenChatTemplate") || !transformerWorker.includes("repetition_penalty")) throw new Error("Transformers.js must apply the Qwen chat template and generation profile.");
  for (const text of ["Generation", "Temperature", "Top P", "Repetition penalty", "Response length", "Restore recommended settings", "type=\"range\""]) if (!app.includes(text)) throw new Error(`Missing generation settings behavior: ${text}`);
  for (const text of ["top_p", "repetition_penalty", "max_tokens"]) if (!adapters.includes(text)) throw new Error(`WebLLM generation profile was not mapped: ${text}`);
  if (!styles.includes("@media (max-width: 600px)")) throw new Error("The workspace needs a narrow viewport layout.");
  for (const text of ["workspace_header", "workspace_footer", "--workspace-gutter", "--workspace-gap", "flex: 1; min-height: 0", ".chat_panel { display: flex; flex: 1"]) if (!app.includes(text) && !styles.includes(text)) throw new Error(`Missing responsive workspace layout: ${text}`);
});
