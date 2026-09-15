import { useEffect, useRef, useState } from "react";
import versionText from "../../version.txt?raw";
import { prepareAdapter } from "./adapters.js";
import { modelFor, modelsFor, providers } from "./catalog.js";
import { addProviderModel, makeId, removeProviderModel, restoreState, saveState, storageKey } from "./state.js";

const repositoryUrl = "https://github.com/SamuelAsherRivello/free-browser-ai";

function labelFor(configuration) {
  const model = modelFor(configuration.provider, configuration.model);
  return `${providers[configuration.provider]?.label ?? configuration.provider}: ${model?.label ?? configuration.model}`;
}

function GitHubMark() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.82c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.51.57.82 1.29.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .22.15.48.55.4A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" /></svg>;
}

export function App() {
  const initial = useRef(restoreState()).current;
  const [providerModels, setProviderModels] = useState(initial.providerModels);
  const [conversations, setConversations] = useState(initial.conversations);
  const [activeConversationId, setActiveConversationId] = useState(initial.activeConversationId);
  const [view, setView] = useState(initial.view);
  const [addingConversation, setAddingConversation] = useState(false);
  const [selectedConfiguration, setSelectedConfiguration] = useState("");
  const [provider, setProvider] = useState("transformers");
  const [model, setModel] = useState(modelsFor("transformers")[0].id);
  const [settingsError, setSettingsError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const adapters = useRef(new Map());
  const cancellations = useRef(new Map());
  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const availableModels = providerModels.filter((item) => item.status !== "loading");

  useEffect(() => saveState({ providerModels, conversations, activeConversationId, view }), [providerModels, conversations, activeConversationId, view]);
  useEffect(() => () => adapters.current.forEach((adapter) => adapter.release()), []);
  const updateProviderModel = (id, update) => setProviderModels((items) => items.map((item) => item.id === id ? update(item) : item));
  const updateConversation = (id, update) => setConversations((items) => items.map((item) => item.id === id ? update(item) : item));

  const prepare = async (configuration) => {
    for (const [id, adapter] of adapters.current) {
      if (id !== configuration.id) {
        void adapter.release();
        adapters.current.delete(id);
        updateProviderModel(id, (item) => ({ ...item, status: "needs-preparation", progress: "Released to keep browser memory available.", error: "" }));
      }
    }
    adapters.current.get(configuration.id)?.release();
    adapters.current.delete(configuration.id);
    updateProviderModel(configuration.id, (item) => ({ ...item, status: "loading", error: "", progress: "Preparing local runtime..." }));
    try {
      const adapter = await prepareAdapter(configuration.provider, configuration.model, (progress) => updateProviderModel(configuration.id, (item) => ({ ...item, progress })));
      adapters.current.set(configuration.id, adapter);
      updateProviderModel(configuration.id, (item) => ({ ...item, status: "ready", error: "", progress: "Ready" }));
      return adapter;
    } catch (error) {
      updateProviderModel(configuration.id, (item) => ({ ...item, status: "failed", error: error instanceof Error ? error.message : "Preparation failed.", progress: "Preparation failed" }));
      throw error;
    }
  };

  const addConfiguration = () => {
    setSettingsError("");
    try { setProviderModels(addProviderModel(providerModels, provider, model)); }
    catch (error) { setSettingsError(error.message); }
  };

  const removeConfiguration = (id) => {
    void adapters.current.get(id)?.release();
    adapters.current.delete(id);
    const next = removeProviderModel(providerModels, conversations, id);
    setProviderModels(next.providerModels);
    setConversations(next.conversations);
    if (!next.conversations.some((item) => item.id === activeConversationId)) setActiveConversationId(next.conversations[0]?.id ?? null);
  };

  const createConversation = () => {
    if (!selectedConfiguration) return;
    const conversation = { id: makeId(), title: `Conversation ${conversations.length + 1}`, providerModelId: selectedConfiguration, messages: [], status: "ready", phase: "", startedAt: null, error: "", retryPrompt: "" };
    setConversations((items) => [...items, conversation]);
    setActiveConversationId(conversation.id);
    setAddingConversation(false);
    setSelectedConfiguration("");
  };

  const closeConversation = (id) => {
    cancellations.current.get(id)?.();
    setConversations((items) => { const next = items.filter((item) => item.id !== id); if (id === activeConversationId) setActiveConversationId(next[0]?.id ?? null); return next; });
  };

  const send = async (submittedPrompt = prompt) => {
    const conversation = conversations.find((item) => item.id === activeConversationId);
    const configuration = providerModels.find((item) => item.id === conversation?.providerModelId);
    if (!conversation || !configuration || !submittedPrompt.trim() || conversation.status === "loading") return;
    const user = { id: makeId(), role: "user", content: submittedPrompt.trim() };
    const assistant = { id: makeId(), role: "assistant", content: "" };
    const history = [...conversation.messages, user];
    updateConversation(conversation.id, (item) => ({ ...item, messages: [...history, assistant], status: "loading", phase: "Assistant is thinking...", startedAt: Date.now(), error: "", retryPrompt: user.content }));
    setPrompt("");
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      let adapter = adapters.current.get(configuration.id);
      if (!adapter) {
        updateConversation(conversation.id, (item) => ({ ...item, phase: "Preparing model..." }));
        adapter = await prepare(configuration);
      }
      updateConversation(conversation.id, (item) => ({ ...item, phase: "Generating response..." }));
      const { task, cancel } = await adapter.generate(history.map(({ role, content }) => ({ role, content })), (piece) => updateConversation(conversation.id, (item) => ({ ...item, phase: "Generating response...", messages: item.messages.map((message) => message.id === assistant.id ? { ...message, content: message.content + piece } : message) })));
      cancellations.current.set(conversation.id, cancel);
      await task;
      updateConversation(conversation.id, (item) => ({ ...item, status: "ready", phase: "", startedAt: null, error: "" }));
    } catch (error) {
      updateConversation(conversation.id, (item) => ({ ...item, status: "stopped", phase: "", startedAt: null, error: error instanceof Error ? error.message : "Generation failed. Retry this prompt." }));
    } finally { cancellations.current.delete(conversation.id); }
  };

  const stop = () => {
    if (!activeConversation) return;
    cancellations.current.get(activeConversation.id)?.();
    updateConversation(activeConversation.id, (item) => ({ ...item, status: "stopped", phase: "", startedAt: null, error: "Generation stopped. You can retry the original prompt." }));
  };
  const copyText = async (text) => { try { await navigator.clipboard.writeText(text); setCopyFeedback("Copied to clipboard."); } catch { setCopyFeedback("Clipboard access was denied. Select and copy the text manually."); } };
  const reset = () => { localStorage.removeItem(storageKey); window.location.reload(); };
  const changeProvider = (nextProvider) => { setProvider(nextProvider); setModel(modelsFor(nextProvider)[0].id); };
  const version = versionText.trim().replace(/^version=/, "").replace(/^v/, "");

  return <main className="workspace" aria-label="Free Browser AI chat workspace">
    <nav className="top_navigation" aria-label="Workspace"><button type="button" aria-current={view === "chat" ? "page" : undefined} onClick={() => setView("chat")}>Chat</button><button type="button" aria-current={view === "settings" ? "page" : undefined} onClick={() => setView("settings")}>Settings</button></nav>
    {view === "settings" ? <Settings provider={provider} model={model} providerModels={providerModels} error={settingsError} onProvider={changeProvider} onModel={setModel} onAdd={addConfiguration} onPrepare={prepare} onRemove={removeConfiguration} /> : <Chat adding={addingConversation} setAdding={setAddingConversation} selected={selectedConfiguration} setSelected={setSelectedConfiguration} configurations={providerModels} conversations={conversations} active={activeConversation} setActive={setActiveConversationId} onCreate={createConversation} onClose={closeConversation} prompt={prompt} setPrompt={setPrompt} onSend={send} onStop={stop} onCopy={copyText} />}
    {copyFeedback && <p className="copy_feedback" role="status">{copyFeedback}</p>}
    <div className="corner corner_top_left"><span className="corner_title">Free Browser AI</span></div><div className="corner corner_top_right"><a href={repositoryUrl} aria-label="Free Browser AI project on GitHub"><GitHubMark /></a></div><div className="corner corner_bottom_right"><span className="corner_body">v{version}</span></div><div className="corner corner_bottom_left"><button type="button" className="settings_option" onClick={reset}>Reset app data</button><small>Clears app data and reloads. Downloaded model caches may remain.</small></div>
  </main>;
}

function Settings({ provider, model, providerModels, error, onProvider, onModel, onAdd, onPrepare, onRemove }) {
  return <section className="panel" aria-labelledby="settings-title"><h1 id="settings-title">Provider Models</h1><p>Models prepare on the first prompt, keeping browser memory free until needed.</p><div className="configuration_form"><label>Provider<select value={provider} onChange={(event) => onProvider(event.target.value)}>{Object.entries(providers).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label><label>Model<select value={model} onChange={(event) => onModel(event.target.value)}>{modelsFor(provider).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><button type="button" className="primary_button" onClick={onAdd}>Add Provider Model</button></div>{error && <p className="error" role="alert">{error}</p>}<div className="configuration_list">{providerModels.length === 0 ? <p>No Provider Models configured.</p> : providerModels.map((item) => <article className="configuration" key={item.id}><div><strong>{labelFor(item)}</strong><p className={`status ${item.status}`}>{item.progress}</p>{item.error && <p className="error" role="alert">{item.error}</p>}</div><div>{item.status !== "loading" && <button type="button" onClick={() => void onPrepare(item)}>Prepare</button>}<button type="button" onClick={() => onRemove(item.id)}>Remove</button></div></article>)}</div></section>;
}

function Chat({ adding, setAdding, selected, setSelected, configurations, conversations, active, setActive, onCreate, onClose, prompt, setPrompt, onSend, onStop, onCopy }) {
  const available = configurations.filter((item) => item.status !== "loading");
  return <section className="panel" aria-labelledby="chat-title"><div className="panel_heading"><div><h1 id="chat-title">Chat</h1><p>Private conversations run entirely in this browser.</p></div><button type="button" className="primary_button" onClick={() => setAdding(true)}>Add Conversation</button></div>{adding && <div className="new_conversation"><label>Provider Model<select value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">Select a Provider Model</option>{available.map((item) => <option key={item.id} value={item.id}>{labelFor(item)}</option>)}</select></label><button type="button" className="primary_button" disabled={!selected} onClick={onCreate}>Create Conversation</button>{available.length === 0 && <p className="error">Add a Provider Model in Settings first.</p>}</div>}{conversations.length > 0 && <div className="tab_list" role="tablist" aria-label="Conversations">{conversations.map((item) => <div className="tab_item" key={item.id}><button type="button" role="tab" aria-selected={item.id === active?.id} onClick={() => setActive(item.id)}>{item.title}</button><button type="button" aria-label={`Close ${item.title}`} onClick={() => onClose(item.id)}>Close</button></div>)}</div>}{active ? <Conversation conversation={active} configuration={configurations.find((item) => item.id === active.providerModelId)} prompt={prompt} setPrompt={setPrompt} onSend={onSend} onStop={onStop} onCopy={onCopy} /> : !adding && <p className="empty_state">Add a conversation, then choose a Provider Model.</p>}</section>;
}

function Conversation({ conversation, configuration, prompt, setPrompt, onSend, onStop, onCopy }) {
  const canSubmit = Boolean(configuration) && conversation.status !== "loading";
  const submit = (value) => onSend(value);
  return <section className="conversation" aria-label={conversation.title}><p className="model_label">{configuration ? labelFor(configuration) : "Removed Provider Model"}</p><div className="transcript" aria-live="polite">{conversation.messages.map((message) => <article className={`message ${message.role}`} key={message.id}><div><strong>{message.role === "user" ? "You" : "Assistant"}</strong><p>{message.content}</p></div><button type="button" onClick={() => onCopy(message.content)}>Copy</button></article>)}</div>{conversation.status === "loading" && <ThinkingStatus conversation={conversation} />}{conversation.error && <p className="error" role="alert">{conversation.error}</p>}{conversation.status === "stopped" && conversation.retryPrompt && <button type="button" onClick={() => submit(conversation.retryPrompt)}>Retry original prompt</button>}<form className="prompt_form" onSubmit={(event) => { event.preventDefault(); submit(); }}><label>Prompt<textarea value={prompt} disabled={!canSubmit} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && event.shiftKey) { event.preventDefault(); submit(event.currentTarget.value); } }} /></label><div><button type="submit" className="primary_button" disabled={!canSubmit || !prompt.trim()}>{conversation.status === "loading" ? "Submitting..." : "Submit (Shift+Enter)"}</button>{conversation.status === "loading" && <button type="button" onClick={onStop}>Stop</button>}</div>{!configuration ? <p className="error">This Provider Model was removed.</p> : null}</form></section>;
}

function ThinkingStatus({ conversation }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => { const interval = setInterval(() => setSeconds(Math.floor((Date.now() - conversation.startedAt) / 1000)), 250); return () => clearInterval(interval); }, [conversation.startedAt]);
  return <p className="thinking_status" role="status">{conversation.phase} {seconds > 0 ? `(${seconds}s)` : ""}</p>;
}
