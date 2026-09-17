import { createElement as h, useEffect, useState } from "react";
import { modelFor, providers } from "./catalog.js";
import { responseMetrics } from "./metrics.js";

const loadingStats = { status: "loading", overall: null, rows: [] };

export function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs)) return "—";
  return durationMs < 1000 ? `${Math.round(durationMs)} ms` : `${(durationMs / 1000).toFixed(2)} s`;
}

export function StatsContent({ stats = loadingStats }) {
  const content = [];

  if (stats.status === "loading") {
    content.push(h("p", { className: "stats_state", role: "status", "aria-live": "polite", key: "state" }, "Loading response statistics…"));
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
      h("div", { className: "stats_table_wrapper", key: "table" },
        h("table", { className: "stats_table" }, [
          h("caption", { key: "caption" }, "Response time by provider and model"),
          h("thead", { key: "head" }, h("tr", null, [
            h("th", { scope: "col", key: "provider" }, "Provider"),
            h("th", { scope: "col", key: "model" }, "Model"),
            h("th", { scope: "col", key: "responses" }, "Responses"),
            h("th", { scope: "col", key: "average" }, "Average response time"),
          ])),
          h("tbody", { key: "body" }, stats.rows.map((row) => h("tr", { key: `${row.provider}:${row.model}` }, [
            h("td", { key: "provider" }, providers[row.provider]?.label ?? row.provider),
            h("td", { key: "model" }, modelFor(row.provider, row.model)?.label ?? row.model),
            h("td", { key: "responses" }, row.responseCount),
            h("td", { key: "average" }, formatDuration(row.averageResponseMs)),
          ]))),
        ])),
    );
  }

  return h("section", { className: "panel settings_panel stats_panel", "aria-labelledby": "stats-title" }, [
    h("h1", { id: "stats-title", key: "title" }, "Stats"),
    h("h2", { className: "tab_subheading", key: "subtitle" }, "Assistant response time"),
    h("p", { className: "stats_privacy", key: "privacy" }, "Conversations and inference stay in this browser. After a successful response, shared analytics receives only the provider, model, and elapsed duration. Prompts, responses, identities, device identifiers, and application timestamps are not stored in the analytics data store."),
    h("p", { className: "stats_caveat", key: "caveat" }, "These are unverified anonymous community measurements, not benchmark-grade results."),
    ...content,
  ]);
}

export function Stats({ metrics = responseMetrics }) {
  const [stats, setStats] = useState(loadingStats);

  useEffect(() => {
    let active = true;
    void metrics.getResponseStats().then((result) => {
      if (active) setStats(result);
    });
    return () => { active = false; };
  }, [metrics]);

  return h(StatsContent, { stats });
}
