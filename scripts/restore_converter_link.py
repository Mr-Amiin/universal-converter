#!/usr/bin/env python3
"""
Restores the "Converter" nav item that a previous pass replaced with the
Categories dropdown. Converter is re-inserted immediately before the
Categories dropdown, using the same relative-path prefix as that page's own
brand/logo link (e.g. "", "../", "../../"), so it works at any nesting depth.

Safe to re-run: it's a no-op on files that already have both links.
"""
from __future__ import annotations

import re
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent.parent

BRAND_RE = re.compile(r'<a class="brand" href="([^"]*)index\.html"')
DROPDOWN_RE = re.compile(r'<div class="nav-dropdown">')
CONVERTER_RE = re.compile(r'<a href="[^"]*#converter">Converter</a>')


def main() -> None:
    updated = 0
    for html_file in SITE_ROOT.rglob("*.html"):
        with open(html_file, "r", encoding="utf-8", newline="") as f:
            text = f.read()

        if CONVERTER_RE.search(text):
            continue

        brand_match = BRAND_RE.search(text)
        if not brand_match:
            continue

        prefix = brand_match.group(1)
        converter_link = f'<a href="{prefix}index.html#converter">Converter</a>'

        new_text, count = DROPDOWN_RE.subn(converter_link + '<div class="nav-dropdown">', text, count=1)
        if count:
            with open(html_file, "w", encoding="utf-8", newline="") as f:
                f.write(new_text)
            updated += 1

    print(f"Restored Converter link in {updated} file(s).")


if __name__ == "__main__":
    main()
