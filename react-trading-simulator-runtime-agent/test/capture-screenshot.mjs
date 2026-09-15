import { spawn } from "node:child_process";
import { once } from "node:events";
import { chromium } from "playwright";

const port = 4173;
const previewUrl = `http://127.0.0.1:${port}/react-trading-simulator-runtime-agent/`;
const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port)], {
  stdio: "ignore",
});

async function waitForPreview() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(previewUrl);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${previewUrl}`);
}

try {
  await waitForPreview();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(previewUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: "react-trading-simulator-runtime-agent/documentation/screenshot01.png", fullPage: true });
  await browser.close();
} finally {
  preview.kill();
  await once(preview, "exit");
}
