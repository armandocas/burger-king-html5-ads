# Browser compatibility review

## Results

| Environment | Result | Evidence |
| --- | --- | --- |
| Chrome with Adblock Plus enabled | Pass after preview-path fix | All six ad iframes rendered; visual inspection of 160×600 and 728×90. |
| Clean headless Chromium | Pass | Automated QA of six units in `dist/qa-report.json`, including assets, bounds, animation, clickTag mouse/keyboard, and no-JS/reduced-motion fallbacks. |
| Safari on macOS | Pass for rendering | All six iframes appeared in the accessibility tree; both English copy variations inspected visually. |
| Chromium mobile emulation, 390×844 touch viewport | Pass for preview layout | Six iframes loaded; page width remained 390 CSS pixels without horizontal page overflow. The 728×90 unit scrolls inside its preview card. |
| Firefox | Not covered | Requires a separate browser QA pass before production delivery. |

## Chrome content-blocker finding

With Adblock Plus enabled, the first preview used URLs containing common ad-size strings such as `/160x600/` and `/728x90/`. Chrome showed the 300×250 unit but those two iframes had zero layout dimensions and their CSS/images failed to load, despite the local server returning HTTP 200. Loading the same 160×600 files from a neutral URL restored the assets and layout. The preview now uses `preview/units/<variant>/u1|u2|u3/`; the deliverable ZIP contents and filenames retain their normal size names.

This is a preview workaround for a content blocker. A real ad blocker may also hide trafficked ads by design. It is not evidence of a browser-engine incompatibility and does not justify weakening the user's browser protection.

## Remaining checks before launch

Run the final creative through the actual DV360/CM360 upload validator and test on the campaign's targeted browsers, device classes, and publisher placements. Review click and impression reporting in that environment. This local portfolio does not make those platform claims.
