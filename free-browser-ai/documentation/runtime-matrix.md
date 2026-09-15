# Runtime Matrix

Free Browser AI downloads model artifacts directly from the listed public sources. It does not bundle model weights or send prompts to an application backend.

| Provider | Model | Tier | Approx. download | Public source | License | Browser requirements |
| --- | --- | --- | --- | --- | --- | --- |
| Transformers.js | `onnx-community/Qwen2.5-0.5B-Instruct` | Lightweight | 750 MiB | https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct | Apache-2.0 upstream Qwen2.5 license | Modern browser; CPU/WASM works, with WebGPU optional for acceleration. |
| Transformers.js | `onnx-community/Qwen2.5-1.5B-Instruct` | Powerful | 1,700 MiB | https://huggingface.co/onnx-community/Qwen2.5-1.5B-Instruct | Apache-2.0 upstream Qwen2.5 license | Modern browser; CPU/WASM works, with WebGPU optional for acceleration. |
| WebLLM | `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` | Lightweight | 945 MiB | https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC | Apache-2.0 upstream Qwen2.5 license | Current browser with WebGPU; allow roughly 945 MiB of GPU memory. |
| WebLLM | `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | Powerful | 1,630 MiB | https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC | Apache-2.0 upstream Qwen2.5 license | Current browser with WebGPU; allow roughly 1,630 MiB of GPU memory. |

The packages and models were selected for their documented browser chat support and Apache-2.0 compatibility with this MIT project. If model weights are redistributed rather than downloaded by the user, retain the applicable Apache license and notices.

## Validation Status

- The Transformers.js entries are ONNX conversions tagged for Transformers.js browser text generation. The application selects their q4 browser artifacts; estimates include the model and supporting tokenizer files.
- The WebLLM model IDs are included in the installed WebLLM prebuilt configuration and use the provider's WebGPU execution path. Their estimates match the prebuilt q4f16 resource requirement rounded to the nearest MiB.
- Manual runtime validation requires a WebGPU-capable browser for WebLLM and a non-WebGPU browser for its unavailability path.

## Generation Profiles

All Qwen2.5 Instruct entries use the same recommended profile: temperature `0.7`, top-p `0.8`, repetition penalty `1.05`, and a 256-token response limit. The Qwen model cards document the instruction-tuned models and their chat-template use; the installed Transformers.js and WebLLM contracts support these sampling options. Users can override these values per Provider Model in Settings and restore the recommendation at any time.

## Dependency Audit

`npm audit` currently reports four high-severity findings without an upstream fix in optional Node-side `onnxruntime-node` and `sharp` dependencies pulled by `@huggingface/transformers`. Free Browser AI dynamically imports its browser runtime and does not use those Node-side packages in the browser bundle. The known limitation was accepted for this release and must be re-evaluated when upgrading dependencies.
