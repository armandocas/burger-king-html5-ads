#!/usr/bin/env python3
"""Build and package standalone display ads from one creative manifest."""
from html import escape
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
SIZES = [(300, 250), (728, 90), (160, 600)]
BURGER_ASSET = {"300x250": "burger-190.png", "728x90": "burger-120.png", "160x600": "burger-230.png"}
PREVIEW_ALIAS = {"300x250": "u1", "160x600": "u2", "728x90": "u3"}
LIMIT = 150_000
CREATIVE = json.loads((ROOT / "creative.json").read_text())


def units():
    for variant, copy in CREATIVE["variants"].items():
        for width, height in SIZES:
            yield variant, copy, width, height, f"{width}x{height}"


def prepare():
    template = (ROOT / "src/index.html").read_text()
    shutil.rmtree(ROOT / "build", ignore_errors=True)
    shutil.rmtree(ROOT / "preview" / "units", ignore_errors=True)
    for variant, copy, width, height, size in units():
        target = ROOT / "build" / variant / size
        target.mkdir(parents=True, exist_ok=True)
        burger_width = int(BURGER_ASSET[size].split("-")[1].split(".")[0])
        values = {
            "WIDTH": width, "HEIGHT": height, "SIZE": size, "LANG": copy["lang"],
            "LANDING_URL": copy["landing_url"],
            "BURGER_WIDTH": burger_width, "BURGER_HEIGHT": burger_width,
            "ARIA": copy["aria"], "HEADLINE_1": copy["headline_1"],
            "HEADLINE_2": copy["headline_2"], "SUBLINE": copy["subline"], "CTA": copy["cta"],
        }
        html = template
        for key, value in values.items():
            html = html.replace("{{" + key + "}}", escape(str(value)))
        if "{{" in html:
            raise SystemExit(f"Unresolved template token in {variant}/{size}")
        (target / "index.html").write_text(html)
        for filename in ("style.css", "ad.js"):
            shutil.copy2(ROOT / "src" / filename, target / filename)
        shutil.copy2(ROOT / "assets" / BURGER_ASSET[size], target / "burger.png")
        shutil.copy2(ROOT / "assets" / "burger-king-logo.svg", target / "logo.svg")
        # Neutral preview paths avoid URL-based ad blockers; the export ZIP remains unchanged.
        alias = ROOT / "preview" / "units" / variant / PREVIEW_ALIAS[size]
        alias.mkdir(parents=True, exist_ok=True)
        for filename in ("index.html", "style.css", "ad.js", "burger.png", "logo.svg"):
            shutil.copy2(target / filename, alias / filename)


def package():
    manifest = []
    (ROOT / "dist").mkdir(exist_ok=True)
    for pattern in ("burgerking_*.zip", "burgerking_*_backup.png"):
        for old_file in (ROOT / "dist").glob(pattern):
            old_file.unlink()
    for variant, _copy, width, height, size in units():
        folder = ROOT / "build" / variant / size
        files = [folder / item for item in ("index.html", "style.css", "ad.js", "burger.png", "logo.svg")]
        backup = folder / "backup.png"
        missing = [str(path) for path in [*files, backup] if not path.exists()]
        if missing:
            raise SystemExit(f"Missing output: {', '.join(missing)}")
        initial_bytes = sum(path.stat().st_size for path in files)
        if initial_bytes > LIMIT:
            raise SystemExit(f"{variant}/{size} exceeds project 150 KB initial-load target: {initial_bytes}")
        base = f"burgerking_{variant}_{size}"
        zip_path = ROOT / "dist" / f"{base}.zip"
        with ZipFile(zip_path, "w", ZIP_DEFLATED, compresslevel=9) as archive:
            for path in files:
                archive.write(path, path.name)
        shutil.copy2(backup, ROOT / "dist" / f"{base}_backup.png")
        manifest.append({"variant": variant, "lang": _copy["lang"], "size": size, "initial_bytes": initial_bytes,
                         "zip_bytes": zip_path.stat().st_size, "zip": zip_path.name,
                         "backup": f"{base}_backup.png"})
    (ROOT / "dist" / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "prepare"
    {"prepare": prepare, "package": package}[action]()
