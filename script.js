const DEFAULT_SEATS = 40;
const MIN_SEATS = 1;
const MAX_SEATS = 200;
const STORAGE_KEY = "neonHunterClassroomSeats";
const COUNT_KEY = "neonHunterSeatCount";

const seatGrid = document.getElementById("seatGrid");
const registeredCount = document.getElementById("registeredCount");
const emptyCount = document.getElementById("emptyCount");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const clearAllButton = document.getElementById("clearAllButton");
const seatCountInput = document.getElementById("seatCountInput");
const applySeatCount = document.getElementById("applySeatCount");
const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");

function loadSeatCount() {
  const value = Number.parseInt(localStorage.getItem(COUNT_KEY), 10);
  return Number.isInteger(value) && value >= MIN_SEATS && value <= MAX_SEATS ? value : DEFAULT_SEATS;
}

let totalSeats = loadSeatCount();

function loadNames() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.from({ length: totalSeats }, (_, i) => typeof saved[i] === "string" ? saved[i] : "");
  } catch {
    return Array(totalSeats).fill("");
  }
}

let seatNames = loadNames();

function saveNames() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seatNames));
  } catch (error) {
    console.warn("座席データを保存できませんでした。", error);
  }
}

function updateSummary() {
  const count = seatNames.filter(name => name.trim() !== "").length;
  const rate = Math.round(count / totalSeats * 100);
  registeredCount.textContent = count;
  emptyCount.textContent = totalSeats - count;
  progressText.textContent = `${rate}%`;
  progressBar.style.width = `${rate}%`;
}

function renderSeats() {
  seatGrid.innerHTML = "";
  seatNames.forEach((name, index) => {
    const seat = document.createElement("label");
    seat.className = `seat${name.trim() ? " is-occupied" : ""}`;
    const top = document.createElement("span");
    top.className = "seat-top";
    const number = document.createElement("span");
    number.className = "seat-number";
    number.textContent = `席 ${String(index + 1).padStart(2, "0")}`;
    const indicator = document.createElement("span");
    indicator.className = "seat-indicator";
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 20;
    input.autocomplete = "off";
    input.enterKeyHint = "done";
    input.placeholder = "名前";
    input.value = name;
    input.setAttribute("aria-label", `席 ${index + 1} の名前`);
    input.addEventListener("input", () => {
      seatNames[index] = input.value;
      seat.classList.toggle("is-occupied", input.value.trim() !== "");
      saveNames();
      updateSummary();
    });
    top.append(number, indicator);
    seat.append(top, input);
    seatGrid.append(seat);
  });
  updateSummary();
  document.querySelector(".back-wall span:nth-child(2)").textContent = `${totalSeats} DESKS`;
  seatGrid.setAttribute("aria-label", `${totalSeats}席の座席表`);
}

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuPanel.hidden = expanded;
  if (!expanded) seatCountInput.focus();
});

applySeatCount.addEventListener("click", () => {
  const nextCount = Number.parseInt(seatCountInput.value, 10);
  if (!Number.isInteger(nextCount) || nextCount < MIN_SEATS || nextCount > MAX_SEATS) {
    seatCountInput.setCustomValidity(`席数は${MIN_SEATS}〜${MAX_SEATS}で入力してください。`);
    seatCountInput.reportValidity();
    return;
  }
  seatCountInput.setCustomValidity("");
  if (nextCount < totalSeats && seatNames.slice(nextCount).some(name => name.trim())) {
    if (!window.confirm(`${nextCount + 1}席目以降の名前は削除されます。席数を変更しますか？`)) return;
  }
  totalSeats = nextCount;
  seatNames = Array.from({ length: totalSeats }, (_, i) => seatNames[i] || "");
  try { localStorage.setItem(COUNT_KEY, String(totalSeats)); } catch (error) { console.warn("席数を保存できませんでした。", error); }
  saveNames();
  renderSeats();
  menuPanel.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
});

seatCountInput.addEventListener("input", () => seatCountInput.setCustomValidity(""));
seatCountInput.value = totalSeats;

clearAllButton.addEventListener("click", () => {
  if (!seatNames.some(name => name.trim())) return;
  if (!window.confirm(`${totalSeats}席すべての名前を消去しますか？`)) return;
  seatNames = Array(totalSeats).fill("");
  saveNames();
  renderSeats();
});

renderSeats();
