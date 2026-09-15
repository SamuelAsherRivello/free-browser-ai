# Runtime Matrix

Free Browser AI downloads model artifacts directly from the listed public sources. It does not bundle model weights or send prompts to an application backend.

| Provider | Model | Public source | License | Browser requirements |
| --- | --- | --- | --- | --- |
| Transformers.js | `onnx-community/Qwen2.5-0.5B-Instruct` | https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct | Apache-2.0 upstream Qwen2.5 license | Modern browser; CPU/WASM works, with WebGPU optional for acceleration. |
| WebLLM | `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` | https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC | Apache-2.0 upstream Qwen2.5 license | Current browser with WebGPU; allow roughly 945 MB of GPU memory. |

The packages and models were selected for their documented browser chat support and Apache-2.0 compatibility with this MIT project. If model weights are redistributed rather than downloaded by the user, retain the applicable Apache license and notices.

## Validation Status

- The Transformers.js model is an ONNX conversion tagged for Transformers.js browser text generation.
- The WebLLM model ID is included in WebLLM's prebuilt configuration and uses the provider's WebGPU execution path.
- Manual runtime validation requires a WebGPU-capable browser for WebLLM and a non-WebGPU browser for its unavailability path.

## Dependency Audit

`npm audit` currently reports four high-severity findings without an upstream fix in optional Node-side `onnxruntime-node` and `sharp` dependencies pulled by `@huggingface/transformers`. Free Browser AI dynamically imports its browser runtime and does not use those Node-side packages in the browser bundle. The known limitation was accepted for this release and must be re-evaluated when upgrading dependencies.
