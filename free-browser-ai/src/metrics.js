import { createClient } from "@supabase/supabase-js";
import { modelFor } from "./catalog.js";

const maximumDurationMs = 3_600_000;

function unavailableStats() {
  return { status: "unavailable", overall: null, rows: [] };
}

function normalizeCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function normalizeAverage(value, allowNull = false) {
  if (allowNull && value === null) return null;
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

async function settleWithin(value, timeoutMs) {
  let timeoutId;
  try {
    return await Promise.race([
      Promise.resolve(value),
      new Promise((_, reject) => { timeoutId = setTimeout(() => reject(new Error("Analytics request timed out.")), timeoutMs); }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeStats(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return unavailableStats();
  const responseCount = normalizeCount(data.overall?.response_count);
  const averageResponseMs = normalizeAverage(data.overall?.average_response_ms, responseCount === 0);
  if (responseCount === null || averageResponseMs === undefined || !Array.isArray(data.by_provider_model)) return unavailableStats();

  const rows = [];
  for (const row of data.by_provider_model) {
    const rowCount = normalizeCount(row?.response_count);
    const rowAverage = normalizeAverage(row?.average_response_ms);
    if (typeof row?.provider !== "string" || typeof row?.model !== "string" || rowCount === null || rowCount === 0 || rowAverage === undefined) return unavailableStats();
    if (!modelFor(row.provider, row.model)) return unavailableStats();
    rows.push({ provider: row.provider, model: row.model, responseCount: rowCount, averageResponseMs: rowAverage });
  }

  return {
    status: responseCount === 0 ? "empty" : "ready",
    overall: { responseCount, averageResponseMs },
    rows,
  };
}

export function createResponseMetrics({
  url,
  publishableKey,
  createSupabaseClient = createClient,
  requestTimeoutMs = 8000,
} = {}) {
  if (!url || !publishableKey) {
    return {
      configured: false,
      recordResponseMetric: async () => false,
      getResponseStats: async () => unavailableStats(),
    };
  }

  let client;
  try {
    client = createSupabaseClient(url, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  } catch {
    return {
      configured: false,
      recordResponseMetric: async () => false,
      getResponseStats: async () => unavailableStats(),
    };
  }

  return {
    configured: true,
    async recordResponseMetric({ provider, model, durationMs }) {
      if (!modelFor(provider, model) || !Number.isInteger(durationMs) || durationMs < 1 || durationMs > maximumDurationMs) return false;
      try {
        const { error } = await settleWithin(client.rpc("record_response_metric", {
          p_provider: provider,
          p_model: model,
          p_duration_ms: durationMs,
        }), requestTimeoutMs);
        return !error;
      } catch {
        return false;
      }
    },
    async getResponseStats() {
      try {
        const { data, error } = await settleWithin(client.rpc("get_response_stats"), requestTimeoutMs);
        return error ? unavailableStats() : normalizeStats(data);
      } catch {
        return unavailableStats();
      }
    },
  };
}

export function startResponseMeasurement({
  provider,
  model,
  now = () => performance.now(),
  recordResponseMetric = (sample) => responseMetrics.recordResponseMetric(sample),
}) {
  const startedAt = now();
  let completed = false;

  return {
    complete() {
      if (completed) return;
      completed = true;
      const durationMs = Math.max(1, Math.round(now() - startedAt));
      void Promise.resolve()
        .then(() => recordResponseMetric({ provider, model, durationMs }))
        .catch(() => undefined);
    },
  };
}

const environment = import.meta.env ?? {};

export const responseMetrics = createResponseMetrics({
  url: environment.VITE_SUPABASE_URL,
  publishableKey: environment.VITE_SUPABASE_PUBLISHABLE_KEY,
});
