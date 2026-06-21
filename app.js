import { calculateCycles, formatClock, validateClockInput } from "./sleep-cycle.js";

const form = document.querySelector("#sleep-form");
const hourInput = document.querySelector("#hour-input");
const minuteInput = document.querySelector("#minute-input");
const errorMessage = document.querySelector("#time-error");
const sleepTime = document.querySelector("#sleep-time");
const resultsList = document.querySelector("#results-list");

function cycleClass(tone) {
  if (tone === "preferred") return "cycle-card preferred";
  if (tone === "caution") return "cycle-card caution";
  return "cycle-card";
}

function renderResults(cycles) {
  resultsList.replaceChildren(
    ...cycles.map((cycle) => {
      const item = document.createElement("li");
      item.className = cycleClass(cycle.tone);
      item.style.setProperty("--cycle-order", cycle.cycle);

      const index = document.createElement("span");
      index.className = "cycle-index";
      index.textContent = `${cycle.cycle}轮`;

      const body = document.createElement("div");
      body.className = "cycle-body";

      const topline = document.createElement("div");
      topline.className = "cycle-topline";

      const time = document.createElement("strong");
      time.className = "cycle-time";
      time.textContent = cycle.time;

      const meta = document.createElement("span");
      meta.className = "cycle-meta";
      meta.textContent = `${cycle.duration} / ${cycle.cycle}周期`;

      const title = document.createElement("div");
      title.className = "cycle-title";
      title.append(cycle.label);

      if (cycle.badge) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = cycle.badge;
        title.append(badge);
      }

      const detail = document.createElement("p");
      detail.className = "cycle-detail";
      detail.textContent = cycle.detail;

      topline.append(time, meta);
      body.append(topline, title, detail);
      item.append(index, body);
      return item;
    }),
  );
}

function update() {
  const validation = validateClockInput(hourInput.value, minuteInput.value);

  if (!validation.valid) {
    errorMessage.textContent = validation.message;
    sleepTime.textContent = "--:--";
    resultsList.replaceChildren();
    return;
  }

  errorMessage.textContent = "";
  sleepTime.textContent = formatClock(validation.hour * 60 + validation.minute);
  renderResults(calculateCycles(validation.hour, validation.minute));
}

function normalizeInput(event) {
  const input = event.currentTarget;
  if (!input.value) return;

  input.value = String(Number(input.value)).padStart(2, "0");
}

form.addEventListener("input", update);
hourInput.addEventListener("blur", normalizeInput);
minuteInput.addEventListener("blur", normalizeInput);
hourInput.addEventListener("blur", update);
minuteInput.addEventListener("blur", update);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

update();
