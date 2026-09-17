/* Dependency-free static tests: node tests.cjs. No model download. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (name) => fs.readFileSync(path.join(__dirname, name), "utf8");
const html = read("index.html");
const styles = read("styles.css");
const app = read("app.js");
const thinking = read("thinking-ui.js");
const mobile = read("mobile-ui.js");
const sw = read("sw.js");

test("UI is split into static HTML, CSS and module app", () => {
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /src="\.\/thinking-ui\.js"/);
  assert.match(html, /src="\.\/mobile-ui\.js"/);
  assert.match(html, /MiniCPM5-2B · WebGPU優先/);
  assert.match(html, /MiniCPM-V 4\.6 · 画像対応/);
});

test("Transformers.js is pinned to the current WebGPU runtime", () => {
  assert.match(app, /@huggingface\/transformers@4\.3\.0/);
  assert.match(app, /device:\s*"webgpu"/);
  assert.match(app, /dtype:\s*MODELS\.text\.webgpu\.dtype/);
  assert.match(app, /dtype:\s*"q4f16"/);
});

test("MiniCPM5-2B WebGPU model and GPU feature gate are explicit", () => {
  assert.match(app, /RASMUS\/MiniCPM5-2B-ONNX/);
  assert.match(app, /navigator\.gpu/);
  assert.match(app, /requestAdapter/);
  assert.match(app, /shader-f16/);
});

test("WebGPU failure falls back to local GGUF/WASM", () => {
  assert.match(app, /openbmb\/MiniCPM5-2B-GGUF/);
  assert.match(app, /@wllama\/wllama@3\.6\.1/);
  assert.match(app, /falling back to WASM/);
  assert.match(app, /await loadWllama\("text"\)/);
});

test("vision mode remains MiniCPM-V and uses local wllama", () => {
  assert.match(app, /ggml-org\/MiniCPM-V-4\.6-GGUF/);
  assert.match(app, /supportInputModality\("image"\)/);
  assert.match(app, /await loadWllama\("vision"\)/);
});

test("generation is streamed and interruptible", () => {
  assert.match(app, /new TextStreamer/);
  assert.match(app, /callback_function/);
  assert.match(app, /new InterruptableStoppingCriteria/);
  assert.match(app, /stopping_criteria:\s*\[stopping\]/);
});

test("conversation storage stays in IndexedDB", () => {
  assert.match(app, /indexedDB\.open\("minicpm-webgpu-chat"/);
  assert.doesNotMatch(app, /api\.openai\.com|generativelanguage\.googleapis\.com|api\.anthropic\.com/i);
});

test("thinking display defaults to hidden and can be switched on", () => {
  assert.match(html, /id="thinkingDisplay"/);
  assert.match(html, /value="hide" selected>OFF · 回答だけ/);
  assert.match(html, /value="show">ON · 思考も表示/);
  assert.match(thinking, /STORAGE_KEY = "thinking-display"/);
  assert.match(thinking, /hideThinking/);
  assert.match(thinking, /showThinking/);
  assert.match(thinking, /MutationObserver/);
});

test("mobile layout prioritizes chat input and compact controls", () => {
  assert.match(html, /id="historyPanel"/);
  assert.match(html, /class="muted file-types"/);
  assert.match(mobile, /max-width: 800px/);
  assert.match(mobile, /historyPanel\.open = false/);
  assert.match(mobile, /Math\.min\(Math\.max\(input\.scrollHeight, 52\), 152\)/);
  assert.match(styles, /\.quick-actions\{flex-wrap:nowrap;overflow-x:auto/);
  assert.match(styles, /\.file-types\{display:none\}/);
  assert.match(styles, /#send\{min-width:78px;height:44px/);
});

test("service worker caches the complete app shell", () => {
  assert.match(sw, /minicpm-webgpu-v4/);
  assert.match(sw, /"\.\/styles\.css"/);
  assert.match(sw, /"\.\/app\.js"/);
  assert.match(sw, /"\.\/thinking-ui\.js"/);
  assert.match(sw, /"\.\/mobile-ui\.js"/);
  assert.match(sw, /cache\.addAll\(SHELL\)/);
});
