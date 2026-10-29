# Production handoff

## Scope

Independent Burger King concept campaign. Deliverables: 300×250, 728×90, and 160×600, in two English copy variations; one HTML5 ZIP and one separate PNG backup per unit. The single source of copy is `creative.json`, and visual/animation masters are in `src/`.

## Trafficking profile

This package targets ordinary HTML5 **display** upload with a universal `clickTag`. The HTML includes `meta name="ad.size"`, declares `var clickTag` without minification, and exposes one anchor exit. The ZIP has only supported HTML/CSS/JS/PNG/SVG assets. It has no external requests, autoplay audio, storage, or nested ZIP. Upload the backup PNG separately.

DV360's [HTML5 creative instructions](https://support.google.com/displayvideo/answer/7128959) distinguish display clickTags from rich media `Enabler.exit()` and explicitly request separate backup images. [CM360 display guidance](https://support.google.com/campaignmanager/answer/3145300) likewise uses clickTags for HTML5 display and warns against obscuring them. A Studio/CM360 **rich media** build would require a distinct Enabler implementation and platform testing; do not relabel these display ZIPs as rich media.

The 150 KB target (150,000 bytes) is a project constraint, not a universal current DV360 limit. [DV360's display guidelines](https://support.google.com/displayvideo/answer/10261241) allow animation up to 30 seconds and describe a 5 MB download ceiling, while publishers can impose smaller limits. This campaign ends its animation at 1.9 seconds and stays below 36 KiB of uncompressed initial assets per unit.

## QA evidence

`scripts/render-and-qa.js` opens every unit in Chromium and writes `dist/qa-report.json`. It checks exact dimensions, headline and CTA bounds, loaded images, one exit, no JavaScript errors, no remote asset requests, animation timing, mouse click, keyboard activation, and a clickTag override applied after load. The final frame is captured as the backup image. ZIP integrity is checked after packaging.

Manual review still matters for final artwork approval, browser differences, mobile placements, localization nuance, and the actual ad server's upload validator. No real DV360 or CM360 account was used here; upload acceptance and impression/click reporting cannot be claimed from the local QA.

See [browser-compatibility.md](browser-compatibility.md) for the Chrome/Safari results, the content-blocker finding, and remaining browser coverage.

## Before real trafficking

1. Obtain approved brand artwork, licensed product photography, final copy, landing URL, and localization signoff.
2. Confirm platform, publisher, size, file, animation, tracking, and backup specifications for the campaign.
3. Replace the portfolio destination; validate the detected clickTag and backup in the actual ad server.
4. Review final screenshots against approved Figma designs and check the units in target browsers/devices.
