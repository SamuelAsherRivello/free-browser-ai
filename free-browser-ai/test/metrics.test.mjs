import assert from "node:assert/strict";
import { test } from "node:test";
import { createResponseMetrics, startResponseMeasurement } from "../src/metrics.js";

const provider = "transformers";
const model = "onnx-community/Qwen2.5-0.5B-Instruct";

function configuredMetrics(rpc) {
  let clientOptions;
  const metrics = createResponseMetrics({
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_example",
    createSupabaseClient: (_url, _key, options) => {
      clientOptions = options;
      return { rpc };
    },
  });
  return { metrics, getClientOptions: () => clientOptions };
}

test("missing public configuration leaves analytics unavailable without creating a client", async () => {
  let created = false;
  const metrics = createResponseMetrics({ createSupabaseClient: () => { created = true; } });

  assert.equal(metrics.configured, false);
  assert.equal(await metrics.recordResponseMetric({ provider, model, durationMs: 1250 }), false);
  assert.deepEqual(await metrics.getResponseStats(), { status: "unavailable", overall: null, rows: [] });
  assert.equal(created, false);
});

test("metric submission sends only the validated provider, model, and duration", async () => {
  const calls = [];
  const { metrics, getClientOptions } = configuredMetrics(async (...args) => {
    calls.push(args);
    return { error: null };
  });

  assert.equal(await metrics.recordResponseMetric({ provider, model, durationMs: 1250 }), true);
  assert.deepEqual(calls, [["record_response_metric", {
    p_provider: provider,
    p_model: model,
    p_duration_ms: 1250,
  }]]);
  assert.deepEqual(getClientOptions().auth, {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  });
});

test("invalid metrics are rejected before an RPC request", async () => {
  let calls = 0;
  const { metrics } = configuredMetrics(async () => { calls += 1; return { error: null }; });

  assert.equal(await metrics.recordResponseMetric({ provider: "unknown", model, durationMs: 1000 }), false);
  assert.equal(await metrics.recordResponseMetric({ provider, model, durationMs: 0 }), false);
  assert.equal(await metrics.recordResponseMetric({ provider, model, durationMs: 3600001 }), false);
  assert.equal(await metrics.recordResponseMetric({ provider, model, durationMs: 1.5 }), false);
  assert.equal(calls, 0);
});

test("submission failures are swallowed and not retried", async () => {
  let calls = 0;
  const { metrics } = configuredMetrics(async () => {
    calls += 1;
    throw new Error("offline");
  });

  assert.equal(await metrics.recordResponseMetric({ provider, model, durationMs: 800 }), false);
  assert.equal(calls, 1);
});

test("analytics timeouts resolve safely without retrying", async () => {
  let calls = 0;
  const metrics = createResponseMetrics({
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_example",
    requestTimeoutMs: 1,
    createSupabaseClient: () => ({ rpc: () => { calls += 1; return new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 25)); } }),
  });

  assert.equal(await metrics.recordResponseMetric({ provider, model, durationMs: 800 }), false);
  assert.deepEqual(await metrics.getResponseStats(), { status: "unavailable", overall: null, rows: [] });
  assert.equal(calls, 2);
});

test("aggregate retrieval distinguishes populated, empty, and unavailable states", async () => {
  const payloads = [
    {
      data: {
        overall: { response_count: 3, average_response_ms: 1500 },
        by_provider_model: [{ provider, model, response_count: 3, average_response_ms: 1500 }],
      },
      error: null,
    },
    {
      data: { overall: { response_count: 0, average_response_ms: null }, by_provider_model: [] },
      error: null,
    },
    { data: null, error: new Error("unavailable") },
  ];
  const { metrics } = configuredMetrics(async (name, args) => {
    assert.equal(name, "get_response_stats");
    assert.equal(args, undefined);
    return payloads.shift();
  });

  assert.deepEqual(await metrics.getResponseStats(), {
    status: "ready",
    overall: { responseCount: 3, averageResponseMs: 1500 },
    rows: [{ provider, model, responseCount: 3, averageResponseMs: 1500 }],
  });
  assert.deepEqual(await metrics.getResponseStats(), {
    status: "empty",
    overall: { responseCount: 0, averageResponseMs: null },
    rows: [],
  });
  assert.deepEqual(await metrics.getResponseStats(), { status: "unavailable", overall: null, rows: [] });
});

test("malformed aggregate payload is treated as unavailable", async () => {
  const { metrics } = configuredMetrics(async () => ({
    data: { overall: { response_count: 1, average_response_ms: 200 }, by_provider_model: [{ prompt: "must not appear" }] },
    error: null,
  }));

  assert.deepEqual(await metrics.getResponseStats(), { status: "unavailable", overall: null, rows: [] });
});

test("a completed response submits one rounded monotonic duration", async () => {
  const samples = [];
  const times = [100.4, 1350.8];
  const measurement = startResponseMeasurement({
    provider,
    model,
    now: () => times.shift(),
    recordResponseMetric: async (sample) => { samples.push(sample); return true; },
  });

  measurement.complete();
  measurement.complete();
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(samples, [{ provider, model, durationMs: 1250 }]);
});

test("failed or stopped attempts submit nothing unless completion is declared", async () => {
  const samples = [];
  startResponseMeasurement({
    provider,
    model,
    now: () => 100,
    recordResponseMetric: async (sample) => { samples.push(sample); return true; },
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(samples, []);
});

test("a retry uses a fresh measurement and rejected telemetry stays isolated", async () => {
  const samples = [];
  const rejected = startResponseMeasurement({
    provider,
    model,
    now: (() => { const times = [0, 500]; return () => times.shift(); })(),
    recordResponseMetric: async (sample) => { samples.push(sample); throw new Error("offline"); },
  });
  const retry = startResponseMeasurement({
    provider,
    model,
    now: (() => { const times = [1000, 1750]; return () => times.shift(); })(),
    recordResponseMetric: async (sample) => { samples.push(sample); return true; },
  });

  rejected.complete();
  retry.complete();
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(samples, [
    { provider, model, durationMs: 500 },
    { provider, model, durationMs: 750 },
  ]);
});
