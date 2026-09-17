const MOBILE_QUERY = "(max-width: 800px)";
const media = matchMedia(MOBILE_QUERY);
const historyPanel = document.getElementById("historyPanel");
const input = document.getElementById("input");
const actions = document.getElementById("actions");
const form = document.getElementById("form");

function applyMobileState() {
  document.documentElement.classList.toggle("mobile-layout", media.matches);
  if (media.matches && historyPanel) historyPanel.open = false;
}

function autoGrow() {
  if (!input || !media.matches) return;
  input.style.height = "auto";
  input.style.height = `${Math.min(Math.max(input.scrollHeight, 52), 152)}px`;
}

applyMobileState();
autoGrow();

media.addEventListener?.("change", () => {
  applyMobileState();
  autoGrow();
});

input?.addEventListener("input", autoGrow);
actions?.addEventListener("click", () => requestAnimationFrame(autoGrow));
form?.addEventListener("submit", () => setTimeout(autoGrow, 0));
window.addEventListener("pageshow", autoGrow);
