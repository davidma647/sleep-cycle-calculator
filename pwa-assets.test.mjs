import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function readText(path) {
  return readFile(path, "utf8");
}

describe("PWA static assets", () => {
  it("wires the page to the app, manifest, styles, and service worker", async () => {
    const [html, app] = await Promise.all([
      readText("index.html"),
      readText("app.js"),
    ]);

    assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
    assert.match(html, /<link rel="stylesheet" href="styles\.css">/);
    assert.match(html, /<script type="module" src="app\.js"><\/script>/);
    assert.match(app, /navigator\.serviceWorker\.register\("\.\/service-worker\.js"\)/);
  });

  it("defines installable manifest metadata and icons", async () => {
    const manifest = JSON.parse(await readText("manifest.webmanifest"));

    assert.equal(manifest.name, "睡眠周期计算器");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.start_url, "./");
    assert.equal(manifest.icons.some((icon) => icon.sizes === "192x192"), true);
    assert.equal(manifest.icons.some((icon) => icon.sizes === "512x512"), true);
  });

  it("caches the static shell for offline reloads", async () => {
    const worker = await readText("service-worker.js");

    for (const asset of [
      "./",
      "./index.html",
      "./styles.css",
      "./app.js",
      "./sleep-cycle.js",
      "./manifest.webmanifest",
    ]) {
      assert.match(worker, new RegExp(asset.replaceAll(".", "\\.")));
    }
  });

  it("includes PNG icon resources", async () => {
    const pngSignature = "89504e470d0a1a0a";
    const icon192 = await readFile("icons/icon-192.png");
    const icon512 = await readFile("icons/icon-512.png");

    assert.equal(icon192.subarray(0, 8).toString("hex"), pngSignature);
    assert.equal(icon512.subarray(0, 8).toString("hex"), pngSignature);
  });
});
