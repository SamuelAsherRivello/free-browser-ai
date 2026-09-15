import { useEffect, useRef, useState } from "react";
import versionText from "../../version.txt?raw";
import { prepareAdapter } from "./adapters.js";
import { effectiveGenerationProfile, generationProfileLimits, modelFor, modelOptionLabel, modelsFor, providerModelKey, providers } from "./catalog.js";
import { RichContent } from "./rich-content.js";
import { addProviderModel, makeId, removeProviderModel, restoreState, saveState, storageKey } from "./state.js";

const repositoryUrl = "https://github.com/SamuelAsherRivello/free-browser-ai";

function labelFor(configuration) {
  const model = modelFor(configuration.provider, configuration.model);
  return `${providers[configuration.provider]?.label ?? configuration.provider}: ${model?.label ?? configuration.model}`;
}

function chatModelLabelFor(configuration) {
  const model = modelFor(configuration.provider, configuration.model);
  const provider = configuration.provider === "transformers" ? "Transformer" : providers[configuration.provider]?.label ?? configuration.provider;
  const modelName = model?.label ?? configuration.model.split("/").pop() ?? configuration.model;
  const shortModel = modelName.match(/Qwen2\.5/)?.[0] ?? modelName.replace(/[- ]?(Instruct|ONNX|q4f16|MLC).*$/i, "").trim();
  return `${provider} - ${shortModel}`;
}

function GitHubMark() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.82c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.51.57.82 1.29.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .22.15.48.55.4A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" /></svg>;
}

function CopyIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="1" /><path d="M15 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h4" /></svg>;
}

export function App() {
  const initial = useRef(restoreState()).current;
  const [providerModels, setProviderModels] = useState(initial.providerModels);
  const [generationProfiles, setGenerationProfiles] = useState(initial.generationProfiles);
  const [editingConfigurationId, setEditingConfigurationId] = useState(null);
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
  const preparations = useRef(new Map());
  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const availableModels = providerModels.filter((item) => item.status === "ready");

  useEffect(() => saveState({ providerModels, conversations, activeConversationId, view, generationProfiles }), [providerModels, conversations, activeConversationId, view, generationProfiles]);
  useEffect(() => () => { adapters.current.forEach((adapter) => adapter.release()); preparations.current.forEach((controller) => controller.abort()); }, []);
  const updateProviderModel = (id, update) => setProviderModels((items) => items.map((item) => item.id === id ? update(item) : item));
  const updateConversation = (id, update) => setConversations((items) => items.map((item) => item.id === id ? update(item) : item));
  const updateGenerationProfile = (providerId, modelId, name, value) => setGenerationProfiles((profiles) => ({ ...profiles, [providerModelKey(providerId, modelId)]: { ...profiles[providerModelKey(providerId, modelId)], [name]: value } }));
  const restoreGenerationProfile = (providerId, modelId) => setGenerationProfiles((profiles) => { const next = { ...profiles }; delete next[providerModelKey(providerId, modelId)]; return next; });

  const prepare = async (configuration) => {
    preparations.current.get(configuration.id)?.abort(new Error("Preparation restarted."));
    const controller = new AbortController();
    preparations.current.set(configuration.id, controller);
    for (const [id, adapter] of adapters.current) {
      if (id !== configuration.id) {
        void adapter.release();
        adapters.current.delete(id);
        updateProviderModel(id, (item) => ({ ...item, status: "needs-preparation", progress: "Released to keep browser memory available.", error: "" }));
      }
    }
    adapters.current.get(configuration.id)?.release();
    adapters.current.delete(configuration.id);
    updateProviderModel(configuration.id, (item) => ({ ...item, status: "loading", error: "", progress: "Starting local runtime...", progressPercent: null, startedAt: Date.now() }));
    try {
      const adapter = await prepareAdapter(configuration.provider, configuration.model, (progress, progressPercent) => updateProviderModel(configuration.id, (item) => ({ ...item, progress, progressPercent: Number.isFinite(progressPercent) ? Math.round(progressPercent) : null })), controller.signal);
      adapters.current.set(configuration.id, adapter);
      updateProviderModel(configuration.id, (item) => ({ ...item, status: "ready", error: "", progress: "Ready", progressPercent: 100, startedAt: null }));
      return adapter;
    } catch (error) {
      const message = controller.signal.reason instanceof Error ? controller.signal.reason.message : error instanceof Error ? error.message : "Preparation failed.";
      updateProviderModel(configuration.id, (item) => ({ ...item, status: "failed", error: message, progress: "Preparation failed", progressPercent: null, startedAt: null }));
      throw error;
    } finally {
      if (preparations.current.get(configuration.id) === controller) preparations.current.delete(configuration.id);
    }
  };

  const addConfiguration = () => {
    setSettingsError("");
    try {
      const next = addProviderModel(providerModels, provider, model);
      setProviderModels(next);
    }
    catch (error) { setSettingsError(error.message); }
  };

  const removeConfiguration = (id) => {
    preparations.current.get(id)?.abort(new Error("Preparation cancelled because the Provider Model was removed."));
    preparations.current.delete(id);
    void adapters.current.get(id)?.release();
    adapters.current.delete(id);
    const next = removeProviderModel(providerModels, conversations, id);
    setProviderModels(next.providerModels);
    setConversations(next.conversations);
    if (!next.conversations.some((item) => item.id === activeConversationId)) setActiveConversationId(next.conversations[0]?.id ?? null);
  };

  const createConversation = () => {
    if (!selectedConfiguration) return;
    const conversation = { id: makeId(), title: `Conversation ${conversations.length + 1}`, providerModelId: selectedConfiguration, messages: [{ id: makeId(), role: "assistant", content: "Type your prompt below", isWelcome: true }], status: "ready", phase: "", startedAt: null, error: "", retryPrompt: "" };
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
    const history = [...conversation.messages.filter((message) => !message.isWelcome), user];
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
      const profile = effectiveGenerationProfile(configuration.provider, configuration.model, generationProfiles[providerModelKey(configuration.provider, configuration.model)]);
      if (!profile) throw new Error("This Provider Model is no longer supported. Select a current model in Settings.");
      const { task, cancel } = await adapter.generate(history.map(({ role, content }) => ({ role, content })), profile, (piece) => updateConversation(conversation.id, (item) => ({ ...item, phase: "Generating response...", messages: item.messages.map((message) => message.id === assistant.id ? { ...message, content: message.content + piece } : message) })));
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
    <nav className="top_navigation" aria-label="Workspace"><div className="top_navigation_tabs"><button type="button" title="Open project overview" aria-current={view === "about" ? "page" : undefined} onClick={() => setView("about")}>About</button><button type="button" title="Open workspace settings" aria-current={view === "settings" ? "page" : undefined} onClick={() => setView("settings")}>Settings</button><button type="button" title="Open workspace chat" aria-current={view === "chat" ? "page" : undefined} onClick={() => setView("chat")}>Chat</button></div><div className="workspace_brand corner corner_top_left"><span className="corner_title">Free Browser AI</span><a className="corner corner_top_right" href={repositoryUrl} aria-label="Free Browser AI project on GitHub"><GitHubMark /></a></div></nav>
    {view === "about" ? <About /> : view === "settings" ? <Settings provider={provider} model={model} providerModels={providerModels} generationProfiles={generationProfiles} editingConfigurationId={editingConfigurationId} error={settingsError} onProvider={changeProvider} onModel={setModel} onAdd={addConfiguration} onPrepare={prepare} onRemove={removeConfiguration} onGenerationChange={updateGenerationProfile} onRestoreGeneration={restoreGenerationProfile} onEdit={setEditingConfigurationId} onReset={reset} /> : <Chat adding={addingConversation} setAdding={setAddingConversation} selected={selectedConfiguration} setSelected={setSelectedConfiguration} configurations={providerModels} conversations={conversations} active={activeConversation} setActive={setActiveConversationId} onCreate={createConversation} onClose={closeConversation} prompt={prompt} setPrompt={setPrompt} onSend={send} onStop={stop} onCopy={copyText} />}
    {copyFeedback && <p className="copy_feedback" role="status">{copyFeedback}</p>}
    <footer className="workspace_footer"><div className="corner corner_bottom_left" aria-hidden="true" /><div className="corner corner_bottom_right"><span className="corner_body">v{version}</span></div></footer>
  </main>;
}

function About() {
  return <section className="panel settings_panel" aria-labelledby="about-title"><h1 id="about-title">About</h1><p>Free Browser AI is a privacy-first local chat workspace for experimenting with small language models directly in your browser. It keeps conversations on your device, lets you compare <a href="https://huggingface.co/docs/transformers.js/">Transformers.js</a> and <a href="https://webllm.mlc.ai/">WebLLM</a> runtimes, prepares models only when needed, and offers controls for managing provider models without a backend or cloud account.</p><h2 className="about_heading">Benefits</h2><ul className="about_list"><li>Runs model inference locally in supported browsers.</li><li>Keeps conversations and settings in local browser storage.</li><li>Lets you compare Transformers.js and WebLLM provider models.</li></ul><h2 className="about_heading">Drawbacks</h2><ul className="about_list"><li>Models must download before their first use.</li><li>WebLLM needs a compatible WebGPU-enabled browser.</li></ul></section>;
}

function Settings({ provider, model, providerModels, generationProfiles, editingConfigurationId, error, onProvider, onModel, onAdd, onPrepare, onRemove, onGenerationChange, onRestoreGeneration, onEdit, onReset }) {
  return <section className="panel settings_panel" aria-labelledby="settings-title">
    <h1 id="settings-title">Settings</h1>
    <h2 className="settings_subheading">Provider Models</h2>
    <p>Add a model, choose its generation settings, then prepare it for conversations.</p>
    <div className="configuration_form"><label>Provider<select value={provider} onChange={(event) => onProvider(event.target.value)}>{Object.entries(providers).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label><label>Model<select value={model} onChange={(event) => onModel(event.target.value)}>{modelsFor(provider).map((item) => <option key={item.id} value={item.id}>{modelOptionLabel(item)}</option>)}</select></label><button type="button" title="Add selected provider model" className="primary_button" onClick={onAdd}>Add Provider Model</button></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="configuration_list">{providerModels.length === 0 ? <p>No Provider Models configured.</p> : providerModels.map((item) => <ProviderModelCard key={item.id} item={item} profile={effectiveGenerationProfile(item.provider, item.model, generationProfiles[providerModelKey(item.provider, item.model)])} hasOverrides={Object.keys(generationProfiles[providerModelKey(item.provider, item.model)] || {}).length > 0} editing={editingConfigurationId === item.id} onPrepare={onPrepare} onRemove={onRemove} onChange={onGenerationChange} onRestore={onRestoreGeneration} onEdit={onEdit} />)}</div>
    <section className="reset_section" aria-labelledby="reset-title"><h2 id="reset-title">Persistence</h2><p>Remove saved conversations, Provider Models, and generation settings, then reload this page. Model files cached by browser runtimes may remain.</p><button type="button" title="Reset local workspace data" className="reset_button" onClick={onReset}>Reset local workspace</button></section>
  </section>;
}

function ProviderModelCard({ item, profile, hasOverrides, editing, onPrepare, onRemove, onChange, onRestore, onEdit }) {
  const showSettings = item.status !== "ready" || editing;
  return <article className="configuration"><div className="configuration_details"><strong>{labelFor(item)}</strong><PreparationStatus item={item} />{item.status === "loading" && <PreparationProgress percent={item.progressPercent} />}{item.error && <p className="error" role="alert">{item.error}</p>}{showSettings ? <GenerationSettings profile={profile} provider={item.provider} model={item.model} hasOverrides={hasOverrides} onChange={onChange} onRestore={onRestore} /> : <p className="generation_summary">Generation settings are configured.</p>}</div><div className="configuration_actions">{item.status === "needs-preparation" && <button type="button" title="Prepare this provider model" onClick={() => void onPrepare(item)}>Prepare</button>}{item.status === "failed" && <button type="button" title="Retry this provider model" onClick={() => void onPrepare(item)}>Retry</button>}{item.status === "ready" && <button type="button" title="Update this provider model settings" onClick={() => onEdit(editing ? null : item.id)}>{editing ? "Done" : "Update Settings"}</button>}<button type="button" title="Remove this provider model" onClick={() => onRemove(item.id)}>Remove</button></div></article>;
}

function LegacySettings({ provider, model, providerModels, generationProfiles, error, onProvider, onModel, onAdd, onPrepare, onRemove, onGenerationChange, onRestoreGeneration, onReset }) {
  const profile = effectiveGenerationProfile(provider, model, generationProfiles[providerModelKey(provider, model)]);
  const hasOverrides = Object.keys(generationProfiles[providerModelKey(provider, model)] || {}).length > 0;
  return <section className="panel settings_panel" aria-labelledby="settings-title"><h1 id="settings-title">Settings</h1><h2 className="settings_subheading">Provider Models</h2><p>Models prepare on the first prompt, keeping browser memory free until needed.</p><div className="configuration_form"><label>Provider<select value={provider} onChange={(event) => onProvider(event.target.value)}>{Object.entries(providers).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label><label>Model<select value={model} onChange={(event) => onModel(event.target.value)}>{modelsFor(provider).map((item) => <option key={item.id} value={item.id}>{modelOptionLabel(item)}</option>)}</select></label><button type="button" title="Add selected provider model" className="primary_button" onClick={onAdd}>Add Provider Model</button></div>{error && <p className="error" role="alert">{error}</p>}<div className="configuration_list">{providerModels.length === 0 ? <p>No Provider Models configured.</p> : providerModels.map((item) => <article className="configuration" key={item.id}><div><strong>{labelFor(item)}</strong><PreparationStatus item={item} />{item.status === "loading" && <PreparationProgress percent={item.progressPercent} />}{item.error && <p className="error" role="alert">{item.error}</p>}</div><div>{item.status !== "loading" && <button type="button" title="Prepare this provider model" onClick={() => void onPrepare(item)}>Prepare</button>}<button type="button" title="Remove this provider model" onClick={() => onRemove(item.id)}>Remove</button></div></article>)}</div><GenerationSettings profile={profile} provider={provider} model={model} hasOverrides={hasOverrides} onChange={onGenerationChange} onRestore={onRestoreGeneration} /><section className="reset_section" aria-labelledby="reset-title"><h2 id="reset-title">Persistence</h2><p>Remove saved conversations, Provider Models, and generation settings, then reload this page. Model files cached by browser runtimes may remain.</p><button type="button" title="Reset local workspace data" className="reset_button" onClick={onReset}>Reset local workspace</button></section></section>;
}

function GenerationSettings({ profile, provider, model, hasOverrides, onChange, onRestore }) {
  if (!profile) return null;
  const [expanded, setExpanded] = useState(true);
  const controls = [{ name: "temperature", label: "Temperature", help: "Lower values keep responses focused; higher values add variety." }, { name: "topP", label: "Top P", help: "Limits choices to the most likely words." }, { name: "repetitionPenalty", label: "Repetition penalty", help: "Higher values discourage repeated phrases." }, { name: "maxNewTokens", label: "Response length", help: "Limits the number of generated response tokens." }];
  return <section className="generation_section" aria-label="Generation settings"><button type="button" className="generation_toggle" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}><span aria-hidden="true">{expanded ? "v" : ">"}</span> Generation</button>{expanded && <><p>{hasOverrides ? "Using custom settings for" : "Using recommended settings for"} {modelFor(provider, model)?.label}.</p><div className="generation_controls">{controls.map(({ name, label, help }) => { const limit = generationProfileLimits[name]; return <label key={name} className="generation_control"><span>{label} <output>{profile[name]}</output></span><input type="range" min={limit.min} max={limit.max} step={limit.step} value={profile[name]} aria-describedby={`${providerModelKey(provider, model)}-${name}-help`} onChange={(event) => onChange(provider, model, name, Number(event.target.value))} /><small id={`${providerModelKey(provider, model)}-${name}-help`}>{help} Range {limit.min} to {limit.max}.</small></label>; })}</div><button type="button" onClick={() => onRestore(provider, model)}>Restore recommended settings</button></>}</section>;
}

function LegacyGenerationSettings({ profile, provider, model, hasOverrides, onChange, onRestore }) {
  if (!profile) return null;
  const controls = [{ name: "temperature", label: "Temperature", help: "Lower values keep responses focused; higher values add variety." }, { name: "topP", label: "Top P", help: "Limits choices to the most likely words." }, { name: "repetitionPenalty", label: "Repetition penalty", help: "Higher values discourage repeated phrases." }, { name: "maxNewTokens", label: "Response length", help: "Limits the number of generated response tokens." }];
  return <section className="generation_section" aria-labelledby="generation-title"><div><h2 id="generation-title">Generation</h2><p>{hasOverrides ? "Using custom settings for" : "Using recommended settings for"} {modelFor(provider, model)?.label}.</p></div><div className="generation_controls">{controls.map(({ name, label, help }) => { const limit = generationProfileLimits[name]; return <label key={name} className="generation_control"><span>{label} <output>{profile[name]}</output></span><input type="range" min={limit.min} max={limit.max} step={limit.step} value={profile[name]} aria-describedby={`${name}-help`} onChange={(event) => onChange(provider, model, name, Number(event.target.value))} /><small id={`${name}-help`}>{help} Range {limit.min} to {limit.max}.</small></label>; })}</div><button type="button" onClick={() => onRestore(provider, model)}>Restore recommended settings</button></section>;
}

function PreparationStatus({ item }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (item.status !== "loading" || !item.startedAt) return undefined;
    const update = () => setSeconds(Math.floor((Date.now() - item.startedAt) / 1000));
    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [item.status, item.startedAt]);
  return <p className={`status ${item.status}`}>{item.progress}{item.status === "loading" && item.startedAt ? ` (${seconds} secs)` : ""}</p>;
}

function PreparationProgress({ percent }) {
  return <progress className="preparation_progress" aria-label="Model preparation progress" value={Number.isFinite(percent) ? percent : undefined} max="100" />;
}

function Chat({ adding, setAdding, selected, setSelected, configurations, conversations, active, setActive, onCreate, onClose, prompt, setPrompt, onSend, onStop, onCopy }) {
  const available = configurations.filter((item) => item.status === "ready");
  return <section className="panel chat_panel" aria-labelledby="chat-title"><div className="panel_heading"><div><h1 id="chat-title">Chat</h1><p>Private conversations run entirely in this browser.</p></div><button type="button" title="Create a new conversation" className="primary_button" onClick={() => setAdding(true)}>Add Conversation</button></div>{adding && <div className="new_conversation"><label>Provider Model<select value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">Select a Provider Model</option>{available.map((item) => <option key={item.id} value={item.id}>{labelFor(item)}</option>)}</select></label><button type="button" title="Create selected conversation tab" className="primary_button" disabled={!selected} onClick={onCreate}>Create</button></div>}{conversations.length > 0 && <div className="tab_list" role="tablist" aria-label="Conversations">{conversations.map((item) => <div className="tab_item" key={item.id}><button type="button" title="Open this conversation tab" role="tab" aria-selected={item.id === active?.id} onClick={() => setActive(item.id)}>{item.title}</button><button type="button" className="close_tab" title="Close this conversation tab" aria-label={`Close ${item.title}`} onClick={() => onClose(item.id)}>x</button></div>)}</div>}{active ? <Conversation conversation={active} configuration={configurations.find((item) => item.id === active.providerModelId)} prompt={prompt} setPrompt={setPrompt} onSend={onSend} onStop={onStop} onCopy={onCopy} /> : !adding && <p className="empty_state">Add a conversation, then choose a Provider Model.</p>}</section>;
}

function Conversation({ conversation, configuration, prompt, setPrompt, onSend, onStop, onCopy }) {
  const canSubmit = Boolean(configuration) && conversation.status !== "loading";
  const submit = (value) => onSend(value);
  useEffect(() => {
    if (conversation.status !== "loading") return undefined;
    const handleKeyDown = (event) => { if (event.key === "Escape") { event.preventDefault(); onStop(); } };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [conversation.status, onStop]);
  return <section className="conversation" aria-label={conversation.title}><div className="model_label" title={configuration?.model ?? "Removed Provider Model"}><strong>Provider Model</strong><span>{configuration ? chatModelLabelFor(configuration) : "Removed Provider Model"}</span></div><div className="transcript" aria-live="polite">{conversation.messages.map((message) => { const isPending = message.role === "assistant" && !message.content && conversation.status === "loading"; return <article className={`message ${message.role}`} key={message.id}><div><strong>{message.role === "user" ? "You" : "Assistant"}</strong>{isPending ? <ThinkingStatus conversation={conversation} /> : <RichContent>{message.content}</RichContent>}</div><button type="button" className="copy_button" aria-label={`Copy ${message.role} message`} title="Copy message to clipboard" onClick={() => onCopy(message.content)}><CopyIcon /></button></article>; })}</div>{conversation.error && <p className="error" role="alert">{conversation.error}</p>}{conversation.status === "stopped" && conversation.retryPrompt && <button type="button" title="Retry the original prompt" onClick={() => submit(conversation.retryPrompt)}>Retry original prompt</button>}<form className="prompt_form" onSubmit={(event) => { event.preventDefault(); submit(); }}><label>Prompt<textarea value={prompt} disabled={!canSubmit} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(event.currentTarget.value); } }} /></label><p className="prompt_hint">Shift+Enter adds a new line.</p><div><button type="submit" title="Send prompt to model" className="primary_button" disabled={!canSubmit || !prompt.trim()}>{conversation.status === "loading" ? "Submitting..." : "Submit (Enter)"}</button>{conversation.status === "loading" && <button type="button" title="Stop current response generation" onClick={onStop}>Stop (Esc)</button>}</div>{!configuration ? <p className="error">This Provider Model was removed.</p> : null}</form></section>;
}

function ThinkingStatus({ conversation }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => { const interval = setInterval(() => setSeconds(Math.floor((Date.now() - conversation.startedAt) / 1000)), 250); return () => clearInterval(interval); }, [conversation.startedAt]);
  return <p className="thinking_status" role="status">{conversation.phase} {seconds > 0 ? `(${seconds}s)` : ""}</p>;
}
