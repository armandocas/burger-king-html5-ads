# Burger King display campaign study

Six fixed-size HTML5 units from two English copy routes. Each route ships at 300×250, 728×90, and 160×600, with a separate PNG backup for every size. This is uncommissioned portfolio work; Burger King did not brief, approve, or publish it.

## Review

[Open the live portfolio](https://armandocas.github.io/burger-king-html5-ads/) · [Contact Armando on LinkedIn](https://www.linkedin.com/in/armando-castellan-neto/?locale=en-US)

The live preview includes all six animated units and direct downloads of their HTML5 ZIPs and PNG backups.

Start the preview with `python3 -m http.server 8000` and open `http://localhost:8000/preview/`. ZIPs and backups are in `dist/`; `manifest.json` lists byte counts and filenames. `qa-report.json` records the automated checks.

## Build

```sh
pnpm install
pnpm ads:build
```

The build requires Python 3, Node.js, and Google Chrome for screenshot QA.

## Publishing

GitHub Pages serves the `main` branch from the repository root. The root page forwards visitors to `preview/`, and `.nojekyll` keeps the static files unchanged. After changing a creative, run `pnpm ads:build` and commit the updated `preview/units/` and `dist/` files along with the source. Page-only edits do not require rebuilding the ads.

Copy and landing URLs live in `creative.json`; HTML, CSS, and motion code live in `src/`. Each ZIP contains `index.html`, `style.css`, `ad.js`, `burger.png`, and `logo.svg`. The backup PNG is delivered separately. There are no remote asset requests. The build enforces a 150,000-byte initial-load target; animation ends at 1.9 seconds.

The clickTag is declared visibly in the HTML head, with one clickable anchor and one named exit. It opens the landing page in a new tab and can be overridden by an ad server. The portfolio default uses the [public Burger King site](https://www.bk.com/) as a demonstration destination. Replace and verify the destination with the trafficker before actual deployment.

## Production handoff

See [production-handoff.md](docs/production-handoff.md) for platform distinctions, QA evidence, limits, and remaining steps before a real campaign can ship.
See [browser-compatibility.md](docs/browser-compatibility.md) for Chrome/Safari checks and the preview-path fix for content blockers.

The [Burger King 2020 SVG](https://commons.wikimedia.org/wiki/File:Burger_King_2020.svg) is used as a brand reference; the mark belongs to its rights holders. The product visual is illustrative and should be replaced with approved photography before trafficking.
