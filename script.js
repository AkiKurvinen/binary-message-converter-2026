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
const messageInput = document.getElementById("message");
const messageBits = document.getElementById("message-bits");

const colors = {
  LIGHTNESS: ["rgb(0, 0, 0)", "rgb(255, 255, 255)"],
  HUE_RG: ["rgb(0, 255, 0)", "rgb(255, 0, 0)"],
  HUE_GB: ["rgb(0, 0, 255)", "rgb(0, 255, 0)"],
  HUE_BR: ["rgb(255, 0, 0)", "rgb(0, 0, 255)"]
};

let timer;

function getMessageBytes() {
  const bytes = Array.from(messageInput.value, (character) => character.codePointAt(0));
  return bytes.every((byte) => byte <= 0xff) ? bytes : null;
}

function updateMessageBits() {
  const bytes = getMessageBytes();
  messageBits.textContent = bytes === null
    ? "Only extended ASCII characters (0-255) are supported"
    : bytes.map((byte) => byte.toString(2).padStart(8, "0")).join(" ") || "—";
}

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

  const message = getMessageBytes();
  if (message === null) {
    error.textContent = "Message must contain extended ASCII characters (0-255) only.";
    return;
  }

  const syncByte = parseInt(document.getElementById("sync-byte").value, 2);
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

messageInput.addEventListener("input", updateMessageBits);
updateMessageBits();
stopButton.addEventListener("click", stop);
