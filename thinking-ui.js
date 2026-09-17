const STORAGE_KEY = "thinking-display";
const select = document.getElementById("thinkingDisplay");
const chat = document.getElementById("chat");

const rawByNode = new WeakMap();
const renderedByNode = new WeakMap();

function getMode() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "show" ? "show" : "hide";
  } catch {
    return "hide";
  }
}

function setMode(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch {}
}

function stripPartialOpeningTag(text) {
  const pos = text.lastIndexOf("<");
  if (pos < 0) return text;
  const tail = text.slice(pos);
  return /^<t(?:h(?:i(?:n(?:k)?)?)?)?$/i.test(tail) ? text.slice(0, pos) : text;
}

function hideThinking(raw) {
  let text = String(raw ?? "");
  text = text.replace(/<think\b[^>]*>[\s\S]*?<\/think\s*>/gi, "");

  const open = text.search(/<think\b[^>]*>/i);
  if (open >= 0) text = text.slice(0, open);

  text = stripPartialOpeningTag(text);
  text = text.replace(/<\/?think\b[^>]*>/gi, "");
  return text.replace(/^\s+/, "");
}

function showThinking(raw) {
  return String(raw ?? "")
    .replace(/<think\b[^>]*>\s*/gi, "【思考】\n")
    .replace(/\s*<\/think\s*>\s*/gi, "\n\n【回答】\n")
    .replace(/^\s+/, "");
}

function renderText(raw) {
  if (getMode() === "show") return showThinking(raw);
  const answer = hideThinking(raw);
  if (!answer && /<think\b/i.test(String(raw ?? ""))) return "考え中…";
  return answer;
}

function applyToNode(node) {
  if (!(node instanceof HTMLElement)) return;

  const current = node.textContent ?? "";
  const previousRendered = renderedByNode.get(node);

  // app.js writes the raw aggregate on every streaming update. Distinguish that
  // from our own rendering so the original output remains available for toggling.
  if (!rawByNode.has(node) || current !== previousRendered) {
    rawByNode.set(node, current);
  }

  const raw = rawByNode.get(node) ?? current;
  const next = renderText(raw);
  renderedByNode.set(node, next);

  if (current !== next) node.textContent = next;
}

function scan() {
  document.querySelectorAll(".message.assistant > div").forEach(applyToNode);
}

if (select) {
  select.value = getMode();
  select.addEventListener("change", () => {
    setMode(select.value === "show" ? "show" : "hide");
    scan();
  });
}

if (chat) {
  const observer = new MutationObserver(scan);
  observer.observe(chat, { childList: true, subtree: true, characterData: true });
}

scan();
