#!/usr/bin/env python3
"""
Regenerates the "Categories" navigation dropdown across the whole static site.

This script does NOT hardcode a category list. Instead it:
  1. Reads CATEGORY_LABELS from generate_seo_pages_from_sitemap.py -- the
     existing category registry that also drives breadcrumbs and category
     pages elsewhere in the codebase.
  2. Keeps only the categories that currently have a real landing page
     (i.e. a "<category>/index.html" file at the site root), since that's
     what makes a category ready to be linked from the nav.
  3. Rebuilds the <nav> "Categories" dropdown markup and swaps it in for the
     old "Converter" link in every HTML file (including generator templates),
     regardless of how deeply nested the file is -- links use root-relative
     paths (e.g. "/length/") so they work the same at any depth.

Re-run this script any time a new category landing page ships and the nav
will pick it up automatically, no manual editing required.

Usage:
    python3 scripts/update_categories_nav.py
"""
from __future__ import annotations

import re
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_FILE = SITE_ROOT / "generate_seo_pages_from_sitemap.py"

# Preferred display order; anything else discovered in the registry that
# isn't listed here is appended afterwards in alphabetical order.
PREFERRED_ORDER = [
    "length",
    "area",
    "volume",
    "weight",
    "temperature",
    "speed",
    "pressure",
    "digital",
    "power",
]

CONVERTER_LINK_RE = re.compile(
    r'<a href="(?:[^"]*index\.html)?#converter">Converter</a>'
)


def load_category_registry() -> dict[str, str]:
    """Parse CATEGORY_LABELS = { "slug": "Label", ... } out of the registry file."""
    text = REGISTRY_FILE.read_text(encoding="utf-8")
    match = re.search(r"CATEGORY_LABELS\s*=\s*\{(.*?)\}", text, re.DOTALL)
    if not match:
        raise RuntimeError("Could not find CATEGORY_LABELS in registry file")
    body = match.group(1)
    pairs = re.findall(r'"([^"]+)"\s*:\s*"([^"]+)"', body)
    return dict(pairs)


def discover_live_categories(registry: dict[str, str]) -> list[tuple[str, str]]:
    """Keep only categories that already have a landing page on disk."""
    live = [
        (slug, label)
        for slug, label in registry.items()
        if (SITE_ROOT / slug / "index.html").is_file()
    ]

    def sort_key(item: tuple[str, str]) -> tuple[int, str]:
        slug = item[0]
        if slug in PREFERRED_ORDER:
            return (PREFERRED_ORDER.index(slug), "")
        return (len(PREFERRED_ORDER), item[1])

    return sorted(live, key=sort_key)


def build_dropdown_html(categories: list[tuple[str, str]]) -> str:
    items = "".join(
        f'<li><a href="/{slug}/">{label}</a></li>' for slug, label in categories
    )
    return (
        '<div class="nav-dropdown">'
        '<button type="button" class="nav-dropdown-toggle" aria-haspopup="true" '
        'aria-expanded="false" aria-controls="categoriesNavMenu">'
        "Categories<span class=\"nav-caret\" aria-hidden=\"true\"></span>"
        "</button>"
        f'<ul class="nav-dropdown-menu" id="categoriesNavMenu">{items}</ul>'
        "</div>"
    )


def update_html_files(dropdown_html: str) -> int:
    updated = 0
    for html_file in SITE_ROOT.rglob("*.html"):
        try:
            # newline="" preserves each file's original line endings (some
            # generated pages use \r\n) so this only touches the nav markup.
            with open(html_file, "r", encoding="utf-8", newline="") as f:
                text = f.read()
        except UnicodeDecodeError:
            continue
        new_text, count = CONVERTER_LINK_RE.subn(dropdown_html, text)
        if count:
            with open(html_file, "w", encoding="utf-8", newline="") as f:
                f.write(new_text)
            updated += 1
    return updated


def main() -> None:
    registry = load_category_registry()
    categories = discover_live_categories(registry)
    if not categories:
        raise RuntimeError("No live category landing pages found; nothing to link.")

    print("Live categories found:")
    for slug, label in categories:
        print(f"  /{slug}/  ->  {label}")

    dropdown_html = build_dropdown_html(categories)
    updated = update_html_files(dropdown_html)
    print(f"\nUpdated {updated} HTML file(s) with the Categories dropdown.")


if __name__ == "__main__":
    main()
