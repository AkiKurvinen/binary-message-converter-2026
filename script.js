"use strict";

const form = document.getElementById("transmitter-form");
const settings = document.getElementById("settings");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const swatch = document.getElementById("swatch");
const status = document.getElementById("status");
const position = document.getElementById("position");
const bitDisplay = document.getElementById("bit");
const error = document.getElementById("error");
const gapInput = document.getElementById("gap");
const intervalInput = document.getElementById("interval");

const colors = {
  LIGHTNESS: ["rgb(0, 0, 0)", "rgb(255, 255, 255)"],
  HUE_RG: ["rgb(0, 255, 0)", "rgb(255, 0, 0)"],
  HUE_GB: ["rgb(0, 0, 255)", "rgb(0, 255, 0)"],
  HUE_BR: ["rgb(255, 0, 0)", "rgb(0, 0, 255)"]
};

let timer;

function darken() {
  swatch.style.backgroundColor = "rgb(0, 0, 0)";
  swatch.setAttribute("aria-label", "Color swatch, currently dark");
}

function stop() {
  clearTimeout(timer);
  darken();
  settings.disabled = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  status.textContent = "Stopped";
  position.textContent = "Ready to transmit";
  bitDisplay.textContent = "—";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const interval = Number(intervalInput.value);
  const gap = Number(gapInput.value);
  if (gap >= interval) {
    error.textContent = "The dark gap must be shorter than the bit duration.";
    return;
  }
  error.textContent = "";

  const syncByte = parseInt(document.getElementById("sync-byte").value, 2);
  const message = new TextEncoder().encode(document.getElementById("message").value);
  const bytes = [syncByte, ...message];
  const mode = document.getElementById("color-mode").value;
  let bitIndex = 0;

  settings.disabled = true;
  startButton.disabled = true;
  stopButton.disabled = false;
  status.textContent = "Transmitting";

  function nextBit() {
    if (bitIndex === bytes.length * 8) {
      darken();
      position.textContent = "Frame pause";
      bitDisplay.textContent = "—";
      bitIndex = 0;
      timer = setTimeout(nextBit, interval * 2 + 200);
      return;
    }

    const byteIndex = Math.floor(bitIndex / 8);
    const bit = (bytes[byteIndex] >> (7 - bitIndex % 8)) & 1;
    swatch.style.backgroundColor = colors[mode][bit];
    swatch.setAttribute("aria-label", `Color swatch, bit ${bit}`);
    position.textContent = `${byteIndex === 0 ? "Start byte" : `Message byte ${byteIndex}`} · bit ${bitIndex % 8 + 1} of 8`;
    bitDisplay.textContent = String(bit);
    bitIndex++;

    timer = setTimeout(() => {
      if (gap > 0) {
        darken();
        timer = setTimeout(nextBit, gap);
      } else {
        nextBit();
      }
    }, interval - gap);
  }

  nextBit();
});

stopButton.addEventListener("click", stop);
