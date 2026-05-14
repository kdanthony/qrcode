const form = document.getElementById("qr-form");
const urlInput = document.getElementById("url-input");
const statusEl = document.getElementById("status");
const downloadBtn = document.getElementById("download-btn");
const canvas = document.getElementById("qr-canvas");

const CANVAS_SIZE = 320;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function normalizeUrl(rawValue) {
  const value = rawValue.trim();
  if (!value) {
    throw new Error("Enter a URL first.");
  }

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.toString();
  } catch {
    throw new Error("Please enter a valid URL.");
  }
}

async function renderQrCode(url) {
  if (!window.QRCode || typeof window.QRCode.toCanvas !== "function") {
    throw new Error("QR library failed to load. Refresh and try again.");
  }

  await QRCode.toCanvas(canvas, url, {
    width: CANVAS_SIZE,
    margin: 2,
    color: {
      dark: "#10232a",
      light: "#ffffff"
    }
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const normalized = normalizeUrl(urlInput.value);
    await renderQrCode(normalized);
    setStatus("QR code ready to download.");
    downloadBtn.disabled = false;
  } catch (error) {
    downloadBtn.disabled = true;
    setStatus(error.message || "Could not generate QR code.", true);
  }
});

downloadBtn.addEventListener("click", () => {
  const pngUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = pngUrl;
  link.download = "qrcode.png";
  link.click();
});

setStatus("Enter a URL and click Generate.");
