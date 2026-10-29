const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
  const root = path.resolve(__dirname, "..");
  const creative = JSON.parse(
    fs.readFileSync(path.join(root, "creative.json"), "utf8"),
  );
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const report = [];
  try {
    for (const variant of Object.keys(creative.variants)) {
      for (const [width, height] of [
        [300, 250],
        [728, 90],
        [160, 600],
      ]) {
        const size = `${width}x${height}`;
        const page = await browser.newPage({
          viewport: { width, height },
          deviceScaleFactor: 1,
        });
        const errors = [];
        const remoteRequests = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("request", (request) => {
          if (/^https?:/i.test(request.url()))
            remoteRequests.push(request.url());
        });
        await page.addInitScript(() => {
          window.open = (url, target) => {
            window.__opened = { url, target };
            return null;
          };
          window.__animationTimings = [];
          const nativeAnimate = Element.prototype.animate;
          Element.prototype.animate = function (frames, options) {
            window.__animationTimings.push(options.delay + options.duration);
            return nativeAnimate.call(this, frames, options);
          };
        });
        await page.goto(
          `file://${path.join(root, "build", variant, size, "index.html")}`,
        );
        await page.waitForTimeout(2050);
        const result = await page.evaluate(() => {
          const ad = document.querySelector(".ad");
          const headline = document.querySelector("h1").getBoundingClientRect();
          const cta = document.querySelector(".cta").getBoundingClientRect();
          const fits = (rect) =>
            rect.width > 0 &&
            rect.height > 0 &&
            rect.left >= 0 &&
            rect.right <= innerWidth &&
            rect.bottom <= innerHeight;
          return {
            width: ad.offsetWidth,
            height: ad.offsetHeight,
            headlineFits: fits(headline),
            ctaFits: fits(cta),
            imagesLoaded: [...document.images].every(
              (image) => image.complete && image.naturalWidth > 0,
            ),
            exits: document.querySelectorAll(".ad-click").length,
            clickTag: window.clickTag,
            animationCount: window.__animationTimings.length,
            maxAnimationEnd: Math.max(...window.__animationTimings, 0),
          };
        });
        if (
          errors.length ||
          remoteRequests.length ||
          !result.headlineFits ||
          !result.ctaFits ||
          !result.imagesLoaded ||
          result.exits !== 1 ||
          result.clickTag !== creative.variants[variant].landing_url ||
          result.width !== width ||
          result.height !== height ||
          result.animationCount < 4 ||
          result.maxAnimationEnd > 30000
        ) {
          throw Error(
            `${variant}/${size} visual QA failed: ${JSON.stringify({ result, errors, remoteRequests })}`,
          );
        }
        await page.screenshot({
          path: path.join(root, "build", variant, size, "backup.png"),
        });
        await page.locator(".ad-click").click();
        let opened = await page.evaluate(() => window.__opened);
        if (
          opened?.url !== creative.variants[variant].landing_url ||
          opened?.target !== "_blank"
        )
          throw Error(`${variant}/${size} clickTag mouse exit failed`);
        await page.evaluate(() => {
          window.clickTag = "https://example.test/override";
          window.__opened = null;
        });
        await page.locator(".ad-click").focus();
        await page.keyboard.press("Enter");
        opened = await page.evaluate(() => window.__opened);
        if (opened?.url !== "https://example.test/override")
          throw Error(`${variant}/${size} late clickTag/keyboard exit failed`);
        report.push({
          variant,
          size,
          result: "pass",
          animation_ms: result.maxAnimationEnd,
          checks: [
            "dimensions",
            "content bounds",
            "assets",
            "no remote requests",
            "one exit",
            "mouse clickTag",
            "keyboard clickTag",
            "late override",
            "JavaScript errors",
          ],
        });
        console.log(
          `${variant}/${size} OK (${result.maxAnimationEnd} ms, one exit, no remote assets)`,
        );
        await page.close();
      }
      // One representative size covers the shared reduced-motion and no-JS fallback code.
      const fallbackUrl = `file://${path.join(root, "build", variant, "300x250", "index.html")}`;
      const reduced = await browser.newPage({
        viewport: { width: 300, height: 250 },
        reducedMotion: "reduce",
      });
      await reduced.goto(fallbackUrl);
      if ((await reduced.evaluate(() => document.getAnimations().length)) !== 0)
        throw Error(`${variant} reduced-motion fallback failed`);
      await reduced.close();
      const noJs = await browser.newPage({
        viewport: { width: 300, height: 250 },
        javaScriptEnabled: false,
      });
      await noJs.goto(fallbackUrl);
      if (
        !(await noJs.locator("h1").isVisible()) ||
        !(await noJs.locator(".burger").isVisible())
      )
        throw Error(`${variant} no-JS fallback failed`);
      await noJs.close();
    }
    fs.mkdirSync(path.join(root, "dist"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "dist", "qa-report.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
