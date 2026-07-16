#!/usr/bin/env python3
"""
Updates the Popular Conversions grid + All Conversions (window.__categoryConversions)
on the Angle and Frequency category hub pages, using the exact same data-shape
already used on the other hub pages (e.g. pressure/index.html, digital/index.html).
Does not touch anything else on the hub pages (hero, FAQ, about, layout, CSS).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "site"

HUBS = {
    "angle": [
        {"slug": "degrees-to-radians", "title": "Degrees to Radians"},
        {"slug": "radians-to-degrees", "title": "Radians to Degrees"},
    ],
    "frequency": [
        {"slug": "hertz-to-rpm", "title": "Hertz to RPM"},
        {"slug": "rpm-to-hertz", "title": "RPM to Hertz"},
    ],
}

EMPTY_GRID = '<div class="popular-grid" id="popularHubGrid">\n        </div>'
EMPTY_CONVERSIONS = "window.__categoryConversions = [];"


def build_popular_grid(category, entries):
    cards = []
    for e in entries:
        href = f"../{category}/{e['slug']}/index.html"
        cards.append(
            f'            <a class="popular-grid-card" href="{href}">\n'
            f'              <span>{e["title"]}</span>\n'
            f"            </a>"
        )
    return (
        '<div class="popular-grid" id="popularHubGrid">\n'
        + "\n".join(cards)
        + "\n        </div>"
    )


def build_conversions_json(category, entries):
    data = [
        {
            "slug": e["slug"],
            "title": e["title"],
            "href": f"../{category}/{e['slug']}/index.html",
        }
        for e in entries
    ]
    return "window.__categoryConversions = " + json.dumps(data) + ";"


def main():
    report = []
    for category, entries in HUBS.items():
        path = ROOT / category / "index.html"
        html = path.read_text(encoding="utf-8")
        original = html

        if EMPTY_GRID not in html:
            report.append(f"[{category}] WARNING: expected empty popular-grid anchor not found (skipping grid update)")
        else:
            html = html.replace(EMPTY_GRID, build_popular_grid(category, entries), 1)
            report.append(f"[{category}] Popular Conversions grid updated ({len(entries)} cards)")

        if EMPTY_CONVERSIONS not in html:
            report.append(f"[{category}] WARNING: expected empty __categoryConversions anchor not found (skipping all-conversions update)")
        else:
            html = html.replace(EMPTY_CONVERSIONS, build_conversions_json(category, entries), 1)
            report.append(f"[{category}] All Conversions data updated ({len(entries)} entries)")

        if html != original:
            path.write_text(html, encoding="utf-8")
            report.append(f"[{category}] index.html written")
        else:
            report.append(f"[{category}] no changes written")

    print("\n".join(report))


if __name__ == "__main__":
    main()
