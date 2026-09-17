import { createElement as h, useEffect, useState } from "react";
import { modelFor, providers } from "./catalog.js";
import { responseMetrics } from "./metrics.js";

const loadingStats = { status: "loading", overall: null, rows: [] };

export function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs)) return "-";
  return durationMs < 1000 ? `${Math.round(durationMs)} ms` : `${(durationMs / 1000).toFixed(2)} s`;
}

export function StatsContent({ stats = loadingStats, embedded = false }) {
  const content = [];

  if (stats.status === "loading") {
    content.push(h("p", { className: "stats_state", role: "status", "aria-live": "polite", key: "state" }, "Loading response statistics..."));
  } else if (stats.status === "empty") {
    content.push(h("p", { className: "stats_state", role: "status", key: "state" }, "No completed response measurements yet."));
  } else if (stats.status !== "ready") {
    content.push(h("p", { className: "stats_state error", role: "status", key: "state" }, "Response statistics are unavailable. Chat remains fully usable."));
  } else {
    content.push(
      h("section", { className: "stats_summary", "aria-label": "Overall response statistics", key: "summary" }, [
        h("span", { key: "label" }, "Average assistant response time"),
        h("strong", { key: "average" }, formatDuration(stats.overall?.averageResponseMs)),
        h("span", { key: "count" }, `${stats.overall?.responseCount ?? 0} completed responses`),
      ]),
      h("div", { className: "stats_rows", role: "table", "aria-label": "Response time by provider and model", key: "rows" }, [
        h("div", { className: "stats_row stats_row_header", role: "row", key: "header" }, [
          h("span", { role: "columnheader", key: "provider" }, "Provider"),
          h("span", { role: "columnheader", key: "model" }, "Model"),
          h("span", { role: "columnheader", key: "responses" }, "Responses"),
          h("span", { role: "columnheader", key: "average" }, "Average response time"),
        ]),
        ...stats.rows.map((row) => h("div", { className: "stats_row", role: "row", key: `${row.provider}:${row.model}` }, [
          h("span", { role: "cell", key: "provider" }, providers[row.provider]?.label ?? row.provider),
          h("span", { role: "cell", key: "model" }, modelFor(row.provider, row.model)?.label ?? row.model),
          h("span", { role: "cell", key: "responses" }, `${row.responseCount}`),
          h("span", { role: "cell", key: "average" }, formatDuration(row.averageResponseMs)),
        ])),
      ]),
    );
  }

  return h("section", { className: embedded ? "stats_panel embedded_stats" : "panel settings_panel stats_panel", "aria-labelledby": "stats-title" }, [
    h("h1", { id: "stats-title", key: "title" }, "Stats"),
    h("h2", { className: "tab_subheading", key: "subtitle" }, "Assistant response time"),
    h("p", { className: "stats_privacy", key: "privacy" }, "Conversations and inference stay in this browser. After a successful response, shared analytics receives only the provider, model, and elapsed duration. Prompts, responses, identities, device identifiers, and application timestamps are not stored in the analytics data store."),
    h("p", { className: "stats_caveat", key: "caveat" }, "These are unverified anonymous community measurements, not benchmark-grade results."),
    ...content,
  ]);
}

export function Stats({ metrics = responseMetrics, embedded = false }) {
  const [stats, setStats] = useState(loadingStats);

  useEffect(() => {
    let active = true;
    void metrics.getResponseStats().then((result) => {
      if (active) setStats(result);
    });
    return () => { active = false; };
  }, [metrics]);

  return h(StatsContent, { stats, embedded });
}
