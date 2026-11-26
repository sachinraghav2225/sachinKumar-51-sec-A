const API_URL = "https://official-joke-api.appspot.com/random_joke";

const setupEl = document.getElementById("setup");
const punchEl = document.getElementById("punchline");
const statusEl = document.getElementById("status");
const newBtn = document.getElementById("newBtn");
const revealBtn = document.getElementById("revealBtn");
const copyBtn = document.getElementById("copyBtn");

let current = null;

async function loadJoke() {
  newBtn.disabled = true;
  revealBtn.disabled = true;
  copyBtn.disabled = true;
  statusEl.textContent = "Loading...";
  punchEl.textContent = "";
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    current = await res.json();
    setupEl.textContent = current.setup;
    statusEl.textContent = "";
    revealBtn.disabled = false;
    copyBtn.disabled = false;
  } catch (err) {
    setupEl.textContent = "Could not load a joke.";
    statusEl.textContent = "Check your internet connection and try again.";
    current = null;
  } finally {
    newBtn.disabled = false;
  }
}

revealBtn.addEventListener("click", () => {
  if (current) punchEl.textContent = current.punchline;
});

copyBtn.addEventListener("click", async () => {
  if (!current) return;
  try {
    await navigator.clipboard.writeText(current.setup + " " + current.punchline);
    statusEl.textContent = "Copied!";
  } catch (e) {
    statusEl.textContent = "Copy not supported in this browser.";
  }
});

newBtn.addEventListener("click", loadJoke);
loadJoke();
