(function () {
"use strict";
// Single source of truth for the site-wide "Categories" nav dropdown.
// Every page's dropdown (desktop #categoriesNavMenu and mobile
// #categoriesNavMenuMobile) is rendered from this list by
// renderCategoryDropdownMenus() below, so adding, removing, or
// reordering a category here updates every page automatically.
// catId maps each nav entry to its real category id in the `categories`
// array (built further below) so the dropdown label can be resolved
// through the SAME getCategoryDisplayName()/i18n-seo lookup already used
// for the category grid and Popular Conversions, instead of staying
// hardcoded English - most catId values match the href slug exactly,
// except flow-rate ("flow") and fuel-economy ("fuel_economy"), where the
// nav URL slug and the internal category id differ.
const NAV_CATEGORIES = [
{ href: "/length/", label: "Length", catId: "length" },
{ href: "/area/", label: "Area", catId: "area" },
{ href: "/volume/", label: "Volume", catId: "volume" },
{ href: "/weight/", label: "Weight", catId: "weight" },
{ href: "/temperature/", label: "Temperature", catId: "temperature" },
{ href: "/time/", label: "Time", catId: "time" },
{ href: "/speed/", label: "Speed", catId: "speed" },
{ href: "/pressure/", label: "Pressure", catId: "pressure" },
{ href: "/power/", label: "Power", catId: "power" },
{ href: "/energy/", label: "Energy", catId: "energy" },
{ href: "/electricity/", label: "Electricity", catId: "electricity" },
{ href: "/frequency/", label: "Frequency", catId: "frequency" },
{ href: "/angle/", label: "Angle", catId: "angle" },
{ href: "/digital/", label: "Digital storage", catId: "digital" },
{ href: "/currency/", label: "Currency", catId: "currency" },
{ href: "/density/", label: "Density", catId: "density" },
{ href: "/flow-rate/", label: "Flow Rate", catId: "flow" },
{ href: "/agriculture/", label: "Agriculture", catId: "agriculture" },
{ href: "/astronomy/", label: "Astronomy", catId: "astronomy" },
{ href: "/chemistry/", label: "Chemistry", catId: "chemistry" },
{ href: "/cooking/", label: "Cooking", catId: "cooking" },
{ href: "/engineering/", label: "Engineering", catId: "engineering" },
{ href: "/force/", label: "Force", catId: "force" },
{ href: "/fuel-economy/", label: "Fuel Economy", catId: "fuel_economy" },
{ href: "/radiation/", label: "Radiation", catId: "radiation" },
{ href: "/scientific/", label: "Scientific", catId: "scientific" },
{ href: "/torque/", label: "Torque", catId: "torque" }
];
function renderCategoryDropdownMenus() {
const menus = document.querySelectorAll("#categoriesNavMenu, #categoriesNavMenuMobile");
if (!menus.length) return;
const itemsHtml = NAV_CATEGORIES.map((category) => {
// English keeps NAV_CATEGORIES' own short label ("Length", "Area", ...)
// unchanged, exactly as originally authored for this dropdown -
// getCategoryDisplayName() is only consulted for non-English languages,
// since for English it falls through to the `categories` array's long
// name ("Length Converter"), which is correct for the category grid/
// Popular Conversions/sidebar elsewhere on the page but is NOT the
// short label this dropdown has always used in English.
let label = category.label;
if (typeof currentLanguageCode !== "undefined" && currentLanguageCode !== DEFAULT_LANGUAGE_CODE && typeof categories !== "undefined" && typeof getCategoryDisplayName === "function") {
const match = categories.find((c) => c.id === category.catId);
if (match) label = getCategoryDisplayName(match);
}
return `<li><a href="${category.href}">${escapeHtml(label)}</a></li>`;
}).join("");
menus.forEach((menu) => {
menu.innerHTML = itemsHtml;
});
}
// ---------------------------------------------------------------------
// Mobile drawer navigation (hamburger menu, <=820px).
// One consistent line-icon set (hand-drawn in the same stroke style as
// the site's existing nav-caret/theme-dot glyphs) used for both the main
// nav rows and every category row. Categories are NOT duplicated here —
// the drawer's "All Categories" list renders straight from
// NAV_CATEGORIES, the same registry renderCategoryDropdownMenus() uses
// for the desktop dropdown, so adding/removing a category there updates
// the drawer automatically too.
// ---------------------------------------------------------------------
function drawerIcon(pathMarkup) {
return `<svg class="drawer-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pathMarkup}</svg>`;
}
const CHEVRON_ICON = `<svg class="drawer-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5l5 5-5 5"/></svg>`;
const MAIN_NAV_ICONS = {
converter: drawerIcon('<path d="M4 7h9"/><path d="M11 4.5 13.5 7 11 9.5"/><path d="M16 13H7"/><path d="M9 10.5 6.5 13 9 15.5"/>'),
categories: drawerIcon('<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/>'),
calculators: drawerIcon('<rect x="4" y="2.5" width="12" height="15" rx="2"/><line x1="6.5" y1="6" x2="13.5" y2="6"/><line x1="6.5" y1="9.7" x2="6.5" y2="9.7"/><line x1="10" y1="9.7" x2="10" y2="9.7"/><line x1="13.5" y1="9.7" x2="13.5" y2="9.7"/><line x1="6.5" y1="12.6" x2="6.5" y2="12.6"/><line x1="10" y1="12.6" x2="10" y2="12.6"/><line x1="13.5" y1="12.6" x2="13.5" y2="12.6"/><line x1="6.5" y1="15.5" x2="6.5" y2="15.5"/>'),
popular: drawerIcon('<path d="M10 17c-3 0-5-2-5-4.7 0-2 1.3-3.2 2-4.8.3 1 .2 2 1 2.3-.3-2.7 1-4.7 3-6 .1 2 .1 3 1.5 4.3C13.8 9.3 15 10.7 15 12.3 15 15 13 17 10 17z"/>'),
guides: drawerIcon('<path d="M10 5c-1.5-1-3.5-1.3-5.5-1v11c2 0 4 .3 5.5 1.3"/><path d="M10 5c1.5-1 3.5-1.3 5.5-1v11c-2 0-4 .3-5.5 1.3"/><path d="M10 5v11.3"/>'),
sitemap: drawerIcon('<path d="M3 5.5 7.5 4l5 1.5 4-1.5v11l-4 1.5-5-1.5-4.5 1.5z"/><path d="M7.5 4v11.5"/><path d="M12.5 5.5V17"/>'),
about: drawerIcon('<circle cx="10" cy="10" r="7"/><line x1="10" y1="9" x2="10" y2="13.5"/><line x1="10" y1="6.3" x2="10" y2="6.3"/>'),
contact: drawerIcon('<rect x="3" y="5" width="14" height="10" rx="1.5"/><path d="M3.5 5.8 10 11l6.5-5.2"/>')
};
// Keyed by the category slug parsed from NAV_CATEGORIES href (e.g.
// "/length/" -> "length"), so this stays in sync automatically as long
// as new categories reuse an existing slug or fall back to the default.
const CATEGORY_ICONS = {
length: drawerIcon('<path d="M3 14 14 3l3 3L6 17z"/><path d="M9.5 7.5l1.5 1.5"/><path d="M6.5 10.5 8 12"/><path d="M12.5 4.5 14 6"/>'),
area: drawerIcon('<rect x="4" y="4" width="12" height="12" rx="1.5"/>'),
volume: drawerIcon('<path d="M10 3 17 6.5 17 13.5 10 17 3 13.5 3 6.5z"/><path d="M3 6.5 10 10l7-3.5"/><path d="M10 10v7"/>'),
weight: drawerIcon('<path d="M10 3v14"/><path d="M4 6h12"/><path d="M4 6 1.5 11a2.5 2.5 0 0 0 5 0z"/><path d="M16 6l-2.5 5a2.5 2.5 0 0 0 5 0z"/>'),
temperature: drawerIcon('<path d="M10 3a2 2 0 0 0-2 2v7.1a3.5 3.5 0 1 0 4 0V5a2 2 0 0 0-2-2z"/><line x1="10" y1="14.5" x2="10" y2="14.5" stroke-width="3"/>'),
time: drawerIcon('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>'),
speed: drawerIcon('<path d="M3 13a7 7 0 1 1 14 0"/><path d="M10 13l4-4"/><line x1="10" y1="13" x2="10" y2="13" stroke-width="3"/>'),
pressure: drawerIcon('<circle cx="10" cy="10" r="7"/><path d="M10 10l3-3"/><line x1="10" y1="6" x2="10" y2="6" stroke-width="3"/>'),
power: drawerIcon('<circle cx="10" cy="10" r="7"/><path d="M11 6 7 11h3l-1 4 4-5h-3z"/>'),
energy: drawerIcon('<path d="M11 2 4 12h5l-1 6 7-10h-5z"/>'),
electricity: drawerIcon('<path d="M8 3v4"/><path d="M12 3v4"/><path d="M6 7h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4z"/><path d="M10 14v3"/>'),
frequency: drawerIcon('<path d="M2 10h2l1.5-5L9 15l2-8 1.5 3H18"/>'),
angle: drawerIcon('<path d="M4 15a6 6 0 0 1 12 0"/><path d="M4 15h12"/><path d="M10 15V9"/>'),
digital: drawerIcon('<rect x="3" y="4" width="14" height="12" rx="2"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="6" y1="13.5" x2="6" y2="13.5" stroke-width="3"/>'),
currency: drawerIcon('<circle cx="10" cy="10" r="7"/><path d="M10 6.5v7"/><path d="M12 8a2 2 0 0 0-2-1.5 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 1-2-1.5"/>'),
density: drawerIcon('<path d="M8 3h4"/><path d="M9 3v5l-4.5 7a1.5 1.5 0 0 0 1.3 2.2h8.4A1.5 1.5 0 0 0 15.5 15L11 8V3"/>'),
"flow-rate": drawerIcon('<path d="M10 3s5 6 5 9.5A5 5 0 0 1 5 12.5C5 9 10 3 10 3z"/>'),
agriculture: drawerIcon('<path d="M10 17V6"/><path d="M10 6 7 3"/><path d="M10 6l3-3"/><path d="M10 9 7.5 6.5"/><path d="M10 9l2.5-2.5"/><path d="M10 12 7.5 9.5"/><path d="M10 12l2.5-2.5"/>'),
astronomy: drawerIcon('<circle cx="10" cy="10" r="2"/><ellipse cx="10" cy="10" rx="8" ry="3.2"/>'),
chemistry: drawerIcon('<path d="M8 3h4"/><path d="M8 3v5l-4 8.5A1 1 0 0 0 4.9 18h10.2a1 1 0 0 0 .9-1.5L12 8V3"/><path d="M6.5 12h7"/>'),
cooking: drawerIcon('<path d="M4 9h12"/><path d="M5 9v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9"/><path d="M2 9h2"/><path d="M16 9h2"/><path d="M10 6V4"/>'),
engineering: drawerIcon('<circle cx="10" cy="10" r="2.4"/><path d="M10 3v2"/><path d="M10 15v2"/><path d="M3 10h2"/><path d="M15 10h2"/><path d="M5.2 5.2l1.4 1.4"/><path d="M13.4 13.4l1.4 1.4"/><path d="M14.8 5.2l-1.4 1.4"/><path d="M6.6 13.4l-1.4 1.4"/>'),
force: drawerIcon('<path d="M4 10h10"/><path d="M11 6l3 4-3 4"/>'),
"fuel-economy": drawerIcon('<rect x="4" y="4" width="7" height="12" rx="1"/><path d="M11 8h2.5a1.5 1.5 0 0 1 1.5 1.5V13a1 1 0 0 0 2 0V8l-2-2"/><line x1="4" y1="8" x2="11" y2="8"/>'),
radiation: drawerIcon('<line x1="10" y1="10" x2="10" y2="10" stroke-width="3.2"/><circle cx="10" cy="10" r="7"/><path d="M10 3.5v3.4"/><path d="M15.2 12.7 12.3 11"/><path d="M4.8 12.7 7.7 11"/>'),
scientific: drawerIcon('<path d="M6 17h8"/><path d="M9 3 8 9"/><path d="M12 3l1 6"/><path d="M6.5 13.5a3.5 3.5 0 1 1 7 0"/>'),
torque: drawerIcon('<path d="M13.5 3.5a3.5 3.5 0 0 0-4.9 4.2L4 12.3v2.2h2.2l4.6-4.6a3.5 3.5 0 0 0 4.2-4.9l-2.3 2.3-1.4-1.4z"/>')
};
const DEFAULT_CATEGORY_ICON = drawerIcon('<path d="M4 7h9"/><path d="M11 4.5 13.5 7 11 9.5"/><path d="M16 13H7"/><path d="M9 10.5 6.5 13 9 15.5"/>');
// Every entry here is a real destination already used elsewhere in the
// site's own header nav (index.html#converter, index.html#calculators,
// index.html#popular, guides.html, sitemap.html, about.html,
// contact.html) - nothing new is invented.
const MOBILE_MAIN_NAV = [
{ id: "converter", label: "Converter", href: "index.html#converter", i18nKey: "nav.converter" },
{ id: "categories", label: "Categories", expand: true, i18nKey: "nav.categories" },
{ id: "calculators", label: "Calculators", href: "index.html#calculators", i18nKey: "nav.calculators" },
{ id: "popular", label: "Popular", href: "index.html#popular", i18nKey: "nav.popular" },
{ id: "guides", label: "Guides", href: "guides.html", i18nKey: "nav.guides" },
{ id: "sitemap", label: "Sitemap", href: "sitemap.html", i18nKey: "nav.sitemap" },
{ id: "about", label: "About", href: "about.html", i18nKey: "nav.about" },
{ id: "contact", label: "Contact", href: "contact.html", i18nKey: "nav.contact" }
];
function categorySlugFromHref(href) {
const parts = String(href || "").split("/").filter(Boolean);
return parts.length ? parts[parts.length - 1] : "";
}
// Renders the shared site header (hamburger button, brand/logo, desktop
// top-nav with the Categories dropdown, and theme toggle) into the empty
// #siteHeader placeholder that every page now ships. This is the missing
// counterpart to renderMobileDrawer() below: both fill an empty shared
// placeholder from the same NAV_CATEGORIES/MOBILE_MAIN_NAV data so every
// page's navigation is rendered from one source of truth instead of being
// hand-authored per page.
function renderSiteHeader() {
const header = document.getElementById("siteHeader");
if (!header || header.childElementCount) return;
const topNavItemsHtml = MOBILE_MAIN_NAV.map((item) => {
if (item.expand) {
return `<div class="nav-dropdown"><button type="button" class="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false" aria-controls="categoriesNavMenu"><span data-i18n="${item.i18nKey}">${item.label}</span><span class="nav-caret" aria-hidden="true"></span></button><ul class="nav-dropdown-menu" id="categoriesNavMenu"></ul></div>`;
}
return `<a href="${item.href}" data-i18n="${item.i18nKey}">${item.label}</a>`;
}).join("");
header.innerHTML = `
<button class="mobile-menu-toggle" id="mobileMenuToggle" type="button" aria-label="Open menu" aria-haspopup="true" aria-expanded="false" aria-controls="mobileDrawer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
<a class="brand" href="/index.html" aria-label="Universal Converter home"><img src="/logo.svg" alt="Universal Converter logo" width="38" height="38"><span>Universal Converter</span></a>
<nav class="top-nav" aria-label="Primary navigation">${topNavItemsHtml}</nav>
<div class="nav-dropdown lang-dropdown" id="langDropdown"><button type="button" class="nav-dropdown-toggle lang-dropdown-toggle" id="langDropdownToggle" aria-haspopup="true" aria-expanded="false" aria-controls="langDropdownMenu" aria-label="Change language"><span class="lang-toggle-flag" id="langToggleFlag" aria-hidden="true"></span><span id="langToggleName"></span><span class="nav-caret" aria-hidden="true"></span></button><ul class="nav-dropdown-menu lang-dropdown-menu" id="langDropdownMenu" role="listbox" aria-label="Select language"></ul></div>
<button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch color theme"><span class="theme-dot" aria-hidden="true"></span><span id="themeText">Dark</span></button>
`;
}
function renderMobileDrawer() {
const drawer = document.getElementById("mobileDrawer");
if (!drawer) return;
// On an SEO conversion page, the drawer's Categories submenu is
// restricted to that page's own category, reusing the exact same
// resolution already used for the desktop/tablet left sidebar
// (seoPageRestrictedCategoryId()) - not a separate guess from the H1.
// The homepage (no seo-page body class) is unaffected: the function
// returns null there and the full 27-category list renders as before.
const restrictedId = seoPageRestrictedCategoryId();
const restrictedHref = restrictedId ? categoryPageUrl(restrictedId) : null;
const navCategorySource = restrictedHref
  ? NAV_CATEGORIES.filter((category) => category.href === restrictedHref)
  : NAV_CATEGORIES;
// The categories submenu markup is built first so it can be embedded
// directly inside the "Categories" <li> below. It must live in normal
// document flow immediately after the Categories toggle button (not as
// a sibling appended after the whole nav list), otherwise it renders
// detached from the row that opens it.
const categoryItemsHtml = navCategorySource.map((category) => {
const slug = categorySlugFromHref(category.href);
const icon = CATEGORY_ICONS[slug] || DEFAULT_CATEGORY_ICON;
// Same English-keeps-its-own-short-label reasoning as
// renderCategoryDropdownMenus() above.
let label = category.label;
if (typeof currentLanguageCode !== "undefined" && currentLanguageCode !== DEFAULT_LANGUAGE_CODE && typeof categories !== "undefined" && typeof getCategoryDisplayName === "function") {
const match = categories.find((c) => c.id === category.catId);
if (match) label = getCategoryDisplayName(match);
}
const unitCountSuffix = restrictedId ? ` (${categoryMap.get(restrictedId).units.length.toLocaleString("en-US")} ${getTranslation("categories.unitsLabel", getStoredLanguageCode())})` : "";
return `<li><a class="mobile-drawer-category-link" href="${category.href}">${icon}<span>${escapeHtml(label)}${escapeHtml(unitCountSuffix)}</span></a></li>`;
}).join("");
const navItemsHtml = MOBILE_MAIN_NAV.map((item) => {
const icon = MAIN_NAV_ICONS[item.id] || DEFAULT_CATEGORY_ICON;
if (item.expand) {
return `<li class="mobile-drawer-categories-item">
<button type="button" class="mobile-drawer-link mobile-drawer-categories-toggle" id="mobileDrawerCategoriesToggle" aria-expanded="false" aria-controls="mobileDrawerCategoriesPanel">${icon}<span data-i18n="${item.i18nKey}">${item.label}</span>${CHEVRON_ICON}</button>
<div class="mobile-drawer-categories" id="mobileDrawerCategoriesPanel">
<ul class="mobile-drawer-category-list">${categoryItemsHtml}</ul>
</div>
</li>`;
}
return `<li><a class="mobile-drawer-link" href="${item.href}">${icon}<span data-i18n="${item.i18nKey}">${item.label}</span>${CHEVRON_ICON}</a></li>`;
}).join("");
drawer.innerHTML = `
<div class="mobile-drawer-head">
<button type="button" class="mobile-drawer-close" id="mobileDrawerClose" aria-label="Close menu">
<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
</button>
</div>
<ul class="mobile-drawer-nav">${navItemsHtml}</ul>
`;
}
// Expands/collapses the Categories submenu as a true accordion: the
// panel stays `position: static` and part of normal document flow, so
// animating its height naturally pushes Calculators/Popular/Guides/etc.
// downward instead of overlaying them.
function toggleCategoriesPanel(panel, open) {
// Clear any in-progress transition listener before starting a new one.
if (panel._collapseTransitionHandler) {
panel.removeEventListener("transitionend", panel._collapseTransitionHandler);
panel._collapseTransitionHandler = null;
}
if (open) {
// Add the class first so padding is in place before we measure the
// content height we're animating toward.
panel.classList.add("open");
const targetHeight = panel.scrollHeight;
panel.style.maxHeight = "0px";
// Force a reflow so the browser registers the 0px starting point
// before we animate to the measured content height.
void panel.offsetHeight;
panel.style.maxHeight = targetHeight + "px";
const onDone = (event) => {
if (event.target !== panel || event.propertyName !== "max-height") return;
// Let the panel grow/shrink freely after opening (e.g. on resize)
// instead of staying pinned to the height measured at open time.
panel.style.maxHeight = "none";
panel.removeEventListener("transitionend", onDone);
panel._collapseTransitionHandler = null;
};
panel._collapseTransitionHandler = onDone;
panel.addEventListener("transitionend", onDone);
} else {
// Pin the panel to its current pixel height first (it may currently
// be "none") so there is a concrete starting point to animate from.
const currentHeight = panel.scrollHeight;
panel.style.maxHeight = currentHeight + "px";
void panel.offsetHeight;
panel.style.maxHeight = "0px";
const onDone = (event) => {
if (event.target !== panel || event.propertyName !== "max-height") return;
// Only now drop the padding, once the panel is visually collapsed.
panel.classList.remove("open");
panel.removeEventListener("transitionend", onDone);
panel._collapseTransitionHandler = null;
};
panel._collapseTransitionHandler = onDone;
panel.addEventListener("transitionend", onDone);
}
}
function initMobileDrawer() {
const toggle = document.getElementById("mobileMenuToggle");
const overlay = document.getElementById("mobileDrawerOverlay");
const drawer = document.getElementById("mobileDrawer");
if (!toggle || !overlay || !drawer) return null;
let lastFocused = null;
function focusableElements() {
return Array.prototype.slice.call(
drawer.querySelectorAll('a[href], button:not([disabled])')
).filter((el) => el.offsetParent !== null);
}
function openDrawer() {
lastFocused = document.activeElement;
overlay.hidden = false;
requestAnimationFrame(() => {
overlay.classList.add("open");
drawer.classList.add("open");
});
drawer.setAttribute("aria-hidden", "false");
toggle.setAttribute("aria-expanded", "true");
document.body.classList.add("mobile-drawer-open");
const main = document.querySelector("main");
if (main) main.setAttribute("inert", "");
const footer = document.querySelector(".site-footer");
if (footer) footer.setAttribute("inert", "");
const closeBtn = document.getElementById("mobileDrawerClose");
if (closeBtn) closeBtn.focus();
}
function closeDrawer() {
overlay.classList.remove("open");
drawer.classList.remove("open");
drawer.setAttribute("aria-hidden", "true");
toggle.setAttribute("aria-expanded", "false");
document.body.classList.remove("mobile-drawer-open");
const main = document.querySelector("main");
if (main) main.removeAttribute("inert");
const footer = document.querySelector(".site-footer");
if (footer) footer.removeAttribute("inert");
window.setTimeout(() => {
if (!drawer.classList.contains("open")) overlay.hidden = true;
}, 260);
if (lastFocused && typeof lastFocused.focus === "function") {
lastFocused.focus();
} else {
toggle.focus();
}
}
toggle.addEventListener("click", () => {
const isOpen = drawer.classList.contains("open");
if (isOpen) {
closeDrawer();
} else {
openDrawer();
}
});
overlay.addEventListener("click", closeDrawer);
drawer.addEventListener("click", (event) => {
const closeBtn = event.target.closest("#mobileDrawerClose");
if (closeBtn) {
closeDrawer();
return;
}
const categoriesToggle = event.target.closest("#mobileDrawerCategoriesToggle");
if (categoriesToggle) {
const panel = document.getElementById("mobileDrawerCategoriesPanel");
const isExpanded = categoriesToggle.getAttribute("aria-expanded") === "true";
categoriesToggle.setAttribute("aria-expanded", String(!isExpanded));
categoriesToggle.classList.toggle("is-open", !isExpanded);
if (panel) toggleCategoriesPanel(panel, !isExpanded);
return;
}
// Any real navigation link inside the drawer: let the browser follow
// it, but also close the drawer so it isn't left open behind the new
// page (relevant for same-page anchors like index.html#converter).
const link = event.target.closest("a[href]");
if (link) closeDrawer();
});
document.addEventListener("keydown", (event) => {
if (event.key !== "Escape") return;
if (!drawer.classList.contains("open")) return;
closeDrawer();
});
drawer.addEventListener("keydown", (event) => {
if (event.key !== "Tab") return;
const focusable = focusableElements();
if (!focusable.length) return;
const first = focusable[0];
const last = focusable[focusable.length - 1];
if (event.shiftKey && document.activeElement === first) {
event.preventDefault();
last.focus();
} else if (!event.shiftKey && document.activeElement === last) {
event.preventDefault();
first.focus();
}
});
return closeDrawer;
}
// ---------------------------------------------------------------------
// Responsive guard: the drawer is tablet/mobile-only (<1024px). It is
// never rendered or initialized while the viewport is desktop-width,
// and it's lazily rendered/initialized the first time the viewport
// drops below 1024px - so resizing a browser window, or rotating a
// tablet, across that breakpoint works correctly with no duplicate
// listeners and no drawer left open behind the desktop nav.
// ---------------------------------------------------------------------
const DESKTOP_NAV_MQ = window.matchMedia("(min-width: 1024px)");
let mobileDrawerReady = false;
let closeMobileDrawer = null;
function setupResponsiveMobileNav() {
if (DESKTOP_NAV_MQ.matches) {
if (closeMobileDrawer) closeMobileDrawer();
return;
}
if (mobileDrawerReady) return;
renderMobileDrawer();
closeMobileDrawer = initMobileDrawer();
mobileDrawerReady = true;
}
if (typeof DESKTOP_NAV_MQ.addEventListener === "function") {
DESKTOP_NAV_MQ.addEventListener("change", setupResponsiveMobileNav);
} else if (typeof DESKTOP_NAV_MQ.addListener === "function") {
DESKTOP_NAV_MQ.addListener(setupResponsiveMobileNav);
}
const storageKeys = {
theme: "uc-theme",
favorites: "uc-favorites",
recent: "uc-recent",
searches: "uc-recent-searches",
history: "uc-history",
precision: "uc-precision",
notation: "uc-notation",
customUnits: "uc-custom-units",
newsletter: "uc-newsletter",
language: "uc-language"
};
// Phase 1 of the language selector: this is the single source of truth
// for every supported language - code, display name (in that language's
// own script), flag, and text direction. The selector UI, the stored-
// language validation/fallback, and the future translation-loading layer
// should all read from this one list rather than each keeping their own
// copy. Adding a 15th language later means adding one entry here.
const SUPPORTED_LANGUAGES = [
{ code: "en", name: "English", flag: "\u{1F1EC}\u{1F1E7}", dir: "ltr" },
{ code: "es", name: "Espa\u00f1ol", flag: "\u{1F1EA}\u{1F1F8}", dir: "ltr" },
{ code: "fr", name: "Fran\u00e7ais", flag: "\u{1F1EB}\u{1F1F7}", dir: "ltr" },
{ code: "de", name: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}", dir: "ltr" },
{ code: "pt", name: "Portugu\u00eas", flag: "\u{1F1F5}\u{1F1F9}", dir: "ltr" },
{ code: "it", name: "Italiano", flag: "\u{1F1EE}\u{1F1F9}", dir: "ltr" },
{ code: "ar", name: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", flag: "\u{1F1F8}\u{1F1E6}", dir: "rtl" },
{ code: "zh", name: "\u4e2d\u6587", flag: "\u{1F1E8}\u{1F1F3}", dir: "ltr" },
{ code: "ja", name: "\u65e5\u672c\u8a9e", flag: "\u{1F1EF}\u{1F1F5}", dir: "ltr" },
{ code: "ko", name: "\ud55c\uad6d\uc5b4", flag: "\u{1F1F0}\u{1F1F7}", dir: "ltr" },
{ code: "hi", name: "\u0939\u093f\u0928\u094d\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}", dir: "ltr" },
{ code: "tr", name: "T\u00fcrk\u00e7e", flag: "\u{1F1F9}\u{1F1F7}", dir: "ltr" },
{ code: "id", name: "Bahasa Indonesia", flag: "\u{1F1EE}\u{1F1E9}", dir: "ltr" },
{ code: "so", name: "Soomaali", flag: "\u{1F1F8}\u{1F1F4}", dir: "ltr" }
];
const DEFAULT_LANGUAGE_CODE = "en";
// Maps each supported language code to a BCP-47 locale tag, used only for
// toLocaleDateString() month-name formatting (e.g. the date calculator's
// result). Deliberately NOT used for toLocaleString() number formatting
// elsewhere in the app (unit counts, page counts, day counts, etc.),
// which intentionally stays "en-US" everywhere for consistent digit
// grouping - this map exists because a month abbreviation like "Oct" is
// translatable UI text, unlike a thousands-separator choice.
const DATE_LOCALE_MAP = {
en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-PT", it: "it-IT",
ar: "ar", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", hi: "hi-IN", tr: "tr-TR",
id: "id-ID", so: "so-SO"
};
const TRANSLATIONS = {
en: {
nav: { home: "Home", converter: "Converter", categories: "Categories", allCategories: "All categories", calculators: "Calculators", popular: "Popular", guides: "Guides", sitemap: "Sitemap", about: "About", contact: "Contact", search: "Search", language: "Language", theme: "Theme", menu: "Menu", themeDark: "Dark", themeLight: "Light", privacy: "Privacy" },
converter: { searchAllUnits: "Search all units", fromUnit: "From Unit", toUnit: "To Unit", swap: "Swap units", decimalControl: "Decimal control", notation: "Notation", notationAuto: "Auto", notationDecimal: "Decimal", notationScientific: "Scientific", notationEngineering: "Engineering", result: "Result", copyResult: "Copy result", share: "Share", favorite: "Favorite", contextValues: "Context values", fromDefinition: "From definition", toDefinition: "To definition", formula: "Formula", enterValue: "Enter a number to convert", useDecimalNotation: "Use decimal or scientific notation, such as 1.25e6.", searchConversionPlaceholder: "Search conversion...", voltageLabel: "Voltage", currentLabel: "Current", resistanceLabel: "Resistance", hoursLabel: "Hours", liquidDensityLabel: "Liquid density, kg/L", contextHelpDefault: "Some unit families need one extra value for a physically accurate result.", contextHelpElectricity: "Cross-family electrical results use voltage, current, resistance, and hours. Same-family electrical units convert directly.", kindDefault: "Converter", kindCurrency: "Currency calculator", kindElectricity: "Electrical calculator", seoAdSlotConverterLabel: "Converter ad slot", seoAdSlotConverterReserved: "Reserved below the result so the calculator remains usable.", seoAdSlotContentTopLabel: "Ad slot: content top (728x90)", seoAdSlotContentTopReserved: "Reserved above the conversion cards and below the converter.", seoAdSlotContentMiddleLabel: "Ad slot: content middle (728x90)", seoAdSlotContentMiddleReserved: "Reserved between the cards and the FAQ so the page stays balanced.", saved: "Saved" },
sidebar: { advertisement: "Advertisement", favoriteConverters: "Favorite converters", recentlyUsed: "Recently used", conversionHistory: "Conversion history", clear: "Clear", noFavorites: "No favorites yet. Save a converter to keep it here.", noRecent: "Recent converters will appear here after you use them.", noHistory: "Your latest conversions stay on this device and work offline.", noMatchingConverter: "No matching converter found. Try a unit symbol, category name, or formula keyword." },
common: { resultCopied: "Result copied to clipboard.", copyUnavailable: "Copy is unavailable in this browser, but the result is ready to select.", shareOpened: "Share dialog opened.", shareCopied: "Share text copied to clipboard.", shareCancelled: "Share was cancelled or unavailable.", addApiEndpoint: "Add an API endpoint or use offline fallback rates.", couldNotLoadRates: "Could not load live rates. Offline fallback remains active." },
categories: { unitsLabel: "units", conversionPagesLabel: "conversion pages" },
homepage: { heroTitle: "Convert Any Unit Instantly", heroDescription: "Universal Converter is a free, all-in-one conversion platform covering 27 measurement categories and over 6,400 units, including length, weight, temperature, volume, currency, digital storage, pressure, agriculture, astronomy, cooking, and engineering. Search or browse by category, get instant accurate results with source definitions and formulas, and use the same converter for everyday tasks, scientific work, and business calculations, online or offline.", chipLength: "Length", chipWeight: "Weight", chipTemperature: "Temperature", chipVolume: "Volume", chipPressure: "Pressure", chipDigital: "Digital Storage", chipCurrency: "Currency", chipAgriculture: "Agriculture", chipFlow: "Flow Rate", adSpace: "Ad space", adSpaceCalculatorText: "Display ads help keep this calculator free to use.", adSpaceSiteText: "Display ads help keep this site free to use.", searchConversionLabel: "Search conversion", statsEyebrow: "Universal Converter by the numbers", statsHeading: "A converter built at real scale", statsDescription: "Every figure below reflects what is actually running behind the calculator: real unit definitions and real generated conversion pages, not placeholder content.", statsCategoriesDescription: "Measurement categories, spanning everyday length and weight through agriculture, astronomy, and engineering.", statsUnitsDescription: "Individual unit definitions supported across every category, including metric prefixes and regional variants.", statsPagesDescription: "SEO conversion pages generated site-wide, each with a formula, FAQ, and related conversions.", popularConversionsHeading: "Popular Conversions", exploreSeoPagesLink: "Explore SEO pages", popularConversionTemplate: "{FROM} to {TO}", recentlySearchedLabel: "Recently searched", noMatchingConversionFound: "No matching conversion found", launchStatusEyebrow: "Launch status", launchStatusHeading: "Accurate, transparent, and ready for daily use", launchStatusUpdatedTemplate: "Last updated: {DATE}. Core SI, metric, imperial, and US customary factors are documented in the converter definitions. Currency rates use offline sample values unless a live API endpoint is connected.", launchStatusAccuracyTitle: "Accuracy information", launchStatusAccuracyDesc: "Exact constants are used where definitions are fixed, including inch, foot, mile, pound, acre, liter, and US gallon relationships.", launchStatusSourcesTitle: "Source references", launchStatusSourcesDesc: "SI definitions are aligned with BIPM and NIST references. Non-SI common units include definition notes in the result panel.", launchStatusViewReferencesLink: "View references", launchStatusOfflineTitle: "Offline and private", launchStatusOfflineDesc: "Converters run in the browser. Favorites, history, newsletter signups, and custom units stay on this device for privacy.", categoryOverviewHeading: "All converter categories", readConversionGuidesLink: "Read conversion guides", whyHeading: "Why Universal Converter", whyThousandsTitle: "Thousands of units", whyThousandsDesc: "Search SI, imperial, US customary, scientific, engineering, cooking, agriculture, astronomy, and digital units from one place.", whyFormulasTitle: "Accurate formulas", whyFormulasDesc: "Exact constants are used where definitions are fixed, and formula notes explain how each result is calculated.", whyFreeTitle: "Free forever", whyFreeDesc: "The core converter is built as a free public utility with no account required for everyday conversions.", whyMobileTitle: "Works on mobile", whyMobileDesc: "The calculator, category grid, search, guides, and SEO pages are responsive for phones, tablets, and desktops.", whyOfflineTitle: "Offline support", whyOfflineDesc: "PWA caching keeps the main app shell available after installation on a hosted HTTP or HTTPS deployment.", guidePreviewEyebrow: "SEO-ready utility pages", guidePreviewHeading: "Helpful guides for common calculations", guidePreviewDesc: "Explore focused pages for unit converter searches, calculator tasks, high-value measurement searches, formulas, FAQs, and related conversion clusters.", linkUnitConverter: "Unit converter", linkOnlineCalculator: "Online calculator", linkMeterToFeet: "Meter to feet", linkKgToLbs: "kg to lbs", linkLiterToGallon: "Liter to gallon", linkCelsiusToFahrenheit: "Celsius to Fahrenheit", linkAcreToHectare: "Acre to hectare", linkGbToMb: "GB to MB", linkMetricVsImperial: "Metric vs Imperial", linkDigitalStorage: "Digital storage", businessHeading: "Built like a real conversion business", businessAnalyticsTitle: "Privacy-friendly analytics", businessAnalyticsDesc: "Usage is measured anonymously to guide improvements, without selling or sharing personal conversion data.", businessAdsTitle: "Ad-supported and free", businessAdsDesc: "Display ads are placed to stay out of the way of the calculator so every tool stays free to use.", businessStayLoopTitle: "Stay in the loop", businessStayLoopDesc: "Subscribe to hear about new calculators, unit coverage, and conversion guides as they launch.", businessCustomUnitsTitle: "Custom units", businessCustomUnitsDesc: "Save unit definitions that matter to your team or industry, right in your browser.", businessMoreTitle: "More on the way", businessMoreDesc: "Saved workspaces, an ad-free mode, team calculators, CSV export, and API access are on the roadmap.", faqHeading: "Common questions", faqQ1: "What is a unit converter?", faqA1: "A unit converter changes a number from one measurement unit to another, such as kilograms to pounds, meters to feet, Celsius to Fahrenheit, or GB to MB.", faqQ2: "How accurate are conversions?", faqA2: "Many relationships are exact by definition, including inch, foot, pound, liter, and US gallon relationships. Approximate units are described in their definitions.", faqQ3: "Which units are supported?", faqA3: "Universal Converter supports metric, imperial, US customary, scientific, engineering, digital, cooking, agriculture, astronomy, electricity, pressure, energy, and more.", faqQ4: "Is Universal Converter free to use?", faqA4: "Yes. The core converter, calculators, category browser, and guides are free to use with no account or sign-up required.", faqQ5: "Does it work without an internet connection?", faqA5: "Once installed as a PWA, the main app shell is cached and stays available offline. Favorites, history, and custom units are also stored on your device.", featuredGuidesHeading: "Learn the conversions behind the numbers", viewAllGuidesLink: "View all guides", readGuideLink: "Read guide", fgTag1: "Digital storage", fgTitle1: "How Digital Storage Units Work", fgDesc1: "Bits, bytes, decimal prefixes, and binary prefixes explain why storage conversions can look different across devices.", fgTag2: "Temperature", fgTitle2: "Celsius vs Fahrenheit", fgDesc2: "The difference between Celsius and Fahrenheit, conversion formulas, and worked examples.", fgTag3: "Measurement systems", fgTitle3: "Metric vs Imperial System", fgDesc3: "Common units, exact relationships, and practical tips for converting between metric and imperial.", fgTag4: "Pressure", fgTitle4: "How Pressure Units Work", fgDesc4: "Pascal, bar, PSI, atmosphere, and mmHg compared, with practical conversion formulas.", newsletterEyebrow: "Newsletter", newsletterHeading: "Get new calculators and conversion guides", newsletterDesc: "Subscribe for new formula guides, agriculture tools, engineering units, and platform updates.", newsletterEmailLabel: "Email", newsletterPlaceholder: "Enter your email address", newsletterSubscribeButton: "Subscribe", newsletterSuccessStatus: "Thanks for subscribing! You're on the list.", missionEyebrow: "Our mission", missionHeading: "Making every measurement easy to trust", missionBody: "Universal Converter exists to make unit conversion fast, accurate, and free for everyone, from students and cooks to engineers and business teams. We publish exact definitions and formulas alongside every result, keep the core tool free with no account required, and build for offline use so a converter is available wherever you're working.", footerTagline: "Fast conversions for everyday, scientific, engineering, and business units.", footerAbout: "About", footerContact: "Contact", footerPrivacy: "Privacy Policy", footerTerms: "Terms", footerReferences: "References", footerGuides: "Guides", footerSitemap: "Sitemap", footerCalculators: "Calculators", moreGuidesHeading: "More conversion guides and tips", blogAccuracyTag: "Accuracy", blogAccuracyTitle: "How unit converters stay accurate", blogAccuracySummary: "Most reliable converters normalize values through a base unit, then format the result for humans.", blogGlobalUnitsTag: "Global units", blogGlobalUnitsTitle: "Metric, imperial, and US customary units", blogGlobalUnitsSummary: "A global converter needs overlapping systems, aliases, and formula notes so users find the unit they expect.", blogTemperatureTag: "Temperature", blogTemperatureTitle: "Celsius vs Fahrenheit", blogTemperatureSummary: "The difference between Celsius and Fahrenheit, conversion formulas, and worked examples.", blogDigitalStorageTag: "Digital storage", blogDigitalStorageTitle: "How Digital Storage Units Work", blogDigitalStorageSummary: "Bits, bytes, decimal prefixes, and binary prefixes explain why storage conversions can look different across devices." },
messages: { sameUnit: "Same-unit conversion.", currencyOfflineNote: "Currency uses offline fallback rates unless live API rates were loaded.", temperatureNote: "Temperature conversion uses Kelvin as the intermediate absolute scale.", chooseCompatibleFamiliesMessage: "Choose compatible unit families", differentThingsNote: "{FROM} and {TO} measure different things.", fuelZeroMessage: "Enter a nonzero fuel economy value", fuelInvertNote: "Consumption units invert the efficiency value.", fuelSupportsNote: "Fuel economy supports both distance-per-volume and volume-per-distance units.", electricitySameFamilyNote: "Electrical units in the same family convert directly.", electricityNeedContextMessage: "Add the needed electrical context", electricityNeedContextNote: "Cross-family electrical calculations need voltage, current, resistance, or hours.", electricityContextNote: "Electrical result uses the context values shown above.", conversionUnavailableMessage: "Conversion unavailable", needCompatibleUnitsNote: "This conversion needs compatible units.", resultsUpdateNote: "Results update instantly as you type." },
calculators: { heading: "Business, finance, health, date, and agriculture calculators", badgeCurrency: "Currency API ready", badgeAgriculture: "Agriculture suite", badgeClientSide: "Client-side results", currencyTitle: "Currency converter", currencyDesc: "API-ready exchange calculator with offline fallback rates.", currencyApiLabel: "API endpoint (optional)", currencyApiPlaceholder: "Paste a live exchange rate API URL", currencyRefreshButton: "Refresh rates", percentageTitle: "Percentage calculator", percentOfLabel: "% of", percentageResultSuffix: "result", bmiTitle: "BMI calculator", bmiUnderweight: "Underweight", bmiNormal: "Normal", bmiOverweight: "Overweight", bmiObesity: "Obesity range", bmiEnterPrompt: "Enter weight and height", ageTitle: "Age calculator", birthDateLabel: "Birth date", chooseDatePrompt: "Choose a date", dateCalcTitle: "Date calculator", chooseStartDatePrompt: "Choose a start date", daysLaterTemplate: "{OFFSET} days later: {DATE}", mortgageTitle: "Mortgage calculator", perMonthSuffix: "per month", enterLoanDetailsPrompt: "Enter loan details", fuelCostTitle: "Fuel cost calculator", estimatedFuelCostSuffix: "estimated fuel cost", enterTripDetailsPrompt: "Enter trip details", agricultureTitle: "Agriculture calculators", tabSeed: "Seed", tabFertilizer: "Fertilizer", tabYield: "Yield", tabIrrigation: "Irrigation", seedRequiredSuffix: "kg seed required", fertBagsTemplate: "{FERT} kg, {BAGS} bags", tHaRevenueTemplate: "{RATE} t/ha, {REVENUE} revenue", m3WaterRequiredSuffix: "m3 water required", ageResultTemplate: "{YEARS} years old, {DAYS} days", currencyNeedEndpointPrompt: "Add an API endpoint or use offline fallback rates.", currencyLiveRatesFailedPrompt: "Could not load live rates. Offline fallback remains active." },
cookieBanner: { messagePrefix: "We use cookies to improve your experience and to enable Google Analytics and Google AdSense. By continuing, you agree to our ", privacyPolicyLink: "Privacy Policy", messageSuffix: ".", decline: "Decline", accept: "Accept", ariaLabel: "Cookie notice" }
},
es: {
nav: { home: "Inicio", converter: "Conversor", categories: "Categorías", allCategories: "Todas las categorías", calculators: "Calculadoras", popular: "Popular", guides: "Guías", sitemap: "Mapa del sitio", about: "Acerca de", contact: "Contacto", search: "Buscar", language: "Idioma", theme: "Tema", menu: "Menú", themeDark: "Oscuro", themeLight: "Claro", privacy: "Privacidad" },
converter: { searchAllUnits: "Buscar todas las unidades", fromUnit: "Unidad de origen", toUnit: "Unidad de destino", swap: "Intercambiar unidades", decimalControl: "Control de decimales", notation: "Notación", notationAuto: "Automática", notationDecimal: "Decimal", notationScientific: "Científica", notationEngineering: "Ingeniería", result: "Resultado", copyResult: "Copiar resultado", share: "Compartir", favorite: "Favorito", contextValues: "Valores de contexto", fromDefinition: "Definición de origen", toDefinition: "Definición de destino", formula: "Fórmula", enterValue: "Introduce un número para convertir", useDecimalNotation: "Usa notación decimal o científica, como 1.25e6.", searchConversionPlaceholder: "Buscar conversión...", voltageLabel: "Voltaje", currentLabel: "Corriente", resistanceLabel: "Resistencia", hoursLabel: "Horas", liquidDensityLabel: "Densidad del líquido, kg/L", contextHelpDefault: "Algunas familias de unidades necesitan un valor adicional para obtener un resultado físicamente preciso.", contextHelpElectricity: "Los resultados eléctricos entre familias distintas usan voltaje, corriente, resistencia y horas. Las unidades eléctricas de la misma familia se convierten directamente.", kindDefault: "Conversor", kindCurrency: "Calculadora de divisas", kindElectricity: "Calculadora eléctrica", seoAdSlotConverterLabel: "Ranura de anuncio del conversor", seoAdSlotConverterReserved: "Reservado debajo del resultado para que la calculadora siga siendo utilizable.", seoAdSlotContentTopLabel: "Espacio publicitario: parte superior del contenido (728x90)", seoAdSlotContentTopReserved: "Reservado encima de las tarjetas de conversión y debajo del conversor.", seoAdSlotContentMiddleLabel: "Espacio publicitario: centro del contenido (728x90)", seoAdSlotContentMiddleReserved: "Reservado entre las tarjetas y las preguntas frecuentes para mantener el equilibrio de la página.", saved: "Guardado" },
sidebar: { advertisement: "Publicidad", favoriteConverters: "Conversores favoritos", recentlyUsed: "Usados recientemente", conversionHistory: "Historial de conversiones", clear: "Borrar", noFavorites: "Aún no hay favoritos. Guarda un conversor para verlo aquí.", noRecent: "Los conversores recientes aparecerán aquí después de usarlos.", noHistory: "Tus conversiones más recientes permanecen en este dispositivo y funcionan sin conexión.", noMatchingConverter: "No se encontró ningún conversor coincidente. Prueba con un símbolo de unidad, un nombre de categoría o una palabra clave de fórmula." },
common: { resultCopied: "Resultado copiado al portapapeles.", copyUnavailable: "Copiar no está disponible en este navegador, pero el resultado está listo para seleccionar.", shareOpened: "Se abrió el diálogo para compartir.", shareCopied: "Texto para compartir copiado al portapapeles.", shareCancelled: "Se canceló o no está disponible la función de compartir.", addApiEndpoint: "Agrega un endpoint de API o usa las tasas sin conexión.", couldNotLoadRates: "No se pudieron cargar las tasas en vivo. Sigue activo el modo sin conexión." },
categories: { unitsLabel: "unidades", conversionPagesLabel: "páginas de conversión" },
homepage: { heroTitle: "Convierte cualquier unidad al instante", heroDescription: "Universal Converter es una plataforma de conversión gratuita y todo en uno que cubre 27 categorías de medición y más de 6400 unidades, incluyendo longitud, peso, temperatura, volumen, moneda, almacenamiento digital, presión, agricultura, astronomía, cocina e ingeniería. Busca o navega por categoría, obtén resultados precisos al instante con definiciones y fórmulas de referencia, y usa el mismo conversor para tareas cotidianas, trabajo científico y cálculos empresariales, en línea o sin conexión.", chipLength: "Longitud", chipWeight: "Peso", chipTemperature: "Temperatura", chipVolume: "Volumen", chipPressure: "Presión", chipDigital: "Almacenamiento digital", chipCurrency: "Moneda", chipAgriculture: "Agricultura", chipFlow: "Caudal", adSpace: "Espacio publicitario", adSpaceCalculatorText: "Los anuncios ayudan a mantener esta calculadora gratuita.", adSpaceSiteText: "Los anuncios ayudan a mantener este sitio gratuito.", searchConversionLabel: "Buscar conversión", statsEyebrow: "Universal Converter en cifras", statsHeading: "Un conversor construido a escala real", statsDescription: "Cada cifra a continuación refleja lo que realmente funciona detrás de la calculadora: definiciones de unidades reales y páginas de conversión generadas de verdad, no contenido de relleno.", statsCategoriesDescription: "Categorías de medición, desde longitud y peso cotidianos hasta agricultura, astronomía e ingeniería.", statsUnitsDescription: "Definiciones de unidades individuales admitidas en cada categoría, incluyendo prefijos métricos y variantes regionales.", statsPagesDescription: "Páginas de conversión SEO generadas en todo el sitio, cada una con fórmula, preguntas frecuentes y conversiones relacionadas.", popularConversionsHeading: "Conversiones populares", exploreSeoPagesLink: "Explorar páginas SEO", popularConversionTemplate: "{FROM} a {TO}", recentlySearchedLabel: "Buscado recientemente", noMatchingConversionFound: "No se encontró ninguna conversión coincidente", launchStatusEyebrow: "Estado de lanzamiento", launchStatusHeading: "Preciso, transparente y listo para el uso diario", launchStatusUpdatedTemplate: "Última actualización: {DATE}. Los factores principales del SI, métrico, imperial y consuetudinario de EE. UU. están documentados en las definiciones del conversor. Las tasas de cambio usan valores de muestra sin conexión a menos que se conecte un endpoint de API en vivo.", launchStatusAccuracyTitle: "Información de precisión", launchStatusAccuracyDesc: "Se usan constantes exactas donde las definiciones son fijas, incluyendo las relaciones de pulgada, pie, milla, libra, acre, litro y galón estadounidense.", launchStatusSourcesTitle: "Referencias de origen", launchStatusSourcesDesc: "Las definiciones del SI se alinean con las referencias del BIPM y el NIST. Las unidades comunes no pertenecientes al SI incluyen notas de definición en el panel de resultados.", launchStatusViewReferencesLink: "Ver referencias", launchStatusOfflineTitle: "Sin conexión y privado", launchStatusOfflineDesc: "Los conversores se ejecutan en el navegador. Los favoritos, el historial, las suscripciones al boletín y las unidades personalizadas permanecen en este dispositivo por privacidad.", categoryOverviewHeading: "Todas las categorías de conversión", readConversionGuidesLink: "Leer guías de conversión", whyHeading: "Por qué Universal Converter", whyThousandsTitle: "Miles de unidades", whyThousandsDesc: "Busca unidades del SI, imperiales, consuetudinarias de EE. UU., científicas, de ingeniería, de cocina, agrícolas, astronómicas y digitales desde un solo lugar.", whyFormulasTitle: "Fórmulas precisas", whyFormulasDesc: "Se usan constantes exactas donde las definiciones son fijas, y las notas de fórmula explican cómo se calcula cada resultado.", whyFreeTitle: "Gratis para siempre", whyFreeDesc: "El conversor principal está creado como una utilidad pública gratuita, sin necesidad de cuenta para las conversiones cotidianas.", whyMobileTitle: "Funciona en móviles", whyMobileDesc: "La calculadora, la cuadrícula de categorías, la búsqueda, las guías y las páginas SEO son adaptables para teléfonos, tabletas y computadoras de escritorio.", whyOfflineTitle: "Compatibilidad sin conexión", whyOfflineDesc: "El almacenamiento en caché de la PWA mantiene disponible el shell principal de la aplicación después de la instalación en una implementación HTTP o HTTPS alojada.", guidePreviewEyebrow: "Páginas de utilidad listas para SEO", guidePreviewHeading: "Guías útiles para cálculos comunes", guidePreviewDesc: "Explora páginas específicas para búsquedas de conversores de unidades, tareas de calculadora, búsquedas de medidas de alto valor, fórmulas, preguntas frecuentes y grupos de conversiones relacionadas.", linkUnitConverter: "Conversor de unidades", linkOnlineCalculator: "Calculadora en línea", linkMeterToFeet: "Metro a pie", linkKgToLbs: "kg a lbs", linkLiterToGallon: "Litro a galón", linkCelsiusToFahrenheit: "Celsius a Fahrenheit", linkAcreToHectare: "Acre a hectárea", linkGbToMb: "GB a MB", linkMetricVsImperial: "Métrico vs. imperial", linkDigitalStorage: "Almacenamiento digital", businessHeading: "Creado como un verdadero negocio de conversión", businessAnalyticsTitle: "Análisis que respeta la privacidad", businessAnalyticsDesc: "El uso se mide de forma anónima para guiar mejoras, sin vender ni compartir datos de conversión personales.", businessAdsTitle: "Con publicidad y gratis", businessAdsDesc: "Los anuncios se colocan de forma que no interfieran con la calculadora, para que cada herramienta siga siendo gratuita.", businessStayLoopTitle: "Mantente al tanto", businessStayLoopDesc: "Suscríbete para enterarte de nuevas calculadoras, cobertura de unidades y guías de conversión a medida que se publican.", businessCustomUnitsTitle: "Unidades personalizadas", businessCustomUnitsDesc: "Guarda definiciones de unidades importantes para tu equipo o industria, directamente en tu navegador.", businessMoreTitle: "Más en camino", businessMoreDesc: "Espacios de trabajo guardados, un modo sin anuncios, calculadoras de equipo, exportación a CSV y acceso a la API están en el plan.", faqHeading: "Preguntas frecuentes", faqQ1: "¿Qué es un conversor de unidades?", faqA1: "Un conversor de unidades transforma un número de una unidad de medida a otra, como kilogramos a libras, metros a pies, Celsius a Fahrenheit o GB a MB.", faqQ2: "¿Qué tan precisas son las conversiones?", faqA2: "Muchas relaciones son exactas por definición, incluyendo pulgada, pie, libra, litro y galón estadounidense. Las unidades aproximadas se describen en sus definiciones.", faqQ3: "¿Qué unidades son compatibles?", faqA3: "Universal Converter admite unidades métricas, imperiales, consuetudinarias de EE. UU., científicas, de ingeniería, digitales, de cocina, agrícolas, astronómicas, eléctricas, de presión, de energía y más.", faqQ4: "¿Es gratis usar Universal Converter?", faqA4: "Sí. El conversor principal, las calculadoras, el navegador de categorías y las guías son gratuitos, sin necesidad de cuenta ni registro.", faqQ5: "¿Funciona sin conexión a internet?", faqA5: "Una vez instalado como PWA, el shell principal de la aplicación se almacena en caché y permanece disponible sin conexión. Los favoritos, el historial y las unidades personalizadas también se guardan en tu dispositivo.", featuredGuidesHeading: "Aprende las conversiones detrás de los números", viewAllGuidesLink: "Ver todas las guías", readGuideLink: "Leer guía", fgTag1: "Almacenamiento digital", fgTitle1: "Cómo funcionan las unidades de almacenamiento digital", fgDesc1: "Bits, bytes, prefijos decimales y prefijos binarios explican por qué las conversiones de almacenamiento pueden verse diferentes según el dispositivo.", fgTag2: "Temperatura", fgTitle2: "Celsius vs. Fahrenheit", fgDesc2: "La diferencia entre Celsius y Fahrenheit, fórmulas de conversión y ejemplos resueltos.", fgTag3: "Sistemas de medición", fgTitle3: "Sistema métrico vs. imperial", fgDesc3: "Unidades comunes, relaciones exactas y consejos prácticos para convertir entre el sistema métrico e imperial.", fgTag4: "Presión", fgTitle4: "Cómo funcionan las unidades de presión", fgDesc4: "Comparación de pascal, bar, PSI, atmósfera y mmHg, con fórmulas de conversión prácticas.", newsletterEyebrow: "Boletín", newsletterHeading: "Recibe nuevas calculadoras y guías de conversión", newsletterDesc: "Suscríbete para recibir nuevas guías de fórmulas, herramientas agrícolas, unidades de ingeniería y actualizaciones de la plataforma.", newsletterEmailLabel: "Correo electrónico", newsletterPlaceholder: "Ingresa tu correo electrónico", newsletterSubscribeButton: "Suscribirse", newsletterSuccessStatus: "¡Gracias por suscribirte! Ya estás en la lista.", missionEyebrow: "Nuestra misión", missionHeading: "Hacer que cada medición sea fácil de confiar", missionBody: "Universal Converter existe para hacer que la conversión de unidades sea rápida, precisa y gratuita para todos, desde estudiantes y cocineros hasta ingenieros y equipos de negocios. Publicamos definiciones y fórmulas exactas junto a cada resultado, mantenemos la herramienta principal gratuita sin necesidad de cuenta, y la construimos para uso sin conexión para que un conversor esté disponible dondequiera que trabajes.", footerTagline: "Conversiones rápidas para unidades cotidianas, científicas, de ingeniería y de negocios.", footerAbout: "Acerca de", footerContact: "Contacto", footerPrivacy: "Política de privacidad", footerTerms: "Términos", footerReferences: "Referencias", footerGuides: "Guías", footerSitemap: "Mapa del sitio", footerCalculators: "Calculadoras", moreGuidesHeading: "Más guías y consejos de conversión", blogAccuracyTag: "Precisión", blogAccuracyTitle: "Cómo los conversores de unidades se mantienen precisos", blogAccuracySummary: "Los conversores más confiables normalizan los valores a través de una unidad base y luego formatean el resultado para las personas.", blogGlobalUnitsTag: "Unidades globales", blogGlobalUnitsTitle: "Unidades métricas, imperiales y consuetudinarias de EE. UU.", blogGlobalUnitsSummary: "Un conversor global necesita sistemas superpuestos, alias y notas de fórmula para que los usuarios encuentren la unidad que esperan.", blogTemperatureTag: "Temperatura", blogTemperatureTitle: "Celsius vs. Fahrenheit", blogTemperatureSummary: "La diferencia entre Celsius y Fahrenheit, fórmulas de conversión y ejemplos resueltos.", blogDigitalStorageTag: "Almacenamiento digital", blogDigitalStorageTitle: "Cómo funcionan las unidades de almacenamiento digital", blogDigitalStorageSummary: "Bits, bytes, prefijos decimales y prefijos binarios explican por qué las conversiones de almacenamiento pueden verse diferentes según el dispositivo." },
messages: { sameUnit: "Conversión entre la misma unidad.", currencyOfflineNote: "La moneda usa tasas de referencia sin conexión a menos que se hayan cargado tasas en vivo de la API.", temperatureNote: "La conversión de temperatura usa Kelvin como escala absoluta intermedia.", chooseCompatibleFamiliesMessage: "Elige familias de unidades compatibles", differentThingsNote: "{FROM} y {TO} miden cosas diferentes.", fuelZeroMessage: "Introduce un valor de consumo de combustible distinto de cero", fuelInvertNote: "Las unidades de consumo invierten el valor de eficiencia.", fuelSupportsNote: "El consumo de combustible admite unidades de distancia por volumen y de volumen por distancia.", electricitySameFamilyNote: "Las unidades eléctricas de la misma familia se convierten directamente.", electricityNeedContextMessage: "Añade el contexto eléctrico necesario", electricityNeedContextNote: "Los cálculos eléctricos entre familias distintas necesitan voltaje, corriente, resistencia u horas.", electricityContextNote: "El resultado eléctrico usa los valores de contexto mostrados arriba.", conversionUnavailableMessage: "Conversión no disponible", needCompatibleUnitsNote: "Esta conversión necesita unidades compatibles.", resultsUpdateNote: "Los resultados se actualizan al instante mientras escribes." },
calculators: { heading: "Calculadoras de negocios, finanzas, salud, fechas y agricultura", badgeCurrency: "API de divisas lista", badgeAgriculture: "Suite agrícola", badgeClientSide: "Resultados en el navegador", currencyTitle: "Conversor de divisas", currencyDesc: "Calculadora de cambio lista para API con tasas de respaldo sin conexión.", currencyApiLabel: "Endpoint de API (opcional)", currencyApiPlaceholder: "Pega la URL de una API de tasas de cambio en vivo", currencyRefreshButton: "Actualizar tasas", percentageTitle: "Calculadora de porcentajes", percentOfLabel: "% de", percentageResultSuffix: "resultado", bmiTitle: "Calculadora de IMC", bmiUnderweight: "Bajo peso", bmiNormal: "Normal", bmiOverweight: "Sobrepeso", bmiObesity: "Rango de obesidad", bmiEnterPrompt: "Ingresa peso y estatura", ageTitle: "Calculadora de edad", birthDateLabel: "Fecha de nacimiento", chooseDatePrompt: "Elige una fecha", dateCalcTitle: "Calculadora de fechas", chooseStartDatePrompt: "Elige una fecha de inicio", daysLaterTemplate: "{OFFSET} días después: {DATE}", mortgageTitle: "Calculadora de hipoteca", perMonthSuffix: "al mes", enterLoanDetailsPrompt: "Ingresa los detalles del préstamo", fuelCostTitle: "Calculadora de costo de combustible", estimatedFuelCostSuffix: "costo estimado de combustible", enterTripDetailsPrompt: "Ingresa los detalles del viaje", agricultureTitle: "Calculadoras agrícolas", tabSeed: "Semilla", tabFertilizer: "Fertilizante", tabYield: "Rendimiento", tabIrrigation: "Riego", seedRequiredSuffix: "kg de semilla requeridos", fertBagsTemplate: "{FERT} kg, {BAGS} bolsas", tHaRevenueTemplate: "{RATE} t/ha, {REVENUE} de ingresos", m3WaterRequiredSuffix: "m³ de agua requeridos", ageResultTemplate: "{YEARS} años, {DAYS} días", currencyNeedEndpointPrompt: "Agrega un endpoint de API o usa las tasas de respaldo sin conexión.", currencyLiveRatesFailedPrompt: "No se pudieron cargar las tasas en vivo. El respaldo sin conexión sigue activo." },
cookieBanner: { messagePrefix: "Utilizamos cookies para mejorar tu experiencia y habilitar Google Analytics y Google AdSense. Al continuar, aceptas nuestra ", privacyPolicyLink: "Política de privacidad", messageSuffix: ".", decline: "Rechazar", accept: "Aceptar", ariaLabel: "Aviso de cookies" }
},
fr: {
nav: { home: "Accueil", converter: "Convertisseur", categories: "Catégories", allCategories: "Toutes les catégories", calculators: "Calculatrices", popular: "Populaire", guides: "Guides", sitemap: "Plan du site", about: "À propos", contact: "Contact", search: "Rechercher", language: "Langue", theme: "Thème", menu: "Menu", themeDark: "Sombre", themeLight: "Clair", privacy: "Confidentialité" },
converter: { searchAllUnits: "Rechercher toutes les unités", fromUnit: "Unité de départ", toUnit: "Unité d'arrivée", swap: "Inverser les unités", decimalControl: "Contrôle des décimales", notation: "Notation", notationAuto: "Automatique", notationDecimal: "Décimale", notationScientific: "Scientifique", notationEngineering: "Ingénierie", result: "Résultat", copyResult: "Copier le résultat", share: "Partager", favorite: "Favori", contextValues: "Valeurs de contexte", fromDefinition: "Définition de départ", toDefinition: "Définition d'arrivée", formula: "Formule", enterValue: "Entrez un nombre à convertir", useDecimalNotation: "Utilisez la notation décimale ou scientifique, par exemple 1.25e6.", searchConversionPlaceholder: "Rechercher une conversion...", voltageLabel: "Tension", currentLabel: "Courant", resistanceLabel: "Résistance", hoursLabel: "Heures", liquidDensityLabel: "Densité du liquide, kg/L", contextHelpDefault: "Certaines familles d'unités nécessitent une valeur supplémentaire pour un résultat physiquement précis.", contextHelpElectricity: "Les résultats électriques entre familles différentes utilisent la tension, le courant, la résistance et les heures. Les unités électriques de la même famille se convertissent directement.", kindDefault: "Convertisseur", kindCurrency: "Calculatrice de devises", kindElectricity: "Calculatrice électrique", seoAdSlotConverterLabel: "Emplacement publicitaire du convertisseur", seoAdSlotConverterReserved: "Réservé sous le résultat afin que la calculatrice reste utilisable.", seoAdSlotContentTopLabel: "Emplacement publicitaire : haut du contenu (728x90)", seoAdSlotContentTopReserved: "Réservé au-dessus des cartes de conversion et sous le convertisseur.", seoAdSlotContentMiddleLabel: "Emplacement publicitaire : milieu du contenu (728x90)", seoAdSlotContentMiddleReserved: "Réservé entre les cartes et la FAQ afin que la page reste équilibrée.", saved: "Enregistré" },
sidebar: { advertisement: "Publicité", favoriteConverters: "Convertisseurs favoris", recentlyUsed: "Utilisés récemment", conversionHistory: "Historique des conversions", clear: "Effacer", noFavorites: "Aucun favori pour l'instant. Enregistrez un convertisseur pour le retrouver ici.", noRecent: "Les convertisseurs récents apparaîtront ici après utilisation.", noHistory: "Vos dernières conversions restent sur cet appareil et fonctionnent hors ligne.", noMatchingConverter: "Aucun convertisseur correspondant trouvé. Essayez un symbole d'unité, un nom de catégorie ou un mot-clé de formule." },
common: { resultCopied: "Résultat copié dans le presse-papiers.", copyUnavailable: "La copie n'est pas disponible dans ce navigateur, mais le résultat peut être sélectionné.", shareOpened: "Boîte de dialogue de partage ouverte.", shareCopied: "Texte de partage copié dans le presse-papiers.", shareCancelled: "Le partage a été annulé ou n'est pas disponible.", addApiEndpoint: "Ajoutez un point d'accès API ou utilisez les taux hors ligne.", couldNotLoadRates: "Impossible de charger les taux en direct. Le mode hors ligne reste actif." },
categories: { unitsLabel: "unités", conversionPagesLabel: "pages de conversion" },
homepage: { heroTitle: "Convertissez n'importe quelle unité instantanément", heroDescription: "Universal Converter est une plateforme de conversion gratuite et tout-en-un couvrant 27 catégories de mesure et plus de 6 400 unités, notamment la longueur, le poids, la température, le volume, la devise, le stockage numérique, la pression, l'agriculture, l'astronomie, la cuisine et l'ingénierie. Recherchez ou parcourez par catégorie, obtenez des résultats précis et instantanés avec des définitions et formules sources, et utilisez le même convertisseur pour les tâches quotidiennes, le travail scientifique et les calculs professionnels, en ligne ou hors ligne.", chipLength: "Longueur", chipWeight: "Poids", chipTemperature: "Température", chipVolume: "Volume", chipPressure: "Pression", chipDigital: "Stockage numérique", chipCurrency: "Devise", chipAgriculture: "Agriculture", chipFlow: "Débit", adSpace: "Espace publicitaire", adSpaceCalculatorText: "Les publicités aident à garder cette calculatrice gratuite.", adSpaceSiteText: "Les publicités aident à garder ce site gratuit.", searchConversionLabel: "Rechercher une conversion", statsEyebrow: "Universal Converter en chiffres", statsHeading: "Un convertisseur conçu à grande échelle", statsDescription: "Chaque chiffre ci-dessous reflète ce qui fonctionne réellement derrière la calculatrice : de véritables définitions d'unités et de véritables pages de conversion générées, pas un contenu fictif.", statsCategoriesDescription: "Catégories de mesure, de la longueur et du poids courants à l'agriculture, l'astronomie et l'ingénierie.", statsUnitsDescription: "Définitions d'unités individuelles prises en charge dans chaque catégorie, y compris les préfixes métriques et les variantes régionales.", statsPagesDescription: "Pages de conversion SEO générées sur l'ensemble du site, chacune avec une formule, une FAQ et des conversions associées.", popularConversionsHeading: "Conversions populaires", exploreSeoPagesLink: "Explorer les pages SEO", popularConversionTemplate: "{FROM} vers {TO}", recentlySearchedLabel: "Recherché récemment", noMatchingConversionFound: "Aucune conversion correspondante trouvée", launchStatusEyebrow: "État du lancement", launchStatusHeading: "Précis, transparent et prêt pour un usage quotidien", launchStatusUpdatedTemplate: "Dernière mise à jour : {DATE}. Les facteurs SI, métriques, impériaux et usuels américains de base sont documentés dans les définitions du convertisseur. Les taux de change utilisent des valeurs d'exemple hors ligne sauf si un point de terminaison API en direct est connecté.", launchStatusAccuracyTitle: "Informations sur la précision", launchStatusAccuracyDesc: "Des constantes exactes sont utilisées lorsque les définitions sont fixes, y compris les relations pouce, pied, mile, livre, acre, litre et gallon américain.", launchStatusSourcesTitle: "Références des sources", launchStatusSourcesDesc: "Les définitions SI sont alignées sur les références du BIPM et du NIST. Les unités courantes non SI incluent des notes de définition dans le panneau de résultats.", launchStatusViewReferencesLink: "Voir les références", launchStatusOfflineTitle: "Hors ligne et privé", launchStatusOfflineDesc: "Les convertisseurs s'exécutent dans le navigateur. Les favoris, l'historique, les inscriptions à la newsletter et les unités personnalisées restent sur cet appareil pour la confidentialité.", categoryOverviewHeading: "Toutes les catégories de conversion", readConversionGuidesLink: "Lire les guides de conversion", whyHeading: "Pourquoi Universal Converter", whyThousandsTitle: "Des milliers d'unités", whyThousandsDesc: "Recherchez des unités SI, impériales, usuelles américaines, scientifiques, d'ingénierie, culinaires, agricoles, astronomiques et numériques depuis un seul endroit.", whyFormulasTitle: "Formules précises", whyFormulasDesc: "Des constantes exactes sont utilisées lorsque les définitions sont fixes, et des notes de formule expliquent comment chaque résultat est calculé.", whyFreeTitle: "Gratuit pour toujours", whyFreeDesc: "Le convertisseur principal est conçu comme un service public gratuit, sans compte requis pour les conversions courantes.", whyMobileTitle: "Fonctionne sur mobile", whyMobileDesc: "La calculatrice, la grille de catégories, la recherche, les guides et les pages SEO sont adaptés aux téléphones, tablettes et ordinateurs de bureau.", whyOfflineTitle: "Prise en charge hors ligne", whyOfflineDesc: "La mise en cache PWA garde le shell principal de l'application disponible après l'installation sur un déploiement HTTP ou HTTPS hébergé.", guidePreviewEyebrow: "Pages utilitaires prêtes pour le SEO", guidePreviewHeading: "Guides utiles pour les calculs courants", guidePreviewDesc: "Explorez des pages ciblées pour les recherches de convertisseurs d'unités, les tâches de calcul, les recherches de mesures à forte valeur, les formules, les FAQ et les groupes de conversions associées.", linkUnitConverter: "Convertisseur d'unités", linkOnlineCalculator: "Calculatrice en ligne", linkMeterToFeet: "Mètre en pied", linkKgToLbs: "kg en lbs", linkLiterToGallon: "Litre en gallon", linkCelsiusToFahrenheit: "Celsius en Fahrenheit", linkAcreToHectare: "Acre en hectare", linkGbToMb: "Go en Mo", linkMetricVsImperial: "Métrique vs impérial", linkDigitalStorage: "Stockage numérique", businessHeading: "Conçu comme une véritable entreprise de conversion", businessAnalyticsTitle: "Analyses respectueuses de la vie privée", businessAnalyticsDesc: "L'utilisation est mesurée de manière anonyme pour orienter les améliorations, sans vendre ni partager de données de conversion personnelles.", businessAdsTitle: "Financé par la publicité et gratuit", businessAdsDesc: "Les publicités sont placées de manière à ne pas gêner la calculatrice, afin que chaque outil reste gratuit.", businessStayLoopTitle: "Restez informé", businessStayLoopDesc: "Abonnez-vous pour être informé des nouvelles calculatrices, de la couverture des unités et des guides de conversion dès leur sortie.", businessCustomUnitsTitle: "Unités personnalisées", businessCustomUnitsDesc: "Enregistrez les définitions d'unités importantes pour votre équipe ou votre secteur, directement dans votre navigateur.", businessMoreTitle: "Plus à venir", businessMoreDesc: "Des espaces de travail enregistrés, un mode sans publicité, des calculatrices d'équipe, l'export CSV et l'accès à l'API sont au programme.", faqHeading: "Questions courantes", faqQ1: "Qu'est-ce qu'un convertisseur d'unités ?", faqA1: "Un convertisseur d'unités transforme un nombre d'une unité de mesure à une autre, comme des kilogrammes en livres, des mètres en pieds, des degrés Celsius en Fahrenheit ou des Go en Mo.", faqQ2: "Quelle est la précision des conversions ?", faqA2: "De nombreuses relations sont exactes par définition, y compris pouce, pied, livre, litre et gallon américain. Les unités approximatives sont décrites dans leurs définitions.", faqQ3: "Quelles unités sont prises en charge ?", faqA3: "Universal Converter prend en charge les unités métriques, impériales, usuelles américaines, scientifiques, d'ingénierie, numériques, culinaires, agricoles, astronomiques, électriques, de pression, d'énergie et bien plus.", faqQ4: "Universal Converter est-il gratuit ?", faqA4: "Oui. Le convertisseur principal, les calculatrices, le navigateur de catégories et les guides sont gratuits, sans compte ni inscription requis.", faqQ5: "Fonctionne-t-il sans connexion internet ?", faqA5: "Une fois installé en tant que PWA, le shell principal de l'application est mis en cache et reste disponible hors ligne. Les favoris, l'historique et les unités personnalisées sont également stockés sur votre appareil.", featuredGuidesHeading: "Découvrez les conversions derrière les chiffres", viewAllGuidesLink: "Voir tous les guides", readGuideLink: "Lire le guide", fgTag1: "Stockage numérique", fgTitle1: "Comment fonctionnent les unités de stockage numérique", fgDesc1: "Les bits, octets, préfixes décimaux et préfixes binaires expliquent pourquoi les conversions de stockage peuvent différer selon les appareils.", fgTag2: "Température", fgTitle2: "Celsius vs Fahrenheit", fgDesc2: "La différence entre Celsius et Fahrenheit, les formules de conversion et des exemples résolus.", fgTag3: "Systèmes de mesure", fgTitle3: "Système métrique vs impérial", fgDesc3: "Unités courantes, relations exactes et conseils pratiques pour convertir entre le système métrique et impérial.", fgTag4: "Pression", fgTitle4: "Comment fonctionnent les unités de pression", fgDesc4: "Comparaison du pascal, bar, PSI, atmosphère et mmHg, avec des formules de conversion pratiques.", newsletterEyebrow: "Newsletter", newsletterHeading: "Recevez de nouvelles calculatrices et guides de conversion", newsletterDesc: "Abonnez-vous pour de nouveaux guides de formules, des outils agricoles, des unités d'ingénierie et des mises à jour de la plateforme.", newsletterEmailLabel: "E-mail", newsletterPlaceholder: "Entrez votre adresse e-mail", newsletterSubscribeButton: "S'abonner", newsletterSuccessStatus: "Merci de vous être abonné ! Vous êtes sur la liste.", missionEyebrow: "Notre mission", missionHeading: "Rendre chaque mesure facile à faire confiance", missionBody: "Universal Converter existe pour rendre la conversion d'unités rapide, précise et gratuite pour tous, des étudiants et cuisiniers aux ingénieurs et équipes commerciales. Nous publions des définitions et formules exactes à côté de chaque résultat, gardons l'outil principal gratuit sans compte requis, et le construisons pour une utilisation hors ligne afin qu'un convertisseur soit disponible où que vous travailliez.", footerTagline: "Conversions rapides pour les unités quotidiennes, scientifiques, d'ingénierie et commerciales.", footerAbout: "À propos", footerContact: "Contact", footerPrivacy: "Politique de confidentialité", footerTerms: "Conditions", footerReferences: "Références", footerGuides: "Guides", footerSitemap: "Plan du site", footerCalculators: "Calculatrices", moreGuidesHeading: "Plus de guides et astuces de conversion", blogAccuracyTag: "Précision", blogAccuracyTitle: "Comment les convertisseurs d'unités restent précis", blogAccuracySummary: "Les convertisseurs les plus fiables normalisent les valeurs via une unité de base, puis formatent le résultat pour les humains.", blogGlobalUnitsTag: "Unités mondiales", blogGlobalUnitsTitle: "Unités métriques, impériales et usuelles américaines", blogGlobalUnitsSummary: "Un convertisseur mondial a besoin de systèmes qui se chevauchent, d'alias et de notes de formule pour que les utilisateurs trouvent l'unité attendue.", blogTemperatureTag: "Température", blogTemperatureTitle: "Celsius vs Fahrenheit", blogTemperatureSummary: "La différence entre Celsius et Fahrenheit, les formules de conversion et des exemples résolus.", blogDigitalStorageTag: "Stockage numérique", blogDigitalStorageTitle: "Comment fonctionnent les unités de stockage numérique", blogDigitalStorageSummary: "Les bits, octets, préfixes décimaux et préfixes binaires expliquent pourquoi les conversions de stockage peuvent différer selon les appareils." },
messages: { sameUnit: "Conversion entre unités identiques.", currencyOfflineNote: "La devise utilise des taux de référence hors ligne, sauf si des taux en direct de l'API ont été chargés.", temperatureNote: "La conversion de température utilise le Kelvin comme échelle absolue intermédiaire.", chooseCompatibleFamiliesMessage: "Choisissez des familles d'unités compatibles", differentThingsNote: "{FROM} et {TO} mesurent des choses différentes.", fuelZeroMessage: "Entrez une valeur de consommation de carburant non nulle", fuelInvertNote: "Les unités de consommation inversent la valeur d'efficacité.", fuelSupportsNote: "La consommation de carburant prend en charge les unités de distance par volume et de volume par distance.", electricitySameFamilyNote: "Les unités électriques de la même famille se convertissent directement.", electricityNeedContextMessage: "Ajoutez le contexte électrique nécessaire", electricityNeedContextNote: "Les calculs électriques entre familles différentes nécessitent une tension, un courant, une résistance ou des heures.", electricityContextNote: "Le résultat électrique utilise les valeurs de contexte affichées ci-dessus.", conversionUnavailableMessage: "Conversion indisponible", needCompatibleUnitsNote: "Cette conversion nécessite des unités compatibles.", resultsUpdateNote: "Les résultats se mettent à jour instantanément pendant que vous tapez." },
calculators: { heading: "Calculatrices d'entreprise, de finance, de santé, de dates et d'agriculture", badgeCurrency: "API de devises prête", badgeAgriculture: "Suite agricole", badgeClientSide: "Résultats côté client", currencyTitle: "Convertisseur de devises", currencyDesc: "Calculatrice de change prête pour l'API avec des taux de secours hors ligne.", currencyApiLabel: "Point de terminaison API (facultatif)", currencyApiPlaceholder: "Collez une URL d'API de taux de change en direct", currencyRefreshButton: "Actualiser les taux", percentageTitle: "Calculatrice de pourcentage", percentOfLabel: "% de", percentageResultSuffix: "résultat", bmiTitle: "Calculatrice d'IMC", bmiUnderweight: "Insuffisance pondérale", bmiNormal: "Normal", bmiOverweight: "Surpoids", bmiObesity: "Plage d'obésité", bmiEnterPrompt: "Entrez le poids et la taille", ageTitle: "Calculatrice d'âge", birthDateLabel: "Date de naissance", chooseDatePrompt: "Choisissez une date", dateCalcTitle: "Calculatrice de dates", chooseStartDatePrompt: "Choisissez une date de début", daysLaterTemplate: "{OFFSET} jours plus tard : {DATE}", mortgageTitle: "Calculatrice de prêt hypothécaire", perMonthSuffix: "par mois", enterLoanDetailsPrompt: "Entrez les détails du prêt", fuelCostTitle: "Calculatrice de coût de carburant", estimatedFuelCostSuffix: "coût de carburant estimé", enterTripDetailsPrompt: "Entrez les détails du trajet", agricultureTitle: "Calculatrices agricoles", tabSeed: "Semence", tabFertilizer: "Engrais", tabYield: "Rendement", tabIrrigation: "Irrigation", seedRequiredSuffix: "kg de semences nécessaires", fertBagsTemplate: "{FERT} kg, {BAGS} sacs", tHaRevenueTemplate: "{RATE} t/ha, {REVENUE} de revenus", m3WaterRequiredSuffix: "m³ d'eau nécessaires", ageResultTemplate: "{YEARS} ans, {DAYS} jours", currencyNeedEndpointPrompt: "Ajoutez un point de terminaison API ou utilisez les taux de secours hors ligne.", currencyLiveRatesFailedPrompt: "Impossible de charger les taux en direct. Le secours hors ligne reste actif." },
cookieBanner: { messagePrefix: "Nous utilisons des cookies pour améliorer votre expérience et activer Google Analytics et Google AdSense. En continuant, vous acceptez notre ", privacyPolicyLink: "Politique de confidentialité", messageSuffix: ".", decline: "Refuser", accept: "Accepter", ariaLabel: "Avis sur les cookies" }
},
de: {
nav: { home: "Startseite", converter: "Umrechner", categories: "Kategorien", allCategories: "Alle Kategorien", calculators: "Rechner", popular: "Beliebt", guides: "Anleitungen", sitemap: "Sitemap", about: "Über uns", contact: "Kontakt", search: "Suche", language: "Sprache", theme: "Design", menu: "Menü", themeDark: "Dunkel", themeLight: "Hell", privacy: "Datenschutz" },
converter: { searchAllUnits: "Alle Einheiten durchsuchen", fromUnit: "Von-Einheit", toUnit: "Zu-Einheit", swap: "Einheiten tauschen", decimalControl: "Dezimalstellen", notation: "Schreibweise", notationAuto: "Automatisch", notationDecimal: "Dezimal", notationScientific: "Wissenschaftlich", notationEngineering: "Technisch", result: "Ergebnis", copyResult: "Ergebnis kopieren", share: "Teilen", favorite: "Favorit", contextValues: "Kontextwerte", fromDefinition: "Definition (von)", toDefinition: "Definition (zu)", formula: "Formel", enterValue: "Zahl zum Umrechnen eingeben", useDecimalNotation: "Verwenden Sie Dezimal- oder wissenschaftliche Schreibweise, z. B. 1.25e6.", searchConversionPlaceholder: "Umrechnung suchen...", voltageLabel: "Spannung", currentLabel: "Strom", resistanceLabel: "Widerstand", hoursLabel: "Stunden", liquidDensityLabel: "Flüssigkeitsdichte, kg/L", contextHelpDefault: "Manche Einheitenfamilien benötigen einen zusätzlichen Wert für ein physikalisch genaues Ergebnis.", contextHelpElectricity: "Familienübergreifende elektrische Ergebnisse verwenden Spannung, Strom, Widerstand und Stunden. Elektrische Einheiten derselben Familie werden direkt umgerechnet.", kindDefault: "Umrechner", kindCurrency: "Währungsrechner", kindElectricity: "Elektrorechner", seoAdSlotConverterLabel: "Anzeigenplatz des Umrechners", seoAdSlotConverterReserved: "Unterhalb des Ergebnisses reserviert, damit der Rechner nutzbar bleibt.", seoAdSlotContentTopLabel: "Anzeigenplatz: oberer Inhaltsbereich (728x90)", seoAdSlotContentTopReserved: "Oberhalb der Umrechnungskarten und unterhalb des Umrechners reserviert.", seoAdSlotContentMiddleLabel: "Anzeigenplatz: mittlerer Inhaltsbereich (728x90)", seoAdSlotContentMiddleReserved: "Zwischen den Karten und den FAQ reserviert, damit die Seite ausgewogen bleibt.", saved: "Gespeichert" },
sidebar: { advertisement: "Werbung", favoriteConverters: "Favorisierte Umrechner", recentlyUsed: "Zuletzt verwendet", conversionHistory: "Umrechnungsverlauf", clear: "Löschen", noFavorites: "Noch keine Favoriten. Speichern Sie einen Umrechner, damit er hier erscheint.", noRecent: "Zuletzt verwendete Umrechner erscheinen hier nach der Nutzung.", noHistory: "Ihre letzten Umrechnungen bleiben auf diesem Gerät gespeichert und funktionieren offline.", noMatchingConverter: "Kein passender Umrechner gefunden. Versuchen Sie ein Einheitensymbol, einen Kategorienamen oder ein Formel-Schlüsselwort." },
common: { resultCopied: "Ergebnis in die Zwischenablage kopiert.", copyUnavailable: "Kopieren ist in diesem Browser nicht verfügbar, das Ergebnis kann aber markiert werden.", shareOpened: "Teilen-Dialog geöffnet.", shareCopied: "Text zum Teilen in die Zwischenablage kopiert.", shareCancelled: "Teilen wurde abgebrochen oder ist nicht verfügbar.", addApiEndpoint: "Fügen Sie einen API-Endpunkt hinzu oder nutzen Sie die Offline-Kurse.", couldNotLoadRates: "Live-Kurse konnten nicht geladen werden. Der Offline-Modus bleibt aktiv." },
categories: { unitsLabel: "Einheiten", conversionPagesLabel: "Umrechnungsseiten" },
homepage: { heroTitle: "Beliebige Einheiten sofort umrechnen", heroDescription: "Universal Converter ist eine kostenlose Alles-in-einem-Umrechnungsplattform mit 27 Maßkategorien und über 6.400 Einheiten, darunter Länge, Gewicht, Temperatur, Volumen, Währung, digitaler Speicher, Druck, Landwirtschaft, Astronomie, Kochen und Technik. Suchen oder durchsuchen Sie nach Kategorie, erhalten Sie sofort genaue Ergebnisse mit Quellendefinitionen und Formeln, und verwenden Sie denselben Umrechner für alltägliche Aufgaben, wissenschaftliche Arbeit und geschäftliche Berechnungen, online oder offline.", chipLength: "Länge", chipWeight: "Gewicht", chipTemperature: "Temperatur", chipVolume: "Volumen", chipPressure: "Druck", chipDigital: "Digitaler Speicher", chipCurrency: "Währung", chipAgriculture: "Landwirtschaft", chipFlow: "Durchfluss", adSpace: "Werbefläche", adSpaceCalculatorText: "Anzeigen helfen, diesen Rechner kostenlos zu halten.", adSpaceSiteText: "Anzeigen helfen, diese Website kostenlos zu halten.", searchConversionLabel: "Umrechnung suchen", statsEyebrow: "Universal Converter in Zahlen", statsHeading: "Ein Umrechner im echten Maßstab", statsDescription: "Jede Zahl unten spiegelt wider, was tatsächlich hinter dem Rechner läuft: echte Einheitendefinitionen und echte generierte Umrechnungsseiten, kein Platzhalterinhalt.", statsCategoriesDescription: "Messkategorien, von alltäglicher Länge und Gewicht bis hin zu Landwirtschaft, Astronomie und Technik.", statsUnitsDescription: "Einzelne Einheitendefinitionen, die in jeder Kategorie unterstützt werden, einschließlich metrischer Präfixe und regionaler Varianten.", statsPagesDescription: "SEO-Umrechnungsseiten, die site-weit erzeugt wurden, jede mit Formel, FAQ und verwandten Umrechnungen.", popularConversionsHeading: "Beliebte Umrechnungen", exploreSeoPagesLink: "SEO-Seiten erkunden", popularConversionTemplate: "{FROM} in {TO}", recentlySearchedLabel: "Zuletzt gesucht", noMatchingConversionFound: "Keine passende Umrechnung gefunden", launchStatusEyebrow: "Startstatus", launchStatusHeading: "Präzise, transparent und bereit für den täglichen Einsatz", launchStatusUpdatedTemplate: "Zuletzt aktualisiert: {DATE}. Die wichtigsten SI-, metrischen, imperialen und US-üblichen Faktoren sind in den Umrechnerdefinitionen dokumentiert. Wechselkurse verwenden Offline-Beispielwerte, sofern kein Live-API-Endpunkt verbunden ist.", launchStatusAccuracyTitle: "Genauigkeitsinformationen", launchStatusAccuracyDesc: "Wo Definitionen feststehen, werden exakte Konstanten verwendet, einschließlich der Beziehungen für Zoll, Fuß, Meile, Pfund, Acre, Liter und US-Gallone.", launchStatusSourcesTitle: "Quellenangaben", launchStatusSourcesDesc: "SI-Definitionen orientieren sich an den Referenzen von BIPM und NIST. Nicht-SI-Einheiten enthalten Definitionshinweise im Ergebnisbereich.", launchStatusViewReferencesLink: "Referenzen ansehen", launchStatusOfflineTitle: "Offline und privat", launchStatusOfflineDesc: "Umrechner laufen im Browser. Favoriten, Verlauf, Newsletter-Anmeldungen und benutzerdefinierte Einheiten bleiben aus Datenschutzgründen auf diesem Gerät.", categoryOverviewHeading: "Alle Umrechnungskategorien", readConversionGuidesLink: "Umrechnungsleitfäden lesen", whyHeading: "Warum Universal Converter", whyThousandsTitle: "Tausende von Einheiten", whyThousandsDesc: "Durchsuchen Sie SI-, imperiale, US-übliche, wissenschaftliche, technische, kulinarische, landwirtschaftliche, astronomische und digitale Einheiten an einem Ort.", whyFormulasTitle: "Präzise Formeln", whyFormulasDesc: "Wo Definitionen feststehen, werden exakte Konstanten verwendet, und Formelhinweise erklären, wie jedes Ergebnis berechnet wird.", whyFreeTitle: "Für immer kostenlos", whyFreeDesc: "Der Kern-Umrechner ist als kostenloses öffentliches Werkzeug konzipiert, für alltägliche Umrechnungen ist kein Konto erforderlich.", whyMobileTitle: "Funktioniert auf Mobilgeräten", whyMobileDesc: "Der Rechner, das Kategorienraster, die Suche, die Leitfäden und die SEO-Seiten sind responsiv für Smartphones, Tablets und Desktops.", whyOfflineTitle: "Offline-Unterstützung", whyOfflineDesc: "Das PWA-Caching hält die Haupt-App-Hülle nach der Installation auf einer gehosteten HTTP- oder HTTPS-Bereitstellung verfügbar.", guidePreviewEyebrow: "SEO-fertige Nutzseiten", guidePreviewHeading: "Hilfreiche Leitfäden für gängige Berechnungen", guidePreviewDesc: "Entdecken Sie gezielte Seiten für Einheitenumrechnungssuchen, Rechneraufgaben, wertvolle Maßsuchen, Formeln, FAQs und zugehörige Umrechnungsgruppen.", linkUnitConverter: "Einheitenumrechner", linkOnlineCalculator: "Online-Rechner", linkMeterToFeet: "Meter in Fuß", linkKgToLbs: "kg in lbs", linkLiterToGallon: "Liter in Gallone", linkCelsiusToFahrenheit: "Celsius in Fahrenheit", linkAcreToHectare: "Acre in Hektar", linkGbToMb: "GB in MB", linkMetricVsImperial: "Metrisch vs. imperial", linkDigitalStorage: "Digitaler Speicher", businessHeading: "Aufgebaut wie ein echtes Umrechnungsunternehmen", businessAnalyticsTitle: "Datenschutzfreundliche Analysen", businessAnalyticsDesc: "Die Nutzung wird anonym gemessen, um Verbesserungen zu steuern, ohne persönliche Umrechnungsdaten zu verkaufen oder weiterzugeben.", businessAdsTitle: "Werbefinanziert und kostenlos", businessAdsDesc: "Anzeigen werden so platziert, dass sie dem Rechner nicht im Weg stehen, damit jedes Tool kostenlos bleibt.", businessStayLoopTitle: "Bleiben Sie auf dem Laufenden", businessStayLoopDesc: "Abonnieren Sie, um über neue Rechner, Einheitenabdeckung und Umrechnungsleitfäden informiert zu werden, sobald sie erscheinen.", businessCustomUnitsTitle: "Benutzerdefinierte Einheiten", businessCustomUnitsDesc: "Speichern Sie für Ihr Team oder Ihre Branche relevante Einheitendefinitionen direkt in Ihrem Browser.", businessMoreTitle: "Mehr ist unterwegs", businessMoreDesc: "Gespeicherte Arbeitsbereiche, ein werbefreier Modus, Team-Rechner, CSV-Export und API-Zugriff stehen auf der Roadmap.", faqHeading: "Häufige Fragen", faqQ1: "Was ist ein Einheitenumrechner?", faqA1: "Ein Einheitenumrechner wandelt eine Zahl von einer Maßeinheit in eine andere um, zum Beispiel Kilogramm in Pfund, Meter in Fuß, Celsius in Fahrenheit oder GB in MB.", faqQ2: "Wie genau sind die Umrechnungen?", faqA2: "Viele Beziehungen sind per Definition exakt, darunter Zoll, Fuß, Pfund, Liter und US-Gallone. Näherungswerte werden in ihren Definitionen beschrieben.", faqQ3: "Welche Einheiten werden unterstützt?", faqA3: "Universal Converter unterstützt metrische, imperiale, US-übliche, wissenschaftliche, technische, digitale, kulinarische, landwirtschaftliche, astronomische, elektrische, Druck-, Energieeinheiten und mehr.", faqQ4: "Ist Universal Converter kostenlos nutzbar?", faqA4: "Ja. Der Kern-Umrechner, die Rechner, der Kategorien-Browser und die Leitfäden sind kostenlos nutzbar, ohne Konto oder Anmeldung.", faqQ5: "Funktioniert es ohne Internetverbindung?", faqA5: "Nach der Installation als PWA wird die Haupt-App-Hülle zwischengespeichert und bleibt offline verfügbar. Favoriten, Verlauf und benutzerdefinierte Einheiten werden ebenfalls auf Ihrem Gerät gespeichert.", featuredGuidesHeading: "Erfahren Sie mehr über die Umrechnungen hinter den Zahlen", viewAllGuidesLink: "Alle Leitfäden ansehen", readGuideLink: "Leitfaden lesen", fgTag1: "Digitaler Speicher", fgTitle1: "Wie digitale Speichereinheiten funktionieren", fgDesc1: "Bits, Bytes, Dezimal- und Binärpräfixe erklären, warum Speicherumrechnungen je nach Gerät unterschiedlich aussehen können.", fgTag2: "Temperatur", fgTitle2: "Celsius vs. Fahrenheit", fgDesc2: "Der Unterschied zwischen Celsius und Fahrenheit, Umrechnungsformeln und durchgerechnete Beispiele.", fgTag3: "Maßsysteme", fgTitle3: "Metrisches vs. imperiales System", fgDesc3: "Gängige Einheiten, exakte Beziehungen und praktische Tipps für die Umrechnung zwischen metrischem und imperialem System.", fgTag4: "Druck", fgTitle4: "Wie Druckeinheiten funktionieren", fgDesc4: "Vergleich von Pascal, Bar, PSI, Atmosphäre und mmHg, mit praktischen Umrechnungsformeln.", newsletterEyebrow: "Newsletter", newsletterHeading: "Erhalten Sie neue Rechner und Umrechnungsleitfäden", newsletterDesc: "Abonnieren Sie neue Formelleitfäden, landwirtschaftliche Tools, technische Einheiten und Plattform-Updates.", newsletterEmailLabel: "E-Mail", newsletterPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein", newsletterSubscribeButton: "Abonnieren", newsletterSuccessStatus: "Danke fürs Abonnieren! Sie stehen auf der Liste.", missionEyebrow: "Unsere Mission", missionHeading: "Jede Messung vertrauenswürdig machen", missionBody: "Universal Converter existiert, um Einheitenumrechnung für alle schnell, präzise und kostenlos zu machen, von Schülern und Köchen bis hin zu Ingenieuren und Geschäftsteams. Wir veröffentlichen exakte Definitionen und Formeln zu jedem Ergebnis, halten das Kernwerkzeug kostenlos ohne Konto und entwickeln es für die Offline-Nutzung, damit ein Umrechner überall verfügbar ist, wo Sie arbeiten.", footerTagline: "Schnelle Umrechnungen für alltägliche, wissenschaftliche, technische und geschäftliche Einheiten.", footerAbout: "Über uns", footerContact: "Kontakt", footerPrivacy: "Datenschutzrichtlinie", footerTerms: "Nutzungsbedingungen", footerReferences: "Referenzen", footerGuides: "Leitfäden", footerSitemap: "Sitemap", footerCalculators: "Rechner", moreGuidesHeading: "Weitere Umrechnungsleitfäden und Tipps", blogAccuracyTag: "Genauigkeit", blogAccuracyTitle: "Wie Einheitenumrechner genau bleiben", blogAccuracySummary: "Die zuverlässigsten Umrechner normalisieren Werte über eine Basiseinheit und formatieren das Ergebnis dann für Menschen.", blogGlobalUnitsTag: "Globale Einheiten", blogGlobalUnitsTitle: "Metrische, imperiale und US-übliche Einheiten", blogGlobalUnitsSummary: "Ein globaler Umrechner benötigt überlappende Systeme, Aliase und Formelhinweise, damit Nutzer die erwartete Einheit finden.", blogTemperatureTag: "Temperatur", blogTemperatureTitle: "Celsius vs. Fahrenheit", blogTemperatureSummary: "Der Unterschied zwischen Celsius und Fahrenheit, Umrechnungsformeln und durchgerechnete Beispiele.", blogDigitalStorageTag: "Digitaler Speicher", blogDigitalStorageTitle: "Wie digitale Speichereinheiten funktionieren", blogDigitalStorageSummary: "Bits, Bytes, Dezimal- und Binärpräfixe erklären, warum Speicherumrechnungen je nach Gerät unterschiedlich aussehen können." },
messages: { sameUnit: "Umrechnung innerhalb derselben Einheit.", currencyOfflineNote: "Bei Währungen werden Offline-Ersatzkurse verwendet, sofern keine Live-API-Kurse geladen wurden.", temperatureNote: "Die Temperaturumrechnung verwendet Kelvin als absolute Zwischenskala.", chooseCompatibleFamiliesMessage: "Wählen Sie kompatible Einheitenfamilien", differentThingsNote: "{FROM} und {TO} messen unterschiedliche Dinge.", fuelZeroMessage: "Geben Sie einen Kraftstoffverbrauchswert ungleich null ein", fuelInvertNote: "Verbrauchseinheiten kehren den Effizienzwert um.", fuelSupportsNote: "Der Kraftstoffverbrauch unterstützt sowohl Strecke-pro-Volumen- als auch Volumen-pro-Strecke-Einheiten.", electricitySameFamilyNote: "Elektrische Einheiten derselben Familie werden direkt umgerechnet.", electricityNeedContextMessage: "Fügen Sie den benötigten elektrischen Kontext hinzu", electricityNeedContextNote: "Familienübergreifende elektrische Berechnungen benötigen Spannung, Strom, Widerstand oder Stunden.", electricityContextNote: "Das elektrische Ergebnis verwendet die oben gezeigten Kontextwerte.", conversionUnavailableMessage: "Umrechnung nicht verfügbar", needCompatibleUnitsNote: "Diese Umrechnung benötigt kompatible Einheiten.", resultsUpdateNote: "Die Ergebnisse werden beim Tippen sofort aktualisiert." },
calculators: { heading: "Rechner für Wirtschaft, Finanzen, Gesundheit, Datum und Landwirtschaft", badgeCurrency: "Währungs-API bereit", badgeAgriculture: "Landwirtschafts-Suite", badgeClientSide: "Ergebnisse clientseitig", currencyTitle: "Währungsumrechner", currencyDesc: "API-fähiger Wechselkursrechner mit Offline-Ausweichkursen.", currencyApiLabel: "API-Endpunkt (optional)", currencyApiPlaceholder: "Fügen Sie eine Live-Wechselkurs-API-URL ein", currencyRefreshButton: "Kurse aktualisieren", percentageTitle: "Prozentrechner", percentOfLabel: "% von", percentageResultSuffix: "Ergebnis", bmiTitle: "BMI-Rechner", bmiUnderweight: "Untergewicht", bmiNormal: "Normal", bmiOverweight: "Übergewicht", bmiObesity: "Adipositas-Bereich", bmiEnterPrompt: "Gewicht und Größe eingeben", ageTitle: "Altersrechner", birthDateLabel: "Geburtsdatum", chooseDatePrompt: "Datum wählen", dateCalcTitle: "Datumsrechner", chooseStartDatePrompt: "Startdatum wählen", daysLaterTemplate: "{OFFSET} Tage später: {DATE}", mortgageTitle: "Hypothekenrechner", perMonthSuffix: "pro Monat", enterLoanDetailsPrompt: "Darlehensdetails eingeben", fuelCostTitle: "Kraftstoffkostenrechner", estimatedFuelCostSuffix: "geschätzte Kraftstoffkosten", enterTripDetailsPrompt: "Fahrtdetails eingeben", agricultureTitle: "Landwirtschaftsrechner", tabSeed: "Saatgut", tabFertilizer: "Dünger", tabYield: "Ertrag", tabIrrigation: "Bewässerung", seedRequiredSuffix: "kg Saatgut erforderlich", fertBagsTemplate: "{FERT} kg, {BAGS} Säcke", tHaRevenueTemplate: "{RATE} t/ha, {REVENUE} Erlös", m3WaterRequiredSuffix: "m³ Wasser erforderlich", ageResultTemplate: "{YEARS} Jahre, {DAYS} Tage", currencyNeedEndpointPrompt: "Fügen Sie einen API-Endpunkt hinzu oder verwenden Sie Offline-Ausweichkurse.", currencyLiveRatesFailedPrompt: "Live-Kurse konnten nicht geladen werden. Der Offline-Ausweichmodus bleibt aktiv." },
cookieBanner: { messagePrefix: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und Google Analytics sowie Google AdSense zu ermöglichen. Durch die Fortsetzung stimmen Sie unserer ", privacyPolicyLink: "Datenschutzrichtlinie", messageSuffix: ".", decline: "Ablehnen", accept: "Akzeptieren", ariaLabel: "Cookie-Hinweis" }
},
pt: {
nav: { home: "Início", converter: "Conversor", categories: "Categorias", allCategories: "Todas as categorias", calculators: "Calculadoras", popular: "Popular", guides: "Guias", sitemap: "Mapa do site", about: "Sobre", contact: "Contato", search: "Pesquisar", language: "Idioma", theme: "Tema", menu: "Menu", themeDark: "Escuro", themeLight: "Claro", privacy: "Privacidade" },
converter: { searchAllUnits: "Pesquisar todas as unidades", fromUnit: "Unidade de origem", toUnit: "Unidade de destino", swap: "Trocar unidades", decimalControl: "Controle de casas decimais", notation: "Notação", notationAuto: "Automática", notationDecimal: "Decimal", notationScientific: "Científica", notationEngineering: "Engenharia", result: "Resultado", copyResult: "Copiar resultado", share: "Compartilhar", favorite: "Favorito", contextValues: "Valores de contexto", fromDefinition: "Definição de origem", toDefinition: "Definição de destino", formula: "Fórmula", enterValue: "Digite um número para converter", useDecimalNotation: "Use notação decimal ou científica, como 1.25e6.", searchConversionPlaceholder: "Buscar conversão...", voltageLabel: "Tensão", currentLabel: "Corrente", resistanceLabel: "Resistência", hoursLabel: "Horas", liquidDensityLabel: "Densidade do líquido, kg/L", contextHelpDefault: "Algumas famílias de unidades precisam de um valor extra para um resultado fisicamente preciso.", contextHelpElectricity: "Resultados elétricos entre famílias diferentes usam tensão, corrente, resistência e horas. Unidades elétricas da mesma família convertem diretamente.", kindDefault: "Conversor", kindCurrency: "Calculadora de moedas", kindElectricity: "Calculadora elétrica", seoAdSlotConverterLabel: "Espaço de anúncio do conversor", seoAdSlotConverterReserved: "Reservado abaixo do resultado para que a calculadora continue utilizável.", seoAdSlotContentTopLabel: "Espaço de anúncio: topo do conteúdo (728x90)", seoAdSlotContentTopReserved: "Reservado acima dos cartões de conversão e abaixo do conversor.", seoAdSlotContentMiddleLabel: "Espaço de anúncio: meio do conteúdo (728x90)", seoAdSlotContentMiddleReserved: "Reservado entre os cartões e as perguntas frequentes para manter a página equilibrada.", saved: "Salvo" },
sidebar: { advertisement: "Publicidade", favoriteConverters: "Conversores favoritos", recentlyUsed: "Usados recentemente", conversionHistory: "Histórico de conversões", clear: "Limpar", noFavorites: "Ainda não há favoritos. Salve um conversor para vê-lo aqui.", noRecent: "Os conversores recentes aparecerão aqui após o uso.", noHistory: "Suas conversões mais recentes ficam neste dispositivo e funcionam offline.", noMatchingConverter: "Nenhum conversor correspondente encontrado. Tente um símbolo de unidade, um nome de categoria ou uma palavra-chave de fórmula." },
common: { resultCopied: "Resultado copiado para a área de transferência.", copyUnavailable: "A cópia não está disponível neste navegador, mas o resultado pode ser selecionado.", shareOpened: "Caixa de diálogo de compartilhamento aberta.", shareCopied: "Texto de compartilhamento copiado para a área de transferência.", shareCancelled: "O compartilhamento foi cancelado ou não está disponível.", addApiEndpoint: "Adicione um endpoint de API ou use as taxas offline.", couldNotLoadRates: "Não foi possível carregar as taxas em tempo real. O modo offline continua ativo." },
categories: { unitsLabel: "unidades", conversionPagesLabel: "páginas de conversão" },
homepage: { heroTitle: "Converta qualquer unidade instantaneamente", heroDescription: "Universal Converter é uma plataforma de conversão gratuita e completa que abrange 27 categorias de medição e mais de 6.400 unidades, incluindo comprimento, peso, temperatura, volume, moeda, armazenamento digital, pressão, agricultura, astronomia, culinária e engenharia. Pesquise ou navegue por categoria, obtenha resultados precisos instantâneos com definições e fórmulas de referência, e use o mesmo conversor para tarefas do dia a dia, trabalho científico e cálculos empresariais, on-line ou off-line.", chipLength: "Comprimento", chipWeight: "Peso", chipTemperature: "Temperatura", chipVolume: "Volume", chipPressure: "Pressão", chipDigital: "Armazenamento digital", chipCurrency: "Moeda", chipAgriculture: "Agricultura", chipFlow: "Vazão", adSpace: "Espaço publicitário", adSpaceCalculatorText: "Os anúncios ajudam a manter esta calculadora gratuita.", adSpaceSiteText: "Os anúncios ajudam a manter este site gratuito.", searchConversionLabel: "Buscar conversão", statsEyebrow: "Universal Converter em números", statsHeading: "Um conversor construído em escala real", statsDescription: "Cada número abaixo reflete o que realmente está em execução por trás da calculadora: definições de unidades reais e páginas de conversão realmente geradas, não conteúdo de espaço reservado.", statsCategoriesDescription: "Categorias de medição, desde comprimento e peso do dia a dia até agricultura, astronomia e engenharia.", statsUnitsDescription: "Definições de unidades individuais suportadas em cada categoria, incluindo prefixos métricos e variantes regionais.", statsPagesDescription: "Páginas de conversão SEO geradas em todo o site, cada uma com fórmula, FAQ e conversões relacionadas.", popularConversionsHeading: "Conversões populares", exploreSeoPagesLink: "Explorar páginas SEO", popularConversionTemplate: "{FROM} para {TO}", recentlySearchedLabel: "Pesquisado recentemente", noMatchingConversionFound: "Nenhuma conversão correspondente encontrada", launchStatusEyebrow: "Status de lançamento", launchStatusHeading: "Preciso, transparente e pronto para o uso diário", launchStatusUpdatedTemplate: "Última atualização: {DATE}. Os principais fatores SI, métricos, imperiais e costumeiros dos EUA estão documentados nas definições do conversor. As taxas de câmbio usam valores de amostra offline, a menos que um endpoint de API ao vivo esteja conectado.", launchStatusAccuracyTitle: "Informações de precisão", launchStatusAccuracyDesc: "Constantes exatas são usadas onde as definições são fixas, incluindo as relações de polegada, pé, milha, libra, acre, litro e galão americano.", launchStatusSourcesTitle: "Referências de origem", launchStatusSourcesDesc: "As definições do SI estão alinhadas com as referências do BIPM e do NIST. Unidades comuns não pertencentes ao SI incluem notas de definição no painel de resultados.", launchStatusViewReferencesLink: "Ver referências", launchStatusOfflineTitle: "Offline e privado", launchStatusOfflineDesc: "Os conversores são executados no navegador. Favoritos, histórico, inscrições na newsletter e unidades personalizadas permanecem neste dispositivo por privacidade.", categoryOverviewHeading: "Todas as categorias de conversão", readConversionGuidesLink: "Ler guias de conversão", whyHeading: "Por que Universal Converter", whyThousandsTitle: "Milhares de unidades", whyThousandsDesc: "Pesquise unidades do SI, imperiais, costumeiras dos EUA, científicas, de engenharia, culinárias, agrícolas, astronômicas e digitais em um só lugar.", whyFormulasTitle: "Fórmulas precisas", whyFormulasDesc: "Constantes exatas são usadas onde as definições são fixas, e notas de fórmula explicam como cada resultado é calculado.", whyFreeTitle: "Grátis para sempre", whyFreeDesc: "O conversor principal foi criado como um utilitário público gratuito, sem necessidade de conta para conversões do dia a dia.", whyMobileTitle: "Funciona no celular", whyMobileDesc: "A calculadora, a grade de categorias, a busca, os guias e as páginas SEO são responsivos para celulares, tablets e desktops.", whyOfflineTitle: "Suporte offline", whyOfflineDesc: "O cache do PWA mantém o shell principal do aplicativo disponível após a instalação em uma implantação HTTP ou HTTPS hospedada.", guidePreviewEyebrow: "Páginas utilitárias prontas para SEO", guidePreviewHeading: "Guias úteis para cálculos comuns", guidePreviewDesc: "Explore páginas focadas em buscas de conversores de unidades, tarefas de calculadora, buscas de medidas de alto valor, fórmulas, perguntas frequentes e grupos de conversões relacionadas.", linkUnitConverter: "Conversor de unidades", linkOnlineCalculator: "Calculadora on-line", linkMeterToFeet: "Metro para pé", linkKgToLbs: "kg para lbs", linkLiterToGallon: "Litro para galão", linkCelsiusToFahrenheit: "Celsius para Fahrenheit", linkAcreToHectare: "Acre para hectare", linkGbToMb: "GB para MB", linkMetricVsImperial: "Métrico vs. imperial", linkDigitalStorage: "Armazenamento digital", businessHeading: "Criado como um verdadeiro negócio de conversão", businessAnalyticsTitle: "Análises que respeitam a privacidade", businessAnalyticsDesc: "O uso é medido anonimamente para orientar melhorias, sem vender ou compartilhar dados pessoais de conversão.", businessAdsTitle: "Com suporte de anúncios e gratuito", businessAdsDesc: "Os anúncios são posicionados para não atrapalhar a calculadora, para que cada ferramenta continue gratuita.", businessStayLoopTitle: "Fique por dentro", businessStayLoopDesc: "Assine para saber sobre novas calculadoras, cobertura de unidades e guias de conversão assim que forem lançados.", businessCustomUnitsTitle: "Unidades personalizadas", businessCustomUnitsDesc: "Salve definições de unidades importantes para sua equipe ou setor, diretamente no seu navegador.", businessMoreTitle: "Mais por vir", businessMoreDesc: "Espaços de trabalho salvos, um modo sem anúncios, calculadoras de equipe, exportação CSV e acesso à API estão no roteiro.", faqHeading: "Perguntas comuns", faqQ1: "O que é um conversor de unidades?", faqA1: "Um conversor de unidades transforma um número de uma unidade de medida para outra, como quilogramas para libras, metros para pés, Celsius para Fahrenheit ou GB para MB.", faqQ2: "Quão precisas são as conversões?", faqA2: "Muitas relações são exatas por definição, incluindo polegada, pé, libra, litro e galão americano. Unidades aproximadas são descritas em suas definições.", faqQ3: "Quais unidades são compatíveis?", faqA3: "O Universal Converter é compatível com unidades métricas, imperiais, costumeiras dos EUA, científicas, de engenharia, digitais, culinárias, agrícolas, astronômicas, elétricas, de pressão, de energia e muito mais.", faqQ4: "O Universal Converter é gratuito?", faqA4: "Sim. O conversor principal, as calculadoras, o navegador de categorias e os guias são gratuitos, sem necessidade de conta ou cadastro.", faqQ5: "Funciona sem conexão com a internet?", faqA5: "Depois de instalado como PWA, o shell principal do aplicativo fica em cache e disponível offline. Favoritos, histórico e unidades personalizadas também são armazenados no seu dispositivo.", featuredGuidesHeading: "Aprenda as conversões por trás dos números", viewAllGuidesLink: "Ver todos os guias", readGuideLink: "Ler guia", fgTag1: "Armazenamento digital", fgTitle1: "Como funcionam as unidades de armazenamento digital", fgDesc1: "Bits, bytes, prefixos decimais e prefixos binários explicam por que as conversões de armazenamento podem parecer diferentes entre dispositivos.", fgTag2: "Temperatura", fgTitle2: "Celsius vs Fahrenheit", fgDesc2: "A diferença entre Celsius e Fahrenheit, fórmulas de conversão e exemplos resolvidos.", fgTag3: "Sistemas de medição", fgTitle3: "Sistema métrico vs imperial", fgDesc3: "Unidades comuns, relações exatas e dicas práticas para converter entre o sistema métrico e o imperial.", fgTag4: "Pressão", fgTitle4: "Como funcionam as unidades de pressão", fgDesc4: "Comparação de pascal, bar, PSI, atmosfera e mmHg, com fórmulas de conversão práticas.", newsletterEyebrow: "Newsletter", newsletterHeading: "Receba novas calculadoras e guias de conversão", newsletterDesc: "Assine para novos guias de fórmulas, ferramentas agrícolas, unidades de engenharia e atualizações da plataforma.", newsletterEmailLabel: "E-mail", newsletterPlaceholder: "Digite seu endereço de e-mail", newsletterSubscribeButton: "Assinar", newsletterSuccessStatus: "Obrigado por se inscrever! Você está na lista.", missionEyebrow: "Nossa missão", missionHeading: "Tornando cada medição fácil de confiar", missionBody: "O Universal Converter existe para tornar a conversão de unidades rápida, precisa e gratuita para todos, de estudantes e cozinheiros a engenheiros e equipes de negócios. Publicamos definições e fórmulas exatas junto a cada resultado, mantemos a ferramenta principal gratuita sem necessidade de conta, e a construímos para uso offline para que um conversor esteja disponível onde quer que você esteja trabalhando.", footerTagline: "Conversões rápidas para unidades do dia a dia, científicas, de engenharia e de negócios.", footerAbout: "Sobre", footerContact: "Contato", footerPrivacy: "Política de Privacidade", footerTerms: "Termos", footerReferences: "Referências", footerGuides: "Guias", footerSitemap: "Mapa do site", footerCalculators: "Calculadoras", moreGuidesHeading: "Mais guias e dicas de conversão", blogAccuracyTag: "Precisão", blogAccuracyTitle: "Como os conversores de unidades permanecem precisos", blogAccuracySummary: "Os conversores mais confiáveis normalizam valores por meio de uma unidade base e depois formatam o resultado para humanos.", blogGlobalUnitsTag: "Unidades globais", blogGlobalUnitsTitle: "Unidades métricas, imperiais e costumeiras dos EUA", blogGlobalUnitsSummary: "Um conversor global precisa de sistemas sobrepostos, apelidos e notas de fórmula para que os usuários encontrem a unidade esperada.", blogTemperatureTag: "Temperatura", blogTemperatureTitle: "Celsius vs Fahrenheit", blogTemperatureSummary: "A diferença entre Celsius e Fahrenheit, fórmulas de conversão e exemplos resolvidos.", blogDigitalStorageTag: "Armazenamento digital", blogDigitalStorageTitle: "Como funcionam as unidades de armazenamento digital", blogDigitalStorageSummary: "Bits, bytes, prefixos decimais e prefixos binários explicam por que as conversões de armazenamento podem parecer diferentes entre dispositivos." },
messages: { sameUnit: "Conversão entre a mesma unidade.", currencyOfflineNote: "A moeda usa taxas de referência offline, a menos que taxas da API em tempo real tenham sido carregadas.", temperatureNote: "A conversão de temperatura usa Kelvin como escala absoluta intermediária.", chooseCompatibleFamiliesMessage: "Escolha famílias de unidades compatíveis", differentThingsNote: "{FROM} e {TO} medem coisas diferentes.", fuelZeroMessage: "Insira um valor de consumo de combustível diferente de zero", fuelInvertNote: "As unidades de consumo invertem o valor de eficiência.", fuelSupportsNote: "O consumo de combustível aceita unidades de distância por volume e de volume por distância.", electricitySameFamilyNote: "Unidades elétricas da mesma família são convertidas diretamente.", electricityNeedContextMessage: "Adicione o contexto elétrico necessário", electricityNeedContextNote: "Cálculos elétricos entre famílias diferentes precisam de tensão, corrente, resistência ou horas.", electricityContextNote: "O resultado elétrico usa os valores de contexto mostrados acima.", conversionUnavailableMessage: "Conversão indisponível", needCompatibleUnitsNote: "Esta conversão precisa de unidades compatíveis.", resultsUpdateNote: "Os resultados são atualizados instantaneamente enquanto você digita." },
calculators: { heading: "Calculadoras de negócios, finanças, saúde, datas e agricultura", badgeCurrency: "API de moeda pronta", badgeAgriculture: "Suíte agrícola", badgeClientSide: "Resultados no navegador", currencyTitle: "Conversor de moedas", currencyDesc: "Calculadora de câmbio pronta para API com taxas de fallback offline.", currencyApiLabel: "Endpoint de API (opcional)", currencyApiPlaceholder: "Cole a URL de uma API de taxas de câmbio ao vivo", currencyRefreshButton: "Atualizar taxas", percentageTitle: "Calculadora de porcentagem", percentOfLabel: "% de", percentageResultSuffix: "resultado", bmiTitle: "Calculadora de IMC", bmiUnderweight: "Abaixo do peso", bmiNormal: "Normal", bmiOverweight: "Sobrepeso", bmiObesity: "Faixa de obesidade", bmiEnterPrompt: "Insira peso e altura", ageTitle: "Calculadora de idade", birthDateLabel: "Data de nascimento", chooseDatePrompt: "Escolha uma data", dateCalcTitle: "Calculadora de datas", chooseStartDatePrompt: "Escolha uma data de início", daysLaterTemplate: "{OFFSET} dias depois: {DATE}", mortgageTitle: "Calculadora de financiamento", perMonthSuffix: "por mês", enterLoanDetailsPrompt: "Insira os detalhes do empréstimo", fuelCostTitle: "Calculadora de custo de combustível", estimatedFuelCostSuffix: "custo estimado de combustível", enterTripDetailsPrompt: "Insira os detalhes da viagem", agricultureTitle: "Calculadoras agrícolas", tabSeed: "Semente", tabFertilizer: "Fertilizante", tabYield: "Rendimento", tabIrrigation: "Irrigação", seedRequiredSuffix: "kg de sementes necessários", fertBagsTemplate: "{FERT} kg, {BAGS} sacos", tHaRevenueTemplate: "{RATE} t/ha, {REVENUE} de receita", m3WaterRequiredSuffix: "m³ de água necessários", ageResultTemplate: "{YEARS} anos, {DAYS} dias", currencyNeedEndpointPrompt: "Adicione um endpoint de API ou use as taxas de fallback offline.", currencyLiveRatesFailedPrompt: "Não foi possível carregar as taxas em tempo real. O fallback offline permanece ativo." },
cookieBanner: { messagePrefix: "Usamos cookies para melhorar sua experiência e habilitar o Google Analytics e o Google AdSense. Ao continuar, você concorda com nossa ", privacyPolicyLink: "Política de Privacidade", messageSuffix: ".", decline: "Recusar", accept: "Aceitar", ariaLabel: "Aviso de cookies" }
},
it: {
nav: { home: "Home", converter: "Convertitore", categories: "Categorie", allCategories: "Tutte le categorie", calculators: "Calcolatrici", popular: "Popolare", guides: "Guide", sitemap: "Mappa del sito", about: "Chi siamo", contact: "Contatti", search: "Cerca", language: "Lingua", theme: "Tema", menu: "Menu", themeDark: "Scuro", themeLight: "Chiaro", privacy: "Privacy" },
converter: { searchAllUnits: "Cerca tutte le unità", fromUnit: "Unità di partenza", toUnit: "Unità di arrivo", swap: "Scambia unità", decimalControl: "Controllo decimali", notation: "Notazione", notationAuto: "Automatica", notationDecimal: "Decimale", notationScientific: "Scientifica", notationEngineering: "Ingegneristica", result: "Risultato", copyResult: "Copia risultato", share: "Condividi", favorite: "Preferito", contextValues: "Valori di contesto", fromDefinition: "Definizione di partenza", toDefinition: "Definizione di arrivo", formula: "Formula", enterValue: "Inserisci un numero da convertire", useDecimalNotation: "Usa la notazione decimale o scientifica, ad esempio 1.25e6.", searchConversionPlaceholder: "Cerca conversione...", voltageLabel: "Tensione", currentLabel: "Corrente", resistanceLabel: "Resistenza", hoursLabel: "Ore", liquidDensityLabel: "Densità del liquido, kg/L", contextHelpDefault: "Alcune famiglie di unità richiedono un valore aggiuntivo per un risultato fisicamente accurato.", contextHelpElectricity: "I risultati elettrici tra famiglie diverse usano tensione, corrente, resistenza e ore. Le unità elettriche della stessa famiglia si convertono direttamente.", kindDefault: "Convertitore", kindCurrency: "Calcolatrice valutaria", kindElectricity: "Calcolatrice elettrica", seoAdSlotConverterLabel: "Spazio pubblicitario del convertitore", seoAdSlotConverterReserved: "Riservato sotto il risultato affinché la calcolatrice resti utilizzabile.", seoAdSlotContentTopLabel: "Spazio pubblicitario: parte superiore del contenuto (728x90)", seoAdSlotContentTopReserved: "Riservato sopra le schede di conversione e sotto il convertitore.", seoAdSlotContentMiddleLabel: "Spazio pubblicitario: centro del contenuto (728x90)", seoAdSlotContentMiddleReserved: "Riservato tra le schede e le FAQ per mantenere la pagina equilibrata.", saved: "Salvato" },
sidebar: { advertisement: "Pubblicità", favoriteConverters: "Convertitori preferiti", recentlyUsed: "Usati di recente", conversionHistory: "Cronologia conversioni", clear: "Cancella", noFavorites: "Nessun preferito ancora. Salva un convertitore per trovarlo qui.", noRecent: "I convertitori recenti appariranno qui dopo l'uso.", noHistory: "Le tue conversioni più recenti restano su questo dispositivo e funzionano offline.", noMatchingConverter: "Nessun convertitore corrispondente trovato. Prova un simbolo di unità, un nome di categoria o una parola chiave della formula." },
common: { resultCopied: "Risultato copiato negli appunti.", copyUnavailable: "La copia non è disponibile in questo browser, ma il risultato è pronto per essere selezionato.", shareOpened: "Finestra di condivisione aperta.", shareCopied: "Testo di condivisione copiato negli appunti.", shareCancelled: "La condivisione è stata annullata o non è disponibile.", addApiEndpoint: "Aggiungi un endpoint API oppure usa i tassi offline.", couldNotLoadRates: "Impossibile caricare i tassi in tempo reale. La modalità offline resta attiva." },
categories: { unitsLabel: "unità", conversionPagesLabel: "pagine di conversione" },
homepage: { heroTitle: "Converti qualsiasi unità all'istante", heroDescription: "Universal Converter è una piattaforma di conversione gratuita e completa che copre 27 categorie di misura e oltre 6.400 unità, tra cui lunghezza, peso, temperatura, volume, valuta, archiviazione digitale, pressione, agricoltura, astronomia, cucina e ingegneria. Cerca o sfoglia per categoria, ottieni risultati accurati e immediati con definizioni e formule di riferimento, e usa lo stesso convertitore per attività quotidiane, lavoro scientifico e calcoli aziendali, online o offline.", chipLength: "Lunghezza", chipWeight: "Peso", chipTemperature: "Temperatura", chipVolume: "Volume", chipPressure: "Pressione", chipDigital: "Archiviazione digitale", chipCurrency: "Valuta", chipAgriculture: "Agricoltura", chipFlow: "Portata", adSpace: "Spazio pubblicitario", adSpaceCalculatorText: "Gli annunci aiutano a mantenere gratuita questa calcolatrice.", adSpaceSiteText: "Gli annunci aiutano a mantenere gratuito questo sito.", searchConversionLabel: "Cerca conversione", statsEyebrow: "Universal Converter in cifre", statsHeading: "Un convertitore costruito su scala reale", statsDescription: "Ogni cifra qui sotto riflette ciò che funziona realmente dietro il calcolatore: definizioni di unità reali e pagine di conversione realmente generate, non contenuti segnaposto.", statsCategoriesDescription: "Categorie di misura, dalla lunghezza e dal peso quotidiani fino ad agricoltura, astronomia e ingegneria.", statsUnitsDescription: "Definizioni di unità individuali supportate in ogni categoria, inclusi prefissi metrici e varianti regionali.", statsPagesDescription: "Pagine di conversione SEO generate in tutto il sito, ciascuna con formula, FAQ e conversioni correlate.", popularConversionsHeading: "Conversioni popolari", exploreSeoPagesLink: "Esplora le pagine SEO", popularConversionTemplate: "da {FROM} a {TO}", recentlySearchedLabel: "Cercato di recente", noMatchingConversionFound: "Nessuna conversione corrispondente trovata", launchStatusEyebrow: "Stato del lancio", launchStatusHeading: "Preciso, trasparente e pronto per l'uso quotidiano", launchStatusUpdatedTemplate: "Ultimo aggiornamento: {DATE}. I fattori principali SI, metrici, imperiali e consuetudinari statunitensi sono documentati nelle definizioni del convertitore. I tassi di cambio usano valori di esempio offline a meno che non sia connesso un endpoint API in tempo reale.", launchStatusAccuracyTitle: "Informazioni sulla precisione", launchStatusAccuracyDesc: "Vengono utilizzate costanti esatte laddove le definizioni sono fisse, comprese le relazioni tra pollice, piede, miglio, libbra, acro, litro e gallone statunitense.", launchStatusSourcesTitle: "Riferimenti delle fonti", launchStatusSourcesDesc: "Le definizioni SI sono allineate ai riferimenti BIPM e NIST. Le unità comuni non SI includono note di definizione nel pannello dei risultati.", launchStatusViewReferencesLink: "Visualizza riferimenti", launchStatusOfflineTitle: "Offline e privato", launchStatusOfflineDesc: "I convertitori funzionano nel browser. Preferiti, cronologia, iscrizioni alla newsletter e unità personalizzate restano su questo dispositivo per la privacy.", categoryOverviewHeading: "Tutte le categorie di conversione", readConversionGuidesLink: "Leggi le guide di conversione", whyHeading: "Perché Universal Converter", whyThousandsTitle: "Migliaia di unità", whyThousandsDesc: "Cerca unità SI, imperiali, consuetudinarie statunitensi, scientifiche, ingegneristiche, culinarie, agricole, astronomiche e digitali da un unico posto.", whyFormulasTitle: "Formule precise", whyFormulasDesc: "Vengono utilizzate costanti esatte laddove le definizioni sono fisse, e le note sulla formula spiegano come viene calcolato ogni risultato.", whyFreeTitle: "Gratis per sempre", whyFreeDesc: "Il convertitore principale è progettato come un'utilità pubblica gratuita, senza necessità di account per le conversioni quotidiane.", whyMobileTitle: "Funziona su mobile", whyMobileDesc: "Il calcolatore, la griglia delle categorie, la ricerca, le guide e le pagine SEO sono responsive per telefoni, tablet e desktop.", whyOfflineTitle: "Supporto offline", whyOfflineDesc: "La memorizzazione nella cache PWA mantiene disponibile il guscio principale dell'app dopo l'installazione su una distribuzione HTTP o HTTPS ospitata.", guidePreviewEyebrow: "Pagine di utilità pronte per la SEO", guidePreviewHeading: "Guide utili per i calcoli comuni", guidePreviewDesc: "Esplora pagine mirate per ricerche di convertitori di unità, attività di calcolo, ricerche di misure ad alto valore, formule, FAQ e gruppi di conversioni correlate.", linkUnitConverter: "Convertitore di unità", linkOnlineCalculator: "Calcolatrice online", linkMeterToFeet: "Metro in piede", linkKgToLbs: "kg in lbs", linkLiterToGallon: "Litro in gallone", linkCelsiusToFahrenheit: "Celsius in Fahrenheit", linkAcreToHectare: "Acro in ettaro", linkGbToMb: "GB in MB", linkMetricVsImperial: "Metrico vs imperiale", linkDigitalStorage: "Archiviazione digitale", businessHeading: "Costruito come una vera attività di conversione", businessAnalyticsTitle: "Analisi rispettose della privacy", businessAnalyticsDesc: "L'utilizzo viene misurato in forma anonima per guidare i miglioramenti, senza vendere o condividere dati di conversione personali.", businessAdsTitle: "Supportato da annunci e gratuito", businessAdsDesc: "Gli annunci vengono posizionati in modo da non intralciare il calcolatore, così ogni strumento resta gratuito.", businessStayLoopTitle: "Resta aggiornato", businessStayLoopDesc: "Iscriviti per essere informato su nuove calcolatrici, copertura delle unità e guide di conversione non appena vengono lanciate.", businessCustomUnitsTitle: "Unità personalizzate", businessCustomUnitsDesc: "Salva le definizioni di unità importanti per il tuo team o settore, direttamente nel tuo browser.", businessMoreTitle: "Altro in arrivo", businessMoreDesc: "Spazi di lavoro salvati, una modalità senza pubblicità, calcolatrici di gruppo, esportazione CSV e accesso API sono nella roadmap.", faqHeading: "Domande comuni", faqQ1: "Cos'è un convertitore di unità?", faqA1: "Un convertitore di unità trasforma un numero da un'unità di misura a un'altra, come chilogrammi in libbre, metri in piedi, Celsius in Fahrenheit o GB in MB.", faqQ2: "Quanto sono precise le conversioni?", faqA2: "Molte relazioni sono esatte per definizione, tra cui pollice, piede, libbra, litro e gallone statunitense. Le unità approssimative sono descritte nelle loro definizioni.", faqQ3: "Quali unità sono supportate?", faqA3: "Universal Converter supporta unità metriche, imperiali, consuetudinarie statunitensi, scientifiche, ingegneristiche, digitali, culinarie, agricole, astronomiche, elettriche, di pressione, energetiche e altro ancora.", faqQ4: "Universal Converter è gratuito?", faqA4: "Sì. Il convertitore principale, le calcolatrici, il browser delle categorie e le guide sono gratuiti, senza bisogno di account o registrazione.", faqQ5: "Funziona senza connessione internet?", faqA5: "Una volta installato come PWA, il guscio principale dell'app viene memorizzato nella cache e resta disponibile offline. Preferiti, cronologia e unità personalizzate sono inoltre salvati sul tuo dispositivo.", featuredGuidesHeading: "Scopri le conversioni dietro i numeri", viewAllGuidesLink: "Vedi tutte le guide", readGuideLink: "Leggi la guida", fgTag1: "Archiviazione digitale", fgTitle1: "Come funzionano le unità di archiviazione digitale", fgDesc1: "Bit, byte, prefissi decimali e prefissi binari spiegano perché le conversioni di archiviazione possono apparire diverse tra i dispositivi.", fgTag2: "Temperatura", fgTitle2: "Celsius vs Fahrenheit", fgDesc2: "La differenza tra Celsius e Fahrenheit, formule di conversione ed esempi svolti.", fgTag3: "Sistemi di misura", fgTitle3: "Sistema metrico vs imperiale", fgDesc3: "Unità comuni, relazioni esatte e consigli pratici per convertire tra il sistema metrico e quello imperiale.", fgTag4: "Pressione", fgTitle4: "Come funzionano le unità di pressione", fgDesc4: "Confronto tra pascal, bar, PSI, atmosfera e mmHg, con formule di conversione pratiche.", newsletterEyebrow: "Newsletter", newsletterHeading: "Ricevi nuove calcolatrici e guide di conversione", newsletterDesc: "Iscriviti per nuove guide alle formule, strumenti agricoli, unità ingegneristiche e aggiornamenti della piattaforma.", newsletterEmailLabel: "Email", newsletterPlaceholder: "Inserisci il tuo indirizzo email", newsletterSubscribeButton: "Iscriviti", newsletterSuccessStatus: "Grazie per l'iscrizione! Sei nella lista.", missionEyebrow: "La nostra missione", missionHeading: "Rendere ogni misurazione facile da fidarsi", missionBody: "Universal Converter esiste per rendere la conversione di unità rapida, precisa e gratuita per tutti, dagli studenti e cuochi agli ingegneri e ai team aziendali. Pubblichiamo definizioni e formule esatte accanto a ogni risultato, manteniamo lo strumento principale gratuito senza bisogno di account, e lo costruiamo per l'uso offline in modo che un convertitore sia disponibile ovunque tu stia lavorando.", footerTagline: "Conversioni rapide per unità quotidiane, scientifiche, ingegneristiche e commerciali.", footerAbout: "Chi siamo", footerContact: "Contatti", footerPrivacy: "Informativa sulla privacy", footerTerms: "Termini", footerReferences: "Riferimenti", footerGuides: "Guide", footerSitemap: "Mappa del sito", footerCalculators: "Calcolatrici", moreGuidesHeading: "Altre guide e consigli sulla conversione", blogAccuracyTag: "Precisione", blogAccuracyTitle: "Come i convertitori di unità restano precisi", blogAccuracySummary: "I convertitori più affidabili normalizzano i valori tramite un'unità base, quindi formattano il risultato per gli esseri umani.", blogGlobalUnitsTag: "Unità globali", blogGlobalUnitsTitle: "Unità metriche, imperiali e consuetudinarie statunitensi", blogGlobalUnitsSummary: "Un convertitore globale necessita di sistemi sovrapposti, alias e note di formula affinché gli utenti trovino l'unità che si aspettano.", blogTemperatureTag: "Temperatura", blogTemperatureTitle: "Celsius vs Fahrenheit", blogTemperatureSummary: "La differenza tra Celsius e Fahrenheit, formule di conversione ed esempi svolti.", blogDigitalStorageTag: "Archiviazione digitale", blogDigitalStorageTitle: "Come funzionano le unità di archiviazione digitale", blogDigitalStorageSummary: "Bit, byte, prefissi decimali e prefissi binari spiegano perché le conversioni di archiviazione possono apparire diverse tra i dispositivi." },
messages: { sameUnit: "Conversione tra la stessa unità.", currencyOfflineNote: "La valuta utilizza tassi di riferimento offline, a meno che non siano stati caricati tassi API in tempo reale.", temperatureNote: "La conversione della temperatura utilizza il Kelvin come scala assoluta intermedia.", chooseCompatibleFamiliesMessage: "Scegli famiglie di unità compatibili", differentThingsNote: "{FROM} e {TO} misurano cose diverse.", fuelZeroMessage: "Inserisci un valore di consumo carburante diverso da zero", fuelInvertNote: "Le unità di consumo invertono il valore di efficienza.", fuelSupportsNote: "Il consumo di carburante supporta sia unità di distanza per volume sia di volume per distanza.", electricitySameFamilyNote: "Le unità elettriche della stessa famiglia si convertono direttamente.", electricityNeedContextMessage: "Aggiungi il contesto elettrico necessario", electricityNeedContextNote: "I calcoli elettrici tra famiglie diverse richiedono tensione, corrente, resistenza o ore.", electricityContextNote: "Il risultato elettrico utilizza i valori di contesto mostrati sopra.", conversionUnavailableMessage: "Conversione non disponibile", needCompatibleUnitsNote: "Questa conversione richiede unità compatibili.", resultsUpdateNote: "I risultati si aggiornano istantaneamente mentre digiti." },
calculators: { heading: "Calcolatrici per affari, finanza, salute, date e agricoltura", badgeCurrency: "API valutaria pronta", badgeAgriculture: "Suite agricola", badgeClientSide: "Risultati lato client", currencyTitle: "Convertitore di valute", currencyDesc: "Calcolatrice di cambio pronta per API con tassi di riserva offline.", currencyApiLabel: "Endpoint API (opzionale)", currencyApiPlaceholder: "Incolla l'URL di un'API di tassi di cambio in tempo reale", currencyRefreshButton: "Aggiorna tassi", percentageTitle: "Calcolatrice percentuale", percentOfLabel: "% di", percentageResultSuffix: "risultato", bmiTitle: "Calcolatrice IMC", bmiUnderweight: "Sottopeso", bmiNormal: "Normale", bmiOverweight: "Sovrappeso", bmiObesity: "Intervallo di obesità", bmiEnterPrompt: "Inserisci peso e altezza", ageTitle: "Calcolatrice dell'età", birthDateLabel: "Data di nascita", chooseDatePrompt: "Scegli una data", dateCalcTitle: "Calcolatrice di date", chooseStartDatePrompt: "Scegli una data di inizio", daysLaterTemplate: "{OFFSET} giorni dopo: {DATE}", mortgageTitle: "Calcolatrice del mutuo", perMonthSuffix: "al mese", enterLoanDetailsPrompt: "Inserisci i dettagli del prestito", fuelCostTitle: "Calcolatrice del costo del carburante", estimatedFuelCostSuffix: "costo stimato del carburante", enterTripDetailsPrompt: "Inserisci i dettagli del viaggio", agricultureTitle: "Calcolatrici agricole", tabSeed: "Seme", tabFertilizer: "Fertilizzante", tabYield: "Resa", tabIrrigation: "Irrigazione", seedRequiredSuffix: "kg di semi richiesti", fertBagsTemplate: "{FERT} kg, {BAGS} sacchi", tHaRevenueTemplate: "{RATE} t/ha, {REVENUE} di ricavo", m3WaterRequiredSuffix: "m³ di acqua richiesti", ageResultTemplate: "{YEARS} anni, {DAYS} giorni", currencyNeedEndpointPrompt: "Aggiungi un endpoint API o usa i tassi di riserva offline.", currencyLiveRatesFailedPrompt: "Impossibile caricare i tassi in tempo reale. Il tasso di riserva offline rimane attivo." },
cookieBanner: { messagePrefix: "Utilizziamo i cookie per migliorare la tua esperienza e abilitare Google Analytics e Google AdSense. Continuando, accetti la nostra ", privacyPolicyLink: "Informativa sulla privacy", messageSuffix: ".", decline: "Rifiuta", accept: "Accetta", ariaLabel: "Avviso sui cookie" }
},
ar: {
nav: { home: "الرئيسية", converter: "المحوّل", categories: "الفئات", allCategories: "كل الفئات", calculators: "الحاسبات", popular: "الأكثر استخدامًا", guides: "الأدلة", sitemap: "خريطة الموقع", about: "من نحن", contact: "تواصل معنا", search: "بحث", language: "اللغة", theme: "المظهر", menu: "القائمة", themeDark: "داكن", themeLight: "فاتح", privacy: "الخصوصية" },
converter: { searchAllUnits: "ابحث في كل الوحدات", fromUnit: "الوحدة الأصلية", toUnit: "الوحدة الهدف", swap: "تبديل الوحدتين", decimalControl: "عدد الخانات العشرية", notation: "طريقة العرض", notationAuto: "تلقائي", notationDecimal: "عشري", notationScientific: "علمي", notationEngineering: "هندسي", result: "النتيجة", copyResult: "نسخ النتيجة", share: "مشاركة", favorite: "المفضلة", contextValues: "قيم سياقية إضافية", fromDefinition: "تعريف الوحدة الأصلية", toDefinition: "تعريف الوحدة الهدف", formula: "المعادلة", enterValue: "أدخل رقمًا للتحويل", useDecimalNotation: "استخدم الصيغة العشرية أو العلمية، مثل 1.25e6.", searchConversionPlaceholder: "البحث عن تحويل...", voltageLabel: "الجهد", currentLabel: "التيار", resistanceLabel: "المقاومة", hoursLabel: "الساعات", liquidDensityLabel: "كثافة السائل، كجم/لتر", contextHelpDefault: "تحتاج بعض عائلات الوحدات إلى قيمة إضافية للحصول على نتيجة دقيقة فيزيائيًا.", contextHelpElectricity: "تستخدم النتائج الكهربائية بين العائلات المختلفة الجهد والتيار والمقاومة والساعات. الوحدات الكهربائية من نفس العائلة تتحول مباشرة.", kindDefault: "محوّل", kindCurrency: "حاسبة العملات", kindElectricity: "حاسبة كهربائية", seoAdSlotConverterLabel: "مساحة إعلان المحوّل", seoAdSlotConverterReserved: "محجوزة أسفل النتيجة حتى تظل الحاسبة قابلة للاستخدام.", seoAdSlotContentTopLabel: "مساحة إعلانية: أعلى المحتوى (728×90)", seoAdSlotContentTopReserved: "محجوزة أعلى بطاقات التحويل وأسفل المحوّل.", seoAdSlotContentMiddleLabel: "مساحة إعلانية: منتصف المحتوى (728×90)", seoAdSlotContentMiddleReserved: "محجوزة بين البطاقات والأسئلة الشائعة لإبقاء الصفحة متوازنة.", saved: "محفوظ" },
sidebar: { advertisement: "إعلان", favoriteConverters: "المحوّلات المفضّلة", recentlyUsed: "المستخدَمة مؤخرًا", conversionHistory: "سجل التحويلات", clear: "مسح", noFavorites: "لا توجد مفضلة بعد. احفظ محوّلًا ليظهر هنا.", noRecent: "ستظهر المحوّلات المستخدمة مؤخرًا هنا بعد استخدامها.", noHistory: "تبقى آخر تحويلاتك محفوظة على هذا الجهاز وتعمل دون اتصال بالإنترنت.", noMatchingConverter: "لم يتم العثور على محول مطابق. جرّب رمز وحدة أو اسم فئة أو كلمة مفتاحية من الصيغة." },
common: { resultCopied: "تم نسخ النتيجة إلى الحافظة.", copyUnavailable: "النسخ غير متاح في هذا المتصفح، لكن النتيجة جاهزة للتحديد.", shareOpened: "تم فتح نافذة المشاركة.", shareCopied: "تم نسخ نص المشاركة إلى الحافظة.", shareCancelled: "تم إلغاء المشاركة أو أنها غير متاحة.", addApiEndpoint: "أضف نقطة وصول API أو استخدم الأسعار غير المتصلة.", couldNotLoadRates: "تعذّر تحميل الأسعار المباشرة. لا يزال الوضع غير المتصل نشطًا." },
categories: { unitsLabel: "وحدة", conversionPagesLabel: "صفحة تحويل" },
homepage: { heroTitle: "حوّل أي وحدة فورًا", heroDescription: "Universal Converter منصة تحويل مجانية شاملة تغطي 27 فئة قياس وأكثر من 6400 وحدة، بما في ذلك الطول والوزن ودرجة الحرارة والحجم والعملة والتخزين الرقمي والضغط والزراعة والفلك والطهي والهندسة. ابحث أو تصفّح حسب الفئة، واحصل على نتائج دقيقة فورية مع التعريفات والصيغ المرجعية، واستخدم نفس المحوّل للمهام اليومية والعمل العلمي والحسابات التجارية، سواء عبر الإنترنت أو بدونه.", chipLength: "الطول", chipWeight: "الوزن", chipTemperature: "درجة الحرارة", chipVolume: "الحجم", chipPressure: "الضغط", chipDigital: "التخزين الرقمي", chipCurrency: "العملة", chipAgriculture: "الزراعة", chipFlow: "معدل التدفق", adSpace: "مساحة إعلانية", adSpaceCalculatorText: "تساعد الإعلانات في إبقاء هذه الحاسبة مجانية.", adSpaceSiteText: "تساعد الإعلانات في إبقاء هذا الموقع مجانيًا.", searchConversionLabel: "البحث عن تحويل", statsEyebrow: "Universal Converter بالأرقام", statsHeading: "محول مبني بحجم حقيقي", statsDescription: "يعكس كل رقم أدناه ما يعمل فعليًا خلف الآلة الحاسبة: تعريفات وحدات حقيقية وصفحات تحويل تم إنشاؤها فعليًا، وليست محتوى وهميًا.", statsCategoriesDescription: "فئات القياس، من الطول والوزن اليوميين إلى الزراعة وعلم الفلك والهندسة.", statsUnitsDescription: "تعريفات الوحدات الفردية المدعومة في كل فئة، بما في ذلك البادئات المترية والاختلافات الإقليمية.", statsPagesDescription: "صفحات تحويل لتحسين محركات البحث تم إنشاؤها على مستوى الموقع بأكمله، تحتوي كل منها على صيغة وأسئلة شائعة وتحويلات ذات صلة.", popularConversionsHeading: "التحويلات الشائعة", exploreSeoPagesLink: "استكشف صفحات تحسين محركات البحث", popularConversionTemplate: "{FROM} إلى {TO}", recentlySearchedLabel: "تم البحث عنه مؤخرًا", noMatchingConversionFound: "لم يتم العثور على تحويل مطابق", launchStatusEyebrow: "حالة الإطلاق", launchStatusHeading: "دقيق وشفاف وجاهز للاستخدام اليومي", launchStatusUpdatedTemplate: "آخر تحديث: {DATE}. تم توثيق عوامل النظام الدولي والمتري والإمبراطوري والأمريكي التقليدي الأساسية في تعريفات المحول. تستخدم أسعار العملات قيمًا تجريبية دون اتصال ما لم يتم توصيل نقطة نهاية API مباشرة.", launchStatusAccuracyTitle: "معلومات الدقة", launchStatusAccuracyDesc: "تُستخدم ثوابت دقيقة حيثما تكون التعريفات ثابتة، بما في ذلك علاقات البوصة والقدم والميل والرطل والفدان واللتر والغالون الأمريكي.", launchStatusSourcesTitle: "المراجع المصدرية", launchStatusSourcesDesc: "تتوافق تعريفات النظام الدولي مع مراجع BIPM وNIST. تتضمن الوحدات الشائعة غير التابعة للنظام الدولي ملاحظات تعريفية في لوحة النتائج.", launchStatusViewReferencesLink: "عرض المراجع", launchStatusOfflineTitle: "دون اتصال وخاص", launchStatusOfflineDesc: "تعمل المحولات داخل المتصفح. تبقى المفضلة والسجل واشتراكات النشرة الإخبارية والوحدات المخصصة على هذا الجهاز حفاظًا على الخصوصية.", categoryOverviewHeading: "جميع فئات التحويل", readConversionGuidesLink: "قراءة أدلة التحويل", whyHeading: "لماذا Universal Converter", whyThousandsTitle: "آلاف الوحدات", whyThousandsDesc: "ابحث عن وحدات النظام الدولي والإمبراطورية والأمريكية التقليدية والعلمية والهندسية وأدوات الطهي والزراعة وعلم الفلك والوحدات الرقمية من مكان واحد.", whyFormulasTitle: "صيغ دقيقة", whyFormulasDesc: "تُستخدم ثوابت دقيقة حيثما تكون التعريفات ثابتة، وتوضح ملاحظات الصيغة كيفية حساب كل نتيجة.", whyFreeTitle: "مجاني إلى الأبد", whyFreeDesc: "تم بناء المحول الأساسي كأداة عامة مجانية دون الحاجة إلى حساب للتحويلات اليومية.", whyMobileTitle: "يعمل على الجوال", whyMobileDesc: "الآلة الحاسبة وشبكة الفئات والبحث والأدلة وصفحات تحسين محركات البحث متجاوبة مع الهواتف والأجهزة اللوحية وأجهزة الكمبيوتر المكتبية.", whyOfflineTitle: "دعم العمل دون اتصال", whyOfflineDesc: "يحافظ التخزين المؤقت لتطبيق الويب التقدمي على توفر الهيكل الأساسي للتطبيق بعد التثبيت على نشر HTTP أو HTTPS مستضاف.", guidePreviewEyebrow: "صفحات أدوات جاهزة لمحركات البحث", guidePreviewHeading: "أدلة مفيدة للحسابات الشائعة", guidePreviewDesc: "استكشف صفحات مخصصة لعمليات بحث محول الوحدات ومهام الآلة الحاسبة وعمليات بحث القياسات عالية القيمة والصيغ والأسئلة الشائعة ومجموعات التحويلات ذات الصلة.", linkUnitConverter: "محول الوحدات", linkOnlineCalculator: "آلة حاسبة عبر الإنترنت", linkMeterToFeet: "متر إلى قدم", linkKgToLbs: "كجم إلى رطل", linkLiterToGallon: "لتر إلى غالون", linkCelsiusToFahrenheit: "مئوية إلى فهرنهايت", linkAcreToHectare: "فدان إلى هكتار", linkGbToMb: "غيغابايت إلى ميغابايت", linkMetricVsImperial: "متري مقابل إمبراطوري", linkDigitalStorage: "التخزين الرقمي", businessHeading: "مُصمَّم مثل شركة تحويل حقيقية", businessAnalyticsTitle: "تحليلات صديقة للخصوصية", businessAnalyticsDesc: "يُقاس الاستخدام بشكل مجهول لتوجيه التحسينات، دون بيع أو مشاركة بيانات التحويل الشخصية.", businessAdsTitle: "مدعوم بالإعلانات ومجاني", businessAdsDesc: "يتم وضع الإعلانات بحيث لا تعيق الآلة الحاسبة حتى تظل كل أداة مجانية للاستخدام.", businessStayLoopTitle: "ابقَ على اطلاع", businessStayLoopDesc: "اشترك لتتعرف على الآلات الحاسبة الجديدة، وتغطية الوحدات، وأدلة التحويل فور إطلاقها.", businessCustomUnitsTitle: "وحدات مخصصة", businessCustomUnitsDesc: "احفظ تعريفات الوحدات المهمة لفريقك أو مجال عملك مباشرة في متصفحك.", businessMoreTitle: "المزيد قادم", businessMoreDesc: "مساحات عمل محفوظة، ووضع خالٍ من الإعلانات، وآلات حاسبة جماعية، وتصدير CSV، والوصول إلى واجهة برمجة التطبيقات ضمن خطة التطوير.", faqHeading: "الأسئلة الشائعة", faqQ1: "ما هو محول الوحدات؟", faqA1: "يقوم محول الوحدات بتحويل رقم من وحدة قياس إلى أخرى، مثل الكيلوغرامات إلى الأرطال، أو الأمتار إلى الأقدام، أو المئوية إلى فهرنهايت، أو غيغابايت إلى ميغابايت.", faqQ2: "ما مدى دقة التحويلات؟", faqA2: "العديد من العلاقات دقيقة بحكم التعريف، بما في ذلك البوصة والقدم والرطل واللتر والغالون الأمريكي. تُوصف الوحدات التقريبية في تعريفاتها.", faqQ3: "ما هي الوحدات المدعومة؟", faqA3: "يدعم Universal Converter الوحدات المترية والإمبراطورية والأمريكية التقليدية والعلمية والهندسية والرقمية ووحدات الطهي والزراعة وعلم الفلك والكهرباء والضغط والطاقة والمزيد.", faqQ4: "هل Universal Converter مجاني الاستخدام؟", faqA4: "نعم. المحول الأساسي والآلات الحاسبة ومتصفح الفئات والأدلة مجانية الاستخدام دون الحاجة إلى حساب أو تسجيل.", faqQ5: "هل يعمل بدون اتصال بالإنترنت؟", faqA5: "بمجرد تثبيته كتطبيق ويب تقدمي، يتم تخزين الهيكل الأساسي للتطبيق مؤقتًا ويبقى متاحًا دون اتصال. كما يتم تخزين المفضلة والسجل والوحدات المخصصة على جهازك.", featuredGuidesHeading: "تعرّف على التحويلات وراء الأرقام", viewAllGuidesLink: "عرض جميع الأدلة", readGuideLink: "قراءة الدليل", fgTag1: "التخزين الرقمي", fgTitle1: "كيف تعمل وحدات التخزين الرقمي", fgDesc1: "تشرح البتات والبايتات والبادئات العشرية والبادئات الثنائية سبب اختلاف تحويلات التخزين عبر الأجهزة.", fgTag2: "درجة الحرارة", fgTitle2: "مئوية مقابل فهرنهايت", fgDesc2: "الفرق بين المئوية والفهرنهايت، وصيغ التحويل، وأمثلة محلولة.", fgTag3: "أنظمة القياس", fgTitle3: "النظام المتري مقابل الإمبراطوري", fgDesc3: "الوحدات الشائعة، والعلاقات الدقيقة، ونصائح عملية للتحويل بين النظامين المتري والإمبراطوري.", fgTag4: "الضغط", fgTitle4: "كيف تعمل وحدات الضغط", fgDesc4: "مقارنة بين الباسكال والبار والرطل لكل بوصة مربعة والضغط الجوي والملم زئبقي، مع صيغ تحويل عملية.", newsletterEyebrow: "النشرة الإخبارية", newsletterHeading: "احصل على آلات حاسبة وأدلة تحويل جديدة", newsletterDesc: "اشترك للحصول على أدلة صيغ جديدة، وأدوات زراعية، ووحدات هندسية، وتحديثات المنصة.", newsletterEmailLabel: "البريد الإلكتروني", newsletterPlaceholder: "أدخل عنوان بريدك الإلكتروني", newsletterSubscribeButton: "اشترك", newsletterSuccessStatus: "شكرًا لاشتراكك! لقد تمت إضافتك إلى القائمة.", missionEyebrow: "مهمتنا", missionHeading: "جعل كل قياس سهل الثقة به", missionBody: "يهدف Universal Converter إلى جعل تحويل الوحدات سريعًا ودقيقًا ومجانيًا للجميع، من الطلاب والطهاة إلى المهندسين وفرق الأعمال. ننشر تعريفات وصيغًا دقيقة بجانب كل نتيجة، ونحافظ على مجانية الأداة الأساسية دون الحاجة إلى حساب، ونبنيها للاستخدام دون اتصال حتى يتوفر محول أينما كنت تعمل.", footerTagline: "تحويلات سريعة للوحدات اليومية والعلمية والهندسية والتجارية.", footerAbout: "حول", footerContact: "اتصل بنا", footerPrivacy: "سياسة الخصوصية", footerTerms: "الشروط", footerReferences: "المراجع", footerGuides: "الأدلة", footerSitemap: "خريطة الموقع", footerCalculators: "الآلات الحاسبة", moreGuidesHeading: "المزيد من أدلة ونصائح التحويل", blogAccuracyTag: "الدقة", blogAccuracyTitle: "كيف تحافظ محولات الوحدات على دقتها", blogAccuracySummary: "تقوم المحولات الأكثر موثوقية بتوحيد القيم من خلال وحدة أساسية، ثم تنسيق النتيجة لتكون مفهومة للبشر.", blogGlobalUnitsTag: "الوحدات العالمية", blogGlobalUnitsTitle: "الوحدات المترية والإمبراطورية والأمريكية التقليدية", blogGlobalUnitsSummary: "يحتاج المحول العالمي إلى أنظمة متداخلة وأسماء بديلة وملاحظات صيغة حتى يجد المستخدمون الوحدة التي يتوقعونها.", blogTemperatureTag: "درجة الحرارة", blogTemperatureTitle: "مئوية مقابل فهرنهايت", blogTemperatureSummary: "الفرق بين المئوية والفهرنهايت، وصيغ التحويل، وأمثلة محلولة.", blogDigitalStorageTag: "التخزين الرقمي", blogDigitalStorageTitle: "كيف تعمل وحدات التخزين الرقمي", blogDigitalStorageSummary: "تشرح البتات والبايتات والبادئات العشرية والبادئات الثنائية سبب اختلاف تحويلات التخزين عبر الأجهزة." },
messages: { sameUnit: "تحويل بين نفس الوحدة.", currencyOfflineNote: "تستخدم العملة أسعارًا احتياطية غير متصلة ما لم يتم تحميل أسعار مباشرة من واجهة برمجة التطبيقات.", temperatureNote: "يستخدم تحويل درجة الحرارة مقياس كلفن كمقياس مطلق وسيط.", chooseCompatibleFamiliesMessage: "اختر عائلات وحدات متوافقة", differentThingsNote: "{FROM} و{TO} تقيسان أشياء مختلفة.", fuelZeroMessage: "أدخل قيمة كفاءة وقود غير صفرية", fuelInvertNote: "تعكس وحدات الاستهلاك قيمة الكفاءة.", fuelSupportsNote: "تدعم كفاءة استهلاك الوقود وحدات المسافة لكل حجم ووحدات الحجم لكل مسافة.", electricitySameFamilyNote: "تتحول الوحدات الكهربائية من نفس العائلة مباشرة.", electricityNeedContextMessage: "أضف السياق الكهربائي المطلوب", electricityNeedContextNote: "تحتاج الحسابات الكهربائية بين العائلات المختلفة إلى الجهد أو التيار أو المقاومة أو الساعات.", electricityContextNote: "تستخدم النتيجة الكهربائية قيم السياق الموضحة أعلاه.", conversionUnavailableMessage: "التحويل غير متاح", needCompatibleUnitsNote: "يحتاج هذا التحويل إلى وحدات متوافقة.", resultsUpdateNote: "يتم تحديث النتائج فوريًا أثناء الكتابة." },
calculators: { heading: "آلات حاسبة للأعمال والمالية والصحة والتاريخ والزراعة", badgeCurrency: "واجهة برمجة تطبيقات العملات جاهزة", badgeAgriculture: "مجموعة أدوات زراعية", badgeClientSide: "نتائج من جانب العميل", currencyTitle: "محول العملات", currencyDesc: "آلة حاسبة لسعر الصرف جاهزة لواجهة برمجة التطبيقات مع أسعار احتياطية دون اتصال.", currencyApiLabel: "نقطة نهاية API (اختياري)", currencyApiPlaceholder: "الصق عنوان URL لواجهة برمجة تطبيقات أسعار الصرف المباشرة", currencyRefreshButton: "تحديث الأسعار", percentageTitle: "آلة حاسبة النسبة المئوية", percentOfLabel: "% من", percentageResultSuffix: "النتيجة", bmiTitle: "حاسبة مؤشر كتلة الجسم", bmiUnderweight: "نقص الوزن", bmiNormal: "طبيعي", bmiOverweight: "زيادة الوزن", bmiObesity: "نطاق السمنة", bmiEnterPrompt: "أدخل الوزن والطول", ageTitle: "حاسبة العمر", birthDateLabel: "تاريخ الميلاد", chooseDatePrompt: "اختر تاريخًا", dateCalcTitle: "حاسبة التاريخ", chooseStartDatePrompt: "اختر تاريخ البدء", daysLaterTemplate: "بعد {OFFSET} يوم: {DATE}", mortgageTitle: "حاسبة الرهن العقاري", perMonthSuffix: "شهريًا", enterLoanDetailsPrompt: "أدخل تفاصيل القرض", fuelCostTitle: "حاسبة تكلفة الوقود", estimatedFuelCostSuffix: "التكلفة التقديرية للوقود", enterTripDetailsPrompt: "أدخل تفاصيل الرحلة", agricultureTitle: "آلات حاسبة زراعية", tabSeed: "البذور", tabFertilizer: "السماد", tabYield: "الإنتاجية", tabIrrigation: "الري", seedRequiredSuffix: "كجم من البذور المطلوبة", fertBagsTemplate: "{FERT} كجم، {BAGS} كيس", tHaRevenueTemplate: "{RATE} طن/هكتار، إيرادات {REVENUE}", m3WaterRequiredSuffix: "م³ من المياه المطلوبة", ageResultTemplate: "{YEARS} سنة، {DAYS} يوم", currencyNeedEndpointPrompt: "أضف نقطة نهاية API أو استخدم الأسعار الاحتياطية دون اتصال.", currencyLiveRatesFailedPrompt: "تعذر تحميل الأسعار المباشرة. يظل الاحتياطي دون اتصال نشطًا." },
cookieBanner: { messagePrefix: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك ولتمكين Google Analytics وGoogle AdSense. بالمتابعة، فإنك توافق على ", privacyPolicyLink: "سياسة الخصوصية", messageSuffix: ".", decline: "رفض", accept: "قبول", ariaLabel: "إشعار ملفات تعريف الارتباط" }
},
zh: {
nav: { home: "首页", converter: "换算器", categories: "分类", allCategories: "所有分类", calculators: "计算器", popular: "热门", guides: "指南", sitemap: "网站地图", about: "关于我们", contact: "联系我们", search: "搜索", language: "语言", theme: "主题", menu: "菜单", themeDark: "深色", themeLight: "浅色", privacy: "隐私" },
converter: { searchAllUnits: "搜索所有单位", fromUnit: "原单位", toUnit: "目标单位", swap: "交换单位", decimalControl: "小数位数", notation: "表示法", notationAuto: "自动", notationDecimal: "小数", notationScientific: "科学计数法", notationEngineering: "工程计数法", result: "结果", copyResult: "复制结果", share: "分享", favorite: "收藏", contextValues: "附加参数", fromDefinition: "原单位定义", toDefinition: "目标单位定义", formula: "换算公式", enterValue: "输入要换算的数值", useDecimalNotation: "请使用小数或科学计数法，例如 1.25e6。", searchConversionPlaceholder: "搜索换算…", voltageLabel: "电压", currentLabel: "电流", resistanceLabel: "电阻", hoursLabel: "小时", liquidDensityLabel: "液体密度，kg/L", contextHelpDefault: "某些单位系列需要一个额外的数值才能得到物理上准确的结果。", contextHelpElectricity: "跨系列电学结果需要电压、电流、电阻和小时数。同一系列的电学单位可直接换算。", kindDefault: "换算器", kindCurrency: "货币计算器", kindElectricity: "电学计算器", seoAdSlotConverterLabel: "换算器广告位", seoAdSlotConverterReserved: "预留在结果下方，以确保计算器仍可正常使用。", seoAdSlotContentTopLabel: "广告位：内容顶部 (728x90)", seoAdSlotContentTopReserved: "预留在换算卡片上方、换算器下方。", seoAdSlotContentMiddleLabel: "广告位：内容中部 (728x90)", seoAdSlotContentMiddleReserved: "预留在卡片和常见问题之间，以保持页面平衡。", saved: "已收藏" },
sidebar: { advertisement: "广告", favoriteConverters: "收藏的换算器", recentlyUsed: "最近使用", conversionHistory: "换算记录", clear: "清除", noFavorites: "暂无收藏。保存一个换算器后会显示在这里。", noRecent: "使用过的换算器会在此处显示。", noHistory: "最近的换算记录保存在本设备上，离线也可使用。", noMatchingConverter: "未找到匹配的换算器。请尝试输入单位符号、分类名称或公式关键词。" },
common: { resultCopied: "结果已复制到剪贴板。", copyUnavailable: "此浏览器不支持复制，但结果已可供选中。", shareOpened: "已打开分享窗口。", shareCopied: "分享文本已复制到剪贴板。", shareCancelled: "分享已取消或不可用。", addApiEndpoint: "请添加 API 端点，或使用离线备用汇率。", couldNotLoadRates: "无法加载实时汇率，已继续使用离线备用汇率。" },
categories: { unitsLabel: "个单位", conversionPagesLabel: "个换算页面" },
homepage: { heroTitle: "即时换算任意单位", heroDescription: "Universal Converter 是一个免费的一体化换算平台，涵盖 27 个计量类别和超过 6,400 个单位，包括长度、重量、温度、体积、货币、数字存储、压力、农业、天文、烹饪和工程。按类别搜索或浏览，即时获得带有原始定义和公式的精确结果，并可将同一换算器用于日常任务、科学工作和商业计算，无论在线还是离线。", chipLength: "长度", chipWeight: "重量", chipTemperature: "温度", chipVolume: "体积", chipPressure: "压力", chipDigital: "数字存储", chipCurrency: "货币", chipAgriculture: "农业", chipFlow: "流量", adSpace: "广告位", adSpaceCalculatorText: "展示广告有助于让这个计算器保持免费。", adSpaceSiteText: "展示广告有助于让本网站保持免费。", searchConversionLabel: "搜索换算", statsEyebrow: "Universal Converter 数据一览", statsHeading: "按真实规模构建的换算工具", statsDescription: "下方的每一个数字都反映了计算器背后实际运行的内容：真实的单位定义和真实生成的换算页面，而非占位内容。", statsCategoriesDescription: "测量分类，涵盖日常的长度和重量，一直到农业、天文学和工程学。", statsUnitsDescription: "每个分类下支持的独立单位定义，包括公制词头和地区变体。", statsPagesDescription: "全站生成的 SEO 换算页面，每个页面都包含公式、常见问题解答和相关换算。", popularConversionsHeading: "热门换算", exploreSeoPagesLink: "浏览 SEO 页面", popularConversionTemplate: "{FROM} 换算为 {TO}", recentlySearchedLabel: "最近搜索", noMatchingConversionFound: "未找到匹配的换算", launchStatusEyebrow: "上线状态", launchStatusHeading: "精准、透明，随时可供日常使用", launchStatusUpdatedTemplate: "最后更新：{DATE}。核心国际单位制、公制、英制和美制惯用换算系数均记录在换算器的定义中。除非连接了实时 API 接口，否则货币汇率将使用离线示例数值。", launchStatusAccuracyTitle: "精度信息", launchStatusAccuracyDesc: "在定义固定的情况下均采用精确常数，包括英寸、英尺、英里、磅、英亩、升与美制加仑之间的换算关系。", launchStatusSourcesTitle: "来源参考", launchStatusSourcesDesc: "国际单位制的定义参照国际计量局（BIPM）与美国国家标准与技术研究院（NIST）的标准。非国际单位制的常用单位会在结果面板中附有定义说明。", launchStatusViewReferencesLink: "查看参考资料", launchStatusOfflineTitle: "离线且私密", launchStatusOfflineDesc: "换算器在浏览器中运行。收藏夹、历史记录、订阅信息与自定义单位均仅保存在本设备上，以保护隐私。", categoryOverviewHeading: "全部换算分类", readConversionGuidesLink: "阅读换算指南", whyHeading: "为什么选择 Universal Converter", whyThousandsTitle: "数千种单位", whyThousandsDesc: "在一个平台内即可搜索国际单位制、英制、美制惯用、科学、工程、烹饪、农业、天文与数字存储等各类单位。", whyFormulasTitle: "精确公式", whyFormulasDesc: "在定义固定的情况下均采用精确常数，并通过公式说明解释每个结果的计算方式。", whyFreeTitle: "永久免费", whyFreeDesc: "核心换算器是一款免费的公共工具，日常换算无需注册账号即可使用。", whyMobileTitle: "支持移动端", whyMobileDesc: "计算器、分类网格、搜索、指南与 SEO 页面均针对手机、平板和桌面设备做了自适应处理。", whyOfflineTitle: "离线支持", whyOfflineDesc: "PWA 缓存机制可在托管的 HTTP 或 HTTPS 部署上安装后，使应用主体在离线状态下依然可用。", guidePreviewEyebrow: "SEO 就绪的实用工具页面", guidePreviewHeading: "常见计算实用指南", guidePreviewDesc: "浏览专为单位换算搜索、计算器任务、高价值计量搜索、公式、常见问题解答以及相关换算集合而设的专题页面。", linkUnitConverter: "单位换算器", linkOnlineCalculator: "在线计算器", linkMeterToFeet: "米换算英尺", linkKgToLbs: "千克换算磅", linkLiterToGallon: "升换算加仑", linkCelsiusToFahrenheit: "摄氏度换算华氏度", linkAcreToHectare: "英亩换算公顷", linkGbToMb: "GB 换算 MB", linkMetricVsImperial: "公制对比英制", linkDigitalStorage: "数字存储", businessHeading: "如真实换算业务般构建", businessAnalyticsTitle: "注重隐私的分析", businessAnalyticsDesc: "使用情况将以匿名方式统计，用于指导产品改进，绝不会出售或共享个人换算数据。", businessAdsTitle: "依靠广告支持并保持免费", businessAdsDesc: "展示广告的位置经过精心安排，不会影响计算器的使用，从而让每个工具都能保持免费。", businessStayLoopTitle: "随时了解最新动态", businessStayLoopDesc: "订阅后即可第一时间获知新计算器、新增单位覆盖范围及换算指南的发布信息。", businessCustomUnitsTitle: "自定义单位", businessCustomUnitsDesc: "可直接在浏览器中保存对您的团队或行业至关重要的单位定义。", businessMoreTitle: "更多功能即将推出", businessMoreDesc: "保存的工作区、无广告模式、团队计算器、CSV 导出以及 API 访问均已列入产品路线图。", faqHeading: "常见问题", faqQ1: "什么是单位换算器？", faqA1: "单位换算器可将数值从一种计量单位换算为另一种，例如千克换算为磅、米换算为英尺、摄氏度换算为华氏度，或 GB 换算为 MB。", faqQ2: "换算结果的精确度如何？", faqA2: "许多换算关系依定义即为精确值，包括英寸、英尺、磅、升与美制加仑之间的关系。近似值单位会在其定义中特别说明。", faqQ3: "支持哪些单位？", faqA3: "Universal Converter 支持公制、英制、美制惯用、科学、工程、数字、烹饪、农业、天文、电学、压力、能量等多种单位。", faqQ4: "Universal Converter 是免费使用的吗？", faqA4: "是的。核心换算器、计算器、分类浏览器与各类指南均可免费使用，无需注册账号或登录。", faqQ5: "没有网络连接时也能使用吗？", faqA5: "安装为 PWA 后，应用主体会被缓存并可在离线状态下使用。收藏夹、历史记录与自定义单位同样会保存在您的设备上。", featuredGuidesHeading: "了解数字背后的换算原理", viewAllGuidesLink: "查看全部指南", readGuideLink: "阅读指南", fgTag1: "数字存储", fgTitle1: "数字存储单位的工作原理", fgDesc1: "比特、字节、十进制前缀与二进制前缀共同解释了为何不同设备上的存储换算结果会有所差异。", fgTag2: "温度", fgTitle2: "摄氏度与华氏度对比", fgDesc2: "摄氏度与华氏度之间的区别、换算公式，以及具体计算示例。", fgTag3: "计量系统", fgTitle3: "公制与英制对比", fgDesc3: "常用单位、精确换算关系，以及公制与英制互相换算的实用技巧。", fgTag4: "压力", fgTitle4: "压力单位的工作原理", fgDesc4: "对比帕斯卡、巴、PSI、大气压与毫米汞柱，并提供实用换算公式。", newsletterEyebrow: "订阅通讯", newsletterHeading: "获取最新计算器与换算指南", newsletterDesc: "订阅即可获取全新公式指南、农业工具、工程单位与平台更新信息。", newsletterEmailLabel: "电子邮箱", newsletterPlaceholder: "请输入您的电子邮箱地址", newsletterSubscribeButton: "订阅", newsletterSuccessStatus: "感谢您的订阅！您已成功加入名单。", missionEyebrow: "我们的使命", missionHeading: "让每一次计量都值得信赖", missionBody: "Universal Converter 的使命是让单位换算变得快速、精确且对所有人免费——无论是学生、厨师，还是工程师与商业团队。我们在每个结果旁都公开精确的定义与公式，让核心工具始终免费、无需注册，并支持离线使用，确保无论您身在何处工作，都能随时使用换算器。", footerTagline: "为日常、科学、工程与商业单位提供快速换算。", footerAbout: "关于我们", footerContact: "联系我们", footerPrivacy: "隐私政策", footerTerms: "条款", footerReferences: "参考资料", footerGuides: "指南", footerSitemap: "网站地图", footerCalculators: "计算器", moreGuidesHeading: "更多换算指南与技巧", blogAccuracyTag: "精确度", blogAccuracyTitle: "单位换算器如何保持精确", blogAccuracySummary: "最可靠的换算器会先通过基准单位对数值进行归一化处理，再将结果格式化为便于人类阅读的形式。", blogGlobalUnitsTag: "全球单位", blogGlobalUnitsTitle: "公制、英制与美制惯用单位", blogGlobalUnitsSummary: "一个真正的全球化换算器需要涵盖多套相互重叠的计量体系、单位别名与公式注释，才能让用户准确找到所需单位。", blogTemperatureTag: "温度", blogTemperatureTitle: "摄氏度与华氏度对比", blogTemperatureSummary: "摄氏度与华氏度之间的区别、换算公式，以及具体计算示例。", blogDigitalStorageTag: "数字存储", blogDigitalStorageTitle: "数字存储单位的工作原理", blogDigitalStorageSummary: "比特、字节、十进制前缀与二进制前缀共同解释了为何不同设备上的存储换算结果会有所差异。" },
messages: { sameUnit: "相同单位之间的换算。", currencyOfflineNote: "除非已加载实时 API 汇率，否则货币换算使用离线备用汇率。", temperatureNote: "温度换算以开尔文作为中间绝对温标。", chooseCompatibleFamiliesMessage: "请选择兼容的单位族", differentThingsNote: "{FROM} 和 {TO} 衡量的是不同的量。", fuelZeroMessage: "请输入非零的燃油经济性数值", fuelInvertNote: "消耗类单位会将效率值取倒数。", fuelSupportsNote: "燃油经济性同时支持“距离每体积”和“体积每距离”两类单位。", electricitySameFamilyNote: "同一族的电气单位可直接换算。", electricityNeedContextMessage: "请添加所需的电气上下文参数", electricityNeedContextNote: "跨族电气计算需要电压、电流、电阻或时间（小时）。", electricityContextNote: "电气结果使用上方显示的上下文参数值。", conversionUnavailableMessage: "无法进行换算", needCompatibleUnitsNote: "此换算需要兼容的单位。", resultsUpdateNote: "结果会随着输入即时更新。" },
calculators: { heading: "商业、财务、健康、日期与农业计算器", badgeCurrency: "支持货币 API", badgeAgriculture: "农业工具套件", badgeClientSide: "浏览器端计算结果", currencyTitle: "货币换算器", currencyDesc: "支持 API 接入的汇率计算器，并配有离线备用汇率。", currencyApiLabel: "API 接口地址（可选）", currencyApiPlaceholder: "粘贴实时汇率 API 网址", currencyRefreshButton: "刷新汇率", percentageTitle: "百分比计算器", percentOfLabel: "% 占", percentageResultSuffix: "结果", bmiTitle: "BMI 计算器", bmiUnderweight: "体重过轻", bmiNormal: "正常", bmiOverweight: "超重", bmiObesity: "肥胖范围", bmiEnterPrompt: "请输入体重与身高", ageTitle: "年龄计算器", birthDateLabel: "出生日期", chooseDatePrompt: "请选择日期", dateCalcTitle: "日期计算器", chooseStartDatePrompt: "请选择起始日期", daysLaterTemplate: "{OFFSET} 天后：{DATE}", mortgageTitle: "房贷计算器", perMonthSuffix: "每月", enterLoanDetailsPrompt: "请输入贷款详情", fuelCostTitle: "燃油成本计算器", estimatedFuelCostSuffix: "预估燃油成本", enterTripDetailsPrompt: "请输入行程详情", agricultureTitle: "农业计算器", tabSeed: "播种", tabFertilizer: "施肥", tabYield: "产量", tabIrrigation: "灌溉", seedRequiredSuffix: "所需种子（kg）", fertBagsTemplate: "{FERT} 千克，{BAGS} 袋", tHaRevenueTemplate: "{RATE} 吨/公顷，收入 {REVENUE}", m3WaterRequiredSuffix: "所需灌溉水量（立方米）", ageResultTemplate: "{YEARS} 岁，{DAYS} 天", currencyNeedEndpointPrompt: "请添加 API 接口地址，或使用离线备用汇率。", currencyLiveRatesFailedPrompt: "无法加载实时汇率，已继续使用离线备用汇率。" },
cookieBanner: { messagePrefix: "我们使用 Cookie 来改善您的体验，并启用 Google Analytics 与 Google AdSense。继续使用即表示您同意我们的", privacyPolicyLink: "隐私政策", messageSuffix: "。", decline: "拒绝", accept: "接受", ariaLabel: "Cookie 提示" }
},
ja: {
nav: { home: "ホーム", converter: "コンバーター", categories: "カテゴリー", allCategories: "すべてのカテゴリー", calculators: "計算ツール", popular: "人気", guides: "ガイド", sitemap: "サイトマップ", about: "サイトについて", contact: "お問い合わせ", search: "検索", language: "言語", theme: "テーマ", menu: "メニュー", themeDark: "ダーク", themeLight: "ライト", privacy: "プライバシー" },
converter: { searchAllUnits: "すべての単位を検索", fromUnit: "変換元の単位", toUnit: "変換先の単位", swap: "単位を入れ替え", decimalControl: "小数点以下の桁数", notation: "表記形式", notationAuto: "自動", notationDecimal: "小数", notationScientific: "指数表記", notationEngineering: "工学表記", result: "結果", copyResult: "結果をコピー", share: "共有", favorite: "お気に入り", contextValues: "追加パラメータ", fromDefinition: "変換元単位の定義", toDefinition: "変換先単位の定義", formula: "計算式", enterValue: "変換する数値を入力してください", useDecimalNotation: "1.25e6 のように小数表記または指数表記を使用してください。", searchConversionPlaceholder: "変換を検索...", voltageLabel: "電圧", currentLabel: "電流", resistanceLabel: "抵抗", hoursLabel: "時間", liquidDensityLabel: "液体密度、kg/L", contextHelpDefault: "一部の単位系では、物理的に正確な結果を得るために追加の値が1つ必要です。", contextHelpElectricity: "系列をまたぐ電気系の結果には、電圧、電流、抵抗、時間が使用されます。同じ系列の電気単位は直接変換されます。", kindDefault: "コンバーター", kindCurrency: "通貨計算機", kindElectricity: "電気計算機", seoAdSlotConverterLabel: "コンバーター広告枠", seoAdSlotConverterReserved: "計算機が使いやすいままになるよう、結果の下に確保されています。", seoAdSlotContentTopLabel: "広告枠：コンテンツ上部（728x90）", seoAdSlotContentTopReserved: "変換カードの上、コンバーターの下に確保されています。", seoAdSlotContentMiddleLabel: "広告枠：コンテンツ中央（728x90）", seoAdSlotContentMiddleReserved: "カードとFAQの間に確保され、ページのバランスを保ちます。", saved: "保存済み" },
sidebar: { advertisement: "広告", favoriteConverters: "お気に入りのコンバーター", recentlyUsed: "最近使用したもの", conversionHistory: "変換履歴", clear: "削除", noFavorites: "お気に入りはまだありません。コンバーターを保存するとここに表示されます。", noRecent: "使用したコンバーターがここに表示されます。", noHistory: "最近の変換履歴はこの端末に保存され、オフラインでも利用できます。", noMatchingConverter: "一致する変換ツールが見つかりません。単位記号、カテゴリ名、または数式のキーワードを試してください。" },
common: { resultCopied: "結果をクリップボードにコピーしました。", copyUnavailable: "このブラウザではコピーを利用できませんが、結果は選択できます。", shareOpened: "共有ダイアログを開きました。", shareCopied: "共有用のテキストをクリップボードにコピーしました。", shareCancelled: "共有がキャンセルされたか、利用できません。", addApiEndpoint: "APIエンドポイントを追加するか、オフラインの参考レートを使用してください。", couldNotLoadRates: "最新レートを取得できませんでした。オフラインの参考レートを引き続き使用します。" },
categories: { unitsLabel: "単位", conversionPagesLabel: "変換ページ" },
homepage: { heroTitle: "あらゆる単位を即座に変換", heroDescription: "Universal Converterは、長さ、重さ、温度、体積、通貨、デジタルストレージ、圧力、農業、天文学、料理、工学など、27の測定カテゴリーと6,400以上の単位をカバーする無料のオールインワン変換プラットフォームです。カテゴリーで検索・閲覧し、出典となる定義や計算式とともに即座に正確な結果を取得でき、日常のタスクから科学的作業、ビジネス計算まで、オンラインでもオフラインでも同じコンバーターを使用できます。", chipLength: "長さ", chipWeight: "重さ", chipTemperature: "温度", chipVolume: "体積", chipPressure: "圧力", chipDigital: "デジタルストレージ", chipCurrency: "通貨", chipAgriculture: "農業", chipFlow: "流量", adSpace: "広告スペース", adSpaceCalculatorText: "広告の表示は、この計算ツールを無料で提供するのに役立っています。", adSpaceSiteText: "広告の表示は、このサイトを無料で提供するのに役立っています。", searchConversionLabel: "変換を検索", statsEyebrow: "Universal Converterの実績", statsHeading: "実際の規模で構築された変換ツール", statsDescription: "以下の各数値は、電卓の裏側で実際に稼働している内容を反映しています。実際の単位定義と実際に生成された変換ページであり、プレースホルダーのコンテンツではありません。", statsCategoriesDescription: "日常の長さや重さから、農業、天文学、工学まで及ぶ測定カテゴリ。", statsUnitsDescription: "メートル法の接頭辞や地域ごとのバリエーションを含む、各カテゴリでサポートされている個々の単位定義。", statsPagesDescription: "サイト全体で生成されたSEO変換ページ。それぞれに数式、よくある質問、関連する変換が含まれます。", popularConversionsHeading: "よく使われる変換", exploreSeoPagesLink: "SEOページを見る", popularConversionTemplate: "{FROM}から{TO}へ", recentlySearchedLabel: "最近の検索", noMatchingConversionFound: "一致する変換が見つかりません", launchStatusEyebrow: "公開ステータス", launchStatusHeading: "正確かつ透明性があり、日常利用にすぐ使えます", launchStatusUpdatedTemplate: "最終更新日：{DATE}。SI基本単位、メートル法、ヤード・ポンド法、および米国慣用単位の主要な係数は、コンバーターの定義に記載されています。ライブAPIエンドポイントが接続されていない限り、通貨レートはオフラインのサンプル値を使用します。", launchStatusAccuracyTitle: "精度に関する情報", launchStatusAccuracyDesc: "インチ、フィート、マイル、ポンド、エーカー、リットル、米ガロンの関係など、定義が固定されている場合は正確な定数が使用されます。", launchStatusSourcesTitle: "参照元情報", launchStatusSourcesDesc: "SIの定義はBIPMおよびNISTの参照基準に準拠しています。非SIの一般的な単位には、結果パネルに定義に関する注記が記載されています。", launchStatusViewReferencesLink: "参照情報を見る", launchStatusOfflineTitle: "オフラインかつプライベート", launchStatusOfflineDesc: "コンバーターはブラウザ内で動作します。お気に入り、履歴、ニュースレター登録、カスタム単位は、プライバシー保護のためこの端末にのみ保存されます。", categoryOverviewHeading: "すべての変換カテゴリ", readConversionGuidesLink: "変換ガイドを読む", whyHeading: "Universal Converterが選ばれる理由", whyThousandsTitle: "数千種類の単位", whyThousandsDesc: "SI、ヤード・ポンド法、米国慣用単位、科学、工学、料理、農業、天文学、デジタル単位を一か所で検索できます。", whyFormulasTitle: "正確な計算式", whyFormulasDesc: "定義が固定されている場合は正確な定数を使用し、各結果がどのように計算されたかを数式の注記で説明します。", whyFreeTitle: "永久無料", whyFreeDesc: "コアコンバーターは無料の公共ユーティリティとして構築されており、日常的な変換にアカウントは不要です。", whyMobileTitle: "モバイルにも対応", whyMobileDesc: "電卓、カテゴリグリッド、検索、ガイド、SEOページは、スマートフォン、タブレット、デスクトップに対応したレスポンシブデザインです。", whyOfflineTitle: "オフライン対応", whyOfflineDesc: "PWAキャッシュにより、ホストされたHTTPまたはHTTPS環境にインストール後もメインのアプリシェルが利用可能な状態を維持します。", guidePreviewEyebrow: "SEO対応のユーティリティページ", guidePreviewHeading: "よくある計算に役立つガイド", guidePreviewDesc: "単位変換の検索、計算タスク、価値の高い測定検索、数式、よくある質問、関連する変換のまとまりに特化したページをご覧ください。", linkUnitConverter: "単位変換ツール", linkOnlineCalculator: "オンライン電卓", linkMeterToFeet: "メートルからフィート", linkKgToLbs: "kgからlbsへ", linkLiterToGallon: "リットルからガロン", linkCelsiusToFahrenheit: "摂氏から華氏", linkAcreToHectare: "エーカーからヘクタール", linkGbToMb: "GBからMBへ", linkMetricVsImperial: "メートル法とヤード・ポンド法", linkDigitalStorage: "デジタルストレージ", businessHeading: "本格的な変換ビジネスとして構築", businessAnalyticsTitle: "プライバシーに配慮した分析", businessAnalyticsDesc: "利用状況は改善の指針とするため匿名で測定され、個人の変換データを販売または共有することはありません。", businessAdsTitle: "広告収入で運営される無料サービス", businessAdsDesc: "広告は電卓の操作を妨げない位置に配置され、すべてのツールを無料で使い続けられるようにしています。", businessStayLoopTitle: "最新情報をチェック", businessStayLoopDesc: "新しい電卓、対応単位の拡充、変換ガイドが公開されるたびに通知を受け取るには購読してください。", businessCustomUnitsTitle: "カスタム単位", businessCustomUnitsDesc: "チームや業界にとって重要な単位定義を、ブラウザ内に直接保存できます。", businessMoreTitle: "さらに多くの機能が登場予定", businessMoreDesc: "保存されたワークスペース、広告非表示モード、チーム向け電卓、CSVエクスポート、API アクセスがロードマップに含まれています。", faqHeading: "よくある質問", faqQ1: "単位変換ツールとは？", faqA1: "単位変換ツールは、キログラムからポンド、メートルからフィート、摂氏から華氏、GBからMBなど、ある測定単位の数値を別の単位に変換するものです。", faqQ2: "変換の精度はどの程度ですか？", faqA2: "インチ、フィート、ポンド、リットル、米ガロンの関係など、多くの関係は定義上正確です。近似値となる単位はその定義内で説明されています。", faqQ3: "どの単位に対応していますか？", faqA3: "Universal Converterは、メートル法、ヤード・ポンド法、米国慣用単位、科学、工学、デジタル、料理、農業、天文学、電気、圧力、エネルギーなど、幅広い単位に対応しています。", faqQ4: "Universal Converterは無料で使えますか？", faqA4: "はい。コアコンバーター、電卓、カテゴリブラウザ、ガイドはすべて無料で利用でき、アカウント登録も不要です。", faqQ5: "インターネット接続がなくても使えますか？", faqA5: "PWAとしてインストールすると、メインのアプリシェルがキャッシュされ、オフラインでも利用可能な状態が保たれます。お気に入り、履歴、カスタム単位も端末に保存されます。", featuredGuidesHeading: "数字の裏にある変換の仕組みを学ぶ", viewAllGuidesLink: "すべてのガイドを見る", readGuideLink: "ガイドを読む", fgTag1: "デジタルストレージ", fgTitle1: "デジタルストレージ単位の仕組み", fgDesc1: "ビット、バイト、十進接頭辞、二進接頭辞について理解すると、デバイスによってストレージ変換結果が異なって見える理由がわかります。", fgTag2: "温度", fgTitle2: "摂氏と華氏の違い", fgDesc2: "摂氏と華氏の違い、変換式、計算例を紹介します。", fgTag3: "測定システム", fgTitle3: "メートル法とヤード・ポンド法", fgDesc3: "一般的な単位、正確な関係、メートル法とヤード・ポンド法の変換に役立つ実践的なヒントを紹介します。", fgTag4: "圧力", fgTitle4: "圧力単位の仕組み", fgDesc4: "パスカル、バール、PSI、気圧、mmHgを比較し、実用的な変換式を紹介します。", newsletterEyebrow: "ニュースレター", newsletterHeading: "新しい電卓と変換ガイドをお届けします", newsletterDesc: "新しい数式ガイド、農業ツール、工学単位、プラットフォームの最新情報を購読して受け取りましょう。", newsletterEmailLabel: "メールアドレス", newsletterPlaceholder: "メールアドレスを入力してください", newsletterSubscribeButton: "購読する", newsletterSuccessStatus: "ご登録ありがとうございます！リストに追加されました。", missionEyebrow: "私たちの使命", missionHeading: "あらゆる測定を信頼できるものに", missionBody: "Universal Converterは、学生や料理人からエンジニア、ビジネスチームまで、あらゆる人にとって単位変換を迅速・正確・無料にすることを使命としています。すべての結果とともに正確な定義や数式を公開し、アカウント不要でコアツールを無料のまま提供し、どこで作業していてもコンバーターが利用できるようオフライン対応で構築しています。", footerTagline: "日常、科学、工学、ビジネス単位のための高速な変換。", footerAbout: "会社概要", footerContact: "お問い合わせ", footerPrivacy: "プライバシーポリシー", footerTerms: "利用規約", footerReferences: "参照情報", footerGuides: "ガイド", footerSitemap: "サイトマップ", footerCalculators: "電卓", moreGuidesHeading: "さらなる変換ガイドとヒント", blogAccuracyTag: "精度", blogAccuracyTitle: "単位変換ツールが精度を保つ仕組み", blogAccuracySummary: "最も信頼性の高いコンバーターは、基準単位を通じて値を正規化し、その結果を人が読みやすい形式に整えます。", blogGlobalUnitsTag: "世界の単位", blogGlobalUnitsTitle: "メートル法、ヤード・ポンド法、米国慣用単位", blogGlobalUnitsSummary: "グローバルなコンバーターには、重なり合う単位系、別名、数式の注記が必要であり、ユーザーが求める単位を見つけられるようにします。", blogTemperatureTag: "温度", blogTemperatureTitle: "摂氏と華氏の違い", blogTemperatureSummary: "摂氏と華氏の違い、変換式、計算例を紹介します。", blogDigitalStorageTag: "デジタルストレージ", blogDigitalStorageTitle: "デジタルストレージ単位の仕組み", blogDigitalStorageSummary: "ビット、バイト、十進接頭辞、二進接頭辞について理解すると、デバイスによってストレージ変換結果が異なって見える理由がわかります。" },
messages: { sameUnit: "同一単位間の変換です。", currencyOfflineNote: "ライブAPIレートが読み込まれていない場合、通貨はオフラインの参考レートを使用します。", temperatureNote: "温度変換では、絶対温度の中間スケールとしてケルビンを使用します。", chooseCompatibleFamiliesMessage: "互換性のある単位グループを選択してください", differentThingsNote: "{FROM}と{TO}は異なる量を測定します。", fuelZeroMessage: "0以外の燃費値を入力してください", fuelInvertNote: "消費量系の単位は効率値を逆数にします。", fuelSupportsNote: "燃費は「距離÷体積」と「体積÷距離」の両方の単位に対応しています。", electricitySameFamilyNote: "同じグループの電気単位は直接変換されます。", electricityNeedContextMessage: "必要な電気パラメータを追加してください", electricityNeedContextNote: "グループをまたぐ電気計算には、電圧・電流・抵抗・時間のいずれかが必要です。", electricityContextNote: "電気の結果には上記のパラメータ値が使用されています。", conversionUnavailableMessage: "この変換は利用できません", needCompatibleUnitsNote: "この変換には互換性のある単位が必要です。", resultsUpdateNote: "入力すると結果が即座に更新されます。" },
calculators: { heading: "ビジネス、財務、健康、日付、農業の電卓", badgeCurrency: "通貨API対応", badgeAgriculture: "農業ツール一式", badgeClientSide: "クライアント側で計算", currencyTitle: "通貨換算ツール", currencyDesc: "API対応の為替計算機能。オフライン時の代替レートにも対応。", currencyApiLabel: "APIエンドポイント（任意）", currencyApiPlaceholder: "リアルタイム為替レートAPIのURLを貼り付けてください", currencyRefreshButton: "レートを更新", percentageTitle: "パーセント計算機", percentOfLabel: "% の", percentageResultSuffix: "結果", bmiTitle: "BMI計算機", bmiUnderweight: "低体重", bmiNormal: "普通", bmiOverweight: "過体重", bmiObesity: "肥満範囲", bmiEnterPrompt: "体重と身長を入力してください", ageTitle: "年齢計算機", birthDateLabel: "生年月日", chooseDatePrompt: "日付を選択してください", dateCalcTitle: "日付計算機", chooseStartDatePrompt: "開始日を選択してください", daysLaterTemplate: "{OFFSET}日後：{DATE}", mortgageTitle: "住宅ローン計算機", perMonthSuffix: "毎月", enterLoanDetailsPrompt: "ローンの詳細を入力してください", fuelCostTitle: "燃料費計算機", estimatedFuelCostSuffix: "推定燃料費", enterTripDetailsPrompt: "旅行の詳細を入力してください", agricultureTitle: "農業計算機", tabSeed: "種子", tabFertilizer: "肥料", tabYield: "収穫量", tabIrrigation: "灌漑", seedRequiredSuffix: "必要な種子量（kg）", fertBagsTemplate: "{FERT} kg、{BAGS} 袋", tHaRevenueTemplate: "{RATE} t/ha、収益 {REVENUE}", m3WaterRequiredSuffix: "必要な水量（m3）", ageResultTemplate: "{YEARS}歳、{DAYS}日", currencyNeedEndpointPrompt: "APIエンドポイントを追加するか、オフラインの代替レートを使用してください。", currencyLiveRatesFailedPrompt: "リアルタイムレートを読み込めませんでした。オフラインの代替レートを引き続き使用します。" },
cookieBanner: { messagePrefix: "お客様の体験を向上させ、Google AnalyticsとGoogle AdSenseを有効にするためにCookieを使用しています。続行することで、以下の", privacyPolicyLink: "プライバシーポリシー", messageSuffix: "。", decline: "拒否", accept: "同意する", ariaLabel: "Cookieに関する通知" }
},
ko: {
nav: { home: "홈", converter: "변환기", categories: "카테고리", allCategories: "전체 카테고리", calculators: "계산기", popular: "인기", guides: "가이드", sitemap: "사이트맵", about: "소개", contact: "문의하기", search: "검색", language: "언어", theme: "테마", menu: "메뉴", themeDark: "다크", themeLight: "라이트", privacy: "개인정보" },
converter: { searchAllUnits: "모든 단위 검색", fromUnit: "변환 전 단위", toUnit: "변환 후 단위", swap: "단위 바꾸기", decimalControl: "소수점 자릿수", notation: "표기 방식", notationAuto: "자동", notationDecimal: "소수", notationScientific: "지수 표기", notationEngineering: "공학 표기", result: "결과", copyResult: "결과 복사", share: "공유", favorite: "즐겨찾기", contextValues: "추가 값", fromDefinition: "변환 전 단위 정의", toDefinition: "변환 후 단위 정의", formula: "공식", enterValue: "변환할 숫자를 입력하세요", useDecimalNotation: "1.25e6과 같은 소수 또는 지수 표기를 사용하세요.", searchConversionPlaceholder: "변환 검색...", voltageLabel: "전압", currentLabel: "전류", resistanceLabel: "저항", hoursLabel: "시간", liquidDensityLabel: "액체 밀도, kg/L", contextHelpDefault: "일부 단위 계열은 물리적으로 정확한 결과를 얻기 위해 추가 값이 하나 더 필요합니다.", contextHelpElectricity: "계열 간 전기 결과에는 전압, 전류, 저항, 시간이 사용됩니다. 같은 계열의 전기 단위는 직접 변환됩니다.", kindDefault: "변환기", kindCurrency: "통화 계산기", kindElectricity: "전기 계산기", seoAdSlotConverterLabel: "변환기 광고 영역", seoAdSlotConverterReserved: "계산기가 계속 사용 가능하도록 결과 아래에 예약되어 있습니다.", seoAdSlotContentTopLabel: "광고 영역: 콘텐츠 상단 (728x90)", seoAdSlotContentTopReserved: "변환 카드 위, 변환기 아래에 예약되어 있습니다.", seoAdSlotContentMiddleLabel: "광고 영역: 콘텐츠 중간 (728x90)", seoAdSlotContentMiddleReserved: "카드와 FAQ 사이에 예약되어 페이지 균형을 유지합니다.", saved: "저장됨" },
sidebar: { advertisement: "광고", favoriteConverters: "즐겨찾는 변환기", recentlyUsed: "최근 사용", conversionHistory: "변환 기록", clear: "지우기", noFavorites: "아직 즐겨찾기가 없습니다. 변환기를 저장하면 여기에 표시됩니다.", noRecent: "최근에 사용한 변환기가 여기에 표시됩니다.", noHistory: "최근 변환 기록은 이 기기에 저장되며 오프라인에서도 사용할 수 있습니다.", noMatchingConverter: "일치하는 변환기를 찾을 수 없습니다. 단위 기호, 카테고리 이름 또는 공식 키워드를 입력해 보세요." },
common: { resultCopied: "결과가 클립보드에 복사되었습니다.", copyUnavailable: "이 브라우저에서는 복사를 사용할 수 없지만 결과를 선택할 수 있습니다.", shareOpened: "공유 대화상자가 열렸습니다.", shareCopied: "공유 텍스트가 클립보드에 복사되었습니다.", shareCancelled: "공유가 취소되었거나 사용할 수 없습니다.", addApiEndpoint: "API 엔드포인트를 추가하거나 오프라인 참고 환율을 사용하세요.", couldNotLoadRates: "실시간 환율을 불러오지 못했습니다. 오프라인 참고 환율이 계속 사용됩니다." },
categories: { unitsLabel: "개 단위", conversionPagesLabel: "개 변환 페이지" },
homepage: { heroTitle: "모든 단위를 즉시 변환하세요", heroDescription: "Universal Converter는 길이, 무게, 온도, 부피, 통화, 디지털 저장 용량, 압력, 농업, 천문학, 요리, 공학을 포함해 27개 측정 카테고리와 6,400개 이상의 단위를 다루는 무료 올인원 변환 플랫폼입니다. 카테고리별로 검색하거나 둘러보고, 출처가 명확한 정의와 공식으로 즉시 정확한 결과를 얻으며, 온라인이든 오프라인이든 일상 업무, 과학 연구, 비즈니스 계산에 동일한 변환기를 사용할 수 있습니다.", chipLength: "길이", chipWeight: "무게", chipTemperature: "온도", chipVolume: "부피", chipPressure: "압력", chipDigital: "디지털 저장 용량", chipCurrency: "통화", chipAgriculture: "농업", chipFlow: "유량", adSpace: "광고 영역", adSpaceCalculatorText: "광고 표시는 이 계산기를 무료로 유지하는 데 도움이 됩니다.", adSpaceSiteText: "광고 표시는 이 사이트를 무료로 유지하는 데 도움이 됩니다.", searchConversionLabel: "변환 검색", statsEyebrow: "숫자로 보는 Universal Converter", statsHeading: "실제 규모로 구축된 변환기", statsDescription: "아래의 각 수치는 계산기 뒤에서 실제로 실행되는 내용을 반영합니다. 실제 단위 정의와 실제로 생성된 변환 페이지이며, 임시 콘텐츠가 아닙니다.", statsCategoriesDescription: "일상적인 길이와 무게부터 농업, 천문학, 공학에 이르는 측정 카테고리.", statsUnitsDescription: "미터법 접두사와 지역별 변형을 포함하여 모든 카테고리에서 지원되는 개별 단위 정의.", statsPagesDescription: "사이트 전체에서 생성된 SEO 변환 페이지로, 각 페이지에는 공식, FAQ, 관련 변환이 포함되어 있습니다.", popularConversionsHeading: "인기 변환", exploreSeoPagesLink: "SEO 페이지 둘러보기", popularConversionTemplate: "{FROM}을(를) {TO}(으)로", recentlySearchedLabel: "최근 검색", noMatchingConversionFound: "일치하는 변환을 찾을 수 없습니다", launchStatusEyebrow: "출시 상태", launchStatusHeading: "정확하고 투명하며 일상적으로 바로 사용할 수 있습니다", launchStatusUpdatedTemplate: "마지막 업데이트: {DATE}. 핵심 SI, 미터법, 야드파운드법, 미국 관용 단위 계수는 변환기 정의에 문서화되어 있습니다. 실시간 API 엔드포인트가 연결되지 않는 한 환율은 오프라인 샘플 값을 사용합니다.", launchStatusAccuracyTitle: "정확도 정보", launchStatusAccuracyDesc: "인치, 피트, 마일, 파운드, 에이커, 리터, 미국 갤런 관계를 포함하여 정의가 고정된 경우 정확한 상수가 사용됩니다.", launchStatusSourcesTitle: "출처 참고 자료", launchStatusSourcesDesc: "SI 정의는 BIPM 및 NIST 참조 기준에 맞춰져 있습니다. 비SI 일반 단위에는 결과 패널에 정의 관련 참고 사항이 포함되어 있습니다.", launchStatusViewReferencesLink: "참고 자료 보기", launchStatusOfflineTitle: "오프라인 및 비공개", launchStatusOfflineDesc: "변환기는 브라우저에서 실행됩니다. 즐겨찾기, 기록, 뉴스레터 구독, 사용자 지정 단위는 개인정보 보호를 위해 이 기기에만 저장됩니다.", categoryOverviewHeading: "모든 변환 카테고리", readConversionGuidesLink: "변환 가이드 읽기", whyHeading: "Universal Converter를 선택하는 이유", whyThousandsTitle: "수천 개의 단위", whyThousandsDesc: "SI, 야드파운드법, 미국 관용 단위, 과학, 공학, 요리, 농업, 천문학, 디지털 단위를 한 곳에서 검색하세요.", whyFormulasTitle: "정확한 공식", whyFormulasDesc: "정의가 고정된 경우 정확한 상수가 사용되며, 공식 참고 사항을 통해 각 결과가 어떻게 계산되는지 설명합니다.", whyFreeTitle: "영원히 무료", whyFreeDesc: "핵심 변환기는 무료 공공 유틸리티로 제작되었으며, 일상적인 변환에는 계정이 필요하지 않습니다.", whyMobileTitle: "모바일에서도 작동", whyMobileDesc: "계산기, 카테고리 그리드, 검색, 가이드, SEO 페이지는 휴대전화, 태블릿, 데스크톱에 반응형으로 대응합니다.", whyOfflineTitle: "오프라인 지원", whyOfflineDesc: "PWA 캐싱을 통해 호스팅된 HTTP 또는 HTTPS 배포에 설치한 후에도 기본 앱 셸을 계속 사용할 수 있습니다.", guidePreviewEyebrow: "SEO 준비가 완료된 유틸리티 페이지", guidePreviewHeading: "일반적인 계산에 유용한 가이드", guidePreviewDesc: "단위 변환기 검색, 계산기 작업, 높은 가치를 지닌 측정 검색, 공식, 자주 묻는 질문, 관련 변환 모음에 특화된 페이지를 살펴보세요.", linkUnitConverter: "단위 변환기", linkOnlineCalculator: "온라인 계산기", linkMeterToFeet: "미터를 피트로", linkKgToLbs: "kg를 lbs로", linkLiterToGallon: "리터를 갤런으로", linkCelsiusToFahrenheit: "섭씨를 화씨로", linkAcreToHectare: "에이커를 헥타르로", linkGbToMb: "GB를 MB로", linkMetricVsImperial: "미터법 대 야드파운드법", linkDigitalStorage: "디지털 저장 용량", businessHeading: "실제 변환 비즈니스처럼 구축됨", businessAnalyticsTitle: "개인정보를 존중하는 분석", businessAnalyticsDesc: "개선 방향을 위해 사용량은 익명으로 측정되며, 개인 변환 데이터를 판매하거나 공유하지 않습니다.", businessAdsTitle: "광고 기반의 무료 서비스", businessAdsDesc: "광고는 계산기 사용에 방해되지 않도록 배치되어 모든 도구를 무료로 유지합니다.", businessStayLoopTitle: "최신 소식 받아보기", businessStayLoopDesc: "새로운 계산기, 단위 지원 확대, 변환 가이드가 출시될 때마다 소식을 받으려면 구독하세요.", businessCustomUnitsTitle: "사용자 지정 단위", businessCustomUnitsDesc: "팀이나 업계에 중요한 단위 정의를 브라우저에 바로 저장하세요.", businessMoreTitle: "더 많은 기능이 준비 중", businessMoreDesc: "저장된 작업 공간, 광고 없는 모드, 팀 계산기, CSV 내보내기, API 액세스가 로드맵에 포함되어 있습니다.", faqHeading: "자주 묻는 질문", faqQ1: "단위 변환기란 무엇인가요?", faqA1: "단위 변환기는 킬로그램을 파운드로, 미터를 피트로, 섭씨를 화씨로, GB를 MB로 바꾸는 것처럼 한 측정 단위의 숫자를 다른 단위로 바꿔줍니다.", faqQ2: "변환은 얼마나 정확한가요?", faqA2: "인치, 피트, 파운드, 리터, 미국 갤런 관계를 포함해 많은 관계는 정의상 정확합니다. 근사치인 단위는 해당 정의에 설명되어 있습니다.", faqQ3: "어떤 단위를 지원하나요?", faqA3: "Universal Converter는 미터법, 야드파운드법, 미국 관용 단위, 과학, 공학, 디지털, 요리, 농업, 천문학, 전기, 압력, 에너지 등 다양한 단위를 지원합니다.", faqQ4: "Universal Converter는 무료로 사용할 수 있나요?", faqA4: "네. 핵심 변환기, 계산기, 카테고리 브라우저, 가이드는 계정이나 가입 없이 무료로 사용할 수 있습니다.", faqQ5: "인터넷 연결 없이도 작동하나요?", faqA5: "PWA로 설치하면 기본 앱 셸이 캐시되어 오프라인에서도 계속 사용할 수 있습니다. 즐겨찾기, 기록, 사용자 지정 단위도 기기에 저장됩니다.", featuredGuidesHeading: "숫자 뒤에 숨은 변환 원리 알아보기", viewAllGuidesLink: "모든 가이드 보기", readGuideLink: "가이드 읽기", fgTag1: "디지털 저장 용량", fgTitle1: "디지털 저장 용량 단위의 작동 원리", fgDesc1: "비트, 바이트, 십진 접두사, 이진 접두사를 알면 기기마다 저장 용량 변환 결과가 다르게 보이는 이유를 이해할 수 있습니다.", fgTag2: "온도", fgTitle2: "섭씨 대 화씨", fgDesc2: "섭씨와 화씨의 차이, 변환 공식, 계산 예시를 소개합니다.", fgTag3: "측정 시스템", fgTitle3: "미터법 대 야드파운드법", fgDesc3: "일반적인 단위, 정확한 관계, 미터법과 야드파운드법 간 변환을 위한 실용적인 팁을 소개합니다.", fgTag4: "압력", fgTitle4: "압력 단위의 작동 원리", fgDesc4: "파스칼, 바, PSI, 기압, mmHg를 비교하고 실용적인 변환 공식을 소개합니다.", newsletterEyebrow: "뉴스레터", newsletterHeading: "새로운 계산기와 변환 가이드 받아보기", newsletterDesc: "새로운 공식 가이드, 농업 도구, 공학 단위, 플랫폼 업데이트 소식을 구독하세요.", newsletterEmailLabel: "이메일", newsletterPlaceholder: "이메일 주소를 입력하세요", newsletterSubscribeButton: "구독하기", newsletterSuccessStatus: "구독해 주셔서 감사합니다! 목록에 등록되었습니다.", missionEyebrow: "우리의 사명", missionHeading: "모든 측정을 신뢰할 수 있게 만들기", missionBody: "Universal Converter는 학생과 요리사부터 엔지니어와 비즈니스 팀까지 모든 사람이 단위 변환을 빠르고 정확하며 무료로 이용할 수 있도록 하기 위해 존재합니다. 모든 결과와 함께 정확한 정의와 공식을 공개하고, 계정 없이 핵심 도구를 무료로 유지하며, 어디서 작업하든 변환기를 사용할 수 있도록 오프라인 사용을 지원하도록 설계했습니다.", footerTagline: "일상, 과학, 공학, 비즈니스 단위를 위한 빠른 변환.", footerAbout: "소개", footerContact: "문의하기", footerPrivacy: "개인정보 처리방침", footerTerms: "이용약관", footerReferences: "참고 자료", footerGuides: "가이드", footerSitemap: "사이트맵", footerCalculators: "계산기", moreGuidesHeading: "더 많은 변환 가이드와 팁", blogAccuracyTag: "정확도", blogAccuracyTitle: "단위 변환기가 정확성을 유지하는 방법", blogAccuracySummary: "가장 신뢰할 수 있는 변환기는 기준 단위를 통해 값을 정규화한 다음 결과를 사람이 읽기 쉬운 형식으로 표시합니다.", blogGlobalUnitsTag: "글로벌 단위", blogGlobalUnitsTitle: "미터법, 야드파운드법, 미국 관용 단위", blogGlobalUnitsSummary: "글로벌 변환기는 사용자가 원하는 단위를 찾을 수 있도록 서로 겹치는 단위 체계, 별칭, 공식 참고 사항이 필요합니다.", blogTemperatureTag: "온도", blogTemperatureTitle: "섭씨 대 화씨", blogTemperatureSummary: "섭씨와 화씨의 차이, 변환 공식, 계산 예시를 소개합니다.", blogDigitalStorageTag: "디지털 저장 용량", blogDigitalStorageTitle: "디지털 저장 용량 단위의 작동 원리", blogDigitalStorageSummary: "비트, 바이트, 십진 접두사, 이진 접두사를 알면 기기마다 저장 용량 변환 결과가 다르게 보이는 이유를 이해할 수 있습니다." },
messages: { sameUnit: "동일 단위 간 변환입니다.", currencyOfflineNote: "실시간 API 환율을 불러오지 않은 경우 통화는 오프라인 참고 환율을 사용합니다.", temperatureNote: "온도 변환은 켈빈을 중간 절대 눈금으로 사용합니다.", chooseCompatibleFamiliesMessage: "호환되는 단위 그룹을 선택하세요", differentThingsNote: "{FROM}와(과) {TO}는(은) 서로 다른 대상을 측정합니다.", fuelZeroMessage: "0이 아닌 연비 값을 입력하세요", fuelInvertNote: "소비량 단위는 효율 값을 역수로 변환합니다.", fuelSupportsNote: "연비는 거리/부피 단위와 부피/거리 단위를 모두 지원합니다.", electricitySameFamilyNote: "같은 그룹의 전기 단위는 직접 변환됩니다.", electricityNeedContextMessage: "필요한 전기 관련 값을 추가하세요", electricityNeedContextNote: "다른 그룹 간 전기 계산에는 전압, 전류, 저항 또는 시간이 필요합니다.", electricityContextNote: "전기 결과는 위에 표시된 값을 사용합니다.", conversionUnavailableMessage: "변환을 사용할 수 없습니다", needCompatibleUnitsNote: "이 변환에는 호환되는 단위가 필요합니다.", resultsUpdateNote: "입력하는 즉시 결과가 업데이트됩니다." },
calculators: { heading: "비즈니스, 금융, 건강, 날짜, 농업 계산기", badgeCurrency: "통화 API 지원", badgeAgriculture: "농업 도구 모음", badgeClientSide: "클라이언트 측 결과", currencyTitle: "환율 변환기", currencyDesc: "API 연동이 가능한 환율 계산기로, 오프라인 대체 환율도 지원합니다.", currencyApiLabel: "API 엔드포인트 (선택 사항)", currencyApiPlaceholder: "실시간 환율 API URL을 붙여넣으세요", currencyRefreshButton: "환율 새로고침", percentageTitle: "백분율 계산기", percentOfLabel: "%, 대상:", percentageResultSuffix: "결과", bmiTitle: "BMI 계산기", bmiUnderweight: "저체중", bmiNormal: "정상", bmiOverweight: "과체중", bmiObesity: "비만 범위", bmiEnterPrompt: "체중과 키를 입력하세요", ageTitle: "나이 계산기", birthDateLabel: "생년월일", chooseDatePrompt: "날짜를 선택하세요", dateCalcTitle: "날짜 계산기", chooseStartDatePrompt: "시작 날짜를 선택하세요", daysLaterTemplate: "{OFFSET}일 후: {DATE}", mortgageTitle: "주택담보대출 계산기", perMonthSuffix: "월", enterLoanDetailsPrompt: "대출 정보를 입력하세요", fuelCostTitle: "연료비 계산기", estimatedFuelCostSuffix: "예상 연료비", enterTripDetailsPrompt: "여행 정보를 입력하세요", agricultureTitle: "농업 계산기", tabSeed: "종자", tabFertilizer: "비료", tabYield: "수확량", tabIrrigation: "관개", seedRequiredSuffix: "필요한 종자량(kg)", fertBagsTemplate: "{FERT} kg, {BAGS} 포대", tHaRevenueTemplate: "{RATE} t/ha, 수익 {REVENUE}", m3WaterRequiredSuffix: "필요한 물량(m3)", ageResultTemplate: "{YEARS}세, {DAYS}일", currencyNeedEndpointPrompt: "API 엔드포인트를 추가하거나 오프라인 대체 환율을 사용하세요.", currencyLiveRatesFailedPrompt: "실시간 환율을 불러올 수 없습니다. 오프라인 대체 환율이 계속 사용됩니다." },
cookieBanner: { messagePrefix: "사용자 경험을 개선하고 Google Analytics 및 Google AdSense를 사용하기 위해 쿠키를 사용합니다. 계속 진행하면 당사의 ", privacyPolicyLink: "개인정보 처리방침", messageSuffix: ".", decline: "거부", accept: "수락", ariaLabel: "쿠키 안내" }
},
hi: {
nav: { home: "होम", converter: "कनवर्टर", categories: "श्रेणियाँ", allCategories: "सभी श्रेणियाँ", calculators: "कैलकुलेटर", popular: "लोकप्रिय", guides: "गाइड", sitemap: "साइटमैप", about: "हमारे बारे में", contact: "संपर्क करें", search: "खोजें", language: "भाषा", theme: "थीम", menu: "मेनू", themeDark: "डार्क", themeLight: "लाइट", privacy: "गोपनीयता" },
converter: { searchAllUnits: "सभी इकाइयाँ खोजें", fromUnit: "मूल इकाई", toUnit: "लक्ष्य इकाई", swap: "इकाइयाँ बदलें", decimalControl: "दशमलव अंकों की संख्या", notation: "संकेतन", notationAuto: "स्वतः", notationDecimal: "दशमलव", notationScientific: "वैज्ञानिक", notationEngineering: "इंजीनियरिंग", result: "परिणाम", copyResult: "परिणाम कॉपी करें", share: "साझा करें", favorite: "पसंदीदा", contextValues: "अतिरिक्त मान", fromDefinition: "मूल इकाई की परिभाषा", toDefinition: "लक्ष्य इकाई की परिभाषा", formula: "सूत्र", enterValue: "बदलने के लिए एक संख्या दर्ज करें", useDecimalNotation: "दशमलव या वैज्ञानिक संकेतन का उपयोग करें, जैसे 1.25e6।", searchConversionPlaceholder: "रूपांतरण खोजें...", voltageLabel: "वोल्टेज", currentLabel: "करंट", resistanceLabel: "प्रतिरोध", hoursLabel: "घंटे", liquidDensityLabel: "तरल घनत्व, kg/L", contextHelpDefault: "भौतिक रूप से सटीक परिणाम के लिए कुछ इकाई समूहों को एक अतिरिक्त मान की आवश्यकता होती है।", contextHelpElectricity: "विभिन्न समूहों के बीच विद्युत परिणामों के लिए वोल्टेज, करंट, प्रतिरोध और घंटों का उपयोग किया जाता है। एक ही समूह की विद्युत इकाइयाँ सीधे रूपांतरित होती हैं।", kindDefault: "कनवर्टर", kindCurrency: "मुद्रा कैलकुलेटर", kindElectricity: "विद्युत कैलकुलेटर", seoAdSlotConverterLabel: "कनवर्टर विज्ञापन स्थान", seoAdSlotConverterReserved: "परिणाम के नीचे आरक्षित है ताकि कैलकुलेटर उपयोग योग्य बना रहे।", seoAdSlotContentTopLabel: "विज्ञापन स्थान: सामग्री का शीर्ष भाग (728x90)", seoAdSlotContentTopReserved: "रूपांतरण कार्ड के ऊपर और कनवर्टर के नीचे आरक्षित है।", seoAdSlotContentMiddleLabel: "विज्ञापन स्थान: सामग्री का मध्य भाग (728x90)", seoAdSlotContentMiddleReserved: "कार्ड और सामान्य प्रश्नों के बीच आरक्षित है ताकि पृष्ठ संतुलित रहे।", saved: "सहेजा गया" },
sidebar: { advertisement: "विज्ञापन", favoriteConverters: "पसंदीदा कनवर्टर", recentlyUsed: "हाल ही में उपयोग किए गए", conversionHistory: "रूपांतरण इतिहास", clear: "साफ़ करें", noFavorites: "अभी तक कोई पसंदीदा नहीं है। कनवर्टर सहेजें ताकि वह यहाँ दिखे।", noRecent: "हाल ही में उपयोग किए गए कनवर्टर उपयोग के बाद यहाँ दिखाई देंगे।", noHistory: "आपके नवीनतम रूपांतरण इस डिवाइस पर सुरक्षित रहते हैं और ऑफ़लाइन भी काम करते हैं।", noMatchingConverter: "कोई मेल खाता कनवर्टर नहीं मिला। कोई इकाई प्रतीक, श्रेणी का नाम, या सूत्र कीवर्ड आज़माएँ।" },
common: { resultCopied: "परिणाम क्लिपबोर्ड पर कॉपी किया गया।", copyUnavailable: "इस ब्राउज़र में कॉपी करना उपलब्ध नहीं है, लेकिन परिणाम चुनने के लिए तैयार है।", shareOpened: "शेयर डायलॉग खोला गया।", shareCopied: "शेयर टेक्स्ट क्लिपबोर्ड पर कॉपी किया गया।", shareCancelled: "शेयर रद्द कर दिया गया या उपलब्ध नहीं है।", addApiEndpoint: "कोई API एंडपॉइंट जोड़ें या ऑफ़लाइन दरें उपयोग करें।", couldNotLoadRates: "लाइव दरें लोड नहीं हो सकीं। ऑफ़लाइन दरें सक्रिय रहेंगी।" },
categories: { unitsLabel: "इकाइयाँ", conversionPagesLabel: "रूपांतरण पेज" },
homepage: { heroTitle: "किसी भी इकाई को तुरंत बदलें", heroDescription: "Universal Converter एक मुफ़्त, सर्व-समावेशी रूपांतरण प्लेटफ़ॉर्म है जो 27 मापन श्रेणियों और 6,400 से अधिक इकाइयों को कवर करता है, जिनमें लंबाई, वज़न, तापमान, आयतन, मुद्रा, डिजिटल स्टोरेज, दबाव, कृषि, खगोल विज्ञान, खाना पकाना और इंजीनियरिंग शामिल हैं। श्रेणी के अनुसार खोजें या ब्राउज़ करें, स्रोत परिभाषाओं और सूत्रों के साथ तुरंत सटीक परिणाम पाएं, और रोज़मर्रा के कार्यों, वैज्ञानिक कार्य और व्यावसायिक गणनाओं के लिए ऑनलाइन या ऑफ़लाइन एक ही कनवर्टर का उपयोग करें।", chipLength: "लंबाई", chipWeight: "वज़न", chipTemperature: "तापमान", chipVolume: "आयतन", chipPressure: "दबाव", chipDigital: "डिजिटल स्टोरेज", chipCurrency: "मुद्रा", chipAgriculture: "कृषि", chipFlow: "प्रवाह दर", adSpace: "विज्ञापन स्थान", adSpaceCalculatorText: "विज्ञापन इस कैलकुलेटर को मुफ़्त रखने में मदद करते हैं।", adSpaceSiteText: "विज्ञापन इस साइट को मुफ़्त रखने में मदद करते हैं।", searchConversionLabel: "रूपांतरण खोजें", statsEyebrow: "आंकड़ों में Universal Converter", statsHeading: "वास्तविक पैमाने पर बना एक कनवर्टर", statsDescription: "नीचे दिया गया हर आंकड़ा यह दर्शाता है कि कैलकुलेटर के पीछे वास्तव में क्या चल रहा है: वास्तविक इकाई परिभाषाएँ और वास्तव में जनरेट किए गए रूपांतरण पेज, न कि प्लेसहोल्डर सामग्री।", statsCategoriesDescription: "रोज़मर्रा की लंबाई और वज़न से लेकर कृषि, खगोल विज्ञान और इंजीनियरिंग तक फैली मापन श्रेणियाँ।", statsUnitsDescription: "मीट्रिक उपसर्गों और क्षेत्रीय भिन्नताओं सहित, हर श्रेणी में समर्थित व्यक्तिगत इकाई परिभाषाएँ।", statsPagesDescription: "पूरी साइट पर जनरेट किए गए SEO रूपांतरण पेज, जिनमें से प्रत्येक में सूत्र, सामान्य प्रश्न और संबंधित रूपांतरण शामिल हैं।", popularConversionsHeading: "लोकप्रिय रूपांतरण", exploreSeoPagesLink: "SEO पेज देखें", popularConversionTemplate: "{FROM} से {TO}", recentlySearchedLabel: "हाल ही में खोजा गया", noMatchingConversionFound: "कोई मेल खाता रूपांतरण नहीं मिला", launchStatusEyebrow: "लॉन्च स्थिति", launchStatusHeading: "सटीक, पारदर्शी, और रोज़मर्रा के उपयोग के लिए तैयार", launchStatusUpdatedTemplate: "अंतिम अपडेट: {DATE}। मुख्य SI, मीट्रिक, इंपीरियल, और US रिवाज़ी कारक कनवर्टर परिभाषाओं में दस्तावेज़ित हैं। जब तक कोई लाइव API एंडपॉइंट कनेक्ट न हो, मुद्रा दरें ऑफ़लाइन नमूना मानों का उपयोग करती हैं।", launchStatusAccuracyTitle: "सटीकता जानकारी", launchStatusAccuracyDesc: "जहाँ परिभाषाएँ स्थिर हैं वहाँ सटीक स्थिरांकों का उपयोग किया जाता है, जिसमें इंच, फ़ुट, मील, पाउंड, एकड़, लीटर, और US गैलन संबंध शामिल हैं।", launchStatusSourcesTitle: "स्रोत संदर्भ", launchStatusSourcesDesc: "SI परिभाषाएँ BIPM और NIST संदर्भों के अनुरूप हैं। गैर-SI सामान्य इकाइयों में परिणाम पैनल में परिभाषा नोट्स शामिल हैं।", launchStatusViewReferencesLink: "संदर्भ देखें", launchStatusOfflineTitle: "ऑफ़लाइन और निजी", launchStatusOfflineDesc: "कनवर्टर ब्राउज़र में चलते हैं। पसंदीदा, इतिहास, न्यूज़लेटर साइनअप, और कस्टम इकाइयाँ गोपनीयता के लिए इस डिवाइस पर ही रहती हैं।", categoryOverviewHeading: "सभी कनवर्टर श्रेणियाँ", readConversionGuidesLink: "रूपांतरण गाइड पढ़ें", whyHeading: "Universal Converter क्यों", whyThousandsTitle: "हज़ारों इकाइयाँ", whyThousandsDesc: "एक ही स्थान से SI, इंपीरियल, US रिवाज़ी, वैज्ञानिक, इंजीनियरिंग, खाना पकाने, कृषि, खगोल विज्ञान, और डिजिटल इकाइयाँ खोजें।", whyFormulasTitle: "सटीक सूत्र", whyFormulasDesc: "जहाँ परिभाषाएँ स्थिर हैं वहाँ सटीक स्थिरांकों का उपयोग किया जाता है, और सूत्र नोट्स बताते हैं कि प्रत्येक परिणाम की गणना कैसे की जाती है।", whyFreeTitle: "हमेशा मुफ़्त", whyFreeDesc: "मुख्य कनवर्टर एक मुफ़्त सार्वजनिक उपयोगिता के रूप में बनाया गया है, जिसमें रोज़मर्रा के रूपांतरणों के लिए किसी खाते की आवश्यकता नहीं है।", whyMobileTitle: "मोबाइल पर काम करता है", whyMobileDesc: "कैलकुलेटर, श्रेणी ग्रिड, खोज, गाइड, और SEO पेज फ़ोन, टैबलेट, और डेस्कटॉप के लिए उत्तरदायी हैं।", whyOfflineTitle: "ऑफ़लाइन समर्थन", whyOfflineDesc: "PWA कैशिंग एक होस्ट किए गए HTTP या HTTPS परिनियोजन पर इंस्टॉलेशन के बाद मुख्य ऐप शेल को उपलब्ध रखता है।", guidePreviewEyebrow: "SEO-तैयार यूटिलिटी पेज", guidePreviewHeading: "सामान्य गणनाओं के लिए उपयोगी गाइड", guidePreviewDesc: "यूनिट कनवर्टर खोजों, कैलकुलेटर कार्यों, उच्च-मूल्य माप खोजों, सूत्रों, सामान्य प्रश्नों और संबंधित रूपांतरण समूहों के लिए केंद्रित पेज देखें।", linkUnitConverter: "यूनिट कनवर्टर", linkOnlineCalculator: "ऑनलाइन कैलकुलेटर", linkMeterToFeet: "मीटर से फ़ुट", linkKgToLbs: "kg से lbs", linkLiterToGallon: "लीटर से गैलन", linkCelsiusToFahrenheit: "सेल्सियस से फ़ारेनहाइट", linkAcreToHectare: "एकड़ से हेक्टेयर", linkGbToMb: "GB से MB", linkMetricVsImperial: "मीट्रिक बनाम इंपीरियल", linkDigitalStorage: "डिजिटल स्टोरेज", businessHeading: "एक वास्तविक रूपांतरण व्यवसाय की तरह निर्मित", businessAnalyticsTitle: "गोपनीयता-अनुकूल एनालिटिक्स", businessAnalyticsDesc: "सुधारों का मार्गदर्शन करने के लिए उपयोग को गुमनाम रूप से मापा जाता है, बिना व्यक्तिगत रूपांतरण डेटा बेचे या साझा किए।", businessAdsTitle: "विज्ञापन-समर्थित और मुफ़्त", businessAdsDesc: "डिस्प्ले विज्ञापनों को कैलकुलेटर के रास्ते से दूर रखा जाता है ताकि हर उपकरण मुफ़्त बना रहे।", businessStayLoopTitle: "जुड़े रहें", businessStayLoopDesc: "नए कैलकुलेटर, इकाई कवरेज, और रूपांतरण गाइड के लॉन्च होने पर उनके बारे में जानने के लिए सब्सक्राइब करें।", businessCustomUnitsTitle: "कस्टम इकाइयाँ", businessCustomUnitsDesc: "अपनी टीम या उद्योग के लिए महत्वपूर्ण इकाई परिभाषाओं को सीधे अपने ब्राउज़र में सहेजें।", businessMoreTitle: "और भी आ रहा है", businessMoreDesc: "सहेजे गए वर्कस्पेस, विज्ञापन-मुक्त मोड, टीम कैलकुलेटर, CSV एक्सपोर्ट, और API एक्सेस रोडमैप पर हैं।", faqHeading: "सामान्य प्रश्न", faqQ1: "यूनिट कनवर्टर क्या है?", faqA1: "एक यूनिट कनवर्टर एक संख्या को एक माप इकाई से दूसरी में बदलता है, जैसे किलोग्राम से पाउंड, मीटर से फ़ुट, सेल्सियस से फ़ारेनहाइट, या GB से MB।", faqQ2: "रूपांतरण कितने सटीक हैं?", faqA2: "कई संबंध परिभाषा के अनुसार सटीक हैं, जिनमें इंच, फ़ुट, पाउंड, लीटर, और US गैलन संबंध शामिल हैं। अनुमानित इकाइयों का वर्णन उनकी परिभाषाओं में किया गया है।", faqQ3: "कौन सी इकाइयाँ समर्थित हैं?", faqA3: "Universal Converter मीट्रिक, इंपीरियल, US रिवाज़ी, वैज्ञानिक, इंजीनियरिंग, डिजिटल, खाना पकाने, कृषि, खगोल विज्ञान, बिजली, दबाव, ऊर्जा, और अधिक का समर्थन करता है।", faqQ4: "क्या Universal Converter मुफ़्त है?", faqA4: "हाँ। मुख्य कनवर्टर, कैलकुलेटर, श्रेणी ब्राउज़र, और गाइड बिना किसी खाते या साइन-अप के मुफ़्त उपयोग के लिए उपलब्ध हैं।", faqQ5: "क्या यह इंटरनेट कनेक्शन के बिना काम करता है?", faqA5: "एक बार PWA के रूप में इंस्टॉल हो जाने पर, मुख्य ऐप शेल कैश हो जाता है और ऑफ़लाइन उपलब्ध रहता है। पसंदीदा, इतिहास, और कस्टम इकाइयाँ भी आपके डिवाइस पर संग्रहीत होती हैं।", featuredGuidesHeading: "संख्याओं के पीछे के रूपांतरण को समझें", viewAllGuidesLink: "सभी गाइड देखें", readGuideLink: "गाइड पढ़ें", fgTag1: "डिजिटल स्टोरेज", fgTitle1: "डिजिटल स्टोरेज इकाइयाँ कैसे काम करती हैं", fgDesc1: "बिट्स, बाइट्स, दशमलव उपसर्ग, और बाइनरी उपसर्ग बताते हैं कि डिवाइसों में स्टोरेज रूपांतरण अलग क्यों दिख सकते हैं।", fgTag2: "तापमान", fgTitle2: "सेल्सियस बनाम फ़ारेनहाइट", fgDesc2: "सेल्सियस और फ़ारेनहाइट के बीच अंतर, रूपांतरण सूत्र, और हल किए गए उदाहरण।", fgTag3: "माप प्रणालियाँ", fgTitle3: "मीट्रिक बनाम इंपीरियल प्रणाली", fgDesc3: "सामान्य इकाइयाँ, सटीक संबंध, और मीट्रिक व इंपीरियल के बीच रूपांतरण के लिए व्यावहारिक सुझाव।", fgTag4: "दबाव", fgTitle4: "दबाव इकाइयाँ कैसे काम करती हैं", fgDesc4: "पास्कल, बार, PSI, वायुमंडल, और mmHg की तुलना, व्यावहारिक रूपांतरण सूत्रों के साथ।", newsletterEyebrow: "न्यूज़लेटर", newsletterHeading: "नए कैलकुलेटर और रूपांतरण गाइड पाएं", newsletterDesc: "नए सूत्र गाइड, कृषि उपकरण, इंजीनियरिंग इकाइयों, और प्लेटफ़ॉर्म अपडेट के लिए सब्सक्राइब करें।", newsletterEmailLabel: "ईमेल", newsletterPlaceholder: "अपना ईमेल पता दर्ज करें", newsletterSubscribeButton: "सब्सक्राइब करें", newsletterSuccessStatus: "सब्सक्राइब करने के लिए धन्यवाद! आप सूची में हैं।", missionEyebrow: "हमारा मिशन", missionHeading: "हर माप को भरोसेमंद बनाना", missionBody: "Universal Converter का उद्देश्य छात्रों और रसोइयों से लेकर इंजीनियरों और व्यावसायिक टीमों तक, सभी के लिए यूनिट रूपांतरण को तेज़, सटीक, और मुफ़्त बनाना है। हम हर परिणाम के साथ सटीक परिभाषाएँ और सूत्र प्रकाशित करते हैं, बिना किसी खाते की आवश्यकता के मुख्य टूल को मुफ़्त रखते हैं, और ऑफ़लाइन उपयोग के लिए इसे बनाते हैं ताकि आप जहाँ भी काम कर रहे हों, एक कनवर्टर उपलब्ध हो।", footerTagline: "रोज़मर्रा, वैज्ञानिक, इंजीनियरिंग और व्यावसायिक इकाइयों के लिए तेज़ रूपांतरण।", footerAbout: "परिचय", footerContact: "संपर्क करें", footerPrivacy: "गोपनीयता नीति", footerTerms: "शर्तें", footerReferences: "संदर्भ", footerGuides: "गाइड", footerSitemap: "साइटमैप", footerCalculators: "कैलकुलेटर", moreGuidesHeading: "अधिक रूपांतरण गाइड और सुझाव", blogAccuracyTag: "सटीकता", blogAccuracyTitle: "यूनिट कनवर्टर सटीक कैसे रहते हैं", blogAccuracySummary: "सबसे विश्वसनीय कनवर्टर एक आधार इकाई के माध्यम से मानों को सामान्य करते हैं, फिर परिणाम को मनुष्यों के लिए प्रारूपित करते हैं।", blogGlobalUnitsTag: "वैश्विक इकाइयाँ", blogGlobalUnitsTitle: "मीट्रिक, इंपीरियल, और US रिवाज़ी इकाइयाँ", blogGlobalUnitsSummary: "एक वैश्विक कनवर्टर को ओवरलैपिंग सिस्टम, उपनामों, और सूत्र नोट्स की आवश्यकता होती है ताकि उपयोगकर्ता अपनी अपेक्षित इकाई ढूँढ सकें।", blogTemperatureTag: "तापमान", blogTemperatureTitle: "सेल्सियस बनाम फ़ारेनहाइट", blogTemperatureSummary: "सेल्सियस और फ़ारेनहाइट के बीच अंतर, रूपांतरण सूत्र, और हल किए गए उदाहरण।", blogDigitalStorageTag: "डिजिटल स्टोरेज", blogDigitalStorageTitle: "डिजिटल स्टोरेज इकाइयाँ कैसे काम करती हैं", blogDigitalStorageSummary: "बिट्स, बाइट्स, दशमलव उपसर्ग, और बाइनरी उपसर्ग बताते हैं कि डिवाइसों में स्टोरेज रूपांतरण अलग क्यों दिख सकते हैं।" },
messages: { sameUnit: "समान इकाई के बीच रूपांतरण।", currencyOfflineNote: "जब तक लाइव API दरें लोड न हों, मुद्रा ऑफ़लाइन फ़ॉलबैक दरों का उपयोग करती है।", temperatureNote: "तापमान रूपांतरण मध्यवर्ती निरपेक्ष पैमाने के रूप में केल्विन का उपयोग करता है।", chooseCompatibleFamiliesMessage: "संगत इकाई समूह चुनें", differentThingsNote: "{FROM} और {TO} अलग-अलग चीज़ें मापते हैं।", fuelZeroMessage: "एक शून्येतर ईंधन दक्षता मान दर्ज करें", fuelInvertNote: "खपत इकाइयाँ दक्षता मान को व्युत्क्रम कर देती हैं।", fuelSupportsNote: "ईंधन दक्षता दूरी-प्रति-आयतन और आयतन-प्रति-दूरी, दोनों प्रकार की इकाइयों का समर्थन करती है।", electricitySameFamilyNote: "एक ही समूह की विद्युत इकाइयाँ सीधे रूपांतरित होती हैं।", electricityNeedContextMessage: "आवश्यक विद्युत संदर्भ मान जोड़ें", electricityNeedContextNote: "भिन्न समूहों के बीच विद्युत गणना के लिए वोल्टेज, करंट, प्रतिरोध या घंटे आवश्यक हैं।", electricityContextNote: "विद्युत परिणाम ऊपर दिखाए गए संदर्भ मानों का उपयोग करता है।", conversionUnavailableMessage: "रूपांतरण उपलब्ध नहीं है", needCompatibleUnitsNote: "इस रूपांतरण के लिए संगत इकाइयाँ आवश्यक हैं।", resultsUpdateNote: "टाइप करते ही परिणाम तुरंत अपडेट होते हैं।" },
calculators: { heading: "व्यवसाय, वित्त, स्वास्थ्य, दिनांक और कृषि कैलकुलेटर", badgeCurrency: "मुद्रा API तैयार", badgeAgriculture: "कृषि सुइट", badgeClientSide: "क्लाइंट-साइड परिणाम", currencyTitle: "मुद्रा कनवर्टर", currencyDesc: "ऑफ़लाइन फ़ॉलबैक दरों के साथ API-तैयार विनिमय कैलकुलेटर।", currencyApiLabel: "API एंडपॉइंट (वैकल्पिक)", currencyApiPlaceholder: "लाइव विनिमय दर API URL पेस्ट करें", currencyRefreshButton: "दरें रीफ़्रेश करें", percentageTitle: "प्रतिशत कैलकुलेटर", percentOfLabel: "% का", percentageResultSuffix: "परिणाम", bmiTitle: "BMI कैलकुलेटर", bmiUnderweight: "कम वज़न", bmiNormal: "सामान्य", bmiOverweight: "अधिक वज़न", bmiObesity: "मोटापे की सीमा", bmiEnterPrompt: "वज़न और ऊँचाई दर्ज करें", ageTitle: "आयु कैलकुलेटर", birthDateLabel: "जन्म तिथि", chooseDatePrompt: "एक तिथि चुनें", dateCalcTitle: "दिनांक कैलकुलेटर", chooseStartDatePrompt: "प्रारंभ तिथि चुनें", daysLaterTemplate: "{OFFSET} दिन बाद: {DATE}", mortgageTitle: "बंधक कैलकुलेटर", perMonthSuffix: "प्रति माह", enterLoanDetailsPrompt: "ऋण विवरण दर्ज करें", fuelCostTitle: "ईंधन लागत कैलकुलेटर", estimatedFuelCostSuffix: "अनुमानित ईंधन लागत", enterTripDetailsPrompt: "यात्रा विवरण दर्ज करें", agricultureTitle: "कृषि कैलकुलेटर", tabSeed: "बीज", tabFertilizer: "उर्वरक", tabYield: "उपज", tabIrrigation: "सिंचाई", seedRequiredSuffix: "आवश्यक बीज kg", fertBagsTemplate: "{FERT} kg, {BAGS} बैग", tHaRevenueTemplate: "{RATE} t/ha, {REVENUE} राजस्व", m3WaterRequiredSuffix: "आवश्यक पानी m3", ageResultTemplate: "{YEARS} वर्ष, {DAYS} दिन", currencyNeedEndpointPrompt: "एक API एंडपॉइंट जोड़ें या ऑफ़लाइन फ़ॉलबैक दरों का उपयोग करें।", currencyLiveRatesFailedPrompt: "लाइव दरें लोड नहीं हो सकीं। ऑफ़लाइन फ़ॉलबैक सक्रिय बना हुआ है।" },
cookieBanner: { messagePrefix: "हम आपके अनुभव को बेहतर बनाने और Google Analytics तथा Google AdSense को सक्षम करने के लिए कुकीज़ का उपयोग करते हैं। जारी रखकर, आप हमारी ", privacyPolicyLink: "गोपनीयता नीति", messageSuffix: "।", decline: "अस्वीकार करें", accept: "स्वीकार करें", ariaLabel: "कुकी सूचना" }
},
tr: {
nav: { home: "Ana Sayfa", converter: "Dönüştürücü", categories: "Kategoriler", allCategories: "Tüm kategoriler", calculators: "Hesap Makineleri", popular: "Popüler", guides: "Rehberler", sitemap: "Site Haritası", about: "Hakkımızda", contact: "İletişim", search: "Ara", language: "Dil", theme: "Tema", menu: "Menü", themeDark: "Koyu", themeLight: "Açık", privacy: "Gizlilik" },
converter: { searchAllUnits: "Tüm birimlerde ara", fromUnit: "Kaynak Birim", toUnit: "Hedef Birim", swap: "Birimleri değiştir", decimalControl: "Ondalık basamak sayısı", notation: "Gösterim", notationAuto: "Otomatik", notationDecimal: "Ondalık", notationScientific: "Bilimsel", notationEngineering: "Mühendislik", result: "Sonuç", copyResult: "Sonucu kopyala", share: "Paylaş", favorite: "Favori", contextValues: "Ek bağlam değerleri", fromDefinition: "Kaynak birim tanımı", toDefinition: "Hedef birim tanımı", formula: "Formül", enterValue: "Dönüştürülecek sayıyı girin", useDecimalNotation: "1.25e6 gibi ondalık veya bilimsel gösterim kullanın.", searchConversionPlaceholder: "Dönüştürme ara...", voltageLabel: "Voltaj", currentLabel: "Akım", resistanceLabel: "Direnç", hoursLabel: "Saat", liquidDensityLabel: "Sıvı yoğunluğu, kg/L", contextHelpDefault: "Bazı birim aileleri fiziksel olarak doğru bir sonuç için ek bir değere ihtiyaç duyar.", contextHelpElectricity: "Aileler arası elektrik sonuçları voltaj, akım, direnç ve saat kullanır. Aynı aileden elektrik birimleri doğrudan dönüştürülür.", kindDefault: "Dönüştürücü", kindCurrency: "Döviz hesap makinesi", kindElectricity: "Elektrik hesap makinesi", seoAdSlotConverterLabel: "Dönüştürücü reklam alanı", seoAdSlotConverterReserved: "Hesap makinesinin kullanılabilir kalması için sonucun altında ayrılmıştır.", seoAdSlotContentTopLabel: "Reklam alanı: içerik üstü (728x90)", seoAdSlotContentTopReserved: "Dönüştürme kartlarının üstünde ve dönüştürücünün altında ayrılmıştır.", seoAdSlotContentMiddleLabel: "Reklam alanı: içerik ortası (728x90)", seoAdSlotContentMiddleReserved: "Sayfanın dengeli kalması için kartlar ile SSS arasında ayrılmıştır.", saved: "Kaydedildi" },
sidebar: { advertisement: "Reklam", favoriteConverters: "Favori dönüştürücüler", recentlyUsed: "Son kullanılanlar", conversionHistory: "Dönüştürme geçmişi", clear: "Temizle", noFavorites: "Henüz favori yok. Burada görünmesi için bir dönüştürücü kaydedin.", noRecent: "Kullandığınız dönüştürücüler burada görünecek.", noHistory: "Son dönüştürmeleriniz bu cihazda saklanır ve çevrimdışı da çalışır.", noMatchingConverter: "Eşleşen bir dönüştürücü bulunamadı. Bir birim sembolü, kategori adı veya formül anahtar kelimesi deneyin." },
common: { resultCopied: "Sonuç panoya kopyalandı.", copyUnavailable: "Bu tarayıcıda kopyalama kullanılamıyor, ancak sonuç seçilmeye hazır.", shareOpened: "Paylaşım penceresi açıldı.", shareCopied: "Paylaşım metni panoya kopyalandı.", shareCancelled: "Paylaşım iptal edildi veya kullanılamıyor.", addApiEndpoint: "Bir API uç noktası ekleyin veya çevrimdışı kurları kullanın.", couldNotLoadRates: "Anlık kurlar yüklenemedi. Çevrimdışı kurlar kullanılmaya devam ediyor." },
categories: { unitsLabel: "birim", conversionPagesLabel: "dönüştürme sayfası" },
homepage: { heroTitle: "Herhangi Bir Birimi Anında Dönüştürün", heroDescription: "Universal Converter; uzunluk, ağırlık, sıcaklık, hacim, para birimi, dijital depolama, basınç, tarım, astronomi, mutfak ve mühendislik dahil olmak üzere 27 ölçüm kategorisini ve 6.400'den fazla birimi kapsayan ücretsiz, hepsi bir arada bir dönüştürme platformudur. Kategoriye göre arama yapın veya göz atın, kaynak tanımları ve formüllerle anında doğru sonuçlar alın ve aynı dönüştürücüyü günlük görevler, bilimsel çalışmalar ve iş hesaplamaları için çevrimiçi veya çevrimdışı kullanın.", chipLength: "Uzunluk", chipWeight: "Ağırlık", chipTemperature: "Sıcaklık", chipVolume: "Hacim", chipPressure: "Basınç", chipDigital: "Dijital Depolama", chipCurrency: "Para Birimi", chipAgriculture: "Tarım", chipFlow: "Akış Hızı", adSpace: "Reklam alanı", adSpaceCalculatorText: "Reklamlar bu hesap makinesinin ücretsiz kalmasına yardımcı olur.", adSpaceSiteText: "Reklamlar bu sitenin ücretsiz kalmasına yardımcı olur.", searchConversionLabel: "Dönüştürme ara", statsEyebrow: "Rakamlarla Universal Converter", statsHeading: "Gerçek ölçekte inşa edilmiş bir dönüştürücü", statsDescription: "Aşağıdaki her rakam, hesap makinesinin arkasında gerçekte neyin çalıştığını yansıtır: gerçek birim tanımları ve gerçekten oluşturulmuş dönüştürme sayfaları, yer tutucu içerik değil.", statsCategoriesDescription: "Günlük uzunluk ve ağırlıktan tarım, astronomi ve mühendisliğe kadar uzanan ölçüm kategorileri.", statsUnitsDescription: "Metrik önekler ve bölgesel varyantlar dahil olmak üzere her kategoride desteklenen bireysel birim tanımları.", statsPagesDescription: "Site genelinde oluşturulan, her biri formül, SSS ve ilgili dönüştürmeler içeren SEO dönüştürme sayfaları.", popularConversionsHeading: "Popüler dönüştürmeler", exploreSeoPagesLink: "SEO sayfalarını keşfedin", popularConversionTemplate: "{FROM} - {TO}", recentlySearchedLabel: "Son aramalar", noMatchingConversionFound: "Eşleşen dönüştürme bulunamadı", launchStatusEyebrow: "Yayın durumu", launchStatusHeading: "Doğru, şeffaf ve günlük kullanıma hazır", launchStatusUpdatedTemplate: "Son güncelleme: {DATE}. Temel SI, metrik, emperyal ve ABD alışılmış birim katsayıları dönüştürücü tanımlarında belgelenmiştir. Canlı bir API uç noktası bağlanmadığı sürece döviz kurları çevrimdışı örnek değerler kullanır.", launchStatusAccuracyTitle: "Doğruluk bilgisi", launchStatusAccuracyDesc: "İnç, fit, mil, pound, akr, litre ve ABD galonu ilişkileri dahil olmak üzere tanımların sabit olduğu yerlerde tam sabitler kullanılır.", launchStatusSourcesTitle: "Kaynak referansları", launchStatusSourcesDesc: "SI tanımları BIPM ve NIST referanslarıyla uyumludur. SI dışı yaygın birimler, sonuç panelinde tanım notları içerir.", launchStatusViewReferencesLink: "Referansları görüntüle", launchStatusOfflineTitle: "Çevrimdışı ve gizli", launchStatusOfflineDesc: "Dönüştürücüler tarayıcıda çalışır. Favoriler, geçmiş, bülten abonelikleri ve özel birimler gizlilik için bu cihazda kalır.", categoryOverviewHeading: "Tüm dönüştürme kategorileri", readConversionGuidesLink: "Dönüştürme kılavuzlarını oku", whyHeading: "Neden Universal Converter", whyThousandsTitle: "Binlerce birim", whyThousandsDesc: "SI, emperyal, ABD alışılmış, bilimsel, mühendislik, mutfak, tarım, astronomi ve dijital birimleri tek bir yerden arayın.", whyFormulasTitle: "Doğru formüller", whyFormulasDesc: "Tanımların sabit olduğu yerlerde tam sabitler kullanılır ve formül notları her sonucun nasıl hesaplandığını açıklar.", whyFreeTitle: "Sonsuza kadar ücretsiz", whyFreeDesc: "Temel dönüştürücü, günlük dönüşümler için hesap gerektirmeyen ücretsiz bir kamu hizmeti olarak tasarlanmıştır.", whyMobileTitle: "Mobilde çalışır", whyMobileDesc: "Hesap makinesi, kategori ızgarası, arama, kılavuzlar ve SEO sayfaları telefonlar, tabletler ve masaüstü bilgisayarlar için duyarlıdır.", whyOfflineTitle: "Çevrimdışı destek", whyOfflineDesc: "PWA önbellekleme, barındırılan bir HTTP veya HTTPS dağıtımına kurulumdan sonra ana uygulama kabuğunu kullanılabilir tutar.", guidePreviewEyebrow: "SEO'ya hazır yardımcı sayfalar", guidePreviewHeading: "Yaygın hesaplamalar için yararlı kılavuzlar", guidePreviewDesc: "Birim dönüştürücü aramaları, hesap makinesi görevleri, yüksek değerli ölçüm aramaları, formüller, SSS ve ilgili dönüştürme kümeleri için odaklanmış sayfaları keşfedin.", linkUnitConverter: "Birim dönüştürücü", linkOnlineCalculator: "Çevrimiçi hesap makinesi", linkMeterToFeet: "Metreden fite", linkKgToLbs: "kg'dan lbs'ye", linkLiterToGallon: "Litreden galona", linkCelsiusToFahrenheit: "Celsius'tan Fahrenheit'a", linkAcreToHectare: "Akrdan hektara", linkGbToMb: "GB'den MB'ye", linkMetricVsImperial: "Metrik ve emperyal", linkDigitalStorage: "Dijital depolama", businessHeading: "Gerçek bir dönüştürme işi gibi kuruldu", businessAnalyticsTitle: "Gizliliğe duyarlı analitik", businessAnalyticsDesc: "Kullanım, kişisel dönüştürme verilerini satmadan veya paylaşmadan iyileştirmelere rehberlik etmek için anonim olarak ölçülür.", businessAdsTitle: "Reklam destekli ve ücretsiz", businessAdsDesc: "Reklamlar hesap makinesinin önüne geçmeyecek şekilde yerleştirilir, böylece her araç ücretsiz kalır.", businessStayLoopTitle: "Haberdar olun", businessStayLoopDesc: "Yeni hesap makineleri, birim kapsamı ve dönüştürme kılavuzları hakkında yayınlandıkça bilgi almak için abone olun.", businessCustomUnitsTitle: "Özel birimler", businessCustomUnitsDesc: "Ekibiniz veya sektörünüz için önemli olan birim tanımlarını doğrudan tarayıcınızda kaydedin.", businessMoreTitle: "Yolda daha fazlası var", businessMoreDesc: "Kaydedilmiş çalışma alanları, reklamsız mod, ekip hesap makineleri, CSV dışa aktarma ve API erişimi yol haritasında yer alıyor.", faqHeading: "Sık sorulan sorular", faqQ1: "Birim dönüştürücü nedir?", faqA1: "Bir birim dönüştürücü, kilogramdan pounda, metreden fite, Celsius'tan Fahrenheit'a veya GB'den MB'ye gibi bir sayıyı bir ölçü biriminden diğerine dönüştürür.", faqQ2: "Dönüştürmeler ne kadar doğru?", faqA2: "İnç, fit, pound, litre ve ABD galonu ilişkileri dahil olmak üzere birçok ilişki tanım gereği tamdır. Yaklaşık birimler kendi tanımlarında açıklanır.", faqQ3: "Hangi birimler destekleniyor?", faqA3: "Universal Converter metrik, emperyal, ABD alışılmış, bilimsel, mühendislik, dijital, mutfak, tarım, astronomi, elektrik, basınç, enerji ve daha fazlasını destekler.", faqQ4: "Universal Converter ücretsiz mi?", faqA4: "Evet. Temel dönüştürücü, hesap makineleri, kategori tarayıcısı ve kılavuzlar hesap veya kayıt gerektirmeden ücretsiz kullanılabilir.", faqQ5: "İnternet bağlantısı olmadan çalışır mı?", faqA5: "PWA olarak yüklendikten sonra, ana uygulama kabuğu önbelleğe alınır ve çevrimdışı kullanılabilir durumda kalır. Favoriler, geçmiş ve özel birimler de cihazınızda saklanır.", featuredGuidesHeading: "Rakamların arkasındaki dönüşümleri öğrenin", viewAllGuidesLink: "Tüm kılavuzları görüntüle", readGuideLink: "Kılavuzu oku", fgTag1: "Dijital depolama", fgTitle1: "Dijital Depolama Birimleri Nasıl Çalışır", fgDesc1: "Bit, bayt, ondalık önekler ve ikili önekler, depolama dönüştürmelerinin cihazlar arasında neden farklı görünebileceğini açıklar.", fgTag2: "Sıcaklık", fgTitle2: "Celsius ve Fahrenheit", fgDesc2: "Celsius ile Fahrenheit arasındaki fark, dönüştürme formülleri ve çözümlü örnekler.", fgTag3: "Ölçü sistemleri", fgTitle3: "Metrik ve Emperyal Sistem", fgDesc3: "Yaygın birimler, tam ilişkiler ve metrik ile emperyal sistem arasında dönüştürme için pratik ipuçları.", fgTag4: "Basınç", fgTitle4: "Basınç Birimleri Nasıl Çalışır", fgDesc4: "Pascal, bar, PSI, atmosfer ve mmHg karşılaştırması ve pratik dönüştürme formülleri.", newsletterEyebrow: "Bülten", newsletterHeading: "Yeni hesap makineleri ve dönüştürme kılavuzlarını alın", newsletterDesc: "Yeni formül kılavuzları, tarım araçları, mühendislik birimleri ve platform güncellemeleri için abone olun.", newsletterEmailLabel: "E-posta", newsletterPlaceholder: "E-posta adresinizi girin", newsletterSubscribeButton: "Abone ol", newsletterSuccessStatus: "Abone olduğunuz için teşekkürler! Listedesiniz.", missionEyebrow: "Misyonumuz", missionHeading: "Her ölçümü güvenilir kılmak", missionBody: "Universal Converter, öğrencilerden ve aşçılardan mühendislere ve iş ekiplerine kadar herkes için birim dönüştürmeyi hızlı, doğru ve ücretsiz hale getirmek için var. Her sonucun yanında tam tanımlar ve formüller yayınlıyor, temel aracı hesap gerektirmeden ücretsiz tutuyor ve nerede çalışırsanız çalışın bir dönüştürücünün kullanılabilir olması için çevrimdışı kullanım için geliştiriyoruz.", footerTagline: "Günlük, bilimsel, mühendislik ve iş birimleri için hızlı dönüştürmeler.", footerAbout: "Hakkında", footerContact: "İletişim", footerPrivacy: "Gizlilik Politikası", footerTerms: "Şartlar", footerReferences: "Referanslar", footerGuides: "Kılavuzlar", footerSitemap: "Site haritası", footerCalculators: "Hesap makineleri", moreGuidesHeading: "Daha fazla dönüştürme kılavuzu ve ipucu", blogAccuracyTag: "Doğruluk", blogAccuracyTitle: "Birim dönüştürücüler doğruluğunu nasıl korur", blogAccuracySummary: "En güvenilir dönüştürücüler değerleri bir temel birim aracılığıyla normalleştirir, ardından sonucu insanlar için biçimlendirir.", blogGlobalUnitsTag: "Küresel birimler", blogGlobalUnitsTitle: "Metrik, emperyal ve ABD alışılmış birimler", blogGlobalUnitsSummary: "Küresel bir dönüştürücünün, kullanıcıların bekledikleri birimi bulabilmesi için örtüşen sistemlere, takma adlara ve formül notlarına ihtiyacı vardır.", blogTemperatureTag: "Sıcaklık", blogTemperatureTitle: "Celsius ve Fahrenheit", blogTemperatureSummary: "Celsius ile Fahrenheit arasındaki fark, dönüştürme formülleri ve çözümlü örnekler.", blogDigitalStorageTag: "Dijital depolama", blogDigitalStorageTitle: "Dijital Depolama Birimleri Nasıl Çalışır", blogDigitalStorageSummary: "Bit, bayt, ondalık önekler ve ikili önekler, depolama dönüştürmelerinin cihazlar arasında neden farklı görünebileceğini açıklar." },
messages: { sameUnit: "Aynı birim arasında dönüştürme.", currencyOfflineNote: "Canlı API kurları yüklenmediği sürece para birimi çevrimdışı yedek kurları kullanır.", temperatureNote: "Sıcaklık dönüşümü, ara mutlak ölçek olarak Kelvin'i kullanır.", chooseCompatibleFamiliesMessage: "Uyumlu birim gruplarını seçin", differentThingsNote: "{FROM} ve {TO} farklı şeyleri ölçer.", fuelZeroMessage: "Sıfırdan farklı bir yakıt ekonomisi değeri girin", fuelInvertNote: "Tüketim birimleri verimlilik değerini ters çevirir.", fuelSupportsNote: "Yakıt ekonomisi, hem mesafe/hacim hem de hacim/mesafe birimlerini destekler.", electricitySameFamilyNote: "Aynı gruptaki elektrik birimleri doğrudan dönüştürülür.", electricityNeedContextMessage: "Gerekli elektriksel bağlamı ekleyin", electricityNeedContextNote: "Farklı gruplar arasındaki elektrik hesaplamaları için gerilim, akım, direnç veya saat gerekir.", electricityContextNote: "Elektrik sonucu yukarıda gösterilen bağlam değerlerini kullanır.", conversionUnavailableMessage: "Dönüştürme kullanılamıyor", needCompatibleUnitsNote: "Bu dönüştürme için uyumlu birimler gereklidir.", resultsUpdateNote: "Sonuçlar siz yazarken anında güncellenir." },
calculators: { heading: "İş, finans, sağlık, tarih ve tarım hesap makineleri", badgeCurrency: "Döviz API'sine hazır", badgeAgriculture: "Tarım paketi", badgeClientSide: "İstemci taraflı sonuçlar", currencyTitle: "Döviz dönüştürücü", currencyDesc: "Çevrimdışı yedek kurlara sahip API'ye hazır döviz hesap makinesi.", currencyApiLabel: "API uç noktası (isteğe bağlı)", currencyApiPlaceholder: "Canlı döviz kuru API URL'sini yapıştırın", currencyRefreshButton: "Kurları yenile", percentageTitle: "Yüzde hesap makinesi", percentOfLabel: "% -", percentageResultSuffix: "sonuç", bmiTitle: "VKİ hesap makinesi", bmiUnderweight: "Düşük kilolu", bmiNormal: "Normal", bmiOverweight: "Fazla kilolu", bmiObesity: "Obezite aralığı", bmiEnterPrompt: "Kilo ve boy girin", ageTitle: "Yaş hesap makinesi", birthDateLabel: "Doğum tarihi", chooseDatePrompt: "Bir tarih seçin", dateCalcTitle: "Tarih hesap makinesi", chooseStartDatePrompt: "Bir başlangıç tarihi seçin", daysLaterTemplate: "{OFFSET} gün sonra: {DATE}", mortgageTitle: "Mortgage hesap makinesi", perMonthSuffix: "aylık", enterLoanDetailsPrompt: "Kredi ayrıntılarını girin", fuelCostTitle: "Yakıt maliyeti hesap makinesi", estimatedFuelCostSuffix: "tahmini yakıt maliyeti", enterTripDetailsPrompt: "Yolculuk ayrıntılarını girin", agricultureTitle: "Tarım hesap makineleri", tabSeed: "Tohum", tabFertilizer: "Gübre", tabYield: "Verim", tabIrrigation: "Sulama", seedRequiredSuffix: "gerekli tohum kg", fertBagsTemplate: "{FERT} kg, {BAGS} çuval", tHaRevenueTemplate: "{RATE} t/ha, {REVENUE} gelir", m3WaterRequiredSuffix: "gerekli su m3", ageResultTemplate: "{YEARS} yaşında, {DAYS} gün", currencyNeedEndpointPrompt: "Bir API uç noktası ekleyin veya çevrimdışı yedek kurları kullanın.", currencyLiveRatesFailedPrompt: "Canlı kurlar yüklenemedi. Çevrimdışı yedek etkin kalmaya devam ediyor." },
cookieBanner: { messagePrefix: "Deneyiminizi geliştirmek ve Google Analytics ile Google AdSense'i etkinleştirmek için çerezler kullanıyoruz. Devam ederek ", privacyPolicyLink: "Gizlilik Politikası", messageSuffix: ".", decline: "Reddet", accept: "Kabul et", ariaLabel: "Çerez bildirimi" }
},
id: {
nav: { home: "Beranda", converter: "Konverter", categories: "Kategori", allCategories: "Semua kategori", calculators: "Kalkulator", popular: "Populer", guides: "Panduan", sitemap: "Peta situs", about: "Tentang", contact: "Kontak", search: "Cari", language: "Bahasa", theme: "Tema", menu: "Menu", themeDark: "Gelap", themeLight: "Terang", privacy: "Privasi" },
converter: { searchAllUnits: "Cari semua satuan", fromUnit: "Satuan Asal", toUnit: "Satuan Tujuan", swap: "Tukar satuan", decimalControl: "Kontrol desimal", notation: "Notasi", notationAuto: "Otomatis", notationDecimal: "Desimal", notationScientific: "Ilmiah", notationEngineering: "Rekayasa", result: "Hasil", copyResult: "Salin hasil", share: "Bagikan", favorite: "Favorit", contextValues: "Nilai konteks tambahan", fromDefinition: "Definisi satuan asal", toDefinition: "Definisi satuan tujuan", formula: "Rumus", enterValue: "Masukkan angka yang akan dikonversi", useDecimalNotation: "Gunakan notasi desimal atau ilmiah, misalnya 1.25e6.", searchConversionPlaceholder: "Cari konversi...", voltageLabel: "Tegangan", currentLabel: "Arus", resistanceLabel: "Resistansi", hoursLabel: "Jam", liquidDensityLabel: "Kepadatan cairan, kg/L", contextHelpDefault: "Beberapa keluarga satuan memerlukan satu nilai tambahan untuk hasil yang akurat secara fisik.", contextHelpElectricity: "Hasil listrik lintas keluarga menggunakan tegangan, arus, resistansi, dan jam. Satuan listrik dalam keluarga yang sama dikonversi secara langsung.", kindDefault: "Konverter", kindCurrency: "Kalkulator mata uang", kindElectricity: "Kalkulator listrik", seoAdSlotConverterLabel: "Slot iklan konverter", seoAdSlotConverterReserved: "Dicadangkan di bawah hasil agar kalkulator tetap dapat digunakan.", seoAdSlotContentTopLabel: "Slot iklan: bagian atas konten (728x90)", seoAdSlotContentTopReserved: "Dicadangkan di atas kartu konversi dan di bawah konverter.", seoAdSlotContentMiddleLabel: "Slot iklan: bagian tengah konten (728x90)", seoAdSlotContentMiddleReserved: "Dicadangkan di antara kartu dan FAQ agar halaman tetap seimbang.", saved: "Tersimpan" },
sidebar: { advertisement: "Iklan", favoriteConverters: "Konverter favorit", recentlyUsed: "Baru digunakan", conversionHistory: "Riwayat konversi", clear: "Hapus", noFavorites: "Belum ada favorit. Simpan konverter agar muncul di sini.", noRecent: "Konverter yang baru digunakan akan muncul di sini.", noHistory: "Konversi terbaru Anda tersimpan di perangkat ini dan tetap berfungsi secara offline.", noMatchingConverter: "Tidak ditemukan konverter yang cocok. Coba simbol satuan, nama kategori, atau kata kunci rumus." },
common: { resultCopied: "Hasil disalin ke clipboard.", copyUnavailable: "Salin tidak tersedia di browser ini, tetapi hasil siap untuk dipilih.", shareOpened: "Dialog berbagi terbuka.", shareCopied: "Teks berbagi disalin ke clipboard.", shareCancelled: "Berbagi dibatalkan atau tidak tersedia.", addApiEndpoint: "Tambahkan endpoint API atau gunakan kurs offline.", couldNotLoadRates: "Kurs langsung tidak dapat dimuat. Kurs offline tetap digunakan." },
categories: { unitsLabel: "satuan", conversionPagesLabel: "halaman konversi" },
homepage: { heroTitle: "Konversi Satuan Apa Pun secara Instan", heroDescription: "Universal Converter adalah platform konversi gratis dan serba guna yang mencakup 27 kategori pengukuran dan lebih dari 6.400 satuan, termasuk panjang, berat, suhu, volume, mata uang, penyimpanan digital, tekanan, pertanian, astronomi, memasak, dan teknik. Cari atau jelajahi berdasarkan kategori, dapatkan hasil akurat secara instan lengkap dengan definisi dan rumus sumber, dan gunakan konverter yang sama untuk tugas sehari-hari, pekerjaan ilmiah, dan perhitungan bisnis, baik online maupun offline.", chipLength: "Panjang", chipWeight: "Berat", chipTemperature: "Suhu", chipVolume: "Volume", chipPressure: "Tekanan", chipDigital: "Penyimpanan Digital", chipCurrency: "Mata Uang", chipAgriculture: "Pertanian", chipFlow: "Laju Aliran", adSpace: "Ruang iklan", adSpaceCalculatorText: "Iklan membantu menjaga kalkulator ini tetap gratis.", adSpaceSiteText: "Iklan membantu menjaga situs ini tetap gratis.", searchConversionLabel: "Cari konversi", statsEyebrow: "Universal Converter dalam angka", statsHeading: "Konverter yang dibangun dalam skala nyata", statsDescription: "Setiap angka di bawah ini mencerminkan apa yang sebenarnya berjalan di balik kalkulator: definisi satuan nyata dan halaman konversi yang benar-benar dihasilkan, bukan konten placeholder.", statsCategoriesDescription: "Kategori pengukuran, mulai dari panjang dan berat sehari-hari hingga pertanian, astronomi, dan teknik.", statsUnitsDescription: "Definisi satuan individual yang didukung di setiap kategori, termasuk awalan metrik dan varian regional.", statsPagesDescription: "Halaman konversi SEO yang dihasilkan di seluruh situs, masing-masing dengan rumus, FAQ, dan konversi terkait.", popularConversionsHeading: "Konversi populer", exploreSeoPagesLink: "Jelajahi halaman SEO", popularConversionTemplate: "{FROM} ke {TO}", recentlySearchedLabel: "Baru saja dicari", noMatchingConversionFound: "Tidak ada konversi yang cocok ditemukan", launchStatusEyebrow: "Status peluncuran", launchStatusHeading: "Akurat, transparan, dan siap untuk penggunaan sehari-hari", launchStatusUpdatedTemplate: "Terakhir diperbarui: {DATE}. Faktor SI, metrik, imperial, dan adat AS utama didokumentasikan dalam definisi konverter. Kurs mata uang menggunakan nilai contoh offline kecuali endpoint API langsung terhubung.", launchStatusAccuracyTitle: "Informasi akurasi", launchStatusAccuracyDesc: "Konstanta yang tepat digunakan jika definisinya tetap, termasuk hubungan inci, kaki, mil, pon, hektar, liter, dan galon AS.", launchStatusSourcesTitle: "Referensi sumber", launchStatusSourcesDesc: "Definisi SI selaras dengan referensi BIPM dan NIST. Satuan umum non-SI menyertakan catatan definisi di panel hasil.", launchStatusViewReferencesLink: "Lihat referensi", launchStatusOfflineTitle: "Offline dan privat", launchStatusOfflineDesc: "Konverter berjalan di browser. Favorit, riwayat, pendaftaran buletin, dan satuan khusus tetap berada di perangkat ini demi privasi.", categoryOverviewHeading: "Semua kategori konverter", readConversionGuidesLink: "Baca panduan konversi", whyHeading: "Mengapa Universal Converter", whyThousandsTitle: "Ribuan satuan", whyThousandsDesc: "Cari satuan SI, imperial, adat AS, ilmiah, teknik, memasak, pertanian, astronomi, dan digital dari satu tempat.", whyFormulasTitle: "Rumus akurat", whyFormulasDesc: "Konstanta yang tepat digunakan jika definisinya tetap, dan catatan rumus menjelaskan cara setiap hasil dihitung.", whyFreeTitle: "Gratis selamanya", whyFreeDesc: "Konverter inti dibangun sebagai utilitas publik gratis tanpa memerlukan akun untuk konversi sehari-hari.", whyMobileTitle: "Berfungsi di seluler", whyMobileDesc: "Kalkulator, kisi kategori, pencarian, panduan, dan halaman SEO responsif untuk ponsel, tablet, dan desktop.", whyOfflineTitle: "Dukungan offline", whyOfflineDesc: "Caching PWA menjaga shell aplikasi utama tetap tersedia setelah instalasi pada penerapan HTTP atau HTTPS yang dihosting.", guidePreviewEyebrow: "Halaman utilitas siap SEO", guidePreviewHeading: "Panduan berguna untuk perhitungan umum", guidePreviewDesc: "Jelajahi halaman khusus untuk pencarian konverter satuan, tugas kalkulator, pencarian pengukuran bernilai tinggi, rumus, FAQ, dan kelompok konversi terkait.", linkUnitConverter: "Konverter satuan", linkOnlineCalculator: "Kalkulator online", linkMeterToFeet: "Meter ke kaki", linkKgToLbs: "kg ke lbs", linkLiterToGallon: "Liter ke galon", linkCelsiusToFahrenheit: "Celsius ke Fahrenheit", linkAcreToHectare: "Hektar are ke hektare", linkGbToMb: "GB ke MB", linkMetricVsImperial: "Metrik vs imperial", linkDigitalStorage: "Penyimpanan digital", businessHeading: "Dibangun seperti bisnis konversi sungguhan", businessAnalyticsTitle: "Analitik yang ramah privasi", businessAnalyticsDesc: "Penggunaan diukur secara anonim untuk memandu peningkatan, tanpa menjual atau membagikan data konversi pribadi.", businessAdsTitle: "Didukung iklan dan gratis", businessAdsDesc: "Iklan ditempatkan agar tidak mengganggu kalkulator sehingga setiap alat tetap gratis digunakan.", businessStayLoopTitle: "Tetap terhubung", businessStayLoopDesc: "Berlangganan untuk mendapatkan info kalkulator baru, cakupan satuan, dan panduan konversi saat diluncurkan.", businessCustomUnitsTitle: "Satuan khusus", businessCustomUnitsDesc: "Simpan definisi satuan yang penting bagi tim atau industri Anda, langsung di browser Anda.", businessMoreTitle: "Lebih banyak lagi akan hadir", businessMoreDesc: "Ruang kerja tersimpan, mode bebas iklan, kalkulator tim, ekspor CSV, dan akses API ada dalam peta jalan.", faqHeading: "Pertanyaan umum", faqQ1: "Apa itu konverter satuan?", faqA1: "Konverter satuan mengubah angka dari satu satuan pengukuran ke satuan lainnya, seperti kilogram ke pon, meter ke kaki, Celsius ke Fahrenheit, atau GB ke MB.", faqQ2: "Seberapa akurat konversinya?", faqA2: "Banyak hubungan yang tepat berdasarkan definisi, termasuk hubungan inci, kaki, pon, liter, dan galon AS. Satuan perkiraan dijelaskan dalam definisinya.", faqQ3: "Satuan apa saja yang didukung?", faqA3: "Universal Converter mendukung satuan metrik, imperial, adat AS, ilmiah, teknik, digital, memasak, pertanian, astronomi, listrik, tekanan, energi, dan banyak lagi.", faqQ4: "Apakah Universal Converter gratis digunakan?", faqA4: "Ya. Konverter inti, kalkulator, penjelajah kategori, dan panduan gratis digunakan tanpa memerlukan akun atau pendaftaran.", faqQ5: "Apakah berfungsi tanpa koneksi internet?", faqA5: "Setelah diinstal sebagai PWA, shell aplikasi utama disimpan dalam cache dan tetap tersedia secara offline. Favorit, riwayat, dan satuan khusus juga disimpan di perangkat Anda.", featuredGuidesHeading: "Pelajari konversi di balik angka-angka", viewAllGuidesLink: "Lihat semua panduan", readGuideLink: "Baca panduan", fgTag1: "Penyimpanan digital", fgTitle1: "Cara Kerja Satuan Penyimpanan Digital", fgDesc1: "Bit, byte, awalan desimal, dan awalan biner menjelaskan mengapa konversi penyimpanan dapat terlihat berbeda di berbagai perangkat.", fgTag2: "Suhu", fgTitle2: "Celsius vs Fahrenheit", fgDesc2: "Perbedaan antara Celsius dan Fahrenheit, rumus konversi, dan contoh yang dikerjakan.", fgTag3: "Sistem pengukuran", fgTitle3: "Sistem Metrik vs Imperial", fgDesc3: "Satuan umum, hubungan yang tepat, dan tips praktis untuk mengonversi antara sistem metrik dan imperial.", fgTag4: "Tekanan", fgTitle4: "Cara Kerja Satuan Tekanan", fgDesc4: "Perbandingan pascal, bar, PSI, atmosfer, dan mmHg, dengan rumus konversi praktis.", newsletterEyebrow: "Buletin", newsletterHeading: "Dapatkan kalkulator baru dan panduan konversi", newsletterDesc: "Berlangganan untuk panduan rumus baru, alat pertanian, satuan teknik, dan pembaruan platform.", newsletterEmailLabel: "Email", newsletterPlaceholder: "Masukkan alamat email Anda", newsletterSubscribeButton: "Berlangganan", newsletterSuccessStatus: "Terima kasih telah berlangganan! Anda ada dalam daftar.", missionEyebrow: "Misi kami", missionHeading: "Membuat setiap pengukuran mudah dipercaya", missionBody: "Universal Converter hadir untuk membuat konversi satuan cepat, akurat, dan gratis untuk semua orang, mulai dari pelajar dan juru masak hingga insinyur dan tim bisnis. Kami mempublikasikan definisi dan rumus yang tepat di samping setiap hasil, menjaga alat inti tetap gratis tanpa memerlukan akun, dan membangunnya untuk penggunaan offline sehingga konverter tersedia di mana pun Anda bekerja.", footerTagline: "Konversi cepat untuk satuan sehari-hari, ilmiah, teknik, dan bisnis.", footerAbout: "Tentang", footerContact: "Kontak", footerPrivacy: "Kebijakan Privasi", footerTerms: "Ketentuan", footerReferences: "Referensi", footerGuides: "Panduan", footerSitemap: "Peta situs", footerCalculators: "Kalkulator", moreGuidesHeading: "Lebih banyak panduan dan tip konversi", blogAccuracyTag: "Akurasi", blogAccuracyTitle: "Cara konverter satuan tetap akurat", blogAccuracySummary: "Konverter yang paling andal menormalkan nilai melalui satuan dasar, lalu memformat hasilnya agar mudah dibaca manusia.", blogGlobalUnitsTag: "Satuan global", blogGlobalUnitsTitle: "Satuan metrik, imperial, dan adat AS", blogGlobalUnitsSummary: "Konverter global memerlukan sistem yang tumpang tindih, alias, dan catatan rumus agar pengguna menemukan satuan yang mereka harapkan.", blogTemperatureTag: "Suhu", blogTemperatureTitle: "Celsius vs Fahrenheit", blogTemperatureSummary: "Perbedaan antara Celsius dan Fahrenheit, rumus konversi, dan contoh yang dikerjakan.", blogDigitalStorageTag: "Penyimpanan digital", blogDigitalStorageTitle: "Cara Kerja Satuan Penyimpanan Digital", blogDigitalStorageSummary: "Bit, byte, awalan desimal, dan awalan biner menjelaskan mengapa konversi penyimpanan dapat terlihat berbeda di berbagai perangkat." },
messages: { sameUnit: "Konversi antar satuan yang sama.", currencyOfflineNote: "Mata uang menggunakan kurs cadangan offline kecuali kurs API langsung telah dimuat.", temperatureNote: "Konversi suhu menggunakan Kelvin sebagai skala absolut perantara.", chooseCompatibleFamiliesMessage: "Pilih kelompok satuan yang kompatibel", differentThingsNote: "{FROM} dan {TO} mengukur hal yang berbeda.", fuelZeroMessage: "Masukkan nilai ekonomi bahan bakar bukan nol", fuelInvertNote: "Satuan konsumsi membalik nilai efisiensi.", fuelSupportsNote: "Ekonomi bahan bakar mendukung satuan jarak-per-volume maupun volume-per-jarak.", electricitySameFamilyNote: "Satuan listrik dalam kelompok yang sama dikonversi secara langsung.", electricityNeedContextMessage: "Tambahkan konteks listrik yang diperlukan", electricityNeedContextNote: "Perhitungan listrik lintas kelompok memerlukan tegangan, arus, resistansi, atau jam.", electricityContextNote: "Hasil listrik menggunakan nilai konteks yang ditampilkan di atas.", conversionUnavailableMessage: "Konversi tidak tersedia", needCompatibleUnitsNote: "Konversi ini memerlukan satuan yang kompatibel.", resultsUpdateNote: "Hasil diperbarui secara instan saat Anda mengetik." },
calculators: { heading: "Kalkulator bisnis, keuangan, kesehatan, tanggal, dan pertanian", badgeCurrency: "API mata uang siap", badgeAgriculture: "Rangkaian pertanian", badgeClientSide: "Hasil sisi klien", currencyTitle: "Konverter mata uang", currencyDesc: "Kalkulator kurs siap API dengan tarif cadangan offline.", currencyApiLabel: "Endpoint API (opsional)", currencyApiPlaceholder: "Tempel URL API kurs langsung", currencyRefreshButton: "Segarkan kurs", percentageTitle: "Kalkulator persentase", percentOfLabel: "% dari", percentageResultSuffix: "hasil", bmiTitle: "Kalkulator BMI", bmiUnderweight: "Kekurangan berat badan", bmiNormal: "Normal", bmiOverweight: "Kelebihan berat badan", bmiObesity: "Rentang obesitas", bmiEnterPrompt: "Masukkan berat dan tinggi badan", ageTitle: "Kalkulator usia", birthDateLabel: "Tanggal lahir", chooseDatePrompt: "Pilih tanggal", dateCalcTitle: "Kalkulator tanggal", chooseStartDatePrompt: "Pilih tanggal mulai", daysLaterTemplate: "{OFFSET} hari kemudian: {DATE}", mortgageTitle: "Kalkulator KPR", perMonthSuffix: "per bulan", enterLoanDetailsPrompt: "Masukkan detail pinjaman", fuelCostTitle: "Kalkulator biaya bahan bakar", estimatedFuelCostSuffix: "perkiraan biaya bahan bakar", enterTripDetailsPrompt: "Masukkan detail perjalanan", agricultureTitle: "Kalkulator pertanian", tabSeed: "Benih", tabFertilizer: "Pupuk", tabYield: "Hasil panen", tabIrrigation: "Irigasi", seedRequiredSuffix: "kg benih diperlukan", fertBagsTemplate: "{FERT} kg, {BAGS} karung", tHaRevenueTemplate: "{RATE} t/ha, pendapatan {REVENUE}", m3WaterRequiredSuffix: "m3 air diperlukan", ageResultTemplate: "{YEARS} tahun, {DAYS} hari", currencyNeedEndpointPrompt: "Tambahkan endpoint API atau gunakan tarif cadangan offline.", currencyLiveRatesFailedPrompt: "Tidak dapat memuat kurs langsung. Cadangan offline tetap aktif." },
cookieBanner: { messagePrefix: "Kami menggunakan cookie untuk meningkatkan pengalaman Anda dan mengaktifkan Google Analytics serta Google AdSense. Dengan melanjutkan, Anda menyetujui ", privacyPolicyLink: "Kebijakan Privasi", messageSuffix: ".", decline: "Tolak", accept: "Terima", ariaLabel: "Pemberitahuan cookie" }
},
so: {
nav: { home: "Bogga hore", converter: "Beddelaha", categories: "Qaybaha", allCategories: "Dhammaan qaybaha", calculators: "Xisaabiyayaasha", popular: "Caanka ah", guides: "Hagayaasha", sitemap: "Khariidadda bogga", about: "Nagu saabsan", contact: "Nala soo xiriir", search: "Raadi", language: "Luqadda", theme: "Muuqaalka", menu: "Menu-ga", themeDark: "Madow", themeLight: "Iftiin", privacy: "Asturnaanta" },
converter: { searchAllUnits: "Ka raadi dhammaan cabbirrada", fromUnit: "Cabbirka laga beddelayo", toUnit: "Cabbirka loo beddelayo", swap: "Isbeddel cabbirrada", decimalControl: "Xakameynta tirooyinka jajabka", notation: "Habka muujinta", notationAuto: "Si toos ah", notationDecimal: "Jajab tobanle", notationScientific: "Sayniska", notationEngineering: "Injineernimo", result: "Natiijada", copyResult: "Koobi natiijada", share: "La wadaag", favorite: "Ku dar door bidaan", contextValues: "Qiyamka dheeraadka ah", fromDefinition: "Sharaxaadda cabbirka laga beddelayo", toDefinition: "Sharaxaadda cabbirka loo beddelayo", formula: "Qaacidada", enterValue: "Geli lambar aad beddesho", useDecimalNotation: "Isticmaal habka jajabka tobanlaha ah ama kan sayniska, sida 1.25e6.", searchConversionPlaceholder: "Raadi beddel...", voltageLabel: "Fooliyada", currentLabel: "Kore-socodka", resistanceLabel: "Iska-caabinta", hoursLabel: "Saacadaha", liquidDensityLabel: "Cufnaanta dareeraha, kg/L", contextHelpDefault: "Qaar ka mid ah qoysaska cabbirrada waxay u baahan yihiin hal qiimo oo dheeraad ah si natiijo dhabta ah loo helo.", contextHelpElectricity: "Natiijooyinka koronto ee qoysas kala duwan waxay isticmaalaan fooliyada, kore-socodka, iska-caabinta, iyo saacadaha. Cabbirrada korontada ee isku qoyska ah si toos ah ayey isugu beddelaan.", kindDefault: "Beddelaha", kindCurrency: "Xisaabiyaha Lacagta", kindElectricity: "Xisaabiyaha Korontada", seoAdSlotConverterLabel: "Booska xayeysiiska beddelaha", seoAdSlotConverterReserved: "Waxaa loo qorsheeyay natiijada hoosteeda si xisaabiyuhu u sii ahaado mid la isticmaali karo.", seoAdSlotContentTopLabel: "Booska xayeysiiska: qaybta sare ee content-ka (728x90)", seoAdSlotContentTopReserved: "Waxaa loo qorsheeyay kaararka beddelka korkooda iyo beddelaha hoostiisa.", seoAdSlotContentMiddleLabel: "Booska xayeysiiska: bartamaha content-ka (728x90)", seoAdSlotContentMiddleReserved: "Waxaa loo qorsheeyay kaararka iyo su'aalaha inta u dhaxaysa si boggu u sii ahaado mid dheelli tiran.", saved: "La Keydiyay" },
sidebar: { advertisement: "Xayeysiin", favoriteConverters: "Beddelayaasha door bidan", recentlyUsed: "Dhawaan la isticmaalay", conversionHistory: "Taariikhda beddelka", clear: "Nadiifi", noFavorites: "Wali ma jiraan door bidaan. Kaydi beddelaha si uu halkan uga soo muuqdo.", noRecent: "Beddelayaasha dhawaan la isticmaalay ayaa halkan ka soo muuqan doona.", noHistory: "Beddelladaada ugu dambeeyay ayaa ku hadhaya qalabkan waxayna u shaqeeyaan offline.", noMatchingConverter: "Lama helin beddel la mid ah. Isku day summad cabbir, magaca qaybta, ama kelmad furaha qaacidada ah." },
common: { resultCopied: "Natiijadu waxay ku koobiyowday xarunta xusuusta.", copyUnavailable: "Koobiyaha lama heli karo biraawsarkan, laakiin natiijadu diyaar bay u tahay in la doorto.", shareOpened: "Sanduuqa wadaagista ayaa la furay.", shareCopied: "Qoraalka wadaagista ayaa ku koobiyowday xarunta xusuusta.", shareCancelled: "Wadaagistu waa la joojiyay ama lama heli karo.", addApiEndpoint: "Ku dar dhamaadka API ama isticmaal qiimayaasha offline-ka ah.", couldNotLoadRates: "Qiimayaasha toos ah lama soo geli karin. Qiimayaasha offline-ku wali way shaqeynayaan." },
categories: { unitsLabel: "cabbir", conversionPagesLabel: "bog beddel" },
homepage: { heroTitle: "Isla Markiiba U Beddel Cabbir Kasta", heroDescription: "Universal Converter waa madal beddelid oo bilaash ah oo wax walba ku jira, kaas oo daboolaya 27 qayb oo cabbir ah iyo in ka badan 6,400 oo cabbir, oo ay ku jiraan dhererka, miisaanka, heerkulka, xajmiga, lacagta, kaydinta dhijitaalka ah, cadaadiska, beeraha, xiddigiska, karinta, iyo injineernimada. Ka raadi ama ka baadh qayb ahaan, natiijooyin sax ah oo degdeg ah la hel adigoo leh sharraxaad iyo qaacido asal ah, oo isticmaal isla beddelahaas hawlaha maalinlaha ah, shaqada sayniska, iyo xisaabinta ganacsiga, si aad u xiran tahay internetka ama aadan u xirnayn.", chipLength: "Dhererka", chipWeight: "Miisaanka", chipTemperature: "Heerkulka", chipVolume: "Xajmiga", chipPressure: "Cadaadiska", chipDigital: "Kaydinta Dhijitaalka ah", chipCurrency: "Lacagta", chipAgriculture: "Beeraha", chipFlow: "Xawaaraha Qulqulka", adSpace: "Booska xayeysiiska", adSpaceCalculatorText: "Xayeysiinta waxay caawisaa in xisaabiyahan lagu sii hayo bilaash.", adSpaceSiteText: "Xayeysiinta waxay caawisaa in boggan lagu sii hayo bilaash.", searchConversionLabel: "Raadi beddel", statsEyebrow: "Universal Converter tirooyinka", statsHeading: "Beddelaha loo dhisay cabbir dhab ah", statsDescription: "Tiro kasta oo hoos ku qoran waxay muujinaysaa waxa dhab ahaantii ka shaqeynaya xisaabiyaha gadaashiisa: qeexitaano cabbirro dhab ah iyo bogag beddel oo dhab ah oo la sameeyay, ee ma aha nuxur meel-haye ah.", statsCategoriesDescription: "Qaybaha cabbirka, laga bilaabo dhererka iyo miisaanka maalinlaha ah illaa beeraha, xiddigiska, iyo injineernimada.", statsUnitsDescription: "Qeexitaannada cabbirrada gaarka ah ee lagu taageero qayb kasta, oo ay ku jiraan horgalayaasha mitirka iyo kala duwanaanshaha gobolka.", statsPagesDescription: "Bogagga beddelka SEO ee laga sameeyay guud ahaan goobta, mid kasta oo leh qaacido, su'aalo badanaa la isweydiiyo, iyo beddello la xiriira.", popularConversionsHeading: "Beddellada caanka ah", exploreSeoPagesLink: "Sahamí bogagga SEO", popularConversionTemplate: "{FROM} ilaa {TO}", recentlySearchedLabel: "Dhawaan la raadiyay", noMatchingConversionFound: "Lama helin beddel la mid ah", launchStatusEyebrow: "Xaaladda shirwaynta", launchStatusHeading: "Sax ah, la og yahay, oo diyaar u ah isticmaalka maalinlaha ah", launchStatusUpdatedTemplate: "Markii ugu dambeysay ee la cusboonaysiiyay: {DATE}. Qodobada aasaasiga ah ee SI, mitirka, imperial-ka, iyo caadooyinka Maraykanka waxaa lagu qeexay qeexitaannada beddelaha. Qiimaha lacagaha waxay isticmaalaan qiyaasyo offline ah ilaa API tooska ah la xiro.", launchStatusAccuracyTitle: "Macluumaadka saxsanaanta", launchStatusAccuracyDesc: "Waxaa la isticmaalaa tirooyin sax ah meelaha qeexitaannadu go'an yihiin, oo ay ku jiraan xiriirka inji, cagta, mayl, rodol, aakhir, litir, iyo galan Maraykan.", launchStatusSourcesTitle: "Tixraacyada isha", launchStatusSourcesDesc: "Qeexitaannada SI waxay la jaan qaadaan tixraacyada BIPM iyo NIST. Cabbirrada caadiga ah ee aan SI ahayn waxay ku jiraan qoraal qeexitaan ah oo ku yaal gogosha natiijada.", launchStatusViewReferencesLink: "Fiiri tixraacyada", launchStatusOfflineTitle: "Offline oo gaar ah", launchStatusOfflineDesc: "Beddellayaasha waxay ku shaqeeyaan biraawsarka. Kuwa la jecel yahay, taariikhda, is-diiwaangelinta warsidaha, iyo cabbirrada gaarka ah waxay ku sii jiraan qalabkan si loo ilaaliyo asturnaanta.", categoryOverviewHeading: "Dhammaan qaybaha beddelka", readConversionGuidesLink: "Akhri hagaha beddelka", whyHeading: "Sababta Universal Converter", whyThousandsTitle: "Kumanaan cabbir ah", whyThousandsDesc: "Ka raadi cabbirrada SI, imperial-ka, caadada Maraykanka, sayniska, injineernimada, karinta, beeraha, cirbixiyeenka, iyo cabbirrada dhijitaalka ah hal meel.", whyFormulasTitle: "Qaacido sax ah", whyFormulasDesc: "Waxaa la isticmaalaa tirooyin sax ah meelaha qeexitaannadu go'an yihiin, qoraallada qaacidooyinku waxay sharraxaan sida natiijo kastaa loo xisaabiyo.", whyFreeTitle: "Bilaash weligiis ah", whyFreeDesc: "Beddelaha aasaasiga ah waxaa loo dhisay sida adeeg dadweyne oo bilaash ah oo aan u baahnayn koonto beddelada maalinlaha ah.", whyMobileTitle: "Wuxuu ku shaqeeyaa taleefanka gacanta", whyMobileDesc: "Xisaabiyaha, shabakadda qaybaha, raadinta, hagaha, iyo bogagga SEO waxay la jaan qaadaan taleefannada, tablet-yada, iyo kombiyuutarrada miiska.", whyOfflineTitle: "Taageerada offline", whyOfflineDesc: "Kaydinta PWA waxay dhawrtaa qolofka ugu weyn ee app-ka inuu diyaar u ahaado kadib rakibidda deploy HTTP ama HTTPS oo la martigeliyay.", guidePreviewEyebrow: "Bogagga adeegga ee diyaarka u ah SEO", guidePreviewHeading: "Hagayaal waxtar leh oo xisaabinta caadiga ah", guidePreviewDesc: "Sahamí bogag diiradda saaray raadinta beddelaha cabbirrada, hawlaha xisaabiyaha, raadinta cabbirrada qiimaha sare leh, qaacidooyinka, su'aalaha badanaa la isweydiiyo, iyo kooxaha beddelka la xiriira.", linkUnitConverter: "Beddelaha cabbirka", linkOnlineCalculator: "Xisaabiye onlayn ah", linkMeterToFeet: "Mitir ilaa cagta", linkKgToLbs: "kg ilaa lbs", linkLiterToGallon: "Litir ilaa galan", linkCelsiusToFahrenheit: "Celsius ilaa Fahrenheit", linkAcreToHectare: "Aakhir ilaa hektar", linkGbToMb: "GB ilaa MB", linkMetricVsImperial: "Mitirka iyo Imperial-ka", linkDigitalStorage: "Kaydinta dhijitaalka ah", businessHeading: "Loo dhisay sida ganacsi beddel oo dhab ah", businessAnalyticsTitle: "Falanqaynta ilaalisa asturnaanta", businessAnalyticsDesc: "Isticmaalka waxaa lagu qiyaasaa si qarsoodi ah si loo hagaajiyo horumarinta, iyada oo aan la iibinayn ama la wadaagin xogta beddelka shakhsiga ah.", businessAdsTitle: "Ku taageersan xayeysiisyada oo bilaash ah", businessAdsDesc: "Xayeysiisyada waxaa la dhigaa si aanay u caqabad gelin xisaabiyaha si aalad kastaa ay u sii ahaato mid bilaash ah.", businessStayLoopTitle: "Warka la soco", businessStayLoopDesc: "Isdiiwaangeli si aad u maqasho xisaabiyayaal cusub, daboolka cabbirrada, iyo hagayaasha beddelka marka la bilaabo.", businessCustomUnitsTitle: "Cabbirro gaar ah", businessCustomUnitsDesc: "Kaydi qeexitaannada cabbirrada muhiimka u ah kooxdaada ama warshaddaada, si toos ah biraawsarkaaga.", businessMoreTitle: "Wax badan oo soo socda", businessMoreDesc: "Goobaha shaqada ee la kaydiyay, qaabka aan xayeysiisyada lahayn, xisaabiyayaasha kooxda, dhoofinta CSV, iyo gelitaanka API waxay ku jiraan qorshaha mustaqbalka.", faqHeading: "Su'aalaha badanaa la isweydiiyo", faqQ1: "Waa maxay beddelaha cabbirka?", faqA1: "Beddelaha cabbirku wuxuu tiro uga beddelaa hal cabbir ilaa mid kale, sida kiiloogaraam ilaa rodol, mitir ilaa cagta, Celsius ilaa Fahrenheit, ama GB ilaa MB.", faqQ2: "Sida saxda ah ee beddelku sida ay u yihiin?", faqA2: "Xiriirro badan waa sax si qeexid ah, oo ay ku jiraan xiriirka inji, cagta, rodol, litir, iyo galan Maraykan. Cabbirrada qiyaasta ah waxaa lagu sharraxaa qeexitaannadooda.", faqQ3: "Cabbirradee ayaa la taageeraa?", faqA3: "Universal Converter waxay taageertaa cabbirrada mitirka, imperial-ka, caadada Maraykanka, sayniska, injineernimada, dhijitaalka, karinta, beeraha, cirbixiyeenka, korontada, cadaadiska, tamarta, iyo wax kale oo badan.", faqQ4: "Universal Converter ma bilaash baa loo isticmaali karaa?", faqA4: "Haa. Beddelaha aasaasiga ah, xisaabiyayaasha, baaraha qaybaha, iyo hagayaasha waa bilaash loo isticmaali karo iyadoon loo baahnayn koonto ama isdiiwaangelin.", faqQ5: "Ma u shaqeeyaa iyada oo aan internet lahayn?", faqA5: "Marka la rakibo sida PWA, qolofka ugu weyn ee app-ku waa la kaydiyaa (cache) wuxuuna sii jiraa offline. Kuwa la jecel yahay, taariikhda, iyo cabbirrada gaarka ah sidoo kale waxaa lagu kaydiyaa qalabkaaga.", featuredGuidesHeading: "Baro beddellada ka danbeeya tirooyinka", viewAllGuidesLink: "Fiiri dhammaan hagayaasha", readGuideLink: "Akhri hagaha", fgTag1: "Kaydinta dhijitaalka ah", fgTitle1: "Sida ay u Shaqeeyaan Cabbirrada Kaydinta Dhijitaalka ah", fgDesc1: "Bits, bytes, horgalayaasha tobanka, iyo horgalayaasha labada waxay sharraxaan sababta beddellada kaydintu ugu muuqan karaan si kala duwan qalab kasta.", fgTag2: "Heerkulka", fgTitle2: "Celsius iyo Fahrenheit", fgDesc2: "Farqiga u dhexeeya Celsius iyo Fahrenheit, qaacidooyinka beddelka, iyo tusaalooyin la xalliyay.", fgTag3: "Nidaamyada cabbirka", fgTitle3: "Nidaamka Mitirka iyo Imperial-ka", fgDesc3: "Cabbirrada caadiga ah, xiriirrada saxda ah, iyo talooyin wax ku ool ah oo lagu beddelayo mitirka iyo imperial-ka.", fgTag4: "Cadaadiska", fgTitle4: "Sida ay u Shaqeeyaan Cabbirrada Cadaadiska", fgDesc4: "Isbarbardhigga Pascal, bar, PSI, atmosfeer, iyo mmHg, oo leh qaacidooyin beddel oo wax ku ool ah.", newsletterEyebrow: "Warsidaha", newsletterHeading: "Hel xisaabiyayaal cusub iyo hagayaal beddel", newsletterDesc: "Isdiiwaangeli si aad u hesho hagayaal qaacido cusub, qalabka beeraha, cabbirrada injineernimada, iyo cusboonaysiinta madasha.", newsletterEmailLabel: "Iimaylka", newsletterPlaceholder: "Geli ciwaanka iimaylkaaga", newsletterSubscribeButton: "Isdiiwaangeli", newsletterSuccessStatus: "Mahadsanid isdiiwaangelintaada! Waxaad ku jirtaa liiska.", missionEyebrow: "Hadafkeenna", missionHeading: "Ka dhigidda cabbir kasta mid la aamini karo", missionBody: "Universal Converter waxay u jirtaa si beddelka cabbirrada uu ugu noqdo mid degdeg ah, sax ah, oo bilaash u ah qof kasta, laga bilaabo ardayda iyo kariyeyaasha ilaa injineerada iyo kooxaha ganacsiga. Waxaan la wadaagnaa qeexitaanno iyo qaacidooyin sax ah natiijo kasta agteeda, waxaana aalada aasaasiga ah ka dhignaa mid bilaash ah oo aan u baahnayn koonto, waxaana u dhisnaa isticmaal offline ah si beddelaha loogu heli karo meel kasta oo aad ka shaqaynayso.", footerTagline: "Beddello degdeg ah oo loogu talagalay cabbirrada maalinlaha, sayniska, injineernimada, iyo ganacsiga.", footerAbout: "Nagu saabsan", footerContact: "Nala soo xiriir", footerPrivacy: "Siyaasadda Asturnaanta", footerTerms: "Shuruudaha", footerReferences: "Tixraacyada", footerGuides: "Hagayaasha", footerSitemap: "Khariidadda bogga", footerCalculators: "Xisaabiyayaasha", moreGuidesHeading: "Hagayaal iyo talooyin beddel oo dheeraad ah", blogAccuracyTag: "Saxsanaanta", blogAccuracyTitle: "Sida ay beddelayaasha cabbirku ugu sii sax ahaadaan", blogAccuracySummary: "Beddelayaasha ugu kalsoonida badan waxay qiyamka ku caadiyeeyaan cabbir aasaasi ah, ka dibna waxay natiijada u qaabeeyaan si dadku u fahmaan.", blogGlobalUnitsTag: "Cabbirrada Caalamiga ah", blogGlobalUnitsTitle: "Cabbirrada Mitirka, Imperial-ka, iyo Caadada Maraykanka", blogGlobalUnitsSummary: "Beddelaha caalamiga ahi wuxuu u baahan yahay nidaamyo isku dhex jira, magacyo kale, iyo qoraallo qaacido si isticmaalayaashu u helaan cabbirka ay filayaan.", blogTemperatureTag: "Heerkulka", blogTemperatureTitle: "Celsius iyo Fahrenheit", blogTemperatureSummary: "Farqiga u dhexeeya Celsius iyo Fahrenheit, qaacidooyinka beddelka, iyo tusaalooyin la xalliyay.", blogDigitalStorageTag: "Kaydinta dhijitaalka ah", blogDigitalStorageTitle: "Sida ay u Shaqeeyaan Cabbirrada Kaydinta Dhijitaalka ah", blogDigitalStorageSummary: "Bits, bytes, horgalayaasha tobanka, iyo horgalayaasha labada waxay sharraxaan sababta beddellada kaydintu ugu muuqan karaan si kala duwan qalab kasta." },
messages: { sameUnit: "Beddelka u dhexeeya isla cabbirka.", currencyOfflineNote: "Lacagtu waxay isticmaashaa qiimayaasha offline-ka ah illaa iyo inta aan la soo geli qiimayaasha API-ga toos ah.", temperatureNote: "Beddelka heerkulku wuxuu isticmaalaa Kelvin sida heerka guud ee u dhexeeya.", chooseCompatibleFamiliesMessage: "Dooro qoysaska cabbirrada is waafaqsan", differentThingsNote: "{FROM} iyo {TO} waxay cabbiraan waxyaabo kala duwan.", fuelZeroMessage: "Geli qiime dhaqaale shidaal oo aan eber ahayn", fuelInvertNote: "Cabbirrada isticmaalku waxay rogaan qiimaha waxtarka.", fuelSupportsNote: "Dhaqaalaha shidaalku wuu taageeraa labadaba cabbirrada masaafo-kor-xajmi iyo xajmi-kor-masaafo.", electricitySameFamilyNote: "Cabbirrada koronto ee isla qoyska si toos ah ayaa loo beddelaa.", electricityNeedContextMessage: "Ku dar macluumaadka korontada ee loo baahan yahay", electricityNeedContextNote: "Xisaabinta korontada ee u dhexeysa qoysas kala duwan waxay u baahan tahay voltage, current, resistance, ama saacado.", electricityContextNote: "Natiijada korontadu waxay isticmaashaa qiyamka macluumaadka ee kor lagu muujiyay.", conversionUnavailableMessage: "Beddelku ma jiro", needCompatibleUnitsNote: "Beddelkani wuxuu u baahan yahay cabbirro is waafaqsan.", resultsUpdateNote: "Natiijooyinku si degdeg ah ayey u cusboonaysiiyaan marka aad qorto." },
calculators: { heading: "Xisaabiyayaasha ganacsiga, maaliyadda, caafimaadka, taariikhda, iyo beeraha", badgeCurrency: "API-ga lacagta ayaa diyaar ah", badgeAgriculture: "Xirmada Beeraha", badgeClientSide: "Natiijooyinka dhinaca macmiilka", currencyTitle: "Beddelaha Lacagta", currencyDesc: "Xisaabiye is-dooris oo API diyaar u ah oo leh qiimayaal offline ah oo backup ah.", currencyApiLabel: "Dhamaadka API (ikhtiyaari)", currencyApiPlaceholder: "Ku dheji URL-ka API-ga qiimaha lacagta ee toos ah", currencyRefreshButton: "Cusboonaysii qiimayaasha", percentageTitle: "Xisaabiyaha Boqolkiiba", percentOfLabel: "% ee", percentageResultSuffix: "natiijo", bmiTitle: "Xisaabiyaha BMI", bmiUnderweight: "Miisaan hooseeya", bmiNormal: "Caadi", bmiOverweight: "Miisaan badan", bmiObesity: "Xadka Buurnaanta", bmiEnterPrompt: "Geli miisaanka iyo dhererka", ageTitle: "Xisaabiyaha Da'da", birthDateLabel: "Taariikhda Dhalashada", chooseDatePrompt: "Dooro taariikh", dateCalcTitle: "Xisaabiyaha Taariikhda", chooseStartDatePrompt: "Dooro taariikhda bilowga", daysLaterTemplate: "{OFFSET} maalmood ka dib: {DATE}", mortgageTitle: "Xisaabiyaha Deynta Guriga", perMonthSuffix: "bishii", enterLoanDetailsPrompt: "Geli faahfaahinta deynta", fuelCostTitle: "Xisaabiyaha Qiimaha Shidaalka", estimatedFuelCostSuffix: "qiimaha shidaalka lagu qiyaasay", enterTripDetailsPrompt: "Geli faahfaahinta safarka", agricultureTitle: "Xisaabiyayaasha Beeraha", tabSeed: "Iniin", tabFertilizer: "Bacriminta", tabYield: "Wax-soo-saar", tabIrrigation: "Waraabinta", seedRequiredSuffix: "kg iniin oo loo baahan yahay", fertBagsTemplate: "{FERT} kg, {BAGS} kiish", tHaRevenueTemplate: "{RATE} t/ha, dakhliga {REVENUE}", m3WaterRequiredSuffix: "m3 biyo oo loo baahan yahay", ageResultTemplate: "{YEARS} jir, {DAYS} maalmood", currencyNeedEndpointPrompt: "Ku dar dhamaadka API ama isticmaal qiimayaasha backup-ka ee offline.", currencyLiveRatesFailedPrompt: "Lama soo rari karin qiimayaasha toos ah. Backup-ka offline ayaa weli firfircoon." },
cookieBanner: { messagePrefix: "Waxaan isticmaalnaa cookies si aan u hagaajino khibradaada iyo si aan u shaqaysiino Google Analytics iyo Google AdSense. Haddii aad sii wadato, waxaad ogolaanaysaa ", privacyPolicyLink: "Siyaasadda Asturnaanta", messageSuffix: ".", decline: "Diid", accept: "Aqbal", ariaLabel: "Ogeysiiska cookies" }
}
};
const prefixes = [
["quetta", "Quetta", "Q", 1e30],
["ronna", "Ronna", "R", 1e27],
["yotta", "Yotta", "Y", 1e24],
["zetta", "Zetta", "Z", 1e21],
["exa", "Exa", "E", 1e18],
["peta", "Peta", "P", 1e15],
["tera", "Tera", "T", 1e12],
["giga", "Giga", "G", 1e9],
["mega", "Mega", "M", 1e6],
["kilo", "Kilo", "k", 1e3],
["hecto", "Hecto", "h", 1e2],
["deca", "Deca", "da", 1e1],
["", "", "", 1],
["deci", "Deci", "d", 1e-1],
["centi", "Centi", "c", 1e-2],
["milli", "Milli", "m", 1e-3],
["micro", "Micro", "u", 1e-6],
["nano", "Nano", "n", 1e-9],
["pico", "Pico", "p", 1e-12],
["femto", "Femto", "f", 1e-15],
["atto", "Atto", "a", 1e-18],
["zepto", "Zepto", "z", 1e-21],
["yocto", "Yocto", "y", 1e-24],
["ronto", "Ronto", "r", 1e-27],
["quecto", "Quecto", "q", 1e-30]
];
const seoConversions = [
{ slug: "meter-to-feet", categoryId: "length", from: "meter", to: "foot", title: "Meter to Feet", description: "Convert meters to feet with formula, examples, FAQ, and related length conversions." },
{ slug: "meters-to-feet", categoryId: "length", from: "meter", to: "foot", title: "Meters to Feet", description: "Convert meters to feet with a precise formula, examples, FAQ, and related length conversions." },
{ slug: "feet-to-meters", categoryId: "length", from: "foot", to: "meter", title: "Feet to Meters", description: "Convert feet to meters with exact international foot definitions and related length conversions." },
{ slug: "miles-to-km", categoryId: "length", from: "mile", to: "kilometer", title: "Miles to Kilometers", description: "Convert miles to kilometers with formula, examples, FAQ, and related distance conversions." },
{ slug: "km-to-miles", categoryId: "length", from: "kilometer", to: "mile", title: "Kilometers to Miles", description: "Convert kilometers to miles instantly with formula and related distance conversions." },
{ slug: "inches-to-cm", categoryId: "length", from: "inch", to: "centimeter", title: "Inches to Centimeters", description: "Convert inches to centimeters with exact formula and related length conversions." },
{ slug: "kg-to-lbs", categoryId: "weight", from: "kilogram", to: "pound", title: "kg to lbs", description: "Convert kilograms to pounds with a precise formula, FAQ, and related weight conversions." },
{ slug: "lbs-to-kg", categoryId: "weight", from: "pound", to: "kilogram", title: "lbs to kg", description: "Convert pounds to kilograms with precise formula, FAQ, and related weight conversions." },
{ slug: "grams-to-ounces", categoryId: "weight", from: "gram", to: "ounce", title: "Grams to Ounces", description: "Convert grams to ounces instantly with formula and related cooking or shipping conversions." },
{ slug: "celsius-to-fahrenheit", categoryId: "temperature", from: "celsius", to: "fahrenheit", title: "Celsius to Fahrenheit", description: "Convert Celsius to Fahrenheit with formula explanation, examples, FAQ, and related temperature conversions." },
{ slug: "fahrenheit-to-celsius", categoryId: "temperature", from: "fahrenheit", to: "celsius", title: "Fahrenheit to Celsius", description: "Convert Fahrenheit to Celsius with formula explanation, examples, and related temperature conversions." },
{ slug: "liter-to-gallon", categoryId: "volume", from: "liter", to: "gallon_us", title: "Liter to Gallon", description: "Convert liters to US gallons with formula, examples, FAQ, and related volume conversions." },
{ slug: "liters-to-gallons", categoryId: "volume", from: "liter", to: "gallon_us", title: "Liters to Gallons", description: "Convert liters to US gallons with a precise volume formula and related conversions." },
{ slug: "gallons-to-liters", categoryId: "volume", from: "gallon_us", to: "liter", title: "Gallons to Liters", description: "Convert US gallons to liters with precise formula and related liquid volume conversions." },
{ slug: "acre-to-hectare", categoryId: "area", from: "acre", to: "hectare", title: "Acre to Hectare", description: "Convert acres to hectares for agriculture, land, mapping, and property calculations." },
{ slug: "acres-to-hectares", categoryId: "area", from: "acre", to: "hectare", title: "Acres to Hectares", description: "Convert acres to hectares for agriculture, land, mapping, and property calculations." },
{ slug: "hectares-to-acres", categoryId: "area", from: "hectare", to: "acre", title: "Hectares to Acres", description: "Convert hectares to acres with formula, examples, FAQ, and related land conversions." },
{ slug: "square-feet-to-square-meters", categoryId: "area", from: "square_foot", to: "square_meter", title: "Square Feet to Square Meters", description: "Convert square feet to square meters for construction, real estate, and engineering work." },
{ slug: "mph-to-kmh", categoryId: "speed", from: "mile_per_hour", to: "kilometer_per_hour", title: "mph to km/h", description: "Convert miles per hour to kilometers per hour with formula and related speed conversions." },
{ slug: "psi-to-bar", categoryId: "pressure", from: "psi", to: "bar", title: "PSI to Bar", description: "Convert PSI to bar for pressure, engineering, tires, pumps, and industrial calculations." },
{ slug: "gb-to-mb", categoryId: "digital", from: "gigabyte", to: "megabyte", title: "GB to MB", description: "Convert gigabytes to megabytes with decimal storage definitions, examples, FAQ, and related digital storage conversions." },
{ slug: "watts-to-horsepower", categoryId: "power", from: "watt", to: "horsepower_mechanical", title: "Watts to Horsepower", description: "Convert watts to horsepower with formula and related power conversions." }
];
const popularConversions = [
{ name: "Kilograms to Pounds", displayName: "1 kg to lbs", category: "weight", from: "kg", to: "lb", value: "1", slug: "kg-to-lbs" },
{ name: "Celsius to Fahrenheit", displayName: "Celsius to Fahrenheit", category: "temperature", from: "c", to: "f", value: "0", slug: "celsius-to-fahrenheit" },
{ name: "Miles to Kilometers", displayName: "Miles to Kilometers", category: "length", from: "mi", to: "km", value: "1", slug: "miles-to-km" },
{ name: "Acres to Hectares", displayName: "Acres to Hectares", category: "area", from: "acre", to: "ha", value: "1", slug: "acres-to-hectares" },
{ name: "GB to MB", displayName: "GB to MB", category: "digital", from: "gb", to: "mb", value: "1", slug: "gb-to-mb" }
];
const blogPosts = [
{
title: "How unit converters stay accurate",
tag: "Accuracy",
summary: "Most reliable converters normalize values through a base unit, then format the result for humans.",
href: "unit-converter.html"
},
{
title: "Metric, imperial, and US customary units",
tag: "Global units",
summary: "A global converter needs overlapping systems, aliases, and formula notes so users find the unit they expect.",
href: "metric-vs-imperial.html"
},
{
title: "Celsius vs Fahrenheit",
tag: "Temperature",
summary: "Temperature conversion uses an offset formula, so the difference between scales matters more than a simple multiplier.",
href: "celsius-vs-fahrenheit.html"
},
{
title: "How digital storage units work",
tag: "Digital storage",
summary: "Bits, bytes, decimal prefixes, and binary prefixes explain why storage conversions can look different across devices.",
href: "digital-storage-units-guide.html"
}
];
const currencyFallbackRates = {
USD: 1.0,
EUR: 1.087,
GBP: 1.27,
JPY: 0.0064,
CHF: 1.11,
CAD: 0.73,
AUD: 0.66,
NZD: 0.6,
CNY: 0.138,
HKD: 0.128,
SGD: 0.745,
KRW: 0.00072,
INR: 0.012,
IDR: 6.2e-05,
MYR: 0.213,
THB: 0.0275,
PHP: 0.0172,
VND: 3.94e-05,
PKR: 0.0036,
BDT: 0.0084,
LKR: 0.0033,
NPR: 0.0075,
MMK: 0.00048,
KHR: 0.00024,
LAK: 4.6e-05,
BND: 0.745,
MOP: 0.124,
TWD: 0.0313,
MNT: 0.00029,
KZT: 0.00185,
UZS: 7.8e-05,
KGS: 0.0113,
TJS: 0.0916,
TMT: 0.286,
AFN: 0.0142,
AMD: 0.0026,
AZN: 0.588,
GEL: 0.365,
RUB: 0.0113,
BYN: 0.305,
UAH: 0.024,
MDL: 0.0558,
PLN: 0.253,
CZK: 0.0437,
HUF: 0.00277,
RON: 0.219,
BGN: 0.556,
HRK: 0.144,
RSD: 0.00927,
ALL: 0.0108,
MKD: 0.0177,
BAM: 0.556,
ISK: 0.00727,
NOK: 0.094,
SEK: 0.0958,
DKK: 0.1458,
TRY: 0.0289,
ILS: 0.269,
JOD: 1.41,
LBP: 1.12e-05,
SYP: 7.69e-05,
IQD: 0.000763,
IRR: 2.38e-05,
SAR: 0.2666,
AED: 0.2723,
QAR: 0.2747,
KWD: 3.253,
BHD: 2.653,
OMR: 2.6,
YER: 0.004,
EGP: 0.0204,
LYD: 0.206,
TND: 0.322,
DZD: 0.00745,
MAD: 0.0993,
MRU: 0.0252,
XOF: 0.00166,
XAF: 0.00166,
GHS: 0.068,
NGN: 0.00067,
XPF: 0.00911,
KES: 0.0077,
TZS: 0.000388,
UGX: 0.000268,
RWF: 0.000715,
BIF: 0.000343,
ETB: 0.0079,
SOS: 0.00175,
DJF: 0.00562,
SDG: 0.00167,
SSP: 0.000386,
ERN: 0.0667,
ZAR: 0.055,
NAD: 0.055,
BWP: 0.0735,
SZL: 0.055,
LSL: 0.055,
ZMW: 0.0385,
MWK: 0.000576,
MZN: 0.0157,
AOA: 0.00109,
CDF: 0.000355,
MGA: 0.000221,
MUR: 0.0217,
SCR: 0.0714,
KMF: 0.00221,
CVE: 0.0102,
STN: 0.0437,
GMD: 0.0139,
GNF: 0.000116,
SLE: 0.0435,
LRD: 0.00521,
MXN: 0.055,
BRL: 0.184,
ARS: 0.00104,
CLP: 0.00104,
COP: 0.00023,
PEN: 0.267,
BOB: 0.144,
PYG: 0.000134,
UYU: 0.0247,
VES: 0.0263,
GYD: 0.00478,
SRD: 0.0282,
TTD: 0.147,
JMD: 0.00637,
BSD: 1.0,
BBD: 0.5,
BZD: 0.496,
XCD: 0.37,
HTG: 0.00758,
DOP: 0.0166,
CUP: 0.0417,
HNL: 0.0405,
GTQ: 0.129,
NIO: 0.0272,
CRC: 0.00196,
PAB: 1.0,
PGK: 0.263,
FJD: 0.448,
SBD: 0.119,
TOP: 0.418,
VUV: 0.00836,
WST: 0.365,
BTN: 0.012,
MVR: 0.0648,
BMD: 1.0,
KYD: 1.2,
ANG: 0.559,
AWG: 0.559,
SHP: 1.27,
FKP: 1.27,
GIP: 1.27,
ZWG: 0.037,
KPW: 0.00111,
XCG: 0.559
};
const currencyMeta = {
USD: { name: 'US Dollar', country: 'United States', symbol: '$' },
EUR: { name: 'Euro', country: 'Eurozone', symbol: '€' },
GBP: { name: 'Pound Sterling', country: 'United Kingdom', symbol: '£' },
JPY: { name: 'Japanese Yen', country: 'Japan', symbol: '¥' },
CHF: { name: 'Swiss Franc', country: 'Switzerland', symbol: 'CHF' },
CAD: { name: 'Canadian Dollar', country: 'Canada', symbol: '$' },
AUD: { name: 'Australian Dollar', country: 'Australia', symbol: '$' },
NZD: { name: 'New Zealand Dollar', country: 'New Zealand', symbol: '$' },
CNY: { name: 'Chinese Yuan', country: 'China', symbol: '¥' },
HKD: { name: 'Hong Kong Dollar', country: 'Hong Kong', symbol: '$' },
SGD: { name: 'Singapore Dollar', country: 'Singapore', symbol: '$' },
KRW: { name: 'South Korean Won', country: 'South Korea', symbol: '₩' },
INR: { name: 'Indian Rupee', country: 'India', symbol: '₹' },
IDR: { name: 'Indonesian Rupiah', country: 'Indonesia', symbol: 'Rp' },
MYR: { name: 'Malaysian Ringgit', country: 'Malaysia', symbol: 'RM' },
THB: { name: 'Thai Baht', country: 'Thailand', symbol: '฿' },
PHP: { name: 'Philippine Peso', country: 'Philippines', symbol: '₱' },
VND: { name: 'Vietnamese Dong', country: 'Vietnam', symbol: '₫' },
PKR: { name: 'Pakistani Rupee', country: 'Pakistan', symbol: '₨' },
BDT: { name: 'Bangladeshi Taka', country: 'Bangladesh', symbol: '৳' },
LKR: { name: 'Sri Lankan Rupee', country: 'Sri Lanka', symbol: 'Rs' },
NPR: { name: 'Nepalese Rupee', country: 'Nepal', symbol: 'Rs' },
MMK: { name: 'Myanmar Kyat', country: 'Myanmar', symbol: 'K' },
KHR: { name: 'Cambodian Riel', country: 'Cambodia', symbol: '៛' },
LAK: { name: 'Lao Kip', country: 'Laos', symbol: '₭' },
BND: { name: 'Brunei Dollar', country: 'Brunei', symbol: '$' },
MOP: { name: 'Macanese Pataca', country: 'Macao', symbol: 'MOP$' },
TWD: { name: 'New Taiwan Dollar', country: 'Taiwan', symbol: 'NT$' },
MNT: { name: 'Mongolian Tugrik', country: 'Mongolia', symbol: '₮' },
KZT: { name: 'Kazakhstani Tenge', country: 'Kazakhstan', symbol: '₸' },
UZS: { name: 'Uzbekistani Som', country: 'Uzbekistan', symbol: 'so\'m' },
KGS: { name: 'Kyrgyzstani Som', country: 'Kyrgyzstan', symbol: 'с' },
TJS: { name: 'Tajikistani Somoni', country: 'Tajikistan', symbol: 'SM' },
TMT: { name: 'Turkmenistani Manat', country: 'Turkmenistan', symbol: 'm' },
AFN: { name: 'Afghan Afghani', country: 'Afghanistan', symbol: '؋' },
AMD: { name: 'Armenian Dram', country: 'Armenia', symbol: '֏' },
AZN: { name: 'Azerbaijani Manat', country: 'Azerbaijan', symbol: '₼' },
GEL: { name: 'Georgian Lari', country: 'Georgia', symbol: '₾' },
RUB: { name: 'Russian Ruble', country: 'Russia', symbol: '₽' },
BYN: { name: 'Belarusian Ruble', country: 'Belarus', symbol: 'Br' },
UAH: { name: 'Ukrainian Hryvnia', country: 'Ukraine', symbol: '₴' },
MDL: { name: 'Moldovan Leu', country: 'Moldova', symbol: 'L' },
PLN: { name: 'Polish Zloty', country: 'Poland', symbol: 'zł' },
CZK: { name: 'Czech Koruna', country: 'Czechia', symbol: 'Kč' },
HUF: { name: 'Hungarian Forint', country: 'Hungary', symbol: 'Ft' },
RON: { name: 'Romanian Leu', country: 'Romania', symbol: 'lei' },
BGN: { name: 'Bulgarian Lev', country: 'Bulgaria', symbol: 'лв' },
HRK: { name: 'Croatian Kuna', country: 'Croatia (legacy)', symbol: 'kn' },
RSD: { name: 'Serbian Dinar', country: 'Serbia', symbol: 'дин' },
ALL: { name: 'Albanian Lek', country: 'Albania', symbol: 'L' },
MKD: { name: 'Macedonian Denar', country: 'North Macedonia', symbol: 'ден' },
BAM: { name: 'Bosnia-Herzegovina Mark', country: 'Bosnia and Herzegovina', symbol: 'KM' },
ISK: { name: 'Icelandic Krona', country: 'Iceland', symbol: 'kr' },
NOK: { name: 'Norwegian Krone', country: 'Norway', symbol: 'kr' },
SEK: { name: 'Swedish Krona', country: 'Sweden', symbol: 'kr' },
DKK: { name: 'Danish Krone', country: 'Denmark', symbol: 'kr' },
TRY: { name: 'Turkish Lira', country: 'Turkiye', symbol: '₺' },
ILS: { name: 'Israeli New Shekel', country: 'Israel', symbol: '₪' },
JOD: { name: 'Jordanian Dinar', country: 'Jordan', symbol: 'د.ا' },
LBP: { name: 'Lebanese Pound', country: 'Lebanon', symbol: 'ل.ل' },
SYP: { name: 'Syrian Pound', country: 'Syria', symbol: '£S' },
IQD: { name: 'Iraqi Dinar', country: 'Iraq', symbol: 'ع.د' },
IRR: { name: 'Iranian Rial', country: 'Iran', symbol: '﷼' },
SAR: { name: 'Saudi Riyal', country: 'Saudi Arabia', symbol: '﷼' },
AED: { name: 'UAE Dirham', country: 'United Arab Emirates', symbol: 'د.إ' },
QAR: { name: 'Qatari Riyal', country: 'Qatar', symbol: '﷼' },
KWD: { name: 'Kuwaiti Dinar', country: 'Kuwait', symbol: 'د.ك' },
BHD: { name: 'Bahraini Dinar', country: 'Bahrain', symbol: '.د.ب' },
OMR: { name: 'Omani Rial', country: 'Oman', symbol: '﷼' },
YER: { name: 'Yemeni Rial', country: 'Yemen', symbol: '﷼' },
EGP: { name: 'Egyptian Pound', country: 'Egypt', symbol: '£' },
LYD: { name: 'Libyan Dinar', country: 'Libya', symbol: 'ل.د' },
TND: { name: 'Tunisian Dinar', country: 'Tunisia', symbol: 'د.ت' },
DZD: { name: 'Algerian Dinar', country: 'Algeria', symbol: 'د.ج' },
MAD: { name: 'Moroccan Dirham', country: 'Morocco', symbol: 'د.م.' },
MRU: { name: 'Mauritanian Ouguiya', country: 'Mauritania', symbol: 'UM' },
XOF: { name: 'West African CFA Franc', country: 'West African Economic and Monetary Union', symbol: 'CFA' },
XAF: { name: 'Central African CFA Franc', country: 'Central African Economic and Monetary Community', symbol: 'FCFA' },
GHS: { name: 'Ghanaian Cedi', country: 'Ghana', symbol: '₵' },
NGN: { name: 'Nigerian Naira', country: 'Nigeria', symbol: '₦' },
XPF: { name: 'CFP Franc', country: 'French Polynesia / New Caledonia', symbol: '₣' },
KES: { name: 'Kenyan Shilling', country: 'Kenya', symbol: 'KSh' },
TZS: { name: 'Tanzanian Shilling', country: 'Tanzania', symbol: 'TSh' },
UGX: { name: 'Ugandan Shilling', country: 'Uganda', symbol: 'USh' },
RWF: { name: 'Rwandan Franc', country: 'Rwanda', symbol: 'FRw' },
BIF: { name: 'Burundian Franc', country: 'Burundi', symbol: 'FBu' },
ETB: { name: 'Ethiopian Birr', country: 'Ethiopia', symbol: 'Br' },
SOS: { name: 'Somali Shilling', country: 'Somalia', symbol: 'Sh' },
DJF: { name: 'Djiboutian Franc', country: 'Djibouti', symbol: 'Fdj' },
SDG: { name: 'Sudanese Pound', country: 'Sudan', symbol: '£SD' },
SSP: { name: 'South Sudanese Pound', country: 'South Sudan', symbol: '£' },
ERN: { name: 'Eritrean Nakfa', country: 'Eritrea', symbol: 'Nfk' },
ZAR: { name: 'South African Rand', country: 'South Africa', symbol: 'R' },
NAD: { name: 'Namibian Dollar', country: 'Namibia', symbol: '$' },
BWP: { name: 'Botswana Pula', country: 'Botswana', symbol: 'P' },
SZL: { name: 'Eswatini Lilangeni', country: 'Eswatini', symbol: 'L' },
LSL: { name: 'Lesotho Loti', country: 'Lesotho', symbol: 'L' },
ZMW: { name: 'Zambian Kwacha', country: 'Zambia', symbol: 'ZK' },
MWK: { name: 'Malawian Kwacha', country: 'Malawi', symbol: 'MK' },
MZN: { name: 'Mozambican Metical', country: 'Mozambique', symbol: 'MT' },
AOA: { name: 'Angolan Kwanza', country: 'Angola', symbol: 'Kz' },
CDF: { name: 'Congolese Franc', country: 'DR Congo', symbol: 'FC' },
MGA: { name: 'Malagasy Ariary', country: 'Madagascar', symbol: 'Ar' },
MUR: { name: 'Mauritian Rupee', country: 'Mauritius', symbol: '₨' },
SCR: { name: 'Seychellois Rupee', country: 'Seychelles', symbol: '₨' },
KMF: { name: 'Comorian Franc', country: 'Comoros', symbol: 'CF' },
CVE: { name: 'Cape Verdean Escudo', country: 'Cabo Verde', symbol: '$' },
STN: { name: 'Sao Tome and Principe Dobra', country: 'Sao Tome and Principe', symbol: 'Db' },
GMD: { name: 'Gambian Dalasi', country: 'The Gambia', symbol: 'D' },
GNF: { name: 'Guinean Franc', country: 'Guinea', symbol: 'FG' },
SLE: { name: 'Sierra Leonean Leone', country: 'Sierra Leone', symbol: 'Le' },
LRD: { name: 'Liberian Dollar', country: 'Liberia', symbol: '$' },
MXN: { name: 'Mexican Peso', country: 'Mexico', symbol: '$' },
BRL: { name: 'Brazilian Real', country: 'Brazil', symbol: 'R$' },
ARS: { name: 'Argentine Peso', country: 'Argentina', symbol: '$' },
CLP: { name: 'Chilean Peso', country: 'Chile', symbol: '$' },
COP: { name: 'Colombian Peso', country: 'Colombia', symbol: '$' },
PEN: { name: 'Peruvian Sol', country: 'Peru', symbol: 'S/' },
BOB: { name: 'Bolivian Boliviano', country: 'Bolivia', symbol: 'Bs' },
PYG: { name: 'Paraguayan Guarani', country: 'Paraguay', symbol: '₲' },
UYU: { name: 'Uruguayan Peso', country: 'Uruguay', symbol: '$U' },
VES: { name: 'Venezuelan Bolivar', country: 'Venezuela', symbol: 'Bs.S' },
GYD: { name: 'Guyanese Dollar', country: 'Guyana', symbol: '$' },
SRD: { name: 'Surinamese Dollar', country: 'Suriname', symbol: '$' },
TTD: { name: 'Trinidad and Tobago Dollar', country: 'Trinidad and Tobago', symbol: '$' },
JMD: { name: 'Jamaican Dollar', country: 'Jamaica', symbol: '$' },
BSD: { name: 'Bahamian Dollar', country: 'The Bahamas', symbol: '$' },
BBD: { name: 'Barbadian Dollar', country: 'Barbados', symbol: '$' },
BZD: { name: 'Belize Dollar', country: 'Belize', symbol: '$' },
XCD: { name: 'East Caribbean Dollar', country: 'Organisation of Eastern Caribbean States', symbol: '$' },
HTG: { name: 'Haitian Gourde', country: 'Haiti', symbol: 'G' },
DOP: { name: 'Dominican Peso', country: 'Dominican Republic', symbol: 'RD$' },
CUP: { name: 'Cuban Peso', country: 'Cuba', symbol: '$' },
HNL: { name: 'Honduran Lempira', country: 'Honduras', symbol: 'L' },
GTQ: { name: 'Guatemalan Quetzal', country: 'Guatemala', symbol: 'Q' },
NIO: { name: 'Nicaraguan Cordoba', country: 'Nicaragua', symbol: 'C$' },
CRC: { name: 'Costa Rican Colon', country: 'Costa Rica', symbol: '₡' },
PAB: { name: 'Panamanian Balboa', country: 'Panama', symbol: 'B/.' },
PGK: { name: 'Papua New Guinea Kina', country: 'Papua New Guinea', symbol: 'K' },
FJD: { name: 'Fijian Dollar', country: 'Fiji', symbol: '$' },
SBD: { name: 'Solomon Islands Dollar', country: 'Solomon Islands', symbol: '$' },
TOP: { name: 'Tongan Paʻanga', country: 'Tonga', symbol: 'T$' },
VUV: { name: 'Vanuatu Vatu', country: 'Vanuatu', symbol: 'VT' },
WST: { name: 'Samoan Tala', country: 'Samoa', symbol: 'T' },
BTN: { name: 'Bhutanese Ngultrum', country: 'Bhutan', symbol: 'Nu.' },
MVR: { name: 'Maldivian Rufiyaa', country: 'Maldives', symbol: 'Rf' },
BMD: { name: 'Bermudian Dollar', country: 'Bermuda', symbol: '$' },
KYD: { name: 'Cayman Islands Dollar', country: 'Cayman Islands', symbol: '$' },
ANG: { name: 'Netherlands Antillean Guilder', country: 'Curacao and Sint Maarten (legacy; superseded by Caribbean Guilder, XCG, in 2025)', symbol: 'ƒ' },
AWG: { name: 'Aruban Florin', country: 'Aruba', symbol: 'ƒ' },
SHP: { name: 'Saint Helena Pound', country: 'Saint Helena', symbol: '£' },
FKP: { name: 'Falkland Islands Pound', country: 'Falkland Islands', symbol: '£' },
GIP: { name: 'Gibraltar Pound', country: 'Gibraltar', symbol: '£' },
ZWG: { name: 'Zimbabwe Gold', country: 'Zimbabwe', symbol: 'ZiG' },
KPW: { name: 'North Korean Won', country: 'North Korea', symbol: '₩' },
XCG: { name: 'Caribbean Guilder', country: 'Curacao and Sint Maarten', symbol: 'Cg' }
};
const categories = applyCustomUnits(buildCategories());
const categoryMap = new Map(categories.map((category) => [category.id, category]));
const seoMap = new Map(seoConversions.map((item) => [item.slug, item]));
let state = {
categoryId: "length",
fromUnitId: "meter",
toUnitId: "foot",
precision: clampNumber(Number(localStorage.getItem(storageKeys.precision)) || 12, 2, 15),
notation: localStorage.getItem(storageKeys.notation) || "auto",
lastRecordKey: ""
};
let historyTimer = 0;
let historyEnabled = false;
let pageInitPending = false;
let seoConversionDataCache = null;
let seoConversionDataResolved = false;
document.addEventListener("DOMContentLoaded", () => {
renderSiteHeader();
initTheme();
initHeroCanvas();
renderCategoryDropdownMenus();
initCategoriesNav();
initLanguageSelector();
setupResponsiveMobileNav();
initSeoConverterPage();
renderOverview();
initConverterApp();
initCalculators();
initNewsletter();
initAdmin();
// Service worker registration, cached-currency-rate loading, and the
// page_view analytics event are not required for first paint or first
// interaction. They are deferred below (load event / idle callback) so
// they no longer occupy the critical startup path, while preserving
// identical registration/fetch/tracking logic and firing exactly once.
if (document.body) document.body.classList.remove("is-loading");
});
// Service worker registration deferred until after the page has fully
// loaded (including images/subresources), matching the standard
// "register after load" pattern. Registration logic itself is unchanged.
window.addEventListener("load", () => {
registerServiceWorker();
});
function runWhenIdle(callback) {
if (typeof window.requestIdleCallback === "function") {
window.requestIdleCallback(callback);
} else {
window.setTimeout(callback, 1);
}
}
// Cached currency rate loading deferred to idle time. Behavior is
// unchanged: the currency tool already relies on the hard-coded fallback
// rates until this fetch resolves, whether that fetch is kicked off
// immediately or during an idle window.
runWhenIdle(() => {
loadCachedCurrencyRates();
});
// Page-view tracking deferred to idle time. dataLayer/gtag/sendBeacon
// logic inside trackEvent() is unchanged; this only delays when the
// single page_view event fires, not whether or how it fires.
runWhenIdle(() => {
trackEvent("page_view", { title: document.title });
});
function loadCachedCurrencyRates() {
// Reads the locally cached rates.json (produced offline by fetch_rates.py on a
// schedule) so the site never calls a live currency API during normal browsing.
// This is a same-origin static file read, not a network round trip to a provider.
fetch("/rates.json", { cache: "no-store" }).then((response) => {
if (!response.ok) throw new Error("rates.json not available");
return response.json();
}).then((payload) => {
if (!payload || !payload.rates) return;
Object.keys(payload.rates).forEach((code) => {
const rate = Number(payload.rates[code]);
if (!Number.isFinite(rate) || rate <= 0) return;
currencyFallbackRates[code] = rate;
});
const currencyCategory = categoryMap.get("currency");
if (currencyCategory) {
currencyCategory.units.forEach((unit) => {
if (currencyFallbackRates[unit.id] !== undefined) unit.factor = currencyFallbackRates[unit.id];
});
}
window.__currencyRatesMeta = { generatedAt: payload.generated_at, provider: payload.provider };
if (document.getElementById("currencyTool") && typeof updateCurrency === "function") updateCurrency();
}).catch(() => {
// Offline fallback rates already loaded synchronously above; nothing else to do.
});
}
function buildCategories() {
const lengthUnits = uniqueUnits([
...metricUnits("meter", "Meter", "m", 1, "The meter is the SI base unit of length."),
u("inch", "Inch", "in", 0.0254, "An inch is exactly 0.0254 meters.", ["inches"]),
u("foot", "Foot", "ft", 0.3048, "A foot is exactly 0.3048 meters.", ["feet"]),
u("yard", "Yard", "yd", 0.9144, "A yard is exactly 0.9144 meters."),
u("mile", "Mile", "mi", 1609.344, "A statute mile is exactly 1,609.344 meters."),
u("nautical_mile", "Nautical mile", "nmi", 1852, "A nautical mile is exactly 1,852 meters."),
u("survey_foot_us", "US survey foot", "ftUS", 1200 / 3937, "The US survey foot is 1200/3937 meters and is retained for legacy land records.", ["survey foot", "us survey feet"]),
u("angstrom", "Angstrom", "A", 1e-10, "An angstrom is 1e-10 meters."),
u("fathom", "Fathom", "ftm", 1.8288, "A fathom is six feet."),
u("chain", "Chain", "ch", 20.1168, "A surveyor's chain is 66 feet."),
u("link", "Link", "li", 0.201168, "A surveyor's link is 1/100 of a chain."),
u("rod", "Rod", "rd", 5.0292, "A rod is 16.5 feet."),
u("furlong", "Furlong", "fur", 201.168, "A furlong is 660 feet."),
u("league", "League", "lea", 4828.032, "A league is commonly treated as three statute miles."),
u("hand", "Hand", "hh", 0.1016, "A hand is four inches, often used for horse height."),
u("cubit", "Cubit", "cubit", 0.4572, "A common cubit is approximated as 18 inches."),
u("point", "Point", "pt", 0.0003527777778, "A desktop publishing point is 1/72 inch."),
u("pica", "Pica", "pc", 0.004233333333, "A pica is 12 points."),
u("astronomical_unit", "Astronomical unit", "AU", 149597870700, "An astronomical unit is the mean Earth-Sun distance."),
u("light_year", "Light-year", "ly", 9460730472580800, "A light-year is the distance light travels in a Julian year."),
u("parsec", "Parsec", "pc", 3.085677581491367e16, "A parsec is about 3.26156 light-years.")
]);
const areaUnits = uniqueUnits([
...squareMetricUnits("meter", "meter", "m", 1, "Square metric area unit."),
u("hectare", "Hectare", "ha", 10000, "A hectare is 10,000 square meters."),
u("acre", "Acre", "ac", 4046.8564224, "An international acre is 4,046.8564224 square meters."),
u("section", "Section", "section", 2589988.110336, "A US public land survey section is one square mile or 640 acres."),
u("township", "Township", "twp", 93239571.972096, "A survey township is 36 square miles."),
u("square_inch", "Square inch", "in2", 0.00064516, "A square inch is the area of a one-inch square."),
u("square_foot", "Square foot", "ft2", 0.09290304, "A square foot is exactly 0.09290304 square meters."),
u("square_yard", "Square yard", "yd2", 0.83612736, "A square yard is exactly 0.83612736 square meters."),
u("square_mile", "Square mile", "mi2", 2589988.110336, "A square mile is 640 acres."),
u("are", "Are", "a", 100, "An are is 100 square meters."),
u("barn", "Barn", "b", 1e-28, "A barn is a nuclear cross-section unit equal to 1e-28 square meters."),
u("rood", "Rood", "rood", 1011.7141056, "A rood is one quarter of an acre.")
]);
const volumeUnits = uniqueUnits([
...cubicMetricUnits("meter", "meter", "m", 1, "Cubic metric volume unit."),
...metricUnits("liter", "Liter", "L", 0.001, "A liter is one cubic decimeter."),
u("gallon_us", "Gallon", "gal", 0.003785411784, "A US liquid gallon is exactly 3.785411784 liters.", ["US gallon"]),
u("gallon_imperial", "Imperial gallon", "imp gal", 0.00454609, "An imperial gallon is exactly 4.54609 liters."),
u("quart_us", "Quart", "qt", 0.000946352946, "A US liquid quart is one quarter of a US gallon."),
u("quart_imperial", "Imperial quart", "imp qt", 0.0011365225, "An imperial quart is one quarter of an imperial gallon."),
u("pint_us", "Pint", "pt", 0.000473176473, "A US liquid pint is one eighth of a US gallon."),
u("pint_imperial", "Imperial pint", "imp pt", 0.00056826125, "An imperial pint is one eighth of an imperial gallon."),
u("fluid_ounce_us", "Fluid ounce", "fl oz", 0.0000295735295625, "A US fluid ounce is 1/128 of a US gallon."),
u("fluid_ounce_imperial", "Imperial fluid ounce", "imp fl oz", 0.0000284130625, "An imperial fluid ounce is 1/160 of an imperial gallon."),
u("cup_us", "Cup", "cup", 0.0002365882365, "A US customary cup is 236.5882365 milliliters."),
u("cup_metric", "Metric cup", "metric cup", 0.00025, "A metric cup is 250 milliliters."),
u("tablespoon_us", "Tablespoon", "tbsp", 0.00001478676478125, "A US tablespoon is half a US fluid ounce."),
u("tablespoon_metric", "Metric tablespoon", "metric tbsp", 0.000015, "A metric tablespoon is 15 milliliters."),
u("teaspoon_us", "Teaspoon", "tsp", 0.00000492892159375, "A US teaspoon is one third of a US tablespoon."),
u("teaspoon_metric", "Metric teaspoon", "metric tsp", 0.000005, "A metric teaspoon is 5 milliliters."),
u("barrel_oil", "Oil barrel", "bbl", 0.158987294928, "An oil barrel is 42 US gallons."),
u("bushel_us", "Bushel", "bu", 0.03523907016688, "A US bushel is about 35.239 liters."),
u("cubic_inch", "Cubic inch", "in3", 0.000016387064, "A cubic inch is the volume of a one-inch cube."),
u("cubic_foot", "Cubic foot", "ft3", 0.028316846592, "A cubic foot is exactly 0.028316846592 cubic meters."),
u("cubic_yard", "Cubic yard", "yd3", 0.764554857984, "A cubic yard is exactly 0.764554857984 cubic meters.")
]);
const massUnits = uniqueUnits([
...metricUnits("gram", "Gram", "g", 0.001, "A gram is one thousandth of a kilogram."),
u("tonne", "Metric ton", "t", 1000, "A metric ton is 1,000 kilograms.", ["metric tonne"]),
u("pound", "Pound", "lb", 0.45359237, "An avoirdupois pound is exactly 0.45359237 kilograms.", ["lbs"]),
u("ounce", "Ounce", "oz", 0.028349523125, "An avoirdupois ounce is 1/16 pound."),
u("troy_ounce", "Troy ounce", "oz t", 0.0311034768, "A troy ounce is exactly 31.1034768 grams."),
u("dram", "Dram", "dr", 0.0017718451953125, "An avoirdupois dram is 1/16 ounce."),
u("stone", "Stone", "st", 6.35029318, "A stone is 14 pounds."),
u("short_ton", "Short ton", "ton", 907.18474, "A US short ton is 2,000 pounds."),
u("long_ton", "Long ton", "long ton", 1016.0469088, "A British long ton is 2,240 pounds."),
u("hundredweight_us", "US hundredweight", "cwt", 45.359237, "A US short hundredweight is 100 pounds."),
u("hundredweight_imperial", "Imperial hundredweight", "long cwt", 50.80234544, "An imperial long hundredweight is 112 pounds."),
u("grain", "Grain", "gr", 0.00006479891, "A grain is exactly 64.79891 milligrams."),
u("carat", "Carat", "ct", 0.0002, "A metric carat is exactly 200 milligrams."),
u("slug", "Slug", "slug", 14.5939029372, "A slug is an imperial mass unit."),
u("atomic_mass_unit", "Atomic mass unit", "u", 1.6605390666e-27, "The unified atomic mass unit is used in atomic physics."),
u("solar_mass", "Solar mass", "Msun", 1.98847e30, "Solar mass is used in astronomy.")
]);
const timeUnits = uniqueUnits([
u("second", "Seconds", "s", 1, "The second is the SI base unit of time."),
...metricUnits("second", "Second", "s", 1, "Metric prefixed time unit.").filter((item) => item.id !== "second"),
u("minute", "Minutes", "min", 60, "A minute is 60 seconds."),
u("hour", "Hours", "h", 3600, "An hour is 3,600 seconds."),
u("day", "Days", "d", 86400, "A day is 86,400 seconds."),
u("week", "Weeks", "wk", 604800, "A week is seven days."),
u("fortnight", "Fortnight", "fn", 1209600, "A fortnight is 14 days."),
u("month", "Months", "mo", 2629746, "A month uses the average Gregorian month."),
u("year", "Years", "yr", 31556952, "A year uses the average Gregorian year of 365.2425 days."),
u("decade", "Decades", "decade", 315569520, "A decade is 10 average Gregorian years."),
u("century", "Centuries", "century", 3155695200, "A century is 100 average Gregorian years.")
]);
const pressureUnits = uniqueUnits([
...metricUnits("pascal", "Pascal", "Pa", 1, "The pascal is one newton per square meter."),
u("bar", "Bar", "bar", 100000, "A bar is exactly 100,000 pascals."),
u("millibar", "Millibar", "mbar", 100, "A millibar is 100 pascals."),
u("psi", "PSI", "psi", 6894.757293168, "Pounds per square inch."),
u("ksi", "KSI", "ksi", 6894757.293168, "Kips per square inch."),
u("atmosphere", "Atmosphere", "atm", 101325, "A standard atmosphere is exactly 101,325 pascals."),
u("torr", "Torr", "Torr", 133.3223684211, "A torr is 1/760 standard atmosphere."),
u("mmhg", "mmHg", "mmHg", 133.322387415, "Millimeters of mercury at standard gravity."),
u("inhg", "inHg", "inHg", 3386.389, "Inches of mercury."),
u("water_meter", "Meter of water", "mH2O", 9806.65, "Meter of water column."),
u("technical_atmosphere", "Technical atmosphere", "at", 98066.5, "Technical atmosphere is kilogram-force per square centimeter.")
]);
const energyUnits = uniqueUnits([
...metricUnits("joule", "Joule", "J", 1, "The joule is the SI derived unit of energy."),
u("calorie", "Calorie", "cal", 4.184, "A thermochemical calorie is 4.184 joules."),
u("kilocalorie", "Kilocalorie", "kcal", 4184, "A kilocalorie is 1,000 calories."),
u("watt_hour", "Watt-hour", "Wh", 3600, "A watt-hour is 3,600 joules."),
u("kilowatt_hour", "kWh", "kWh", 3600000, "A kilowatt-hour is 3.6 million joules."),
u("btu", "BTU", "BTU", 1055.05585262, "British thermal unit."),
u("therm_us", "US therm", "therm", 105480400, "US therm used for natural gas energy."),
u("electronvolt", "Electronvolt", "eV", 1.602176634e-19, "An electronvolt is the energy gained by an electron across one volt."),
u("erg", "Erg", "erg", 1e-7, "An erg is a CGS energy unit."),
u("foot_pound", "Foot-pound", "ft-lb", 1.3558179483314004, "Work from one pound-force over one foot.")
]);
const powerUnits = uniqueUnits([
...metricUnits("watt", "Watt", "W", 1, "The watt is one joule per second."),
u("horsepower_mechanical", "Horsepower", "hp", 745.6998715822702, "Mechanical horsepower."),
u("horsepower_metric", "Metric horsepower", "PS", 735.49875, "Metric horsepower."),
u("btu_hour", "BTU per hour", "BTU/h", 0.2930710701722222, "Power rate using BTU per hour."),
u("ton_refrigeration", "Ton of refrigeration", "TR", 3516.8528420667, "Cooling power equal to 12,000 BTU/h."),
u("foot_pound_second", "Foot-pound per second", "ft-lb/s", 1.3558179483314004, "Mechanical power rate.")
]);
const forceUnits = uniqueUnits([
...metricUnits("newton", "Newton", "N", 1, "The newton is the SI unit of force."),
u("dyne", "Dyne", "dyn", 1e-5, "A dyne is a CGS force unit."),
u("pound_force", "Pound-force", "lbf", 4.4482216152605, "Pound-force under standard gravity."),
u("kip", "Kip", "kip", 4448.2216152605, "A kip is 1,000 pound-force."),
u("kilogram_force", "Kilogram-force", "kgf", 9.80665, "Kilogram-force under standard gravity."),
u("ounce_force", "Ounce-force", "ozf", 0.27801385095378125, "Ounce-force.")
]);
const torqueUnits = uniqueUnits([
...metricUnits("newton_meter", "Newton meter", "N m", 1, "Newton meter is the SI torque unit."),
u("pound_foot", "Pound-foot", "lb ft", 1.3558179483314004, "Torque from one pound-force at one foot."),
u("pound_inch", "Pound-inch", "lb in", 0.1129848290276167, "Torque from one pound-force at one inch."),
u("ounce_inch", "Ounce-inch", "oz in", 0.007061551814226042, "Torque from one ounce-force at one inch."),
u("kilogram_force_meter", "Kilogram-force meter", "kgf m", 9.80665, "Torque from one kilogram-force at one meter.")
]);
const frequencyUnits = uniqueUnits([
...metricUnits("hertz", "Hertz", "Hz", 1, "The hertz is one cycle per second."),
u("rpm", "Revolutions per minute", "rpm", 1 / 60, "Revolutions per minute converted to hertz."),
u("rps", "Revolutions per second", "rps", 1, "Revolutions per second."),
u("bpm", "Beats per minute", "bpm", 1 / 60, "Beats per minute as a frequency."),
u("rad_second", "Radians per second", "rad/s", 1 / (2 * Math.PI), "Angular frequency converted by one revolution equals 2*pi radians.")
]);
const digitalUnits = uniqueUnits([
...digitalStorageUnits(),
u("nibble", "Nibble", "nibble", 4, "A nibble is four bits."),
u("word_16", "16-bit word", "word", 16, "A common word size of 16 bits.")
]);
const angleUnits = uniqueUnits([
u("radian", "Radian", "rad", 1, "The radian is the SI angle unit."),
u("degree", "Degree", "deg", Math.PI / 180, "A degree is pi/180 radians."),
u("gradian", "Gradian", "gon", Math.PI / 200, "A gradian is 1/400 of a turn."),
u("turn", "Turn", "turn", 2 * Math.PI, "One full revolution."),
u("arcminute", "Arcminute", "arcmin", Math.PI / 10800, "One arcminute is 1/60 degree."),
u("arcsecond", "Arcsecond", "arcsec", Math.PI / 648000, "One arcsecond is 1/3600 degree."),
u("milliradian", "Milliradian", "mrad", 0.001, "One milliradian is 0.001 radians."),
u("circle", "Circle", "circle", 2 * Math.PI, "One complete circle.")
]);
const densityUnits = ratioUnits(
massUnits,
volumeUnits,
"per",
"density",
"Mass per volume density."
);
const flowUnits = ratioUnits(
volumeUnits,
timeUnits,
"per",
"flow",
"Volumetric flow rate."
);
const agricultureUnits = agricultureRateUnits(massUnits, volumeUnits, areaUnits);
const chemistryUnits = chemistryConcentrationUnits(massUnits, volumeUnits);
return [
c("length", "Length Converter", "Convert SI, imperial, US customary, astronomical, scientific, and historical length units.", "linear", "meter", "foot", lengthUnits, "Length uses the meter as the base unit."),
c("area", "Area Converter", "Convert land, construction, mapping, survey, and scientific area units.", "linear", "square_meter", "acre", areaUnits, "Area uses the square meter as the base unit."),
c("volume", "Volume Converter", "Convert metric, US customary, imperial, cooking, dry, and industrial volume units.", "linear", "liter", "gallon_us", volumeUnits, "Volume uses the cubic meter as the base unit."),
c("weight", "Mass/Weight Converter", "Convert SI mass, imperial weight, jewelry, atomic, and astronomy mass units.", "linear", "kilogram", "pound", massUnits, "Mass uses the kilogram as the base unit."),
c("temperature", "Temperature Converter", "Convert Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Reaumur, and Romer.", "temperature", "celsius", "fahrenheit", temperatureUnits(), "Temperature conversions use absolute Kelvin internally."),
c("time", "Time Converter", "Convert SI time, civil time, historical durations, months, and years.", "linear", "hour", "day", timeUnits, "Months and years use the average Gregorian year."),
c("speed", "Speed Converter", "Convert road, aviation, marine, lab, and scientific speed units.", "linear", "kilometer_per_hour", "mile_per_hour", speedUnits(lengthUnits, timeUnits), "Speed uses meters per second as the base unit."),
c("pressure", "Pressure Converter", "Convert pascals, bars, PSI, atmospheres, mercury columns, water columns, and engineering pressure units.", "linear", "pascal", "psi", pressureUnits, "Pressure uses the pascal as the base unit."),
c("energy", "Energy Converter", "Convert joules, calories, kilowatt-hours, BTU, electronvolts, therms, and mechanical work units.", "linear", "joule", "kilowatt_hour", energyUnits, "Energy uses the joule as the base unit."),
c("power", "Power Converter", "Convert watts, horsepower, refrigeration tons, BTU per hour, and engineering power units.", "linear", "watt", "horsepower_mechanical", powerUnits, "Power uses the watt as the base unit."),
c("force", "Force Converter", "Convert newtons, dynes, pound-force, kilogram-force, kips, and ounce-force.", "linear", "newton", "pound_force", forceUnits, "Force uses the newton as the base unit."),
c("torque", "Torque Converter", "Convert newton meters, pound-feet, pound-inches, ounce-inches, and kilogram-force meters.", "linear", "newton_meter", "pound_foot", torqueUnits, "Torque uses the newton meter as the base unit."),
c("electricity", "Electricity Converter", "Convert electrical units by family and calculate voltage, current, resistance, power, and energy with context values.", "electricity", "volt", "kilovolt", electricityUnits(), "Electrical units convert directly within the same family; cross-family results use Ohm's law and time context."),
c("frequency", "Frequency Converter", "Convert hertz, SI frequency prefixes, RPM, beats per minute, and angular frequency.", "linear", "hertz", "rpm", frequencyUnits, "Frequency uses hertz as the base unit."),
c("digital", "Digital Storage Converter", "Convert bits, bytes, decimal storage, binary storage, nibbles, and word sizes.", "linear", "byte", "megabyte", digitalUnits, "Digital storage uses bits as the base unit."),
c("angle", "Angle Converter", "Convert radians, degrees, gradians, turns, arcminutes, arcseconds, and milliradians.", "linear", "degree", "radian", angleUnits, "Angle uses radians as the base unit."),
c("density", "Density Converter", "Convert thousands of mass-per-volume density combinations for science, engineering, agriculture, and fluids.", "linear", "kilogram_per_cubic_meter", "pound_per_cubic_foot", densityUnits, "Density uses kilograms per cubic meter as the base unit."),
c("flow", "Flow Rate Converter", "Convert volumetric flow rates across metric, US, imperial, industrial, and scientific units.", "linear", "liter_per_second", "gallon_us_per_minute", flowUnits, "Flow rate uses cubic meters per second as the base unit."),
c("fuel_economy", "Fuel Economy Converter", "Convert MPG, km/L, L/100 km, and related transport fuel economy units.", "fuel", "mile_per_gallon_us", "liter_per_100_kilometer", fuelUnits(), "Fuel economy converts between distance-per-volume and volume-per-distance formats."),
c("radiation", "Radiation Converter", "Convert radioactivity, absorbed dose, and equivalent dose units by compatible radiation family.", "multi", "gray", "rad_absorbed", radiationUnits(), "Radiation conversions are dimension-aware."),
c("chemistry", "Chemistry Converter", "Convert concentration, molarity, amount, and laboratory scientific units by compatible family.", "multi", "gram_per_liter", "milligram_per_liter", chemistryUnits, "Chemistry conversions are dimension-aware."),
c("agriculture", "Agriculture Converter", "Convert acres, hectares, yield, seed, fertilizer, irrigation, and application-rate units.", "multi", "acre", "hectare", agricultureUnits, "Agriculture conversions are grouped by area, mass rate, liquid rate, and yield rate."),
c("cooking", "Cooking Converter", "Convert cooking volume and mass units used in recipes and nutrition workflows.", "multi", "cup_us", "milliliter", cookingUnits(volumeUnits, massUnits), "Cooking units are dimension-aware because volume and mass require density to mix."),
c("astronomy", "Astronomy Converter", "Convert astronomical length, mass, time, and distance units by compatible family.", "multi", "astronomical_unit", "light_year", astronomyUnits(lengthUnits, massUnits, timeUnits), "Astronomy conversions are dimension-aware."),
c("engineering", "Engineering Converter", "Convert common stress, force, torque, power, and energy units used in engineering.", "multi", "psi", "pascal", engineeringUnits(pressureUnits, forceUnits, torqueUnits, powerUnits, energyUnits), "Engineering units are grouped by compatible dimensions."),
c("scientific", "Scientific Units Converter", "Convert SI derived units, scientific notation-friendly units, atomic units, and lab measurements.", "multi", "angstrom", "nanometer", scientificUnits(lengthUnits, massUnits, energyUnits, pressureUnits, frequencyUnits), "Scientific units are grouped by compatible dimensions."),
c("currency", "Currency Converter", "Convert major world currencies with offline fallback rates and optional API support.", "currency", "USD", "EUR", currencyUnits(), "Currency rates are offline estimates unless live API rates are loaded.")
];
}
function u(id, name, symbol, factor, definition, aliases, dimension) {
const allAliases = buildAliases(id, name, symbol, aliases || []);
return {
id,
name,
symbol,
factor,
definition: definition || `${name} conversion unit.`,
aliases: allAliases,
synonyms: allAliases,
dimension: dimension || "value"
};
}
function buildAliases(id, name, symbol, aliases) {
const values = new Set([id, name, symbol, id.replace(/_/g, " "), name.toLowerCase(), symbol.toLowerCase()]);
aliases.forEach((alias) => values.add(alias));
const lowerName = name.toLowerCase();
if (!lowerName.endsWith("s")) values.add(`${lowerName}s`);
const dictionary = {
kilogram: ["kg", "kilo", "kilos"],
pound: ["lb", "lbs", "pounds"],
ounce: ["oz", "ounces"],
mile: ["mi", "miles"],
kilometer: ["km", "kilometre", "kilometres", "kilometers"],
meter: ["m", "metre", "metres", "meters"],
foot: ["ft", "feet"],
inch: ["in", "inches"],
acre: ["ac", "acres"],
hectare: ["ha", "hectares"],
liter: ["l", "litre", "litres", "liters"],
gallon_us: ["gal", "gallon", "gallons", "us gallon", "us gallons"],
gallon_imperial: ["imperial gallon", "imperial gallons", "uk gallon", "uk gallons"],
cup_us: ["cup", "cups", "us cup", "us cups"],
cup_metric: ["metric cup", "metric cups"],
celsius: ["c", "centigrade"],
fahrenheit: ["f"],
kelvin: ["k"],
mile_per_hour: ["mph", "miles per hour"],
kilometer_per_hour: ["kmh", "kph", "km/h", "kilometers per hour"],
square_foot: ["sq ft", "ft2", "square feet"],
square_meter: ["sq m", "m2", "square metres", "square meters"],
psi: ["pounds per square inch"],
bar: ["bars"],
watt: ["w", "watts"],
horsepower_mechanical: ["hp", "horsepower"]
};
(dictionary[id] || []).forEach((alias) => values.add(alias));
return Array.from(values).filter(Boolean);
}
function c(id, name, description, type, defaultFrom, defaultTo, units, note) {
return { id, name, description, type, defaultFrom, defaultTo, units: uniqueUnits(units), note };
}
function metricUnits(baseId, baseName, baseSymbol, baseFactor, baseDefinition, options) {
const settings = options || {};
return prefixes.map(([key, prefixName, prefixSymbol, prefixFactor]) => {
const id = key ? `${key}${baseId}` : baseId;
const name = key ? `${prefixName}${baseName.toLowerCase()}` : baseName;
const symbol = `${prefixSymbol}${baseSymbol}`;
return u(id, name, symbol, baseFactor * prefixFactor, key ? `${name} is ${prefixFactor} ${baseName.toLowerCase()} units.` : baseDefinition, [], settings.dimension);
});
}
function squareMetricUnits(baseId, baseName, baseSymbol, baseFactor, definition) {
return prefixes.map(([key, prefixName, prefixSymbol, prefixFactor]) => {
const id = key ? `square_${key}${baseId}` : `square_${baseId}`;
const name = key ? `Square ${prefixName.toLowerCase()}${baseName}` : `Square ${baseName}`;
const symbol = `${prefixSymbol}${baseSymbol}2`;
return u(id, titleCase(name), symbol, baseFactor * prefixFactor * prefixFactor, definition, [], "area");
});
}
function cubicMetricUnits(baseId, baseName, baseSymbol, baseFactor, definition) {
return prefixes.map(([key, prefixName, prefixSymbol, prefixFactor]) => {
const id = key ? `cubic_${key}${baseId}` : `cubic_${baseId}`;
const name = key ? `Cubic ${prefixName.toLowerCase()}${baseName}` : `Cubic ${baseName}`;
const symbol = `${prefixSymbol}${baseSymbol}3`;
return u(id, titleCase(name), symbol, baseFactor * Math.pow(prefixFactor, 3), definition, [], "volume");
});
}
function ratioUnits(numerators, denominators, joiner, dimension, definition) {
const units = [];
uniqueUnits(numerators).forEach((top) => {
uniqueUnits(denominators).forEach((bottom) => {
units.push(u(
`${top.id}_per_${bottom.id}`,
`${top.name} ${joiner} ${bottom.name}`,
`${top.symbol}/${bottom.symbol}`,
top.factor / bottom.factor,
definition,
[],
dimension
));
});
});
return uniqueUnits(units);
}
function temperatureUnits() {
return [
u("celsius", "Celsius", "C", 1, "Celsius is a temperature scale with water freezing at 0 C and boiling at 100 C.", [], "temperature"),
u("fahrenheit", "Fahrenheit", "F", 1, "Fahrenheit is a temperature scale with water freezing at 32 F and boiling at 212 F.", [], "temperature"),
u("kelvin", "Kelvin", "K", 1, "Kelvin is the SI absolute temperature scale.", [], "temperature"),
u("rankine", "Rankine", "R", 1, "Rankine is an absolute Fahrenheit-based temperature scale.", [], "temperature"),
u("delisle", "Delisle", "De", 1, "Delisle is a historical temperature scale.", [], "temperature"),
u("newton_temperature", "Newton", "N", 1, "Newton is a historical temperature scale.", [], "temperature"),
u("reaumur", "Reaumur", "Re", 1, "Reaumur is a historical temperature scale.", [], "temperature"),
u("romer", "Romer", "Ro", 1, "Romer is a historical temperature scale.", [], "temperature")
];
}
function speedUnits(lengthUnits, timeUnits) {
const common = [
u("meter_per_second", "m/s", "m/s", 1, "Meters per second.", [], "speed"),
u("kilometer_per_hour", "km/h", "km/h", 1000 / 3600, "Kilometers per hour.", [], "speed"),
u("mile_per_hour", "mph", "mph", 1609.344 / 3600, "Miles per hour.", [], "speed"),
u("foot_per_second", "ft/s", "ft/s", 0.3048, "Feet per second.", [], "speed"),
u("knot", "Knots", "kn", 1852 / 3600, "A knot is one nautical mile per hour.", ["knots"], "speed"),
u("mach_standard", "Mach", "Ma", 340.29, "Mach at standard sea-level conditions.", [], "speed"),
u("speed_of_light", "Speed of light", "c", 299792458, "Speed of light in vacuum.", [], "speed")
];
const lengthSubset = lengthUnits.filter((item) => ["meter", "kilometer", "centimeter", "millimeter", "mile", "foot", "yard", "nautical_mile"].includes(item.id));
const timeSubset = timeUnits.filter((item) => ["second", "minute", "hour", "day"].includes(item.id));
return uniqueUnits([...common, ...ratioUnits(lengthSubset, timeSubset, "per", "speed", "Distance divided by time.")]);
}
function digitalStorageUnits() {
// The decimal-bit multiples (kilobit..exabit) have symbols that are just an
// SI-prefix letter + "b" (kb, Mb, Gb, Tb, Pb, Eb). URL routing normalizes
// everything to lowercase, so those symbols collide with the decimal-BYTE
// multiples' symbols (KB, MB, GB, TB, PB -> kb, mb, gb, tb, pb once
// lowercased) - a genuine ambiguity between e.g. kilobit's "kb" and
// kilobyte's "KB". The generated SEO page slugs sidestep that collision by
// spelling these units out as "kbit"/"mbit"/"gbit"/"tbit"/"pbit"/"ebit" in
// the URL instead of the bare symbol, but resolveUnitAlias() (used by both
// deriveConversionFromPath() for SEO-page hydration and
// findConversionFromParams() for the interactive converter) only matched
// against id/name/symbol/aliases - and "kbit" etc. were never listed as an
// alias anywhere - so those specific URLs silently failed to resolve to a
// unit at all. hydrateSeoArticleContent() depends on that resolution
// succeeding (it bails out entirely, before translating anything, when it
// doesn't), so every one of these pages stayed English-only on every
// language switch even though their unitDefinitions/units translations
// already existed. Adding the unambiguous "<letter>bit" spelling as a real
// alias (data-only, no id/factor/category change) fixes resolution - and
// therefore hydration - generically for every page built on these units,
// not just the four originally reported.
const decimal = [
["bit", "Bit", "bit", 1],
["byte", "Byte", "B", 8],
["kilobit", "Kilobit", "kb", 1e3, ["kbit"]],
["kilobyte", "KB", "KB", 8e3],
["megabit", "Megabit", "Mb", 1e6, ["mbit"]],
["megabyte", "MB", "MB", 8e6],
["gigabit", "Gigabit", "Gb", 1e9, ["gbit"]],
["gigabyte", "GB", "GB", 8e9],
["terabit", "Terabit", "Tb", 1e12, ["tbit"]],
["terabyte", "TB", "TB", 8e12],
["petabit", "Petabit", "Pb", 1e15, ["pbit"]],
["petabyte", "PB", "PB", 8e15],
["exabit", "Exabit", "Eb", 1e18, ["ebit"]],
["exabyte", "EB", "EB", 8e18],
["zettabyte", "ZB", "ZB", 8e21],
["yottabyte", "YB", "YB", 8e24]
];
const binary = [
["kibibyte", "KiB", "KiB", 8 * 1024],
["mebibyte", "MiB", "MiB", 8 * Math.pow(1024, 2)],
["gibibyte", "GiB", "GiB", 8 * Math.pow(1024, 3)],
["tebibyte", "TiB", "TiB", 8 * Math.pow(1024, 4)],
["pebibyte", "PiB", "PiB", 8 * Math.pow(1024, 5)],
["exbibyte", "EiB", "EiB", 8 * Math.pow(1024, 6)]
];
return [...decimal, ...binary].map(([id, name, symbol, factor, aliases]) => u(id, name, symbol, factor, `${name} digital storage unit.`, aliases || [], "storage"));
}
function electricityUnits() {
const voltage = metricUnits("volt", "Volt", "V", 1, "Volt is the SI unit of electric potential.", { dimension: "voltage" });
const current = metricUnits("ampere", "Ampere", "A", 1, "Ampere is the SI unit of electric current.", { dimension: "current" });
const resistance = metricUnits("ohm", "Ohm", "Ohm", 1, "Ohm is the SI unit of electrical resistance.", { dimension: "resistance" });
const charge = metricUnits("coulomb", "Coulomb", "C", 1, "Coulomb is the SI unit of electric charge.", { dimension: "charge" });
const capacitance = metricUnits("farad", "Farad", "F", 1, "Farad is the SI unit of capacitance.", { dimension: "capacitance" });
const conductance = metricUnits("siemens", "Siemens", "S", 1, "Siemens is the SI unit of conductance.", { dimension: "conductance" });
const inductance = metricUnits("henry", "Henry", "H", 1, "Henry is the SI unit of inductance.", { dimension: "inductance" });
const power = metricUnits("watt", "Watt", "W", 1, "Watt is one joule per second.", { dimension: "power" });
const energy = [u("watt_hour", "Watt-hour", "Wh", 3600, "Electrical energy over time.", [], "energy"), u("kilowatt_hour", "kWh", "kWh", 3600000, "Kilowatt-hour electrical energy.", [], "energy")];
return uniqueUnits([...voltage, ...current, ...resistance, ...charge, ...capacitance, ...conductance, ...inductance, ...power, ...energy]);
}
function fuelUnits() {
return [
fuel("mile_per_gallon_us", "Miles per US gallon", "mpg", "efficiency", 1609.344 / 0.003785411784),
fuel("mile_per_gallon_imperial", "Miles per imperial gallon", "mpg imp", "efficiency", 1609.344 / 0.00454609),
fuel("kilometer_per_liter", "Kilometers per liter", "km/L", "efficiency", 1000 / 0.001),
fuel("meter_per_liter", "Meters per liter", "m/L", "efficiency", 1 / 0.001),
fuel("liter_per_100_kilometer", "Liters per 100 kilometers", "L/100 km", "consumption", 0.001 / 100000),
fuel("liter_per_kilometer", "Liters per kilometer", "L/km", "consumption", 0.001 / 1000),
fuel("gallon_us_per_100_mile", "US gallons per 100 miles", "gal/100 mi", "consumption", 0.003785411784 / 160934.4)
];
}
function fuel(id, name, symbol, mode, factor) {
return { id, name, symbol, mode, factor, definition: `${name} fuel economy unit.`, aliases: [], dimension: "fuel" };
}
function radiationUnits() {
return [
u("becquerel", "Becquerel", "Bq", 1, "Becquerel is one radioactive decay per second.", [], "activity"),
u("curie", "Curie", "Ci", 3.7e10, "Curie is 3.7e10 becquerels.", [], "activity"),
u("gray", "Gray", "Gy", 1, "Gray is absorbed dose in joules per kilogram.", [], "absorbed_dose"),
u("rad_absorbed", "Rad", "rad", 0.01, "Rad is 0.01 gray.", [], "absorbed_dose"),
u("sievert", "Sievert", "Sv", 1, "Sievert is equivalent dose.", [], "equivalent_dose"),
u("rem", "Rem", "rem", 0.01, "Rem is 0.01 sievert.", [], "equivalent_dose"),
...metricUnits("gray", "Gray", "Gy", 1, "Metric gray.", { dimension: "absorbed_dose" }),
...metricUnits("sievert", "Sievert", "Sv", 1, "Metric sievert.", { dimension: "equivalent_dose" })
];
}
function chemistryConcentrationUnits(massUnits, volumeUnits) {
const massSubset = massUnits.filter((item) => ["kilogram", "gram", "milligram", "microgram", "pound", "ounce"].includes(item.id));
const volumeSubset = volumeUnits.filter((item) => ["cubic_meter", "liter", "milliliter", "microliter", "gallon_us", "fluid_ounce_us"].includes(item.id));
return uniqueUnits([
...ratioUnits(massSubset, volumeSubset, "per", "mass_concentration", "Mass concentration."),
u("mole", "Mole", "mol", 1, "Mole is the SI amount of substance unit.", [], "amount"),
...metricUnits("mole", "Mole", "mol", 1, "Metric mole.", { dimension: "amount" }),
u("mole_per_liter", "Mole per liter", "mol/L", 1000, "Molar concentration.", [], "molarity"),
u("millimole_per_liter", "Millimole per liter", "mmol/L", 1, "Millimolar concentration.", [], "molarity"),
u("micromole_per_liter", "Micromole per liter", "umol/L", 0.001, "Micromolar concentration.", [], "molarity"),
u("parts_per_million_water", "Parts per million water", "ppm", 0.001, "Approximate mg/L in water.", [], "mass_concentration"),
u("parts_per_billion_water", "Parts per billion water", "ppb", 0.000001, "Approximate ug/L in water.", [], "mass_concentration")
]);
}
function agricultureRateUnits(massUnits, volumeUnits, areaUnits) {
const areas = areaUnits.filter((item) => ["hectare", "acre", "square_meter", "square_kilometer", "square_foot", "square_mile"].includes(item.id));
const masses = massUnits.filter((item) => ["kilogram", "gram", "milligram", "tonne", "pound", "ounce", "short_ton"].includes(item.id));
const volumes = volumeUnits.filter((item) => ["liter", "milliliter", "cubic_meter", "gallon_us", "quart_us", "pint_us", "fluid_ounce_us"].includes(item.id));
const area = areas.map((item) => ({ ...item, dimension: "area" }));
const massRates = ratioUnits(masses, areas, "per", "mass_application_rate", "Mass application rate.");
const liquidRates = ratioUnits(volumes, areas, "per", "liquid_application_rate", "Liquid application rate.");
const yieldRates = ratioUnits([u("tonne", "Metric ton", "t", 1000, "Metric ton."), u("kilogram", "Kilogram", "kg", 1, "Kilogram."), u("bushel_wheat", "Bushel wheat", "bu wheat", 27.2155, "Approximate wheat bushel mass.")], areas, "per", "yield_rate", "Agricultural yield rate.");
return uniqueUnits([...area, ...massRates, ...liquidRates, ...yieldRates]);
}
function cookingUnits(volumeUnits, massUnits) {
const volumeIds = ["teaspoon_us", "teaspoon_metric", "tablespoon_us", "tablespoon_metric", "fluid_ounce_us", "cup_us", "cup_metric", "pint_us", "quart_us", "gallon_us", "milliliter", "liter"];
const massIds = ["gram", "kilogram", "milligram", "ounce", "pound"];
return uniqueUnits([
...volumeUnits.filter((item) => volumeIds.includes(item.id)).map((item) => ({ ...item, dimension: "volume" })),
...massUnits.filter((item) => massIds.includes(item.id)).map((item) => ({ ...item, dimension: "mass" })),
u("pinch", "Pinch", "pinch", 0.0000003080576, "A cooking pinch approximated as 1/16 teaspoon.", [], "volume"),
u("dash", "Dash", "dash", 0.0000006161152, "A cooking dash approximated as 1/8 teaspoon.", [], "volume")
]);
}
function astronomyUnits(lengthUnits, massUnits, timeUnits) {
return uniqueUnits([
...lengthUnits.filter((item) => ["astronomical_unit", "light_year", "parsec", "kilometer", "meter", "mile"].includes(item.id)).map((item) => ({ ...item, dimension: "distance" })),
...massUnits.filter((item) => ["kilogram", "tonne", "earth_mass", "solar_mass"].includes(item.id)).map((item) => ({ ...item, dimension: "mass" })),
u("earth_mass", "Earth mass", "Mearth", 5.9722e24, "Earth mass.", [], "mass"),
u("jupiter_mass", "Jupiter mass", "Mj", 1.89813e27, "Jupiter mass.", [], "mass"),
...timeUnits.filter((item) => ["second", "day", "year", "century"].includes(item.id)).map((item) => ({ ...item, dimension: "time" }))
]);
}
function engineeringUnits(pressureUnits, forceUnits, torqueUnits, powerUnits, energyUnits) {
return uniqueUnits([
...pressureUnits.map((item) => ({ ...item, dimension: "stress_pressure" })),
...forceUnits.map((item) => ({ ...item, dimension: "force" })),
...torqueUnits.map((item) => ({ ...item, dimension: "torque" })),
...powerUnits.map((item) => ({ ...item, dimension: "power" })),
...energyUnits.map((item) => ({ ...item, dimension: "energy" }))
]);
}
function scientificUnits(lengthUnits, massUnits, energyUnits, pressureUnits, frequencyUnits) {
return uniqueUnits([
...lengthUnits.filter((item) => ["angstrom", "nanometer", "micrometer", "meter", "astronomical_unit", "parsec"].includes(item.id)).map((item) => ({ ...item, dimension: "length" })),
...massUnits.filter((item) => ["atomic_mass_unit", "microgram", "milligram", "gram", "kilogram"].includes(item.id)).map((item) => ({ ...item, dimension: "mass" })),
...energyUnits.filter((item) => ["electronvolt", "joule", "kilojoule", "erg"].includes(item.id)).map((item) => ({ ...item, dimension: "energy" })),
...pressureUnits.filter((item) => ["pascal", "bar", "atmosphere", "torr"].includes(item.id)).map((item) => ({ ...item, dimension: "pressure" })),
...frequencyUnits.map((item) => ({ ...item, dimension: "frequency" }))
]);
}
function currencyUnits() {
return Object.keys(currencyFallbackRates).map((code) => {
const meta = currencyMeta[code] || { name: code, country: "", symbol: code };
const definition = meta.country
? `The ${meta.name} (${code}) is the official currency of ${meta.country}.`
: `${code} offline exchange-rate placeholder relative to USD.`;
return u(code, meta.name, meta.symbol, currencyFallbackRates[code], definition, [], "currency");
});
}
function applyCustomUnits(baseCategories) {
const custom = readArray(storageKeys.customUnits);
if (!custom.length) return baseCategories;
custom.forEach((item) => {
const category = baseCategories.find((entry) => entry.id === item.categoryId);
if (!category || !["linear", "currency"].includes(category.type)) return;
category.units.push(u(item.id, item.name, item.symbol, Number(item.factor), item.definition || "Custom admin unit.", ["custom"], "value"));
category.units = uniqueUnits(category.units);
});
return baseCategories;
}
function uniqueUnits(units) {
const seen = new Set();
return units.filter((item) => {
if (!item || seen.has(item.id)) return false;
seen.add(item.id);
return true;
});
}
function titleCase(value) {
return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function initTheme() {
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem(storageKeys.theme);
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (prefersDark ? "dark" : "light"));
if (themeToggle) {
themeToggle.addEventListener("click", () => {
const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
setTheme(nextTheme);
});
}
}
function setTheme(theme) {
document.documentElement.dataset.theme = theme;
localStorage.setItem(storageKeys.theme, theme);
const themeText = document.getElementById("themeText");
if (themeText) themeText.textContent = getTranslation(theme === "dark" ? "nav.themeLight" : "nav.themeDark", getStoredLanguageCode());
}
// Returns a valid language code: the stored choice if it's one of
// SUPPORTED_LANGUAGES, otherwise DEFAULT_LANGUAGE_CODE. This is the only
// place that reads uc-language from storage, so an invalid/missing/
// tampered value can never reach the rest of the app - every caller
// downstream always receives a known-good code.
function getStoredLanguageCode() {
let stored = null;
try {
stored = localStorage.getItem(storageKeys.language);
} catch (error) {
stored = null;
}
const match = SUPPORTED_LANGUAGES.find((lang) => lang.code === stored);
return match ? match.code : DEFAULT_LANGUAGE_CODE;
}
// Applies a language code to the document (html lang/dir) and to the
// selector UI (toggle flag/name, aria-current on the active menu item),
// and persists the choice. This is Phase 1: it establishes the global
// language state and direction correctly; it does not translate page
// content yet (see the task's "prepare for future translation" scope).
// Looks up a translation by dot-path key (e.g. "nav.home") for the given
// language, falling back to English whenever the language is missing
// entirely, the key path doesn't exist for it, or the value is empty -
// so the UI can never show "undefined" or a raw key name. This is the
// only function that should read from TRANSLATIONS directly; everything
// else (applyTranslations, individual call sites) should go through it.
function getTranslation(path, langCode) {
const parts = path.split(".");
function readFrom(dict) {
let node = dict;
for (const part of parts) {
if (node == null || typeof node !== "object") return undefined;
node = node[part];
}
return typeof node === "string" && node.length > 0 ? node : undefined;
}
const langDict = TRANSLATIONS[langCode];
const fromLang = langDict ? readFrom(langDict) : undefined;
if (fromLang !== undefined) return fromLang;
const fromEnglish = readFrom(TRANSLATIONS[DEFAULT_LANGUAGE_CODE]);
return fromEnglish !== undefined ? fromEnglish : path;
}
// Applies every data-i18n-tagged element's translated text (and, for
// elements also carrying data-i18n-attr, a translated attribute such as
// placeholder/aria-label instead of textContent) for the given language.
// This only touches shared UI chrome (header, sidebar, converter shell,
// homepage overview labels) that renderSiteHeader()/renderSeoConverterShell()/
// etc. already render on every page - it never touches SEO page-specific
// content (titles, About, FAQ, formulas, examples), since none of that is
// marked with data-i18n and this function only ever looks at elements that are.
function applyTranslations(langCode) {
// Elements tagged data-i18n (currently: the header nav, which
// renderSiteHeader() genuinely injects at runtime into every page's
// empty #siteHeader placeholder) are updated generically here.
document.querySelectorAll("[data-i18n]").forEach((el) => {
const key = el.getAttribute("data-i18n");
const value = getTranslation(key, langCode);
const attr = el.getAttribute("data-i18n-attr");
if (attr) {
el.setAttribute(attr, value);
} else {
el.textContent = value;
}
});
document.querySelectorAll("[data-i18n-title]").forEach((el) => {
el.setAttribute("title", getTranslation(el.getAttribute("data-i18n-title"), langCode));
});
// The converter shell and sidebar are NOT injected by any runtime
// function - every SEO page (and the homepage) already ships this
// markup as static, pre-generated HTML with no data-i18n attributes
// on it (renderSeoConverterShell() in this file is not actually
// called anywhere at runtime; adding data-i18n to its template alone
// would not reach any real page). So these are targeted directly by
// their existing selectors/IDs instead, which are identical across
// the homepage and all 327,527 SEO pages since they share one
// generation source - no HTML file needs to change for this to work.
const t = (key) => getTranslation(key, langCode);
// Small helper: updates only the first text-node child of an element,
// leaving nested elements (inputs, selects, spans) untouched - several
// of these labels are raw text immediately followed by a form control
// with no wrapping span, e.g. <label>Decimal control<input>...</label>
function setFirstTextNode(el, text) {
if (!el) return;
for (const node of el.childNodes) {
if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
node.textContent = text + " ";
return;
}
}
}
document.querySelectorAll('label[for="fromValue"] > span:first-child').forEach((el) => { el.textContent = t("converter.fromUnit"); });
document.querySelectorAll('label[for="toValue"] > span:first-child').forEach((el) => { el.textContent = t("converter.toUnit"); });
document.querySelectorAll(".swap-button").forEach((el) => { el.setAttribute("aria-label", t("converter.swap")); });
document.querySelectorAll(".converter-controls label").forEach((el) => {
const input = el.querySelector("input, select");
if (input && input.id === "precisionControl") setFirstTextNode(el, t("converter.decimalControl"));
if (input && input.id === "notationMode") setFirstTextNode(el, t("converter.notation"));
});
document.querySelectorAll(".calc-api").forEach((el) => { setFirstTextNode(el, t("calculators.currencyApiLabel")); });
document.querySelectorAll(".calc-birthdate").forEach((el) => { setFirstTextNode(el, t("calculators.birthDateLabel")); });
document.querySelectorAll("#notationMode option").forEach((opt) => {
const map = { auto: "converter.notationAuto", decimal: "converter.notationDecimal", scientific: "converter.notationScientific", engineering: "converter.notationEngineering" };
if (map[opt.value]) opt.textContent = t(map[opt.value]);
});
document.querySelectorAll(".favorite-button").forEach((el) => { setFirstTextNode(el, t("converter.favorite")); });
document.querySelectorAll(".result-label").forEach((el) => { el.textContent = t("converter.result"); });
document.querySelectorAll("#copyButton").forEach((el) => { el.textContent = t("converter.copyResult"); });
document.querySelectorAll("#shareButton").forEach((el) => { el.textContent = t("converter.share"); });
document.querySelectorAll(".converter-ad-slot > span:first-child, .in-content-ad > span:first-child").forEach((el) => { el.textContent = t("sidebar.advertisement"); });
document.querySelectorAll(".definition-panel article > span:first-child").forEach((el, i) => {
const keys = ["converter.fromDefinition", "converter.toDefinition", "converter.formula"];
if (keys[i]) el.textContent = t(keys[i]);
});
document.querySelectorAll(".sidebar-ad").forEach((el) => { setFirstTextNode(el, t("sidebar.advertisement")); });
document.querySelectorAll(".context-copy strong").forEach((el) => { el.textContent = t("converter.contextValues"); });
document.querySelectorAll("#contextHelp").forEach((el) => {
const panel = document.getElementById("contextPanel");
const mode = panel && panel.dataset.mode;
el.textContent = mode === "electricity" ? t("converter.contextHelpElectricity") : t("converter.contextHelpDefault");
});
document.querySelectorAll(".context-grid label").forEach((el) => {
const input = el.querySelector("input");
const map = { contextVoltage: "converter.voltageLabel", contextCurrent: "converter.currentLabel", contextResistance: "converter.resistanceLabel", contextHours: "converter.hoursLabel", contextDensity: "converter.liquidDensityLabel" };
if (input && map[input.id]) setFirstTextNode(el, t(map[input.id]));
});
document.querySelectorAll(".activity-panel > section").forEach((section, i) => {
const keys = ["sidebar.favoriteConverters", "sidebar.recentlyUsed", "sidebar.conversionHistory"];
const heading = section.querySelector(".activity-heading h3");
const clearBtn = section.querySelector(".activity-heading button");
if (heading && keys[i]) heading.textContent = t(keys[i]);
if (clearBtn) clearBtn.textContent = t("sidebar.clear");
});
// Every SEO conversion page's static breadcrumb starts with a "Home"
// link (identical markup/text across all 327,527 generated pages, never
// touched by any translation logic before now), e.g.
// <nav class="breadcrumb"><a href="../../index.html">Home</a>...</nav>.
// The reused nav.home key already exists for the site header, so no new
// key is needed here. The category segment (2nd breadcrumb link, e.g.
// "Area") is handled separately in refreshLanguageAwareConverter() below,
// since it depends on the page's resolved category/currentLanguageCode
// being current - the same timing rule already established for
// getCategoryDisplayName() elsewhere in this file. The 3rd breadcrumb
// segment (the page's own specific conversion title, e.g.
// "Acres to Hectares") is left untouched: it is page-specific SEO
// content tied to this exact slug, not shared UI, and is out of scope
// (translating it generically for all 327,527 slugs is a separate,
// much larger content-localization effort, not a UI-shell gap).
document.querySelectorAll(".breadcrumb a:first-child").forEach((el) => { el.textContent = t("nav.home"); });
// SEO-page-only ad-slot placeholder copy: the converter ad slot's own
// heading/reserved-space text ("Converter ad slot" / "Reserved below the
// result...") is different wording from the homepage's own converter ad
// slot (which already has its own data-i18n hooks, "Ad space" / "Display
// ads help keep this calculator free to use." - untouched here), so this
// is guarded to seo-page bodies only to avoid overwriting that already-
// correct homepage text with the SEO wording. Same for the two
// in-article ad placeholders (content-top/content-middle), which only
// exist on SEO pages at all. The "Advertisement" span above each of
// these is already handled by the .converter-ad-slot/.sidebar-ad rules
// above.
if (document.body && document.body.classList.contains("seo-page")) {
document.querySelectorAll(".converter-ad-slot > strong").forEach((el) => { el.textContent = t("converter.seoAdSlotConverterLabel"); });
document.querySelectorAll(".converter-ad-slot > p").forEach((el) => { el.textContent = t("converter.seoAdSlotConverterReserved"); });
const SEO_AD_SLOT_COPY = {
"content-top": ["converter.seoAdSlotContentTopLabel", "converter.seoAdSlotContentTopReserved"],
"content-middle": ["converter.seoAdSlotContentMiddleLabel", "converter.seoAdSlotContentMiddleReserved"]
};
document.querySelectorAll("[data-ad-placement]").forEach((el) => {
const pair = SEO_AD_SLOT_COPY[el.dataset.adPlacement];
if (!pair) return;
const strongEl = el.querySelector("strong");
const pEl = el.querySelector("p");
if (strongEl) strongEl.textContent = t(pair[0]);
if (pEl) pEl.textContent = t(pair[1]);
});
// SEO pages ship their own, simpler static footer (5 links: Privacy,
// Terms, Contact, Guides, Sitemap - no data-i18n hooks), distinct from
// the homepage's own already-localized footer (7 links, different
// wording, e.g. "Privacy Policy" not "Privacy", already handled via its
// own data-i18n attributes and left untouched here). The tagline
// sentence's wording is identical to the homepage's, so it reuses that
// exact existing key; "Contact"/"Guides"/"Sitemap" also already match
// existing nav.* key values exactly, so only "Privacy" needed a new key
// (nav.privacy) - "Terms" reuses the existing homepage.footerTerms value
// ("Terms"), which already matches this footer's own wording.
const footerTagline = document.querySelector(".site-footer > div > p:not([data-i18n])");
if (footerTagline) footerTagline.textContent = t("homepage.footerTagline");
const SEO_FOOTER_LINK_KEYS = [
[/privacy\.html$/, "nav.privacy"],
[/terms\.html$/, "homepage.footerTerms"],
[/contact\.html$/, "nav.contact"],
[/guides\.html$/, "nav.guides"],
[/sitemap\.html$/, "nav.sitemap"]
];
document.querySelectorAll(".site-footer nav a:not([data-i18n])").forEach((a) => {
const href = a.getAttribute("href") || "";
const match = SEO_FOOTER_LINK_KEYS.find(([pattern]) => pattern.test(href));
if (match) a.textContent = t(match[1]);
});
}
// Launch-status "Last updated" paragraph: the literal date is preserved
// exactly as authored (per requirement: never translate factual dates),
// while the surrounding sentence is localized via a {DATE} template.
const launchUpdatedEl = document.getElementById("launchStatusUpdated");
if (launchUpdatedEl) {
const literalDate = launchUpdatedEl.getAttribute("data-i18n-date") || "June 25, 2026";
launchUpdatedEl.textContent = fillTemplate(t("homepage.launchStatusUpdatedTemplate"), { DATE: literalDate });
}
// The sidebar's empty-state messages (Favorites/Recently used/History)
// are generated by JS at render time rather than living as static
// template text, so they need an explicit re-render here to pick up
// the new language - typeof-guarded since not every page that calls
// applyLanguage() necessarily has renderStoredLists defined/relevant.
if (typeof renderStoredLists === "function") {
renderStoredLists();
}
if (typeof renderOverview === "function") {
renderOverview();
}
// NOTE: renderCategoryDropdownMenus()/renderMobileDrawer() are NOT
// re-run here, even though they also need to pick up the new language -
// both resolve their labels through getCategoryDisplayName(), which
// reads the currentLanguageCode/currentSeoData() globals that
// applySeoTranslations() (called AFTER applyTranslations() returns, see
// applyLanguage() below) hasn't updated yet at this point. Calling them
// here would render with the PREVIOUS language's SEO data, same failure
// mode already documented on renderStoredLists() inside
// refreshLanguageAwareConverter() below - so, matching that existing
// precedent exactly, they are re-run from refreshLanguageAwareConverter()
// instead, once currentLanguageCode/currentSeoData() are actually current.
// The theme toggle's visible "Dark"/"Light" label is plain text set by
// setTheme() at toggle time, not data-i18n markup - re-apply the current
// theme's translated label here too, so switching language alone (with
// no theme click) still updates it instead of leaving the previous
// language's word on screen.
const themeTextEl = document.getElementById("themeText");
if (themeTextEl) {
const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
themeTextEl.textContent = t(currentTheme === "dark" ? "nav.themeLight" : "nav.themeDark");
}
// The "More conversion guides and tips" cards are JS-rendered from the
// blogPosts array (see renderBlog()) rather than static markup, so they
// need an explicit re-render here too, same as renderStoredLists/
// renderOverview above, to pick up the new language's tag/title/summary.
if (typeof renderBlog === "function") {
renderBlog();
}
// The calculator result strings (BMI label, "Choose a date", "N days
// later", "$X per month", etc.) are plain text set by these update
// functions rather than data-i18n markup, so a language switch after
// first load needs to explicitly re-run them - otherwise a result
// computed in the previous language would stay on screen untranslated
// until the user next edits that calculator's inputs. Each function
// already guards on its own required DOM elements existing (via byId
// calls that throw if missing... actually initCalculators() itself
// already early-returns when #currencyTool is absent, so these are
// only meaningful on pages that have the calculator section at all;
// typeof-guard here since not every page defines them).
if (typeof updatePercentage === "function" && document.getElementById("percentageResult")) {
updatePercentage();
}
if (typeof updateBmi === "function" && document.getElementById("bmiResult")) {
updateBmi();
}
if (typeof updateAge === "function" && document.getElementById("ageResult")) {
updateAge();
}
if (typeof updateDateCalc === "function" && document.getElementById("dateResult")) {
updateDateCalc();
}
if (typeof updateMortgage === "function" && document.getElementById("mortgageResult")) {
updateMortgage();
}
if (typeof updateFuelCost === "function" && document.getElementById("fuelCostResult")) {
updateFuelCost();
}
if (typeof updateAgricultureTools === "function" && document.getElementById("seedResult")) {
updateAgricultureTools();
}
}
// Diagnostic helper (not run automatically): walks every language and
// every English key, reporting any language missing a key or holding an
// empty value for one - the same check already run standalone during
// development, exposed here so it can be re-run against the live
// TRANSLATIONS object from the browser console if needed later.
function validateAllTranslations() {
function flattenKeys(obj, prefix) {
let keys = [];
for (const k of Object.keys(obj)) {
const path = prefix ? `${prefix}.${k}` : k;
if (obj[k] && typeof obj[k] === "object") {
keys = keys.concat(flattenKeys(obj[k], path));
} else {
keys.push(path);
}
}
return keys;
}
const englishKeys = flattenKeys(TRANSLATIONS[DEFAULT_LANGUAGE_CODE], "");
const problems = [];
Object.keys(TRANSLATIONS).forEach((langCode) => {
englishKeys.forEach((key) => {
const value = getTranslation(key, langCode);
if (value === key || !value) problems.push(`${langCode}: ${key}`);
});
});
return { totalKeys: englishKeys.length, totalLanguages: Object.keys(TRANSLATIONS).length, problems };
}
// app.js runs inside an IIFE (see the top of this file), so top-level
// function declarations are private to that scope and not reachable
// from the browser console or from outside code by default. This one
// diagnostic is deliberately exposed on window so it can actually be
// run from the console as intended, without exposing the rest of the
// app's internals.
window.validateAllTranslations = validateAllTranslations;
function applyLanguage(code) {
const lang = SUPPORTED_LANGUAGES.find((entry) => entry.code === code) ||
SUPPORTED_LANGUAGES.find((entry) => entry.code === DEFAULT_LANGUAGE_CODE);
document.documentElement.setAttribute("lang", lang.code);
document.documentElement.setAttribute("dir", lang.dir);
try {
localStorage.setItem(storageKeys.language, lang.code);
} catch (error) {
/* localStorage unavailable (private mode, quota, etc.) - language
   still applies for this page view, just won't persist across visits. */
}
applyTranslations(lang.code);
if (typeof applySeoTranslations === "function") applySeoTranslations(lang.code);
const flagEl = document.getElementById("langToggleFlag");
const nameEl = document.getElementById("langToggleName");
if (flagEl) flagEl.textContent = lang.flag;
if (nameEl) nameEl.textContent = lang.name;
const toggle = document.getElementById("langDropdownToggle");
if (toggle) toggle.setAttribute("aria-label", `Change language, current language ${lang.name}`);
document.querySelectorAll("#langDropdownMenu [role=\"option\"]").forEach((item) => {
const isSelected = item.dataset.langCode === lang.code;
item.setAttribute("aria-selected", String(isSelected));
item.classList.toggle("is-selected", isSelected);
});
}
// Builds the 14-item language menu from SUPPORTED_LANGUAGES (one source
// of truth - see its definition above) and wires up selection, restores
// the previously chosen language on load, and layers keyboard support
// (Up/Down/Home/End to move between options, Enter/Space to choose,
// matching the existing Categories dropdown's Escape/click-outside
// handling already set up generically for every .nav-dropdown in
// initCategoriesNav() below) on top of that shared open/close behavior.
function initLanguageSelector() {
const menu = document.getElementById("langDropdownMenu");
const toggle = document.getElementById("langDropdownToggle");
const dropdown = document.getElementById("langDropdown");
if (!menu || !toggle || !dropdown) return;
menu.innerHTML = SUPPORTED_LANGUAGES.map((lang) => `<li role="presentation"><button type="button" class="lang-option" role="option" aria-selected="false" data-lang-code="${lang.code}"><span class="lang-option-flag" aria-hidden="true">${lang.flag}</span><span class="lang-option-name">${lang.name}</span></button></li>`).join("");
applyLanguage(getStoredLanguageCode());
menu.addEventListener("click", (event) => {
const option = event.target.closest(".lang-option");
if (!option) return;
applyLanguage(option.dataset.langCode);
dropdown.classList.remove("is-open");
toggle.setAttribute("aria-expanded", "false");
toggle.focus();
});
menu.addEventListener("keydown", (event) => {
const options = Array.from(menu.querySelectorAll(".lang-option"));
const currentIndex = options.indexOf(document.activeElement);
if (event.key === "ArrowDown" || event.key === "ArrowUp") {
event.preventDefault();
const delta = event.key === "ArrowDown" ? 1 : -1;
const nextIndex = (currentIndex + delta + options.length) % options.length;
options[nextIndex].focus();
} else if (event.key === "Home") {
event.preventDefault();
options[0].focus();
} else if (event.key === "End") {
event.preventDefault();
options[options.length - 1].focus();
}
});
toggle.addEventListener("keydown", (event) => {
if (event.key === "ArrowDown") {
event.preventDefault();
dropdown.classList.add("is-open");
toggle.setAttribute("aria-expanded", "true");
const first = menu.querySelector(".lang-option");
if (first) first.focus();
}
});
}
function initCategoriesNav() {
const dropdowns = document.querySelectorAll(".nav-dropdown");
if (!dropdowns.length) return;
function findDropdownContainer(dropdown) {
const header = dropdown.closest(".site-header");
return header ? header.querySelector(".category-dropdown-container") : null;
}
function closeDropdown(dropdown) {
dropdown.classList.remove("is-open");
const toggle = dropdown.querySelector(".nav-dropdown-toggle");
if (toggle) toggle.setAttribute("aria-expanded", "false");
const container = findDropdownContainer(dropdown);
if (container) container.classList.remove("open");
}
function closeAll(except) {
dropdowns.forEach((dropdown) => {
if (dropdown !== except) closeDropdown(dropdown);
});
}
dropdowns.forEach((dropdown) => {
const toggle = dropdown.querySelector(".nav-dropdown-toggle");
const menu = dropdown.querySelector(".nav-dropdown-menu");
const container = findDropdownContainer(dropdown);
if (!toggle || !menu) return;
toggle.addEventListener("click", (event) => {
event.preventDefault();
const isOpen = dropdown.classList.contains("is-open");
closeAll(dropdown);
const nextOpen = !isOpen;
dropdown.classList.toggle("is-open", nextOpen);
toggle.setAttribute("aria-expanded", String(nextOpen));
if (container) container.classList.toggle("open", nextOpen);
});
menu.addEventListener("click", (event) => {
if (event.target.closest("a")) closeDropdown(dropdown);
});
if (container) {
container.addEventListener("click", (event) => {
if (event.target.closest("a")) closeDropdown(dropdown);
});
}
dropdown.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
closeDropdown(dropdown);
toggle.focus();
}
});
if (container) {
container.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
closeDropdown(dropdown);
toggle.focus();
}
});
}
});
document.addEventListener("click", (event) => {
dropdowns.forEach((dropdown) => {
const container = findDropdownContainer(dropdown);
const insideDropdown = dropdown.contains(event.target);
const insideContainer = container && container.contains(event.target);
if (!insideDropdown && !insideContainer) closeDropdown(dropdown);
});
});
document.addEventListener("focusin", (event) => {
dropdowns.forEach((dropdown) => {
const container = findDropdownContainer(dropdown);
const insideDropdown = dropdown.contains(event.target);
const insideContainer = container && container.contains(event.target);
const header = dropdown.closest(".site-header");
const insideHeader = header && header.contains(event.target);
if (!insideDropdown && !insideContainer && !insideHeader) closeDropdown(dropdown);
});
});
}
function initHeroCanvas() {
const canvas = document.getElementById("heroCanvas");
if (!canvas) return;
const context = canvas.getContext("2d");
const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const marks = [];
let width = 0;
let height = 0;
let raf = 0;
function resize() {
const ratio = Math.min(window.devicePixelRatio || 1, 2);
width = canvas.clientWidth;
height = canvas.clientHeight;
canvas.width = Math.floor(width * ratio);
canvas.height = Math.floor(height * ratio);
context.setTransform(ratio, 0, 0, ratio, 0, 0);
marks.length = 0;
const count = Math.max(36, Math.floor(width / 26));
for (let index = 0; index < count; index += 1) {
marks.push({
x: Math.random() * width,
y: Math.random() * height,
length: 14 + Math.random() * 60,
speed: 0.12 + Math.random() * 0.42,
tilt: -0.6 + Math.random() * 1.2,
warm: Math.random() > 0.72
});
}
}
function drawGrid() {
context.clearRect(0, 0, width, height);
const theme = document.documentElement.dataset.theme;
const gridColor = theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(21,32,46,0.07)";
const accent = theme === "dark" ? "rgba(53,196,186,0.42)" : "rgba(15,159,154,0.36)";
const warm = theme === "dark" ? "rgba(246,189,96,0.42)" : "rgba(244,168,61,0.38)";
context.strokeStyle = gridColor;
context.lineWidth = 1;
for (let x = 0; x <= width; x += 52) drawLine(x, 0, x, height);
for (let y = 0; y <= height; y += 52) drawLine(0, y, width, y);
context.lineCap = "round";
marks.forEach((mark) => {
mark.y += reducedMotion ? 0 : mark.speed;
mark.x += reducedMotion ? 0 : mark.tilt * 0.15;
if (mark.y > height + 30) mark.y = -30;
if (mark.x < -60) mark.x = width + 60;
if (mark.x > width + 60) mark.x = -60;
context.strokeStyle = mark.warm ? warm : accent;
context.lineWidth = mark.warm ? 2 : 1.5;
drawLine(mark.x, mark.y, mark.x + mark.length, mark.y + mark.tilt * 18);
context.fillStyle = mark.warm ? warm : accent;
context.beginPath();
context.arc(mark.x, mark.y, 2.4, 0, Math.PI * 2);
context.fill();
});
if (!reducedMotion) raf = window.requestAnimationFrame(drawGrid);
}
function drawLine(x1, y1, x2, y2) {
context.beginPath();
context.moveTo(x1, y1);
context.lineTo(x2, y2);
context.stroke();
}
window.requestAnimationFrame(() => {
resize();
drawGrid();
});
let resizeRaf = 0;
window.addEventListener("resize", () => {
if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
resizeRaf = window.requestAnimationFrame(() => {
resizeRaf = 0;
window.cancelAnimationFrame(raf);
resize();
drawGrid();
});
});
document.addEventListener("visibilitychange", () => {
if (document.hidden) {
window.cancelAnimationFrame(raf);
} else if (!reducedMotion) {
window.cancelAnimationFrame(raf);
drawGrid();
}
});
}
function applyPageConversion(pageConversion) {
const slug = currentPageSlug();
const category = categoryMap.get(pageConversion.categoryId);
const fromSelect = byId("fromUnit");
const toSelect = byId("toUnit");
if (!category || !fromSelect || !toSelect) {
return null;
}
const fromUnit = resolveUnitAlias(category, pageConversion.fromUnitId)
|| category.units.find((unit) => unit.id === pageConversion.fromUnitId)
|| category.units[0];
const toUnit = resolveUnitAlias(category, pageConversion.toUnitId)
|| category.units.find((unit) => unit.id === pageConversion.toUnitId)
|| category.units[Math.min(1, category.units.length - 1)]
|| category.units[0];
if (!fromUnit || !toUnit) {
return null;
}
selectCategory(category.id, { remember: false });
populateSelect(fromSelect, category.units, fromUnit.id);
populateSelect(toSelect, category.units, toUnit.id);
state.categoryId = category.id;
state.fromUnitId = fromUnit.id;
state.toUnitId = toUnit.id;
const sourceInput = byId("fromValue");
const targetInput = byId("toValue");
if (sourceInput) sourceInput.value = pageConversion.value || "1";
if (targetInput) targetInput.value = "";
updateConversion();
return pageConversion;
}
function initializeConverterFromPageRegistry() {
const slug = currentPageSlug();
const pageConversion = readSeoConversionData();
if (!pageConversion || !pageConversion.categoryId || !pageConversion.fromUnitId || !pageConversion.toUnitId) {
pageInitPending = false;
return null;
}
const registryLoaded = Boolean(categoryMap && categoryMap.size > 0 && byId("fromUnit") && byId("toUnit"));
if (!registryLoaded) {
pageInitPending = true;
window.requestAnimationFrame(() => {
pageInitPending = false;
initializeConverterFromPageRegistry();
});
return null;
}
pageInitPending = false;
return applyPageConversion(pageConversion);
}
function currentPageSlug() {
const pageData = typeof window !== "undefined" ? window.__seoPageData : null;
const slugFromPageData = pageData && typeof pageData.slug === "string" ? pageData.slug.trim() : "";
if (slugFromPageData) return slugFromPageData;
const container = document.getElementById("seoConverter");
const slugFromContainer = container?.dataset?.slug || "";
if (slugFromContainer) return slugFromContainer;
return inferSlugFromPath(preferredPagePath());
}
function preferredPagePath() {
const canonicalHref = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
const canonicalPath = canonicalHref ? tryParsePathname(canonicalHref) : "";
return canonicalPath || location.pathname || "";
}
function inferSlugFromPath(pathname) {
if (!pathname) return "";
const cleaned = String(pathname).trim();
const parsed = tryParsePathname(cleaned);
const segments = parsed.split("/").filter(Boolean);
if (!segments.length) return "";
const lastSegment = decodeURIComponent(segments[segments.length - 1] || "");
if (lastSegment && lastSegment.toLowerCase() !== "index.html" && lastSegment.toLowerCase() !== "index.htm") {
return lastSegment;
}
for (let index = segments.length - 2; index >= 0; index -= 1) {
const segment = decodeURIComponent(segments[index]);
if (!segment || segment.toLowerCase() === "index.html" || segment.toLowerCase() === "index.htm") continue;
return segment;
}
return lastSegment || "";
}
function tryParsePathname(value) {
if (!value) return "";
try {
const parsed = new URL(value, window.location.href);
return parsed.pathname;
} catch (error) {
return String(value).replace(/^https?:\/\//, "").split("/").slice(1).join("/");
}
}
function initConverterApp() {
const fromValue = document.getElementById("fromValue");
if (!fromValue) return;
const precisionControl = byId("precisionControl");
const notationMode = byId("notationMode");
precisionControl.value = String(state.precision);
notationMode.value = state.notation;
renderCategoryList();
renderOverview();
renderPopularConversions();
renderStoredLists();
const sharedConversion = readSharedConversion();
const pageConversion = initializeConverterFromPageRegistry();
if (pageConversion) {
if (sharedConversion && sharedConversion.categoryId !== pageConversion.categoryId) {
applySharedConversion(sharedConversion);
}
} else if (sharedConversion) {
state.categoryId = sharedConversion.categoryId;
selectCategory(state.categoryId, { remember: false });
applySharedConversion(sharedConversion);
} else if (!pageInitPending) {
selectCategory(state.categoryId, { remember: false });
}
bindConverterEvents();
historyEnabled = true;
}
function bindConverterEvents() {
byId("fromValue").addEventListener("input", updateConversion);
byId("fromUnit").addEventListener("change", (event) => {
state.fromUnitId = event.target.value;
updateConversion();
trackEvent("unit_change", { category: state.categoryId, unit: event.target.value });
trackEvent("unit_selected", { category: state.categoryId, unit: event.target.value, direction: "from" });
});
byId("toUnit").addEventListener("change", (event) => {
state.toUnitId = event.target.value;
updateConversion();
trackEvent("unit_selected", { category: state.categoryId, unit: event.target.value, direction: "to" });
});
byId("swapButton").addEventListener("click", () => {
const fromSelect = byId("fromUnit");
const toSelect = byId("toUnit");
const nextFrom = toSelect.value;
const nextTo = fromSelect.value;
state.fromUnitId = nextFrom;
state.toUnitId = nextTo;
fromSelect.value = nextFrom;
toSelect.value = nextTo;
updateConversion();
trackEvent("swap_units", { category: state.categoryId });
});
byId("copyButton").addEventListener("click", copyResult);
byId("shareButton").addEventListener("click", shareResult);
byId("favoriteButton").addEventListener("click", toggleFavorite);
byId("precisionControl").addEventListener("input", (event) => {
state.precision = clampNumber(Number(event.target.value) || 12, 2, 15);
localStorage.setItem(storageKeys.precision, String(state.precision));
updateConversion();
});
byId("notationMode").addEventListener("change", (event) => {
state.notation = event.target.value;
localStorage.setItem(storageKeys.notation, state.notation);
updateConversion();
});
byId("clearFavorites").addEventListener("click", () => {
writeArray(storageKeys.favorites, []);
renderStoredLists();
updateFavoriteButton();
});
byId("clearRecent").addEventListener("click", () => {
writeArray(storageKeys.recent, []);
renderStoredLists();
});
byId("clearHistory").addEventListener("click", () => {
writeArray(storageKeys.history, []);
renderStoredLists();
});
document.querySelectorAll("[data-select-category]").forEach((button) => {
button.addEventListener("click", () => {
const category = categoryMap.get(button.dataset.selectCategory);
if (category) rememberSearch(category.name, "#converter", category.id);
selectCategory(button.dataset.selectCategory);
scrollToConverter();
});
});
["contextVoltage", "contextCurrent", "contextResistance", "contextHours", "contextDensity"].forEach((id) => {
const input = document.getElementById(id);
if (input) input.addEventListener("input", updateConversion);
});
const unitSearch = byId("unitSearch");
unitSearch.addEventListener("input", () => renderCategoryList(unitSearch.value));
initGlobalSearch();
document.addEventListener("keydown", handleGlobalKeyboard);
// On an individual SEO conversion page, the "Search all units" box above
// the (already single-category) left sidebar is removed entirely, so the
// panel starts directly with the category. The listener above is still
// attached first, then the now-orphaned elements are simply removed from
// the DOM - harmless, and keeps this as one small addition rather than
// restructuring the existing setup code. The homepage (no seo-page body
// class) is completely unaffected; this block does nothing there.
if (document.body && document.body.classList.contains("seo-page")) {
const unitSearchLabel = document.querySelector('label.field-label[for="unitSearch"]');
if (unitSearchLabel) unitSearchLabel.remove();
if (unitSearch) unitSearch.remove();
// The single-category left sidebar leaves a large empty area below the
// one remaining category card. Fill it with an ad placeholder reusing
// the exact same "sidebar-ad" class/markup already used for the right
// sidebar's advertisement, so it matches in style without any new CSS
// file changes - positioning is handled with an inline style on this
// one generated element only.
//
// This must be a SEPARATE grid item, not a child of .category-panel,
// so the category panel's own height stays exactly its content height
// (just the one category card) and never stretches. .tool-layout is a
// 3-column CSS grid (category-panel | converter-panel | activity-panel)
// with default row/column auto-placement; category-panel implicitly
// occupies column 1, row 1, so this new element is explicitly placed
// at column 1, row 2 - directly below it, same column width, as its
// own independent block.
const categoryListEl = document.getElementById("categoryList");
const categoryPanelEl = categoryListEl ? categoryListEl.closest(".category-panel") : null;
const toolLayoutEl = categoryPanelEl ? categoryPanelEl.closest(".tool-layout") : null;
if (toolLayoutEl && categoryPanelEl && !categoryPanelEl.parentElement.classList.contains("category-panel-stack")) {
// .tool-layout uses align-items: start, so a short category-panel simply
// leaves unused grid-cell space below it in row 1 - a sibling explicitly
// placed in "row 2" would land after the ENTIRE row (i.e. below the much
// taller converter-panel), not in that empty space. To actually fill the
// gap directly under the category card, category-panel and the new ad
// are both moved into one small wrapper that takes over category-panel's
// original grid slot and stacks its two children vertically itself.
const stack = document.createElement("div");
stack.className = "category-panel-stack";
stack.style.display = "flex";
stack.style.flexDirection = "column";
stack.style.gap = "1rem";
categoryPanelEl.insertAdjacentElement("beforebegin", stack);
stack.appendChild(categoryPanelEl);

const categorySidebarAd = document.createElement("aside");
categorySidebarAd.className = "sidebar-ad";
categorySidebarAd.setAttribute("data-ad-placement", "category-sidebar");
categorySidebarAd.setAttribute("aria-label", "Category sidebar advertisement placeholder");
categorySidebarAd.style.position = "static";
categorySidebarAd.textContent = getTranslation("sidebar.advertisement", getStoredLanguageCode());
stack.appendChild(categorySidebarAd);

// Height-balance against the main converter card: size the ad so the
// category card + gap + ad together roughly match the converter panel's
// height, capped at the existing .sidebar-ad style's own 280px minimum
// so it never collapses smaller than the site's normal ad slot size.
const converterPanelEl = toolLayoutEl.querySelector(".converter-panel");
if (converterPanelEl) {
requestAnimationFrame(() => {
const converterHeight = converterPanelEl.getBoundingClientRect().height;
const cardHeight = categoryPanelEl.getBoundingClientRect().height;
const gap = 16;
const targetAdHeight = converterHeight - cardHeight - gap;
if (targetAdHeight > 280) {
categorySidebarAd.style.minHeight = `${Math.round(targetAdHeight)}px`;
}
});
}

// Required mobile content order on SEO pages: Category, Converter,
// LEFT sidebar Advertisement, Favorite converters, then the remaining
// activity-panel content (Recently used, Conversion history) - with the
// activity panel's own RIGHT sidebar ad kept as a distinct, separate
// slot (not substituted, not duplicated), moved to the end of that
// panel for mobile only so it doesn't sit between the LEFT ad and
// Favorite converters. Desktop/tablet layout (LEFT ad directly under
// the category card; RIGHT ad at the top of the right sidebar) and the
// homepage are completely unaffected - this only runs on SEO pages, and
// every move is reversed if the viewport goes back above 900px.
//
// CSS `order` alone cannot achieve this: the LEFT ad lives nested inside
// .category-panel-stack (needed so it sits directly under the card on
// desktop - see the wrapper created above), not as a direct sibling of
// .converter-panel/.activity-panel, so `order` on it would have no
// effect relative to them. This does real DOM moves instead, gated by
// matchMedia so it responds correctly to viewport/orientation changes
// in both directions.
const mobileBreakpoint = window.matchMedia("(max-width: 900px)");
const activityPanelEl = toolLayoutEl.querySelector(".activity-panel");
const rightSidebarAdEl = activityPanelEl ? activityPanelEl.querySelector(".sidebar-ad[data-ad-placement=\"sidebar\"]") : null;
function applyMobileAdOrder(isMobile) {
if (isMobile) {
if (converterPanelEl) converterPanelEl.insertAdjacentElement("afterend", categorySidebarAd);
if (activityPanelEl && rightSidebarAdEl) activityPanelEl.appendChild(rightSidebarAdEl);
// DOM order alone was found (by direct measurement) not to be reliable
// here - some existing, unrelated CSS class elsewhere in the stylesheet
// happens to also set a "order" value that collides with these grid
// items, so explicit inline order values are set on all four .tool-layout
// children to guarantee the visual sequence regardless of that. Reset to
// "" (falls back to stylesheet/default) when returning to desktop.
stack.style.order = "1";
if (converterPanelEl) converterPanelEl.style.order = "2";
categorySidebarAd.style.order = "3";
if (activityPanelEl) activityPanelEl.style.order = "4";
} else {
stack.appendChild(categorySidebarAd);
if (activityPanelEl && rightSidebarAdEl) activityPanelEl.insertAdjacentElement("afterbegin", rightSidebarAdEl);
stack.style.order = "";
if (converterPanelEl) converterPanelEl.style.order = "";
categorySidebarAd.style.order = "";
if (activityPanelEl) activityPanelEl.style.order = "";
}
}
applyMobileAdOrder(mobileBreakpoint.matches);
mobileBreakpoint.addEventListener("change", (e) => applyMobileAdOrder(e.matches));

// Tablet-range fix (roughly 901-1160px): the site's own existing CSS at
// this width explicitly pins .converter-panel to grid-column: 1, but
// .category-panel-stack (holding the category card + LEFT ad) has no
// matching explicit placement, so it auto-places into that SAME column,
// stacking above the converter rather than using the second (~240-280px)
// column that rule defines but never assigns anything to - leaving it
// empty while the LEFT ad (sized to match the converter's height) renders
// as a huge block above everything. This does not touch that existing
// CSS; it only adds explicit placement for this breakpoint via inline
// styles, reverted when the viewport leaves this range.
const tabletBreakpoint = window.matchMedia("(min-width: 901px) and (max-width: 1160px)");
function applyTabletAdLayout(isTablet) {
if (isTablet) {
toolLayoutEl.insertBefore(categorySidebarAd, activityPanelEl);
// Category comes first (row 1, full width), then Converter + LEFT ad
// side-by-side in row 2.
categoryPanelEl.parentElement.style.gridColumn = "1 / -1";
categoryPanelEl.parentElement.style.gridRow = "1";
if (converterPanelEl) converterPanelEl.style.gridRow = "2";
categorySidebarAd.style.gridColumn = "2";
categorySidebarAd.style.gridRow = "2";
if (activityPanelEl) activityPanelEl.style.gridRow = "3";
} else if (!mobileBreakpoint.matches) {
stack.appendChild(categorySidebarAd);
categorySidebarAd.style.gridColumn = "";
categorySidebarAd.style.gridRow = "";
if (converterPanelEl) converterPanelEl.style.gridRow = "";
categoryPanelEl.parentElement.style.gridColumn = "";
categoryPanelEl.parentElement.style.gridRow = "";
if (activityPanelEl) activityPanelEl.style.gridRow = "";
}
}
applyTabletAdLayout(tabletBreakpoint.matches);
tabletBreakpoint.addEventListener("change", (e) => applyTabletAdLayout(e.matches));

// Visually remove the "Converter" kicker label and the category-name
// heading (e.g. "Mass/Weight Converter") above the converter description,
// on SEO pages only. These elements are hidden, not removed from the
// DOM: selectCategory() writes to both via textContent on every category
// change, and removing them outright would throw the same kind of
// null-reference error found and fixed earlier for the unit-search
// input. Hiding still lets the description sit directly at the top of
// the panel with no leftover gap, since a display:none element takes no
// layout space.
const activeCategoryKindEl = document.getElementById("activeCategoryKind");
const activeCategoryNameEl = document.getElementById("activeCategoryName");
if (activeCategoryKindEl) activeCategoryKindEl.style.display = "none";
if (activeCategoryNameEl) activeCategoryNameEl.style.display = "none";
}
}
}
function handleGlobalKeyboard(event) {
if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
const target = event.target;
const isTyping = target && (
target.isContentEditable ||
["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
);
if (event.key === "/" && !isTyping) {
event.preventDefault();
const search = byId("globalSearch");
if (search) search.focus();
return;
}
if (event.key.toLowerCase() === "s" && !isTyping) {
event.preventDefault();
const swapButton = byId("swapButton");
if (swapButton) swapButton.click();
}
}
function byId(id) {
return document.getElementById(id);
}
function renderCategoryList(filter = "") {
const list = byId("categoryList");
if (!list) return;
const lang = getStoredLanguageCode();
const unitsLabel = getTranslation("categories.unitsLabel", lang);
const matches = filterCategories(filter);
list.innerHTML = "";
matches.forEach((category) => {
const button = document.createElement("button");
button.type = "button";
button.className = category.id === state.categoryId ? "active" : "";
button.innerHTML = `
<span class="category-row">
<span class="category-icon" aria-hidden="true">${escapeHtml(iconFor(category.id))}</span>
<span>
<span class="category-name">${escapeHtml(getCategoryDisplayName(category))}</span>
<span class="category-meta">${category.units.length.toLocaleString("en-US")} ${escapeHtml(unitsLabel)}</span>
</span>
</span>
`;
button.addEventListener("click", () => selectCategory(category.id));
list.appendChild(button);
});
if (!matches.length) {
list.innerHTML = `<p class="empty-state">${escapeHtml(getTranslation("sidebar.noMatchingConverter", lang))}</p>`;
}
}
function renderOverview() {
const overviewGrid = byId("overviewGrid");
if (!overviewGrid) return;
const lang = getStoredLanguageCode();
const unitsLabel = getTranslation("categories.unitsLabel", lang);
const pagesLabel = getTranslation("categories.conversionPagesLabel", lang);
overviewGrid.innerHTML = categories.map((category) => {
const unitCount = category.units.length.toLocaleString("en-US");
const pageCount = conversionPageCountFor(category.id).toLocaleString("en-US");
const href = categoryPageUrl(category.id);
const displayName = getCategoryDisplayName(category);
const displayDescription = getCategoryDisplayDescription(category);
return `
<a class="overview-card" href="${escapeAttribute(href)}" aria-label="${escapeAttribute(displayName)}: ${unitCount} ${escapeAttribute(unitsLabel)}, ${pageCount} ${escapeAttribute(pagesLabel)}">
<span class="overview-icon" aria-hidden="true">${escapeHtml(iconFor(category.id))}</span>
<h3>${escapeHtml(displayName)}</h3>
<p>${escapeHtml(displayDescription)}</p>
<div class="unit-chips">
<span>${unitCount} ${escapeHtml(unitsLabel)}</span>
<span>${pageCount} ${escapeHtml(pagesLabel)}</span>
</div>
</a>
`;
}).join("");
}
function renderPopularConversions() {
const grid = byId("popularGrid");
if (!grid) return;
const generated = [
...popularConversions,
...seoConversions
.filter((item) => !popularConversions.some((popular) => popular.slug === item.slug))
.map((item) => ({ name: item.title, displayName: item.title, category: item.categoryId, from: item.from, to: item.to, value: "1", slug: item.slug }))
];
grid.innerHTML = generated.map((item) => {
const resolved = resolveConversionRoute(item);
if (!resolved) return "";
const { category, from, to, href, value } = resolved;
const sampleAmount = Number.isFinite(parseInput(value)) ? parseInput(value) : 1;
const sample = convert(category, sampleAmount, from, to);
const lang = getStoredLanguageCode();
const englishName = item.displayName || item.name;
const localizedName = lang === DEFAULT_LANGUAGE_CODE
? englishName
: (fillTemplateSafe(getTranslation("homepage.popularConversionTemplate", lang), { FROM: getUnitDisplayName(from), TO: getUnitDisplayName(to) }) || englishName);
return `
<a href="${escapeAttribute(href)}" data-conversion-name="${escapeAttribute(item.name)}" data-route="${escapeAttribute(href)}" data-category="${escapeAttribute(category.id)}" data-from="${escapeAttribute(from.id)}" data-to="${escapeAttribute(to.id)}">
<span>${escapeHtml(localizedName)}</span>
<strong>${formatNumber(sampleAmount)} ${escapeHtml(from.symbol)} = ${sample.ok ? formatNumber(sample.value) : ""} ${escapeHtml(to.symbol)}</strong>
<small>${escapeHtml(getCategoryDisplayName(category))}</small>
</a>
`;
}).join("");
grid.querySelectorAll("a").forEach((link) => {
link.addEventListener("click", () => {
debugConversionRoute("popular_conversion_click", {
name: link.dataset.conversionName,
generatedUrl: link.getAttribute("href"),
targetRoute: "/converter",
category: link.dataset.category,
fromUnit: link.dataset.from,
toUnit: link.dataset.to
});
rememberSearch(link.querySelector("span")?.textContent || "Conversion page", link.getAttribute("href") || "#popular", link.dataset.category || "");
trackEvent("popular_conversion_click", {
name: link.dataset.conversionName,
route: link.dataset.route,
category: link.dataset.category,
from: link.dataset.from,
to: link.dataset.to
});
});
});
}
/* -------------------------------------------------------------------- *
 * Global site-wide search
 *
 * Loads /search-index.json (built by generate_search_index.py from the
 * SEO conversion registry + static page list, so it covers every
 * searchable page on the site) exactly once, then searches entirely
 * client-side against that in-memory array. Debounced, keyboard
 * navigable, ranked (never alphabetical).
 * -------------------------------------------------------------------- */
const searchState = {
loadPromise: null,
records: [],
activeIndex: -1,
currentResults: [],
debounceTimer: null
};
const SEARCH_DEBOUNCE_MS = 150;
const SEARCH_MAX_RESULTS = 15;
const SEARCH_DROPDOWN_GAP = 6; // px gap between the search field and the dropdown

/**
 * Keeps the #searchResults dropdown pinned directly beneath #globalSearch,
 * sized to fit whatever viewport space is available, and immune to
 * clipping from ancestors such as .hero (which uses overflow:hidden for
 * its background canvas). The dropdown is portaled to <body> the first
 * time this runs and positioned with position:fixed, so it always paints
 * above the rest of the page regardless of where it lives in the DOM.
 */
function positionSearchDropdown() {
const results = byId("searchResults");
const input = byId("globalSearch");
if (!results || !input) return;
if (results.parentElement !== document.body) {
document.body.appendChild(results);
}
const rect = input.getBoundingClientRect();
const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
const spaceBelow = viewportHeight - rect.bottom - SEARCH_DROPDOWN_GAP - 8;
const spaceAbove = rect.top - SEARCH_DROPDOWN_GAP - 8;
const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow;
const available = Math.max(160, openUpward ? spaceAbove : spaceBelow);
results.style.left = `${rect.left}px`;
results.style.width = `${rect.width}px`;
results.style.maxHeight = `${Math.min(available, 600)}px`;
if (openUpward) {
results.style.top = "";
results.style.bottom = `${viewportHeight - rect.top + SEARCH_DROPDOWN_GAP}px`;
} else {
results.style.bottom = "";
results.style.top = `${rect.bottom + SEARCH_DROPDOWN_GAP}px`;
}
}

function trackSearchDropdownPosition() {
positionSearchDropdown();
window.addEventListener("scroll", positionSearchDropdown, true);
window.addEventListener("resize", positionSearchDropdown);
}

function untrackSearchDropdownPosition() {
window.removeEventListener("scroll", positionSearchDropdown, true);
window.removeEventListener("resize", positionSearchDropdown);
}

function loadSearchIndex() {
if (searchState.loadPromise) return searchState.loadPromise;
searchState.loadPromise = fetch(`${rootRelativePrefix()}search-index.json`)
.then((response) => {
if (!response.ok) throw new Error(`search-index.json ${response.status}`);
return response.json();
})
.then((data) => {
searchState.records = Array.isArray(data) ? data : [];
return searchState.records;
})
.catch((error) => {
console.error("Failed to load search index:", error);
searchState.records = [];
return searchState.records;
});
return searchState.loadPromise;
}

function normalizeSearchText(text) {
return String(text || "").toLowerCase().trim();
}

/* Ranking, lowest number wins (never alphabetical):
   1 exact title, 2 exact slug, 3 exact unit (from/to), 4 alias match,
   5 partial match, 6 keyword match. */
function scoreSearchRecord(record, termLower) {
if (!termLower) return null;
const title = normalizeSearchText(record.title);
const slug = normalizeSearchText(record.slug);
const from = normalizeSearchText(record.from);
const to = normalizeSearchText(record.to);
const category = normalizeSearchText(record.category);
const aliases = (record.aliases || []).map(normalizeSearchText);
const keywords = (record.keywords || []).map(normalizeSearchText);

if (title === termLower) return { rank: 1, field: "title" };
if (slug === termLower || slug.replace(/-/g, " ") === termLower) return { rank: 2, field: "slug" };
if (from === termLower || to === termLower) return { rank: 3, field: "unit" };
if (aliases.some((alias) => alias === termLower)) return { rank: 4, field: "alias" };

const titleWords = title.split(/\s+/);
if (titleWords.some((word) => word === termLower)) return { rank: 3, field: "title" };
if (title.includes(termLower)) return { rank: 5, field: "title" };
if (slug.includes(termLower.replace(/\s+/g, "-"))) return { rank: 5, field: "slug" };
if (from.includes(termLower) || to.includes(termLower)) return { rank: 5, field: "unit" };
if (category === termLower) return { rank: 3, field: "category" };
if (aliases.some((alias) => alias.includes(termLower))) return { rank: 5, field: "alias" };
if (category.includes(termLower)) return { rank: 5, field: "category" };
if (keywords.some((keyword) => keyword === termLower)) return { rank: 6, field: "keyword" };
if (keywords.some((keyword) => keyword.includes(termLower))) return { rank: 6, field: "keyword" };

return null;
}

function searchIndexRecords(term) {
const termLower = normalizeSearchText(term);
if (!termLower) return [];
const scored = [];
for (const record of searchState.records) {
const match = scoreSearchRecord(record, termLower);
if (match) scored.push({ record, rank: match.rank, field: match.field });
}
scored.sort((a, b) => {
if (a.rank !== b.rank) return a.rank - b.rank;
const lenDiff = a.record.title.length - b.record.title.length;
if (lenDiff !== 0) return lenDiff;
return a.record.title.localeCompare(b.record.title);
});
return scored.slice(0, SEARCH_MAX_RESULTS);
}

function highlightMatch(text, term) {
const safeText = escapeHtml(text || "");
const termTrimmed = (term || "").trim();
if (!termTrimmed) return safeText;
const safeTerm = escapeHtml(termTrimmed).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = new RegExp(`(${safeTerm})`, "ig");
return safeText.replace(pattern, "<mark>$1</mark>");
}

function categorySubtitleFor(record) {
if (record.category === "Home" || record.category === "Tools" || record.category === "About") {
return record.category;
}
if (!record.from && !record.to) return `${record.category} \u2022 Category`;
return `${record.category} \u2022 SEO converter`;
}

function renderSearchResults(query) {
const results = byId("searchResults");
const input = byId("globalSearch");
if (!results || !input) return;
const term = query.trim();
searchState.activeIndex = -1;
if (!term) {
results.innerHTML = "";
results.classList.remove("active");
untrackSearchDropdownPosition();
searchState.currentResults = [];
input.removeAttribute("aria-activedescendant");
input.setAttribute("aria-expanded", "false");
return;
}
loadSearchIndex().then(() => {
const matches = searchIndexRecords(term);
searchState.currentResults = matches;
results.innerHTML = "";
if (!matches.length) {
results.innerHTML = `<button type="button" disabled>${escapeHtml(getTranslation("homepage.noMatchingConversionFound", getStoredLanguageCode()))}</button>`;
results.classList.add("active");
input.setAttribute("aria-expanded", "true");
trackSearchDropdownPosition();
return;
}
matches.forEach((match, index) => {
const record = match.record;
const isCategoryPage = !record.from && !record.to && record.category !== "Home" && record.category !== "Tools" && record.category !== "About" && record.category !== "Guides";
const el = document.createElement(record.url.startsWith("#") ? "button" : "a");
el.id = `searchResultOption-${index}`;
el.setAttribute("role", "option");
if (el.tagName === "A") {
el.href = record.url;
} else {
el.type = "button";
}
el.innerHTML = `
<span class="search-result-row">
<span class="search-result-title">${highlightMatch(record.title, term)}</span>
<span class="search-result-badge">${escapeHtml(record.category)}</span>
</span>
<span class="search-result-meta">${escapeHtml(categorySubtitleFor(record))}</span>
`;
el.addEventListener("click", (event) => {
rememberSearch(record.title, record.url, isCategoryPage ? record.slug : "");
if (isCategoryPage && categoryMap.has(record.slug)) {
event.preventDefault();
selectCategory(record.slug);
scrollToConverter();
}
input.value = "";
results.classList.remove("active");
untrackSearchDropdownPosition();
input.setAttribute("aria-expanded", "false");
});
results.appendChild(el);
});
results.classList.add("active");
input.setAttribute("aria-expanded", "true");
trackSearchDropdownPosition();
});
}

function setActiveSearchResult(index) {
const results = byId("searchResults");
const input = byId("globalSearch");
if (!results || !input) return;
const options = Array.from(results.querySelectorAll('[role="option"]'));
if (!options.length) return;
options.forEach((option) => option.classList.remove("active"));
const clamped = ((index % options.length) + options.length) % options.length;
searchState.activeIndex = clamped;
const active = options[clamped];
active.classList.add("active");
if (typeof active.scrollIntoView === "function") {
active.scrollIntoView({ block: "nearest" });
}
input.setAttribute("aria-activedescendant", active.id);
}

function initGlobalSearch() {
const globalSearch = byId("globalSearch");
const searchResults = byId("searchResults");
if (!globalSearch || !searchResults) return;
globalSearch.setAttribute("role", "combobox");
globalSearch.setAttribute("aria-autocomplete", "list");
globalSearch.setAttribute("aria-expanded", "false");
globalSearch.setAttribute("aria-controls", "searchResults");
searchResults.setAttribute("role", "listbox");
loadSearchIndex();

const debouncedRender = (value) => {
clearTimeout(searchState.debounceTimer);
searchState.debounceTimer = setTimeout(() => renderSearchResults(value), SEARCH_DEBOUNCE_MS);
};

globalSearch.addEventListener("input", () => debouncedRender(globalSearch.value));
globalSearch.addEventListener("focus", () => {
if (globalSearch.value.trim()) renderSearchResults(globalSearch.value);
});
globalSearch.addEventListener("keydown", (event) => {
const options = () => Array.from(searchResults.querySelectorAll('[role="option"]'));
if (event.key === "ArrowDown") {
event.preventDefault();
if (!options().length) return;
setActiveSearchResult(searchState.activeIndex + 1);
} else if (event.key === "ArrowUp") {
event.preventDefault();
if (!options().length) return;
setActiveSearchResult(searchState.activeIndex - 1);
} else if (event.key === "Enter") {
const items = options();
if (searchState.activeIndex >= 0 && items[searchState.activeIndex]) {
event.preventDefault();
items[searchState.activeIndex].click();
}
} else if (event.key === "Escape") {
clearTimeout(searchState.debounceTimer);
globalSearch.value = "";
searchResults.innerHTML = "";
searchResults.classList.remove("active");
untrackSearchDropdownPosition();
globalSearch.setAttribute("aria-expanded", "false");
searchState.activeIndex = -1;
} else if (event.key === "Tab") {
searchResults.classList.remove("active");
untrackSearchDropdownPosition();
globalSearch.setAttribute("aria-expanded", "false");
}
});
document.addEventListener("click", (event) => {
// searchResults is portaled to <body> (see positionSearchDropdown), so it's
// no longer a DOM descendant of .hero-search — check both explicitly.
if (!event.target.closest(".hero-search") && !event.target.closest("#searchResults")) {
searchResults.classList.remove("active");
untrackSearchDropdownPosition();
globalSearch.setAttribute("aria-expanded", "false");
}
});
}
function conversionPageCountFor(id) {
const counts = {
length: 1981, area: 1261, volume: 4693, weight: 1561, temperature: 57, time: 1123, speed: 1191,
pressure: 1191, energy: 1123, power: 871, force: 871, torque: 813, electricity: 40603, frequency: 813,
digital: 553, angle: 57, density: 166057, flow: 102081, fuel_economy: 43, radiation: 2863, chemistry: 4291,
agriculture: 9121, cooking: 343, astronomy: 211, engineering: 24807, scientific: 2257, currency: 23871
};
return counts[id] || 0;
}
function categoryPageUrl(id) {
const slugs = { flow: "flow-rate", fuel_economy: "fuel-economy" };
return `/${slugs[id] || id}/`;
}
function iconFor(id) {
const icons = {
length: "m",
area: "m2",
volume: "L",
weight: "kg",
temperature: "C/F",
time: "h",
speed: "km/h",
pressure: "Pa",
energy: "J",
power: "W",
force: "N",
torque: "Nm",
electricity: "V",
frequency: "Hz",
digital: "GB",
angle: "deg",
density: "rho",
flow: "L/s",
fuel_economy: "mpg",
radiation: "Sv",
chemistry: "mol",
agriculture: "ha",
cooking: "cup",
astronomy: "AU",
engineering: "psi",
scientific: "SI",
currency: "USD"
};
return icons[id] || "U";
}
function seoPageRestrictedCategoryId() {
if (!document.body || !document.body.classList.contains("seo-page")) return null;
const idForSlug = { "flow-rate": "flow", "fuel-economy": "fuel_economy" };
const crumbLinks = document.querySelectorAll(".breadcrumb a[href]");
for (const a of crumbLinks) {
const href = a.getAttribute("href") || "";
const match = href.match(/^\/([a-z0-9-]+)\/?$/i);
if (!match) continue;
const candidate = idForSlug[match[1]] || match[1];
if (categoryMap.has(candidate)) return candidate;
}
return null;
}
function filterCategories(filter) {
const term = filter.trim().toLowerCase();
const restrictedId = seoPageRestrictedCategoryId();
const baseList = restrictedId ? categories.filter((c) => c.id === restrictedId) : categories;
if (!term) return baseList;
return baseList.filter((category) => {
const categoryText = `${category.name} ${category.description} ${category.id}`.toLowerCase();
return categoryText.includes(term) || category.units.some((item) => searchableUnitText(item).includes(term));
});
}
function searchableUnitText(item) {
return `${item.id} ${item.name} ${item.symbol} ${(item.aliases || []).join(" ")} ${(item.synonyms || []).join(" ")} ${item.definition}`.toLowerCase();
}
function categoryKindLabel(category) {
const lang = getStoredLanguageCode();
if (category.type === "currency") return getTranslation("converter.kindCurrency", lang);
if (category.type === "electricity") return getTranslation("converter.kindElectricity", lang);
return getTranslation("converter.kindDefault", lang);
}
// Shared by selectCategory() (initial/explicit category selection) and
// refreshLanguageAwareConverter() (a later language switch) so the SEO
// page breadcrumb's 2nd link (this page's own category, e.g. "Area")
// never lags behind #activeCategoryName - calling it from only one of
// the two left it showing the state.categoryId default ("Length",
// categories[0]) on initial SEO page load until the next language
// switch, since selectCategory() runs before this file's language state
// is otherwise touched. Same English-keeps-its-own-short-label reasoning
// already established for the header's Categories dropdown: English
// restores NAV_CATEGORIES' own short label (matching this breadcrumb's
// original static text), every other language uses getCategoryDisplayName()
// (the same authoritative i18n-seo short name used everywhere else). The
// breadcrumb's href is never touched, so seoPageRestrictedCategoryId()/
// the SEO route/canonical URL are unaffected. The homepage has no
// .breadcrumb element, so this is a no-op there.
function updateSeoBreadcrumbCategory(category) {
const breadcrumbCategoryLink = document.querySelectorAll(".breadcrumb a")[1];
if (!breadcrumbCategoryLink) return;
if (typeof currentLanguageCode === "undefined" || currentLanguageCode === DEFAULT_LANGUAGE_CODE) {
const navEntry = NAV_CATEGORIES.find((nc) => nc.catId === category.id);
if (navEntry) breadcrumbCategoryLink.textContent = navEntry.label;
} else {
breadcrumbCategoryLink.textContent = getCategoryDisplayName(category);
}
}
function selectCategory(categoryId, options = {}) {
const category = categoryMap.get(categoryId) || categories[0];
const remember = options.remember !== false;
state.categoryId = category.id;
state.fromUnitId = category.defaultFrom || category.units[0].id;
state.toUnitId = category.defaultTo || category.units[Math.min(1, category.units.length - 1)].id;
byId("activeCategoryName").textContent = getCategoryDisplayName(category);
byId("activeCategoryDescription").textContent = getCategoryDisplayDescription(category);
byId("activeCategoryKind").textContent = categoryKindLabel(category);
updateSeoBreadcrumbCategory(category);
populateSelect(byId("fromUnit"), category.units, state.fromUnitId);
populateSelect(byId("toUnit"), category.units, state.toUnitId);
updateContextPanel(category);
renderCategoryList(byId("unitSearch")?.value || "");
updateFavoriteButton();
updateConversion();
if (remember) {
rememberRecent(category.id);
renderStoredLists();
trackEvent("select_category", { category: category.id });
trackEvent("category_opened", { category: category.id, category_name: category.name });
}
}
function populateSelect(select, units, selectedId) {
select.innerHTML = units.map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(getUnitDisplayName(item))} (${escapeHtml(item.symbol)})</option>`).join("");
select.value = selectedId;
}
function updateContextPanel(category) {
const panel = byId("contextPanel");
const help = byId("contextHelp");
if (!panel) return;
if (category.type !== "electricity") {
panel.hidden = true;
return;
}
panel.hidden = false;
panel.dataset.mode = "electricity";
help.textContent = getTranslation("converter.contextHelpElectricity", getStoredLanguageCode());
}
const UNCOUNTABLE_UNIT_WORDS = new Set([
"water", "mercury", "celsius", "fahrenheit", "kelvin", "rankine", "delisle", "newton", "reaumur", "romer"
]);
const CATEGORY_CONVERSION_TAIL = {
length: "using the exact conversion factor",
area: "using the exact conversion factor",
volume: "using the appropriate conversion factor",
weight: "using the exact international conversion factor",
time: "using the exact conversion factor",
speed: "using the exact conversion factor",
pressure: "using the exact conversion factor",
energy: "using the exact conversion factor",
power: "using the appropriate conversion factor",
force: "using the exact conversion factor",
torque: "using the exact conversion factor",
frequency: "using the exact conversion factor",
digital: "using the exact conversion factor",
angle: "using the exact conversion factor",
density: "using the applicable density conversion factor",
flow: "using the applicable flow rate conversion factor"
};
// Maps each category id to the i18n-seo `chrome.<key>` lookup that holds
// the translated version of its CATEGORY_CONVERSION_TAIL string above -
// one key per distinct English tail phrase actually used there, so
// categories that share the same English tail also share one translated
// string instead of needing 16 separate near-duplicate entries per
// language.
const CATEGORY_CONVERSION_TAIL_KEYS = {
length: "tail_exact_factor",
area: "tail_exact_factor",
volume: "tail_appropriate_factor",
weight: "tail_exact_international_factor",
time: "tail_exact_factor",
speed: "tail_exact_factor",
pressure: "tail_exact_factor",
energy: "tail_exact_factor",
power: "tail_appropriate_factor",
force: "tail_exact_factor",
torque: "tail_exact_factor",
frequency: "tail_exact_factor",
digital: "tail_exact_factor",
angle: "tail_exact_factor",
density: "tail_density_factor",
flow: "tail_flow_factor"
};
function pluralizeWord(word) {
if (!word) return word;
const lower = word.toLowerCase();
const irregularPlurals = { foot: "feet", tooth: "teeth", datum: "data" };
if (irregularPlurals[lower]) {
const plural = irregularPlurals[lower];
const isCapitalized = word.charAt(0) === word.charAt(0).toUpperCase();
return isCapitalized ? plural.charAt(0).toUpperCase() + plural.slice(1) : plural;
}
if (/[sxz]$/.test(lower) || /(ch|sh)$/.test(lower)) return `${word}es`;
if (/[^aeiou]y$/.test(lower)) return `${word.slice(0, -1)}ies`;
return `${word}s`;
}
function pluralizeUnitName(unit) {
const name = typeof unit === "string" ? unit : unit && unit.name;
if (!name) return name;
if (name.includes("/")) return name;
const symbol = typeof unit === "object" && unit ? unit.symbol : null;
if (symbol && name.toLowerCase() === symbol.toLowerCase()) return name;
const perIndex = name.indexOf(" per ");
if (perIndex !== -1) return `${pluralizeUnitName(name.slice(0, perIndex))}${name.slice(perIndex)}`;
const ofIndex = name.indexOf(" of ");
if (ofIndex !== -1) return `${pluralizeUnitName(name.slice(0, ofIndex))}${name.slice(ofIndex)}`;
const match = name.match(/^(.*?)([A-Za-z]+)$/);
if (!match) return name;
const prefix = match[1];
const lastWord = match[2];
const lowerLastWord = lastWord.toLowerCase();
if (UNCOUNTABLE_UNIT_WORDS.has(lowerLastWord) || lowerLastWord.endsWith("s")) return name;
return `${prefix}${pluralizeWord(lastWord)}`;
}
// Builds the localized version of the "Convert X (sym) to Y (sym) using
// ..." sentence frame from the existing Phase 3 i18n-seo `chrome` template
// data, reusing the exact fillTemplateSafe()/{PLACEHOLDER} mechanism the
// FAQ translations already use (see translateFaqItems() above) rather than
// inventing a second translation mechanism. Returns null - never a
// partially-translated string - whenever the current language's JSON
// doesn't yet carry the sentence-frame template or this specific tail key,
// so buildConversionDescription() always has a complete English sentence
// to fall back to (the same graceful-degradation contract every other
// getXDisplayY()/translate*() lookup in this file already follows).
function localizedConversionDescription(tailKey, vars) {
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return null;
const seoData = currentSeoData();
const chrome = seoData && seoData.chrome;
if (!chrome || !chrome.convert_description_template) return null;
const tail = chrome[tailKey];
if (!tail) return null;
return fillTemplateSafe(chrome.convert_description_template, Object.assign({}, vars, { TAIL: tail }));
}
// Same fillTemplateSafe()/chrome.* mechanism as localizedConversionDescription()
// above, reused (not duplicated) for the #formulaText value shown in the
// definition panel. Returns null - never a partially-translated string -
// whenever the language is English or the current language's JSON doesn't
// yet carry the requested chrome.formula_* key, so every caller always has
// a complete English fallback string to use instead.
function localizedFormula(key, vars) {
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return null;
const seoData = currentSeoData();
const chrome = seoData && seoData.chrome;
if (!chrome || !chrome[key]) return null;
return vars ? fillTemplateSafe(chrome[key], vars) : chrome[key];
}

// Localized version of the generic "Result = <amount> x <factor> /
// <factor>." formula line. amountText is either a formatted numeric amount
// (formatNumber(amount), already typed by the visitor) or the translated
// word for "input" (chrome.formula_input_word) when nothing has been typed
// yet - both share the same chrome.formula_factor_template so only one
// template key is needed for both call sites. Numbers/factors themselves
// are never translated, matching every other numeric value in this file.
function localizedFactorFormula(amountText, fromFactor, toFactor) {
const localized = localizedFormula("formula_factor_template", { AMOUNT: amountText, FROM_FACTOR: compactNumber(fromFactor), TO_FACTOR: compactNumber(toFactor) });
return localized || `Result = ${amountText} x ${compactNumber(fromFactor)} / ${compactNumber(toFactor)}.`;
}
function localizedInputWord() {
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return "input";
const seoData = currentSeoData();
const chrome = seoData && seoData.chrome;
return (chrome && chrome.formula_input_word) || "input";
}
function buildConversionDescription(category, fromUnit, toUnit) {
if (!category) return "";
if (!fromUnit || !toUnit) return getCategoryDisplayDescription(category);
if (category.type === "temperature") {
const fromLabel = fromUnit.id === "kelvin" ? fromUnit.symbol : `\u00b0${fromUnit.symbol}`;
const toLabel = toUnit.id === "kelvin" ? toUnit.symbol : `\u00b0${toUnit.symbol}`;
const fromName = getUnitDisplayName(fromUnit);
const toName = getUnitDisplayName(toUnit);
const localized = localizedConversionDescription("tail_temperature_formula", { FROM: fromName, FROM_SYMBOL: fromLabel, TO: toName, TO_SYMBOL: toLabel });
return localized || `Convert ${fromName} (${fromLabel}) to ${toName} (${toLabel}) using the standard temperature conversion formula.`;
}
if (category.type === "currency") {
const fromName = pluralizeUnitDisplayName(fromUnit);
const toName = pluralizeUnitDisplayName(toUnit);
const localized = localizedConversionDescription("tail_currency_rates", { FROM: fromName, FROM_SYMBOL: fromUnit.id, TO: toName, TO_SYMBOL: toUnit.id });
return localized || `Convert ${fromName} (${fromUnit.id}) to ${toName} (${toUnit.id}) using current exchange rates.`;
}
if (category.type === "fuel") {
const fromName = getUnitDisplayName(fromUnit);
const toName = getUnitDisplayName(toUnit);
const localized = localizedConversionDescription("tail_fuel_formula", { FROM: fromName, FROM_SYMBOL: fromUnit.symbol, TO: toName, TO_SYMBOL: toUnit.symbol });
return localized || `Convert ${fromName} (${fromUnit.symbol}) to ${toName} (${toUnit.symbol}) using the fuel economy conversion formula.`;
}
if (category.type === "electricity") {
const fromName = pluralizeUnitDisplayName(fromUnit);
const toName = pluralizeUnitDisplayName(toUnit);
const localized = localizedConversionDescription("tail_electrical_factor", { FROM: fromName, FROM_SYMBOL: fromUnit.symbol, TO: toName, TO_SYMBOL: toUnit.symbol });
return localized || `Convert ${fromName} (${fromUnit.symbol}) to ${toName} (${toUnit.symbol}) using the applicable electrical conversion factor.`;
}
if (category.type === "multi") {
const fromName = pluralizeUnitDisplayName(fromUnit);
const toName = pluralizeUnitDisplayName(toUnit);
const localized = localizedConversionDescription("tail_applicable_factor", { FROM: fromName, FROM_SYMBOL: fromUnit.symbol, TO: toName, TO_SYMBOL: toUnit.symbol });
return localized || `Convert ${fromName} (${fromUnit.symbol}) to ${toName} (${toUnit.symbol}) using the applicable conversion factor for these units.`;
}
const tailKey = CATEGORY_CONVERSION_TAIL_KEYS[category.id] || "tail_exact_factor";
const tail = CATEGORY_CONVERSION_TAIL[category.id] || "using the exact conversion factor";
const fromName = pluralizeUnitDisplayName(fromUnit);
const toName = pluralizeUnitDisplayName(toUnit);
const localized = localizedConversionDescription(tailKey, { FROM: fromName, FROM_SYMBOL: fromUnit.symbol, TO: toName, TO_SYMBOL: toUnit.symbol });
return localized || `Convert ${fromName} (${fromUnit.symbol}) to ${toName} (${toUnit.symbol}) ${tail}.`;
}
function updateActiveCategoryDescription(category, fromUnit, toUnit) {
const node = byId("activeCategoryDescription");
if (!node || !category) return;
node.textContent = buildConversionDescription(category, fromUnit, toUnit);
}
function updateConversion() {
const category = categoryMap.get(state.categoryId);
const amount = parseInput(byId("fromValue").value);
const from = getUnit(category, byId("fromUnit").value);
const to = getUnit(category, byId("toUnit").value);
state.fromUnitId = from.id;
state.toUnitId = to.id;
updateActiveCategoryDescription(category, from, to);
const note = byId("conversionNote");
const output = byId("toValue");
const resultText = byId("resultText");
if (!Number.isFinite(amount)) {
output.value = "";
resultText.textContent = getTranslation("converter.enterValue", currentLanguageCode);
note.textContent = getTranslation("converter.useDecimalNotation", currentLanguageCode);
updateDefinitionPanel(category, from, to, null);
return;
}
const result = convert(category, amount, from, to);
if (!result.ok) {
output.value = "";
resultText.textContent = result.message;
note.textContent = result.note || getCategoryDisplayNote(category) || getTranslation("messages.needCompatibleUnitsNote", currentLanguageCode);
updateDefinitionPanel(category, from, to, result);
return;
}
const formatted = formatNumber(result.value);
output.value = formatted;
resultText.textContent = `${formatNumber(amount)} ${getUnitDisplayName(from)} = ${formatted} ${getUnitDisplayName(to)}`;
note.textContent = result.note || getCategoryDisplayNote(category) || getTranslation("messages.resultsUpdateNote", currentLanguageCode);
updateDefinitionPanel(category, from, to, result);
scheduleHistoryRecord(category, amount, from, result.value, to);
}
function updateDefinitionPanel(category, from, to, result) {
const fromDefinition = byId("fromDefinition");
if (!fromDefinition) return;
byId("fromDefinition").textContent = getUnitDisplayDefinition(from) || `${getUnitDisplayName(from)} definition.`;
byId("toDefinition").textContent = getUnitDisplayDefinition(to) || `${getUnitDisplayName(to)} definition.`;
byId("formulaText").textContent = result && result.formula
? result.formula
: formulaFor(category, from, to);
}
function formulaFor(category, from, to) {
if (category.type === "temperature") return localizedFormula("formula_temperature") || "Convert the source temperature to Kelvin, then convert Kelvin to the target scale.";
if (category.type === "fuel") return localizedFormula("formula_fuel") || "Normalize fuel economy to distance per volume, inverting consumption units when needed.";
if (category.type === "multi" && from.dimension !== to.dimension) return localizedFormula("formula_multi_cross") || "Choose units from the same measurement family for a direct conversion.";
if (category.type === "electricity" && from.dimension !== to.dimension) return localizedFormula("formula_electricity_cross") || "Use Ohm's law and energy over time: V = I x R, P = V x I, E = P x time.";
return localizedFactorFormula(localizedInputWord(), from.factor, to.factor);
}
function parseInput(value) {
if (typeof value !== "string") return NaN;
const normalized = value.replace(/,/g, "").trim();
if (normalized === "") return NaN;
return Number(normalized);
}
function getUnit(category, id) {
return category.units.find((item) => item.id === id) || category.units[0];
}
function resolveCategoryByIdentifier(identifier) {
if (!identifier) return null;
if (categoryMap.has(identifier)) return categoryMap.get(identifier);
const normalized = normalizeRouteValue(identifier);
if (!normalized) return null;
const byId = categories.find((category) => normalizeRouteValue(category.id) === normalized);
if (byId) return byId;
const byName = categories.find((category) => {
const candidates = [category.name, category.title, category.label, ...(category.aliases || []), ...(category.synonyms || [])]
.filter(Boolean)
.map((value) => normalizeRouteValue(value));
return candidates.some((candidate) => candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate));
});
return byName || null;
}
function resolveUnitAlias(category, value) {
const term = normalizeRouteValue(value);
if (!category || !term) return null;
const exactMatch = category.units.find((unit) => {
const aliases = [unit.id, unit.name, unit.symbol, ...(unit.aliases || []), ...(unit.synonyms || [])];
return aliases.some((alias) => normalizeRouteValue(alias) === term);
});
if (exactMatch) return exactMatch;
const termKey = unitTokenKey(value);
if (!termKey) return null;
return category.units.find((unit) => {
const aliases = [unit.id, unit.name, unit.symbol, ...(unit.aliases || []), ...(unit.synonyms || [])];
return aliases.some((alias) => unitTokenKey(alias) === termKey);
}) || null;
}
function unitTokenKey(value) {
return normalizeRouteValue(value)
.split("_")
.filter(Boolean)
.map(singularizeToken)
.sort()
.join("_");
}
function singularizeToken(token) {
if (token.length <= 3) return token;
if (token.endsWith("ies")) return token.slice(0, -3) + "y";
if (/(ches|shes|xes|ses|zes)$/.test(token)) return token.slice(0, -2);
if (token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
return token;
}
function findConversionFromParams(params) {
const slugConfig = seoMap.get(params.get("slug") || "");
const categoryId = params.get("category") || (slugConfig ? slugConfig.categoryId : "");
const fromValue = params.get("from") || (slugConfig ? slugConfig.from : "");
const toValue = params.get("to") || (slugConfig ? slugConfig.to : "");
const value = params.get("value") || "";
if (!fromValue || !toValue) return null;
const candidates = categoryId && categoryMap.has(categoryId)
? [categoryMap.get(categoryId)]
: categories;
for (const category of candidates) {
const from = resolveUnitAlias(category, fromValue);
const to = resolveUnitAlias(category, toValue);
if (from && to) {
return {
categoryId: category.id,
fromUnitId: from.id,
toUnitId: to.id,
value,
originalFrom: fromValue,
originalTo: toValue,
route: window.location.pathname + window.location.search + window.location.hash
};
}
}
debugConversionRoute("converter_route_unresolved", {
category: categoryId || "",
from: fromValue,
to: toValue
});
return null;
}
function normalizeRouteValue(value) {
return String(value || "").trim().toLowerCase().replace(/\+/g, " ").replace(/[_\s-]+/g, "_");
}
function convert(category, amount, from, to) {
if (from.id === to.id) return { ok: true, value: amount, note: getTranslation("messages.sameUnit", currentLanguageCode), formula: localizedFormula("formula_same_unit") || "Source and target units are identical." };
if (category.type === "linear" || category.type === "currency") {
return {
ok: true,
value: amount * from.factor / to.factor,
note: category.type === "currency" ? getTranslation("messages.currencyOfflineNote", currentLanguageCode) : getCategoryDisplayNote(category),
formula: localizedFactorFormula(formatNumber(amount), from.factor, to.factor)
};
}
if (category.type === "temperature") {
const kelvin = toKelvin(amount, from.id);
return { ok: true, value: fromKelvin(kelvin, to.id), note: getTranslation("messages.temperatureNote", currentLanguageCode), formula: formulaFor(category, from, to) };
}
if (category.type === "multi") {
if (from.dimension !== to.dimension) {
// The dimension name itself (from.dimension, e.g. "mass_concentration")
// is deliberately left untranslated here: there is no per-dimension
// translation table for these internal identifiers, and translating
// only the surrounding words while leaving the dimension name in
// English would recreate the exact mixed-language leak this pass was
// meant to fix elsewhere. The surrounding sentence is translated; the
// interpolated unit names are translated via getUnitDisplayName().
return { ok: false, message: getTranslation("messages.chooseCompatibleFamiliesMessage", currentLanguageCode), note: fillTemplate(getTranslation("messages.differentThingsNote", currentLanguageCode), { FROM: getUnitDisplayName(from), TO: getUnitDisplayName(to) }) };
}
return { ok: true, value: amount * from.factor / to.factor, note: `${titleCase(from.dimension.replace(/_/g, " "))} units are compatible.`, formula: localizedFactorFormula(formatNumber(amount), from.factor, to.factor) };
}
if (category.type === "electricity") return convertElectricity(amount, from, to);
if (category.type === "fuel") return convertFuel(amount, from, to);
return { ok: false, message: getTranslation("messages.conversionUnavailableMessage", currentLanguageCode) };
}
function toKelvin(value, unitId) {
if (unitId === "celsius") return value + 273.15;
if (unitId === "fahrenheit") return (value - 32) * 5 / 9 + 273.15;
if (unitId === "rankine") return value * 5 / 9;
if (unitId === "delisle") return 373.15 - value * 2 / 3;
if (unitId === "newton_temperature") return value * 100 / 33 + 273.15;
if (unitId === "reaumur") return value * 5 / 4 + 273.15;
if (unitId === "romer") return (value - 7.5) * 40 / 21 + 273.15;
return value;
}
function fromKelvin(value, unitId) {
if (unitId === "celsius") return value - 273.15;
if (unitId === "fahrenheit") return (value - 273.15) * 9 / 5 + 32;
if (unitId === "rankine") return value * 9 / 5;
if (unitId === "delisle") return (373.15 - value) * 3 / 2;
if (unitId === "newton_temperature") return (value - 273.15) * 33 / 100;
if (unitId === "reaumur") return (value - 273.15) * 4 / 5;
if (unitId === "romer") return (value - 273.15) * 21 / 40 + 7.5;
return value;
}
function convertFuel(amount, from, to) {
const base = from.mode === "consumption" ? 1 / (amount * from.factor) : amount * from.factor;
const value = to.mode === "consumption" ? 1 / (base * to.factor) : base / to.factor;
if (!Number.isFinite(value)) return { ok: false, message: getTranslation("messages.fuelZeroMessage", currentLanguageCode), note: getTranslation("messages.fuelInvertNote", currentLanguageCode) };
return { ok: true, value, note: getTranslation("messages.fuelSupportsNote", currentLanguageCode), formula: formulaFor(categoryMap.get("fuel_economy"), from, to) };
}
function convertElectricity(amount, from, to) {
if (from.dimension === to.dimension) {
return { ok: true, value: amount * from.factor / to.factor, note: getTranslation("messages.electricitySameFamilyNote", currentLanguageCode), formula: localizedFactorFormula(formatNumber(amount), from.factor, to.factor) };
}
const source = amount * from.factor;
const voltage = positiveContext("contextVoltage");
const current = positiveContext("contextCurrent");
const resistance = positiveContext("contextResistance");
const hours = positiveContext("contextHours");
const seconds = hours * 3600;
const baseByDimension = {};
if (from.dimension === "voltage") {
baseByDimension.voltage = source;
if (resistance) baseByDimension.current = source / resistance;
if (current) baseByDimension.resistance = source / current;
if (current) baseByDimension.power = source * current;
}
if (from.dimension === "current") {
baseByDimension.current = source;
if (resistance) baseByDimension.voltage = source * resistance;
if (voltage) baseByDimension.resistance = voltage / source;
if (voltage) baseByDimension.power = voltage * source;
}
if (from.dimension === "resistance") {
baseByDimension.resistance = source;
if (voltage) baseByDimension.current = voltage / source;
if (current) baseByDimension.voltage = current * source;
if (voltage) baseByDimension.power = voltage * voltage / source;
if (current) baseByDimension.power = current * current * source;
}
if (from.dimension === "power") {
baseByDimension.power = source;
if (current) baseByDimension.voltage = source / current;
if (voltage) baseByDimension.current = source / voltage;
if (voltage) baseByDimension.resistance = voltage * voltage / source;
}
if (from.dimension === "energy") {
baseByDimension.energy = source;
if (seconds) baseByDimension.power = source / seconds;
}
if (baseByDimension.power && seconds) baseByDimension.energy = baseByDimension.power * seconds;
const value = baseByDimension[to.dimension];
if (!Number.isFinite(value)) {
return { ok: false, message: getTranslation("messages.electricityNeedContextMessage", currentLanguageCode), note: getTranslation("messages.electricityNeedContextNote", currentLanguageCode) };
}
return { ok: true, value: value / to.factor, note: getTranslation("messages.electricityContextNote", currentLanguageCode), formula: localizedFormula("formula_electricity_cross") || "V = I x R, P = V x I, and E = P x time." };
}
function positiveContext(id) {
const input = byId(id);
if (!input) return 0;
const value = parseInput(input.value);
return Number.isFinite(value) && value > 0 ? value : 0;
}
function formatNumber(value) {
if (!Number.isFinite(value)) return "";
if (Object.is(value, -0)) value = 0;
const precision = clampNumber(state.precision || 12, 2, 15);
const absolute = Math.abs(value);
if (state.notation === "scientific") return trimExponent(value.toExponential(precision - 1));
if (state.notation === "engineering") return formatEngineering(value, precision);
if (state.notation === "decimal") {
return new Intl.NumberFormat("en-US", { maximumFractionDigits: precision, useGrouping: true }).format(value);
}
if (absolute !== 0 && (absolute < 1e-6 || absolute >= 1e12)) return trimExponent(value.toExponential(precision - 1));
return new Intl.NumberFormat("en-US", {
maximumSignificantDigits: precision,
maximumFractionDigits: precision
}).format(value);
}
function compactNumber(value) {
if (!Number.isFinite(value)) return "";
if (Math.abs(value) >= 1e6 || (Math.abs(value) > 0 && Math.abs(value) < 1e-4)) return trimExponent(value.toExponential(8));
return String(Number(value.toPrecision(10)));
}
function formatEngineering(value, precision) {
if (value === 0) return "0";
const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
const mantissa = value / Math.pow(10, exponent);
return `${Number(mantissa.toPrecision(precision))}e${exponent}`;
}
function trimExponent(value) {
return value.replace(/\.?0+e/, "e");
}
function scheduleHistoryRecord(category, amount, from, value, to) {
if (!historyEnabled) return;
window.clearTimeout(historyTimer);
const key = `${category.id}:${amount}:${from.id}:${to.id}:${value}`;
historyTimer = window.setTimeout(() => {
if (state.lastRecordKey === key) return;
state.lastRecordKey = key;
const history = readArray(storageKeys.history);
history.unshift({
categoryId: category.id,
categoryName: category.name,
text: `${formatNumber(amount)} ${from.symbol} = ${formatNumber(value)} ${to.symbol}`,
timestamp: new Date().toISOString()
});
writeArray(storageKeys.history, uniqueHistory(history).slice(0, 12));
renderStoredLists();
trackEvent("conversion_completed", {
category: category.id,
from_unit: from.id,
to_unit: to.id,
input_value: amount,
output_value: value
});
}, 350);
}
function uniqueHistory(history) {
const seen = new Set();
return history.filter((item) => {
const key = `${item.categoryId}:${item.text}`;
if (seen.has(key)) return false;
seen.add(key);
return true;
});
}
function toggleFavorite() {
const favorites = readArray(storageKeys.favorites);
const exists = favorites.includes(state.categoryId);
const next = exists ? favorites.filter((id) => id !== state.categoryId) : [state.categoryId, ...favorites].slice(0, 12);
writeArray(storageKeys.favorites, next);
renderStoredLists();
updateFavoriteButton();
if (!exists) trackEvent("favorite_saved", { category: state.categoryId });
}
function updateFavoriteButton() {
const button = byId("favoriteButton");
if (!button) return;
const favorites = readArray(storageKeys.favorites);
const active = favorites.includes(state.categoryId);
button.classList.toggle("is-active", active);
button.setAttribute("aria-pressed", String(active));
const lang = getStoredLanguageCode();
const label = active ? getTranslation("converter.saved", lang) : getTranslation("converter.favorite", lang);
const icon = active ? "-" : "+";
button.innerHTML = `<span aria-hidden="true">${icon}</span> ${escapeHtml(label)}`;
}
function rememberRecent(categoryId) {
const recent = readArray(storageKeys.recent).filter((id) => id !== categoryId);
recent.unshift(categoryId);
writeArray(storageKeys.recent, recent.slice(0, 8));
}
function rememberSearch(label, url, categoryId = "") {
if (!label || !url) return;
const entry = { label, url, categoryId, timestamp: new Date().toISOString() };
const searches = readArray(storageKeys.searches).filter((item) => `${item.label}:${item.url}` !== `${label}:${url}`);
searches.unshift(entry);
writeArray(storageKeys.searches, searches.slice(0, 6));
renderRecentSearches();
trackEvent("search_used", { search_term: label, destination: url, category: categoryId || "" });
}
function renderRecentSearches() {
const element = byId("recentSearches");
if (!element) return;
const searches = readArray(storageKeys.searches).filter((item) => item && item.label && item.url);
if (!searches.length) {
element.innerHTML = "";
return;
}
element.innerHTML = `<span>${escapeHtml(getTranslation("homepage.recentlySearchedLabel", getStoredLanguageCode()))}</span>`;
searches.slice(0, 5).forEach((item) => {
if (item.categoryId && categoryMap.has(item.categoryId)) {
const button = document.createElement("button");
button.type = "button";
button.textContent = getCategoryDisplayName(categoryMap.get(item.categoryId));
button.addEventListener("click", () => {
selectCategory(item.categoryId);
scrollToConverter();
});
element.appendChild(button);
return;
}
const link = document.createElement("a");
link.href = item.url;
link.textContent = item.label;
element.appendChild(link);
});
}
function resolveConversionRoute(item) {
const category = categoryMap.get(item.category);
if (!category) {
debugConversionRoute("popular_conversion_invalid_category", item);
return null;
}
const from = resolveUnitAlias(category, item.from);
const to = resolveUnitAlias(category, item.to);
if (!from || !to) {
debugConversionRoute("popular_conversion_invalid_units", {
name: item.name,
category: item.category,
from: item.from,
to: item.to,
resolvedFrom: from ? from.id : "",
resolvedTo: to ? to.id : ""
});
return null;
}
return {
category,
from,
to,
value: item.value || "1",
href: converterRouteUrl({
category: category.id,
from: item.from,
to: item.to,
value: item.value || "1",
slug: item.slug || ""
})
};
}
function rootRelativePrefix() {
const scriptEl = document.querySelector('script[src$="app.js"]');
if (scriptEl) {
const src = scriptEl.getAttribute("src") || "";
return src.replace(/app\.js$/, "");
}
return "";
}
function converterRouteUrl({ category, from, to, value = "1", slug = "" }) {
const params = new URLSearchParams({ category, from, to, value });
if (slug) params.set("slug", slug);
return `${rootRelativePrefix()}index.html?${params.toString()}#converter`;
}
function conversionPageUrl(slug) {
const config = seoMap.get(slug);
if (!config) return mainConverterUrlForConversion(slug);
return converterRouteUrl({
category: config.categoryId,
from: config.from,
to: config.to,
value: "1",
slug
});
}
function mainConverterUrlForConversion(slug) {
const config = seoMap.get(slug);
if (!config) return `${rootRelativePrefix()}index.html#converter`;
const params = new URLSearchParams({
category: config.categoryId,
from: config.from,
to: config.to,
value: "1"
});
return `${rootRelativePrefix()}index.html?${params.toString()}#converter`;
}
function renderStoredLists() {
const lang = getStoredLanguageCode();
renderCategoryMiniList("favoritesList", readArray(storageKeys.favorites), getTranslation("sidebar.noFavorites", lang));
renderCategoryMiniList("recentList", readArray(storageKeys.recent), getTranslation("sidebar.noRecent", lang));
renderRecentSearches();
renderHistory();
}
function renderCategoryMiniList(elementId, ids, emptyText) {
const element = byId(elementId);
if (!element) return;
element.innerHTML = "";
const validIds = ids.filter((id) => categoryMap.has(id));
if (!validIds.length) {
element.innerHTML = `<p class="empty-state">${emptyText}</p>`;
return;
}
validIds.forEach((id) => {
const category = categoryMap.get(id);
const button = document.createElement("button");
button.type = "button";
button.textContent = getCategoryDisplayName(category);
button.addEventListener("click", () => selectCategory(id));
element.appendChild(button);
});
}
function renderHistory() {
const element = byId("historyList");
if (!element) return;
const history = readArray(storageKeys.history);
if (!history.length) {
element.innerHTML = `<p class="empty-state">${escapeHtml(getTranslation("sidebar.noHistory", getStoredLanguageCode()))}</p>`;
return;
}
element.innerHTML = history.map((item) => {
const category = item.categoryId ? categoryMap.get(item.categoryId) : null;
const categoryLabel = category ? getCategoryDisplayName(category) : item.categoryName;
return `
<div class="history-item">
<strong>${escapeHtml(item.text)}</strong>
<span>${escapeHtml(categoryLabel)}</span>
</div>
`;
}).join("");
}
async function copyResult() {
const text = byId("resultText").textContent;
const note = byId("conversionNote");
const lang = getStoredLanguageCode();
try {
await navigator.clipboard.writeText(text);
note.textContent = getTranslation("common.resultCopied", lang);
trackEvent("copy_result", { category: state.categoryId });
} catch (error) {
note.textContent = getTranslation("common.copyUnavailable", lang);
}
}
async function shareResult() {
const text = byId("resultText").textContent;
const note = byId("conversionNote");
const shareUrl = buildShareUrl();
const shareData = { title: "Universal Converter", text, url: shareUrl };
const lang = getStoredLanguageCode();
try {
if (navigator.share) {
await navigator.share(shareData);
note.textContent = getTranslation("common.shareOpened", lang);
} else {
await navigator.clipboard.writeText(`${text} - ${shareUrl}`);
note.textContent = getTranslation("common.shareCopied", lang);
}
trackEvent("share_result", { category: state.categoryId });
} catch (error) {
note.textContent = getTranslation("common.shareCancelled", lang);
}
}
function buildShareUrl() {
const url = new URL(window.location.href);
url.searchParams.set("category", state.categoryId);
url.searchParams.set("from", state.fromUnitId);
url.searchParams.set("to", state.toUnitId);
url.searchParams.set("value", byId("fromValue").value || "1");
url.hash = "converter";
return url.toString();
}
function readSeoConversionData() {
// Cached per page load: the underlying inputs (window.__seoPageData, the
// #seoConverter dataset, categoryMap, and the current location) do not
// change during a single page load, so this result is safe to compute once
// and reuse instead of re-deriving it on every call (initSeoConverterPage()
// and initializeConverterFromPageRegistry() both need this same value).
if (seoConversionDataResolved) return seoConversionDataCache;
seoConversionDataCache = computeSeoConversionData();
seoConversionDataResolved = true;
return seoConversionDataCache;
}
function computeSeoConversionData() {
const pageData = typeof window !== "undefined" ? window.__seoPageData : null;
const slugFromPageData = pageData && typeof pageData.slug === "string" ? pageData.slug.trim() : "";
const container = document.getElementById("seoConverter");
const slugFromContainer = container?.dataset?.slug || "";
const slug = slugFromPageData || slugFromContainer || currentPageSlug() || "";
const categoryId = pageData && (pageData.categoryId || pageData.category);
const fromUnitId = pageData && (pageData.fromUnitId || pageData.from);
const toUnitId = pageData && (pageData.toUnitId || pageData.to);
const resolvedCategory = resolveCategoryByIdentifier(categoryId);
if (categoryId && fromUnitId && toUnitId && resolvedCategory) {
const resolvedFrom = resolveUnitAlias(resolvedCategory, fromUnitId);
const resolvedTo = resolveUnitAlias(resolvedCategory, toUnitId);
if (resolvedFrom && resolvedTo && resolvedFrom.id !== resolvedTo.id) {
return {
categoryId: resolvedCategory.id,
fromUnitId: resolvedFrom.id,
toUnitId: resolvedTo.id,
value: pageData.value || "1",
originalFrom: fromUnitId,
originalTo: toUnitId,
route: pageData.path || window.location.pathname
};
}
}
const lastSlugSegment = slug.includes("/") ? slug.split("/").filter(Boolean).pop() : slug;
const config = seoMap.get(slug) || (lastSlugSegment ? seoMap.get(lastSlugSegment) : null);
// seoMap is keyed by bare slug only (e.g. "acre-to-hectare"), but a
// handful of those curated slugs are reused by a separately-generated
// page nested under a DIFFERENT category folder (e.g. the curated
// "acre-to-hectare" -> area entry vs. the real generated page at
// /agriculture/acre-to-hectare/, or curated "psi-to-bar" -> pressure vs.
// /engineering/psi-to-bar/). Without this check the bare-slug match wins
// for those nested pages too and hands the converter the wrong
// category's units even though the page's own breadcrumb/category
// sidebar correctly show its real category. When the URL's own
// category-folder segment names a real, different category, trust that
// folder (the page's own authoritative location) and fall through to
// deriveConversionFromPath() below instead, which already resolves these
// correctly via the same folder hint.
const pathForFolderHint = preferredPagePath() || window.location.pathname || "";
const folderHintSegments = pathForFolderHint.split("/").filter(Boolean);
const folderHintId = folderHintSegments.length > 1 ? folderHintSegments[0] : null;
const configMatchesFolderHint = !folderHintId || !categoryMap.has(folderHintId) || !config || config.categoryId === folderHintId;
if (config && configMatchesFolderHint) {
return {
categoryId: config.categoryId,
fromUnitId: config.from,
toUnitId: config.to,
value: "1",
originalFrom: config.from,
originalTo: config.to,
route: window.location.pathname
};
}
if (typeof window !== "undefined" && window.__seoConversion) return window.__seoConversion;
if (container) {
const categoryId = container.dataset.category;
const from = container.dataset.from;
const to = container.dataset.to;
const value = container.dataset.value || "1";
if (categoryId && from && to) {
return {
categoryId,
fromUnitId: from,
toUnitId: to,
value,
originalFrom: from,
originalTo: to,
route: window.location.pathname
};
}
}
const derived = deriveConversionFromPath(preferredPagePath()) || deriveConversionFromPath(location.pathname);
if (derived) return derived;
const currentPath = preferredPagePath() || window.location.pathname || "";
const routeSegments = currentPath.split("/").filter(Boolean);
const candidateSlug = routeSegments.length > 1 ? routeSegments[routeSegments.length - 1] : routeSegments[0] || "";
if (candidateSlug && candidateSlug.includes("-to-")) {
const fromToken = candidateSlug.split("-to-")[0];
const toToken = candidateSlug.split("-to-")[1];
if (fromToken && toToken) {
const categoryHintId = routeSegments.length > 1 ? routeSegments[0] : null;
const hintedCategory = categoryHintId ? categoryMap.get(categoryHintId) : null;
const searchOrder = hintedCategory
? [hintedCategory, ...categories.filter((category) => category !== hintedCategory)]
: categories;
for (const category of searchOrder) {
const fromUnit = resolveUnitAlias(category, fromToken);
const toUnit = resolveUnitAlias(category, toToken);
if (fromUnit && toUnit && fromUnit.id !== toUnit.id) {
return {
categoryId: category.id,
fromUnitId: fromUnit.id,
toUnitId: toUnit.id,
value: "1",
originalFrom: fromToken,
originalTo: toToken,
route: currentPath
};
}
}
}
}
return null;
}
function deriveConversionFromPath(pathname) {
const segments = String(pathname || "")
.split("/")
.map((segment) => decodeURIComponent(segment))
.filter(Boolean);
if (!segments.length) return null;
const cleanedSegments = segments.filter((segment) => {
const lower = segment.toLowerCase();
return lower !== "index.html" && lower !== "index.htm";
});
if (!cleanedSegments.length) return null;
const conversionSegment = [...cleanedSegments].reverse().find((segment) => segment.includes("-to-"));
if (!conversionSegment) return null;
const splitIndex = conversionSegment.indexOf("-to-");
const fromToken = conversionSegment.slice(0, splitIndex);
const toToken = conversionSegment.slice(splitIndex + 4);
if (!fromToken || !toToken) return null;
const hintedCategoryId = cleanedSegments.find((segment) => categoryMap.has(segment));
const hintedCategory = hintedCategoryId ? categoryMap.get(hintedCategoryId) : null;
const searchOrder = hintedCategory
? [hintedCategory, ...categories.filter((category) => category !== hintedCategory)]
: categories;
for (const category of searchOrder) {
const fromUnit = resolveUnitAlias(category, fromToken);
const toUnit = resolveUnitAlias(category, toToken);
if (fromUnit && toUnit && fromUnit.id !== toUnit.id) {
return {
categoryId: category.id,
fromUnitId: fromUnit.id,
toUnitId: toUnit.id,
value: "1",
originalFrom: fromToken,
originalTo: toToken,
route: pathname
};
}
}
return null;
}
function renderSeoConverterShell() {
return `
<section class="tool-section" id="converter" aria-labelledby="converterTitle">
<div class="section-heading">
<div>
<p class="eyebrow">Professional calculator style</p>
<h2 id="converterTitle">World-scale conversion engine</h2>
</div>
<div class="metric-strip" aria-label="Converter summary">
<span>30+ categories</span>
<span>Thousands of units</span>
<span>Instant results</span>
<span>Offline ready</span>
</div>
</div>
<div class="tool-layout">
<aside class="category-panel" aria-label="Converter categories">
<label class="field-label" for="unitSearch" data-i18n="converter.searchAllUnits">Search all units</label>
<input class="compact-search" id="unitSearch" type="search" placeholder="Search all units" data-i18n="converter.searchAllUnits" data-i18n-attr="placeholder">
<div class="category-list" id="categoryList"></div>
</aside>
<section class="converter-panel" aria-label="Active converter">
<div class="converter-header">
<div>
<p class="panel-kicker" id="activeCategoryKind">Converter</p>
<h2 id="activeCategoryName">Length Converter</h2>
<p id="activeCategoryDescription">Convert metric, imperial, and nautical distance units.</p>
</div>
<button class="favorite-button" id="favoriteButton" type="button" aria-pressed="false">
<span aria-hidden="true">+</span>
<span data-i18n="converter.favorite">Favorite</span>
</button>
</div>
<div class="converter-grid">
<label class="unit-box" for="fromValue">
<span data-i18n="converter.fromUnit">From Unit</span>
<input id="fromValue" type="text" inputmode="decimal" value="1" autocomplete="off">
<select id="fromUnit" aria-label="From unit"></select>
</label>
<button class="swap-button" id="swapButton" type="button" aria-label="Swap units" data-i18n="converter.swap" data-i18n-attr="aria-label">&#8644;</button>
<label class="unit-box" for="toValue">
<span data-i18n="converter.toUnit">To Unit</span>
<input id="toValue" type="text" readonly>
<select id="toUnit" aria-label="To unit"></select>
</label>
</div>
<div class="converter-controls" aria-label="Result formatting controls">
<label><span data-i18n="converter.decimalControl">Decimal control</span>
<input id="precisionControl" type="number" min="2" max="15" value="12">
</label>
<label><span data-i18n="converter.notation">Notation</span>
<select id="notationMode">
<option value="auto" data-i18n="converter.notationAuto">Auto</option>
<option value="decimal" data-i18n="converter.notationDecimal">Decimal</option>
<option value="scientific" data-i18n="converter.notationScientific">Scientific</option>
<option value="engineering" data-i18n="converter.notationEngineering">Engineering</option>
</select>
</label>
</div>
<div class="context-panel" id="contextPanel" hidden>
<div class="context-copy">
<strong>Context values</strong>
<span id="contextHelp">Some unit families need one extra value for a physically accurate result.</span>
</div>
<div class="context-grid electricity-context">
<label>Voltage
<input id="contextVoltage" type="number" min="0" step="any" value="120">
</label>
<label>Current
<input id="contextCurrent" type="number" min="0" step="any" value="10">
</label>
<label>Resistance
<input id="contextResistance" type="number" min="0" step="any" value="12">
</label>
<label>Hours
<input id="contextHours" type="number" min="0" step="any" value="1">
</label>
</div>
<div class="context-grid agriculture-context">
<label>Liquid density, kg/L
<input id="contextDensity" type="number" min="0" step="any" value="1">
</label>
</div>
</div>
<div class="result-bar">
<div>
<span class="result-label" data-i18n="converter.result">Result</span>
<strong id="resultText">1 meter = 3.28084 feet</strong>
</div>
<div class="result-actions">
<button class="copy-button" id="copyButton" type="button" data-i18n="converter.copyResult">Copy result</button>
<button class="copy-button secondary" id="shareButton" type="button" data-i18n="converter.share">Share</button>
</div>
</div>
<section class="converter-ad-slot" data-ad-placement="converter" aria-label="Converter advertisement placeholder">
<span data-i18n="sidebar.advertisement">Advertisement</span>
<strong>Converter ad slot</strong>
<p>Reserved below the result so the calculator remains usable.</p>
</section>
<div class="definition-panel" id="definitionPanel">
<article>
<span data-i18n="converter.fromDefinition">From definition</span>
<p id="fromDefinition">Meter is the SI base unit of length.</p>
</article>
<article>
<span data-i18n="converter.toDefinition">To definition</span>
<p id="toDefinition">Foot equals exactly 0.3048 meters.</p>
</article>
<article>
<span data-i18n="converter.formula">Formula</span>
<p id="formulaText">Multiply by the source factor, then divide by the target factor.</p>
</article>
</div>
<p class="conversion-note" id="conversionNote">Results update instantly as you type.</p>
</section>
<aside class="activity-panel" aria-label="Saved and recent conversions">
<aside class="sidebar-ad" data-ad-placement="sidebar" aria-label="Sidebar advertisement placeholder">
<span data-i18n="sidebar.advertisement">Advertisement</span>
</aside>
<section>
<div class="activity-heading">
<h3 data-i18n="sidebar.favoriteConverters">Favorite converters</h3>
<button type="button" id="clearFavorites" data-i18n="sidebar.clear">Clear</button>
</div>
<div class="mini-list" id="favoritesList"></div>
</section>
<section>
<div class="activity-heading">
<h3 data-i18n="sidebar.recentlyUsed">Recently used</h3>
<button type="button" id="clearRecent" data-i18n="sidebar.clear">Clear</button>
</div>
<div class="mini-list" id="recentList"></div>
</section>
<section>
<div class="activity-heading">
<h3 data-i18n="sidebar.conversionHistory">Conversion history</h3>
<button type="button" id="clearHistory" data-i18n="sidebar.clear">Clear</button>
</div>
<div class="history-list" id="historyList"></div>
</section>
</aside>
</div>
</section>
`;
}
function readSharedConversion() {
const params = new URLSearchParams(window.location.search);
const shared = findConversionFromParams(params);
if (!shared) return null;
debugConversionRoute("converter_route_loaded", {
route: shared.route,
category: shared.categoryId,
fromParam: shared.originalFrom,
toParam: shared.originalTo,
selectedFromUnit: shared.fromUnitId,
selectedToUnit: shared.toUnitId
});
return shared;
}
function applySharedConversion(sharedConversion) {
const category = categoryMap.get(sharedConversion.categoryId);
if (!category) return;
const from = category.units.some((unit) => unit.id === sharedConversion.fromUnitId)
? sharedConversion.fromUnitId
: state.fromUnitId;
const to = category.units.some((unit) => unit.id === sharedConversion.toUnitId)
? sharedConversion.toUnitId
: state.toUnitId;
state.fromUnitId = from;
state.toUnitId = to;
byId("fromUnit").value = from;
byId("toUnit").value = to;
if (sharedConversion.value && Number.isFinite(parseInput(sharedConversion.value))) {
byId("fromValue").value = sharedConversion.value;
}
updateConversion();
const fromUnit = getUnit(category, from);
const toUnit = getUnit(category, to);
rememberSearch(`${fromUnit.name} to ${toUnit.name}`, "#converter", category.id);
debugConversionRoute("converter_route_applied", {
category: category.id,
fromUnit: fromUnit.id,
toUnit: toUnit.id,
value: byId("fromValue").value || "1"
});
}
function initSeoConverterPage() {
const container = document.getElementById("seoConverter");
if (!container) return;
const seoConversion = readSeoConversionData();
if (!seoConversion) {
const slug = container.dataset.slug || location.pathname.split("/").filter(Boolean).pop();
if (typeof mainConverterUrlForConversion === "function") {
window.location.replace(mainConverterUrlForConversion(slug));
}
return;
}
const category = categoryMap.get(seoConversion.categoryId);
const from = category ? getUnit(category, seoConversion.fromUnitId) : null;
const to = category ? getUnit(category, seoConversion.toUnitId) : null;
if (!category || !from || !to) {
const slug = container.dataset.slug || location.pathname.split("/").filter(Boolean).pop();
if (typeof mainConverterUrlForConversion === "function") {
window.location.replace(mainConverterUrlForConversion(slug));
}
return;
}
window.__seoConversion = seoConversion;
const target = container.closest(".tool-section") || container.closest(".seo-converter-column") || container;
target.outerHTML = renderSeoConverterShell();
}
function initCalculators() {
if (!document.getElementById("currencyTool")) return;
initCurrencyTool();
bindCalc(["percentValue", "percentBase"], updatePercentage);
bindCalc(["bmiWeight", "bmiHeight"], updateBmi);
bindCalc(["birthDate"], updateAge);
bindCalc(["dateStart", "dateOffset"], updateDateCalc);
bindCalc(["loanAmount", "loanRate", "loanYears"], updateMortgage);
bindCalc(["tripDistance", "fuelEfficiency", "fuelPrice"], updateFuelCost);
bindCalc(["seedArea", "seedRate", "seedLoss", "fertArea", "fertRate", "fertBags", "yieldMass", "yieldArea", "yieldPrice", "irrigationArea", "irrigationDepth", "irrigationEfficiency"], updateAgricultureTools);
initAgriTabs();
renderBlog();
setDefaultDates();
updatePercentage();
updateBmi();
updateAge();
updateDateCalc();
updateMortgage();
updateFuelCost();
updateAgricultureTools();
}
function bindCalc(ids, callback) {
ids.forEach((id) => {
const input = byId(id);
if (input) {
input.addEventListener("input", () => {
callback();
trackEvent("calculator_used", { calculator: calculatorForInput(id), control: id });
});
}
});
}
function calculatorForInput(id) {
if (id.startsWith("percent")) return "percentage";
if (id.startsWith("bmi")) return "bmi";
if (id.startsWith("birth")) return "age";
if (id.startsWith("date")) return "date";
if (id.startsWith("loan")) return "mortgage";
if (id.startsWith("trip") || id.startsWith("fuel")) return "fuel_cost";
if (id.startsWith("seed")) return "seed_rate";
if (id.startsWith("fert")) return "fertilizer";
if (id.startsWith("yield")) return "yield";
if (id.startsWith("irrigation")) return "irrigation";
return "calculator";
}
function initCurrencyTool() {
const from = byId("currencyFrom");
const to = byId("currencyTo");
const codes = Object.keys(currencyFallbackRates);
from.innerHTML = codes.map((code) => `<option value="${code}">${code}</option>`).join("");
to.innerHTML = from.innerHTML;
from.value = "USD";
to.value = "EUR";
["currencyAmount", "currencyFrom", "currencyTo"].forEach((id) => byId(id).addEventListener("input", () => {
updateCurrency();
trackEvent("calculator_used", { calculator: "currency", control: id });
}));
byId("currencyFrom").addEventListener("change", () => {
updateCurrency();
trackEvent("calculator_used", { calculator: "currency", control: "currencyFrom" });
});
byId("currencyTo").addEventListener("change", () => {
updateCurrency();
trackEvent("calculator_used", { calculator: "currency", control: "currencyTo" });
});
byId("currencyRefresh").addEventListener("click", refreshCurrencyRates);
updateCurrency();
}
function updateCurrency() {
const amount = parseInput(byId("currencyAmount").value);
const from = byId("currencyFrom").value;
const to = byId("currencyTo").value;
const result = amount * currencyFallbackRates[from] / currencyFallbackRates[to];
byId("currencyResult").textContent = `${formatNumber(amount)} ${from} = ${formatNumber(result)} ${to}`;
}
async function refreshCurrencyRates() {
const endpoint = byId("currencyApi").value.trim();
const result = byId("currencyResult");
const lang = getStoredLanguageCode();
if (!endpoint) {
result.textContent = getTranslation("calculators.currencyNeedEndpointPrompt", lang);
return;
}
try {
const base = byId("currencyFrom").value;
const response = await fetch(endpoint.replace("{base}", encodeURIComponent(base)));
const data = await response.json();
if (!data || !data.rates) throw new Error("Missing rates");
Object.keys(data.rates).forEach((code) => {
if (currencyFallbackRates[code]) currencyFallbackRates[code] = currencyFallbackRates[base] / Number(data.rates[code]);
});
updateCurrency();
trackEvent("currency_refresh", { base });
} catch (error) {
result.textContent = getTranslation("calculators.currencyLiveRatesFailedPrompt", lang);
}
}
function updatePercentage() {
const value = parseInput(byId("percentValue").value);
const base = parseInput(byId("percentBase").value);
const lang = getStoredLanguageCode();
byId("percentageResult").textContent = `${formatNumber(base * value / 100)} ${getTranslation("calculators.percentageResultSuffix", lang)}`;
}
function updateBmi() {
const weight = parseInput(byId("bmiWeight").value);
const heightCm = parseInput(byId("bmiHeight").value);
const bmi = weight / Math.pow(heightCm / 100, 2);
const lang = getStoredLanguageCode();
const labelKey = bmi < 18.5 ? "calculators.bmiUnderweight" : bmi < 25 ? "calculators.bmiNormal" : bmi < 30 ? "calculators.bmiOverweight" : "calculators.bmiObesity";
const label = getTranslation(labelKey, lang);
byId("bmiResult").textContent = Number.isFinite(bmi) ? `BMI ${formatNumber(bmi)} - ${label}` : getTranslation("calculators.bmiEnterPrompt", lang);
}
function updateAge() {
const value = byId("birthDate").value;
const lang = getStoredLanguageCode();
if (!value) {
byId("ageResult").textContent = getTranslation("calculators.chooseDatePrompt", lang);
return;
}
const birth = new Date(`${value}T00:00:00`);
const today = new Date();
let years = today.getFullYear() - birth.getFullYear();
const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
if (beforeBirthday) years -= 1;
const days = Math.floor((today - birth) / 86400000);
byId("ageResult").textContent = fillTemplate(getTranslation("calculators.ageResultTemplate", lang), { YEARS: years, DAYS: days.toLocaleString("en-US") });
}
function updateDateCalc() {
const startValue = byId("dateStart").value;
const offset = Number(byId("dateOffset").value) || 0;
const lang = getStoredLanguageCode();
if (!startValue) {
byId("dateResult").textContent = getTranslation("calculators.chooseStartDatePrompt", lang);
return;
}
const date = new Date(`${startValue}T00:00:00`);
date.setDate(date.getDate() + offset);
const dateLocale = DATE_LOCALE_MAP[lang] || "en-US";
const formattedDate = date.toLocaleDateString(dateLocale, { year: "numeric", month: "short", day: "numeric" });
byId("dateResult").textContent = fillTemplate(getTranslation("calculators.daysLaterTemplate", lang), { OFFSET: offset, DATE: formattedDate });
}
function updateMortgage() {
const principal = parseInput(byId("loanAmount").value);
const annualRate = parseInput(byId("loanRate").value) / 100;
const years = parseInput(byId("loanYears").value);
const months = years * 12;
const monthlyRate = annualRate / 12;
const payment = monthlyRate === 0 ? principal / months : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
const lang = getStoredLanguageCode();
byId("mortgageResult").textContent = Number.isFinite(payment) ? `${money(payment)} ${getTranslation("calculators.perMonthSuffix", lang)}` : getTranslation("calculators.enterLoanDetailsPrompt", lang);
}
function updateFuelCost() {
const distance = parseInput(byId("tripDistance").value);
const litersPer100 = parseInput(byId("fuelEfficiency").value);
const price = parseInput(byId("fuelPrice").value);
const cost = distance / 100 * litersPer100 * price;
const lang = getStoredLanguageCode();
byId("fuelCostResult").textContent = Number.isFinite(cost) ? `${money(cost)} ${getTranslation("calculators.estimatedFuelCostSuffix", lang)}` : getTranslation("calculators.enterTripDetailsPrompt", lang);
}
function initAgriTabs() {
const tabs = Array.from(document.querySelectorAll("[data-agri-tool]"));
function selectAgriTab(tab) {
tabs.forEach((item) => {
const isSelected = item === tab;
item.classList.toggle("active", isSelected);
item.setAttribute("aria-selected", isSelected ? "true" : "false");
item.setAttribute("tabindex", isSelected ? "0" : "-1");
});
document.querySelectorAll("[data-agri-panel]").forEach((item) => item.classList.remove("active"));
document.querySelector(`[data-agri-panel="${tab.dataset.agriTool}"]`).classList.add("active");
}
tabs.forEach((tab, index) => {
tab.addEventListener("click", () => selectAgriTab(tab));
tab.addEventListener("keydown", (event) => {
let newIndex = null;
switch (event.key) {
case "ArrowRight":
newIndex = (index + 1) % tabs.length;
break;
case "ArrowLeft":
newIndex = (index - 1 + tabs.length) % tabs.length;
break;
case "Home":
newIndex = 0;
break;
case "End":
newIndex = tabs.length - 1;
break;
default:
return;
}
event.preventDefault();
const newTab = tabs[newIndex];
selectAgriTab(newTab);
newTab.focus();
});
});
}
function updateAgricultureTools() {
const lang = getStoredLanguageCode();
const seed = parseInput(byId("seedArea").value) * parseInput(byId("seedRate").value) * (1 + parseInput(byId("seedLoss").value) / 100);
byId("seedResult").textContent = `${formatNumber(seed)} ${getTranslation("calculators.seedRequiredSuffix", lang)}`;
const fertKg = parseInput(byId("fertArea").value) * parseInput(byId("fertRate").value);
const bags = fertKg / parseInput(byId("fertBags").value);
byId("fertResult").textContent = fillTemplate(getTranslation("calculators.fertBagsTemplate", lang), { FERT: formatNumber(fertKg), BAGS: formatNumber(bags) });
const yieldRate = parseInput(byId("yieldMass").value) / parseInput(byId("yieldArea").value);
const revenue = parseInput(byId("yieldMass").value) * parseInput(byId("yieldPrice").value);
byId("yieldResult").textContent = fillTemplate(getTranslation("calculators.tHaRevenueTemplate", lang), { RATE: formatNumber(yieldRate), REVENUE: money(revenue) });
const irrigation = parseInput(byId("irrigationArea").value) * 10000 * parseInput(byId("irrigationDepth").value) / 1000 / (parseInput(byId("irrigationEfficiency").value) / 100);
byId("irrigationResult").textContent = `${formatNumber(irrigation)} ${getTranslation("calculators.m3WaterRequiredSuffix", lang)}`;
}
function setDefaultDates() {
const today = new Date().toISOString().slice(0, 10);
if (byId("dateStart")) byId("dateStart").value = today;
}
function money(value) {
return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}
// Maps each static blogPosts entry (keyed by its stable href) to the
// homepage.blog* translation keys added for the "More conversion guides
// and tips" section, so non-English languages resolve real translations
// while unmapped/future posts still fall back to the English literal
// tag/title/summary already baked into the blogPosts array.
const BLOG_POST_TRANSLATION_KEYS = {
"unit-converter.html": { tag: "homepage.blogAccuracyTag", title: "homepage.blogAccuracyTitle", summary: "homepage.blogAccuracySummary" },
"metric-vs-imperial.html": { tag: "homepage.blogGlobalUnitsTag", title: "homepage.blogGlobalUnitsTitle", summary: "homepage.blogGlobalUnitsSummary" },
"celsius-vs-fahrenheit.html": { tag: "homepage.blogTemperatureTag", title: "homepage.blogTemperatureTitle", summary: "homepage.blogTemperatureSummary" },
"digital-storage-units-guide.html": { tag: "homepage.blogDigitalStorageTag", title: "homepage.blogDigitalStorageTitle", summary: "homepage.blogDigitalStorageSummary" },
};
function renderBlog() {
const grid = byId("blogGrid");
if (!grid) return;
const lang = getStoredLanguageCode();
const readGuideLabel = getTranslation("homepage.readGuideLink", lang);
grid.innerHTML = blogPosts.map((post) => {
const keys = BLOG_POST_TRANSLATION_KEYS[post.href];
const tag = keys ? getTranslation(keys.tag, lang) : post.tag;
const title = keys ? getTranslation(keys.title, lang) : post.title;
const summary = keys ? getTranslation(keys.summary, lang) : post.summary;
return `
<article>
<span>${escapeHtml(tag)}</span>
<h3>${escapeHtml(title)}</h3>
<p>${escapeHtml(summary)}</p>
<a href="${escapeAttribute(post.href || "guides.html")}">${escapeHtml(readGuideLabel)}</a>
</article>
`;
}).join("");
}
function initNewsletter() {
const form = byId("newsletterForm");
if (!form) return;
form.addEventListener("submit", (event) => {
event.preventDefault();
const email = byId("newsletterEmail").value.trim();
if (!email) return;
const subscribers = readArray(storageKeys.newsletter);
subscribers.unshift({ email, date: new Date().toISOString() });
writeArray(storageKeys.newsletter, subscribers.slice(0, 100));
byId("newsletterStatus").textContent = getTranslation("homepage.newsletterSuccessStatus", getStoredLanguageCode());
form.reset();
trackEvent("newsletter_signup", {});
});
}
function initAdmin() {
const form = byId("adminUnitForm");
if (!form) return;
const select = byId("adminCategory");
select.innerHTML = categories
.filter((category) => ["linear", "currency"].includes(category.type))
.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
.join("");
const tableBody = byId("adminUnitTableBody");
const searchInput = byId("adminSearch");
const exportBtn = byId("adminExportBtn");
const importBtn = byId("adminImportBtn");
const importInput = byId("adminImportInput");
const clearBtn = byId("adminClearBtn");
const cancelEditBtn = byId("adminCancelEdit");
const statusEl = byId("adminFormStatus");
const submitBtn = form.querySelector('button[type="submit"]') || byId("adminSubmitBtn");
let editingId = null;

function setStatus(message) {
if (statusEl) statusEl.textContent = message || "";
}
function exitEditMode() {
editingId = null;
if (submitBtn) submitBtn.textContent = "Add unit";
if (cancelEditBtn) cancelEditBtn.hidden = true;
}

form.addEventListener("submit", (event) => {
event.preventDefault();
const categoryId = byId("adminCategory").value;
const name = byId("adminUnitName").value.trim();
const symbol = byId("adminUnitSymbol").value.trim();
const factor = Number(byId("adminUnitFactor").value);
const definition = byId("adminUnitDefinition").value.trim();
if (!name || !symbol || !Number.isFinite(factor) || factor <= 0) {
setStatus("Enter a unit name, symbol, and a positive conversion factor.");
return;
}
const custom = readArray(storageKeys.customUnits);
if (editingId) {
const index = custom.findIndex((item) => item.id === editingId);
if (index !== -1) {
custom[index] = { ...custom[index], categoryId, name, symbol, factor, definition };
}
writeArray(storageKeys.customUnits, custom);
setStatus(`Updated "${name}". Reload to refresh the converter lists.`);
trackEvent("admin_edit_unit", { category: categoryId });
exitEditMode();
} else {
custom.unshift({
categoryId,
id: `custom_${slug(name)}_${Date.now()}`,
name,
symbol,
factor,
definition
});
writeArray(storageKeys.customUnits, custom.slice(0, 100));
setStatus(`Added "${name}". Reload to include it in the converter lists.`);
trackEvent("admin_add_unit", { category: categoryId });
}
renderAdminList();
form.reset();
});

if (cancelEditBtn) {
cancelEditBtn.addEventListener("click", () => {
exitEditMode();
form.reset();
setStatus("");
});
}
if (searchInput) {
searchInput.addEventListener("input", () => renderAdminList());
}
if (exportBtn) {
exportBtn.addEventListener("click", () => {
const custom = readArray(storageKeys.customUnits);
const blob = new Blob([JSON.stringify(custom, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "custom-units.json";
document.body.appendChild(link);
link.click();
link.remove();
URL.revokeObjectURL(url);
trackEvent("admin_export_units", { count: custom.length });
});
}
if (importBtn && importInput) {
importBtn.addEventListener("click", () => importInput.click());
importInput.addEventListener("change", () => {
const file = importInput.files && importInput.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = () => {
try {
const parsed = JSON.parse(String(reader.result));
if (!Array.isArray(parsed)) throw new Error("invalid");
const existing = readArray(storageKeys.customUnits);
const seen = new Set(existing.map((item) => item.id));
const additions = parsed.filter((item) => item && item.id && item.name && item.symbol && !seen.has(item.id));
const merged = existing.concat(additions).slice(0, 100);
writeArray(storageKeys.customUnits, merged);
renderAdminList();
setStatus(`Imported ${additions.length} custom unit${additions.length === 1 ? "" : "s"}.`);
trackEvent("admin_import_units", { count: additions.length });
} catch (error) {
setStatus("That file could not be read as custom-unit JSON.");
}
};
reader.readAsText(file);
importInput.value = "";
});
}
if (clearBtn) {
clearBtn.addEventListener("click", () => {
if (!window.confirm("Remove all custom units from this device? This cannot be undone.")) return;
writeArray(storageKeys.customUnits, []);
exitEditMode();
form.reset();
renderAdminList();
setStatus("All custom units cleared.");
trackEvent("admin_clear_units", {});
});
}
if (tableBody) {
tableBody.addEventListener("click", (event) => {
const editTarget = event.target.closest("[data-edit]");
const deleteTarget = event.target.closest("[data-delete]");
if (editTarget) {
const id = editTarget.getAttribute("data-edit");
const custom = readArray(storageKeys.customUnits);
const item = custom.find((entry) => entry.id === id);
if (!item) return;
byId("adminCategory").value = item.categoryId;
byId("adminUnitName").value = item.name;
byId("adminUnitSymbol").value = item.symbol;
byId("adminUnitFactor").value = item.factor;
byId("adminUnitDefinition").value = item.definition || "";
editingId = id;
if (submitBtn) submitBtn.textContent = "Update unit";
if (cancelEditBtn) cancelEditBtn.hidden = false;
setStatus(`Editing "${item.name}".`);
form.scrollIntoView({ behavior: "smooth", block: "start" });
} else if (deleteTarget) {
const id = deleteTarget.getAttribute("data-delete");
if (!window.confirm("Delete this custom unit?")) return;
const custom = readArray(storageKeys.customUnits).filter((entry) => entry.id !== id);
writeArray(storageKeys.customUnits, custom);
if (editingId === id) {
exitEditMode();
form.reset();
}
renderAdminList();
setStatus("Custom unit deleted.");
trackEvent("admin_delete_unit", {});
}
});
}
renderAdminList();
}
function renderAdminList() {
const tableBody = byId("adminUnitTableBody");
const emptyState = byId("adminEmptyState");
const searchInput = byId("adminSearch");
if (!tableBody) return;
const custom = readArray(storageKeys.customUnits);
const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
const filtered = !query ? custom : custom.filter((item) => {
const category = categoryMap.get(item.categoryId);
const categoryName = category ? category.name : item.categoryId;
return [item.name, item.symbol, categoryName].some((value) => String(value || "").toLowerCase().includes(query));
});
if (!custom.length) {
tableBody.innerHTML = "";
if (emptyState) {
emptyState.hidden = false;
emptyState.textContent = "No custom units yet. Add one above and it will appear here.";
}
return;
}
if (!filtered.length) {
tableBody.innerHTML = "";
if (emptyState) {
emptyState.hidden = false;
emptyState.textContent = "No custom units match your search.";
}
return;
}
if (emptyState) emptyState.hidden = true;
tableBody.innerHTML = filtered.map((item) => {
const category = categoryMap.get(item.categoryId);
const categoryName = category ? category.name : item.categoryId;
return `
<tr>
<td data-label="Name"><strong>${escapeHtml(item.name)}</strong></td>
<td data-label="Category">${escapeHtml(categoryName)}</td>
<td data-label="Symbol">${escapeHtml(item.symbol)}</td>
<td data-label="Factor">${escapeHtml(item.factor)}</td>
<td data-label="Definition">${escapeHtml(item.definition || "\u2014")}</td>
<td data-label="Actions" class="admin-row-actions">
<button type="button" class="admin-edit-btn" data-edit="${escapeAttribute(item.id)}">Edit</button>
<button type="button" class="admin-delete-btn" data-delete="${escapeAttribute(item.id)}">Delete</button>
</td>
</tr>`;
}).join("");
}
function registerServiceWorker() {
if ("serviceWorker" in navigator && location.protocol !== "file:") {
const appScript = document.querySelector('script[src$="app.js"]');
const appUrl = appScript ? appScript.src : new URL("app.js", window.location.href).href;
const workerUrl = new URL("service-worker.js", appUrl).href;
navigator.serviceWorker.register(workerUrl).catch(() => {});
}
}
function trackEvent(name, payload) {
const data = payload || {};
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: name, payload: data, timestamp: new Date().toISOString() });
if (typeof window.gtag === "function" && window.UC_GA_READY) {
if (name === "page_view") {
window.gtag("event", "page_view", {
page_title: document.title,
page_location: window.location.href,
page_path: window.location.pathname
});
} else {
window.gtag("event", gaEventName(name), gaPayload(data));
}
}
const config = window.UC_ANALYTICS;
if (config && config.enabled && config.endpoint && navigator.sendBeacon) {
navigator.sendBeacon(config.endpoint, JSON.stringify({ event: name, payload: data }));
}
}
function gaEventName(name) {
const names = {
select_category: "select_category",
unit_change: "unit_change",
copy_result: "copy_result",
share_result: "share_result",
currency_refresh: "calculator_used",
newsletter_signup: "newsletter_signup",
admin_add_unit: "admin_add_unit",
admin_edit_unit: "admin_edit_unit",
admin_delete_unit: "admin_delete_unit",
admin_export_units: "admin_export_units",
admin_import_units: "admin_import_units",
admin_clear_units: "admin_clear_units",
swap_units: "swap_units"
};
return names[name] || name;
}
function gaPayload(payload) {
const result = {};
Object.entries(payload || {}).forEach(([key, value]) => {
if (value === undefined || value === null) return;
result[key] = typeof value === "number" || typeof value === "boolean" ? value : String(value).slice(0, 100);
});
return result;
}
function debugConversionRoute(eventName, payload) {
const data = payload || {};
if (window.console && typeof window.console.info === "function") {
window.console.info(`[Universal Converter] ${eventName}`, data);
}
}
function readArray(key) {
try {
const value = JSON.parse(localStorage.getItem(key) || "[]");
return Array.isArray(value) ? value : [];
} catch (error) {
return [];
}
}
function writeArray(key, value) {
localStorage.setItem(key, JSON.stringify(value));
}
function clampNumber(value, min, max) {
return Math.min(max, Math.max(min, value));
}
function slug(value) {
return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}
function escapeHtml(value) {
return String(value)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}
function escapeAttribute(value) {
return escapeHtml(value).replace(/`/g, "&#096;");
}
function scrollToConverter() {
const converter = document.getElementById("converter");
if (converter) converter.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===========================================================================
// PHASE 3: SEO CONTENT LOCALIZATION
// ===========================================================================
// Phase 1/2 (above) translate the shared UI chrome (header, sidebar,
// converter shell) via TRANSLATIONS/applyTranslations() and explicitly did
// NOT translate SEO page-specific content (titles, About, FAQ, formulas,
// definitions) because none of it carries data-i18n markup - see the
// comment on applyTranslations().
//
// This section adds that missing layer WITHOUT touching any of the
// 327,527 pre-generated static HTML files: the translation data lives in
// small on-demand JSON files (/i18n-seo/<lang>.json, one per non-English
// language, fetched only when that language is selected) and this file -
// the one script every page already includes - re-renders the relevant
// DOM text at runtime from that data, using the exact same
// deriveConversionFromPath()/categoryMap/getUnit() machinery the
// converter widget already uses to know which unit pair a given page is
// about. English is completely unaffected: nothing is fetched or
// rewritten unless a non-English language is actively selected, and
// switching back to English restores the original static text exactly
// (cached before the first rewrite) rather than re-deriving it.
//
// Scope (see PHASE_3_IMPLEMENTATION_REPORT.md for the full breakdown):
//   - category names/descriptions, unit names/definitions, FAQ items 1-6
//     (the mechanically-composed ones), "Where it's used"/"difference
//     between" FAQ items (translation-memory, bounded to the 16 enhanced
//     pages' researched content), chrome labels (Formula, Related
//     conversions, etc.), the converter widget's live definition panel
//     and unit dropdowns.
//   - deliberately NOT translated in this phase: the long-form
//     About/Understanding/History/Uses/Sources prose paragraphs (no
//     per-unit researched translation source exists for those beyond the
//     16 enhanced pages), and the live calculation result text.
//   - IDs, symbols, numeric factors, formulas, URLs and slugs are never
//     translated or altered, per the hard safety rules for this project.

let currentLanguageCode = DEFAULT_LANGUAGE_CODE;
const SEO_I18N_CACHE = {};

function seoI18nUrl(langCode) {
// Root-absolute, exactly like the existing /logo.svg and /index.html
// references in renderSiteHeader() - works the same from any page depth
// (root pages, one level deep, or two levels deep under a category).
return `/i18n-seo/${langCode}.json`;
}

function loadSeoTranslations(langCode) {
if (langCode === DEFAULT_LANGUAGE_CODE) return Promise.resolve(null);
if (SEO_I18N_CACHE[langCode]) return Promise.resolve(SEO_I18N_CACHE[langCode]);
if (typeof fetch !== "function") return Promise.resolve(null);
return fetch(seoI18nUrl(langCode), { cache: "force-cache" })
.then((response) => (response && response.ok ? response.json() : null))
.then((data) => {
if (data) SEO_I18N_CACHE[langCode] = data;
return data;
})
.catch(() => null);
}

// ---------------------------------------------------------------------
// Display-name/definition lookups. Every one of these falls back to the
// original English value (from the real app.js unit/category catalog)
// whenever no translation is loaded, cached, or available for that
// specific id - so a partially-covered language degrades gracefully
// instead of ever showing "undefined" or a blank string.
// ---------------------------------------------------------------------
function currentSeoData() {
return SEO_I18N_CACHE[currentLanguageCode] || null;
}

function resolveBaseUnitName(baseId, seoData) {
return (seoData.units && seoData.units[baseId]) || null;
}

// Recursive version of the base-id resolver used by composeGeneratedUnitName:
// unlike resolveBaseUnitName (a single flat dictionary lookup), this also
// unwraps a square/cubic modifier or an SI prefix around the id before
// giving up - so a compound-rate numerator/denominator id like
// "cubic_millimeter" or "kilogram" resolves the same way it would if it
// were the page's own primary unit, not just when it happens to be
// individually curated. Still never guesses: every step requires an
// actual translated prefix/modifier AND a resolved base name.
function resolveComposableUnitName(id, seoData) {
if (!id || !seoData) return null;
const flat = resolveBaseUnitName(id, seoData);
if (flat) return flat;
const modMatch = id.match(/^(square|cubic)_(.+)$/);
if (modMatch && seoData.modifiers && seoData.modifiers[modMatch[1]]) {
const baseName = resolveComposableUnitName(modMatch[2], seoData);
if (baseName) return `${seoData.modifiers[modMatch[1]]} ${baseName}`;
}
if (seoData.prefixes) {
const prefixKeys = Object.keys(seoData.prefixes).filter(Boolean).sort((a, b) => b.length - a.length);
for (const pk of prefixKeys) {
if (id.indexOf(pk) === 0) {
const baseName = resolveComposableUnitName(id.slice(pk.length), seoData);
if (baseName) return `${seoData.prefixes[pk]}${baseName.toLowerCase()}`;
}
}
}
return null;
}

// Mirrors app.js's own compositional unit-name generation
// (metricUnits()/squareMetricUnits()/cubicMetricUnits()/ratioUnits()
// above): a generated id like "kilojoule", "square_kilometer", or
// "kilogram_per_cubic_meter" is decomposed into known parts (SI prefix,
// area/volume modifier, or a numerator_per_denominator pair) and only
// composed into a translated name when every part already has a real
// translation loaded - never guessed. The "_per_" branch (compound-rate
// units: density, flow, speed subset, mass_concentration subset, and the
// three agriculture rate classes - the 7 ratioUnits() call sites in this
// file) was previously unhandled here, so those units' names silently
// stayed in English even when both sides of the ratio were curated; the
// translated "per" joiner word (seoData.modifiers.per) already existed
// in every language file but was dead data until this branch was added.
function composeGeneratedUnitName(unit, seoData) {
if (!unit || !unit.id || !seoData) return null;
const id = unit.id;
const perMatch = id.match(/^(.+?)_per_(.+)$/);
if (perMatch && seoData.modifiers && seoData.modifiers.per) {
const topName = resolveComposableUnitName(perMatch[1], seoData);
const bottomName = resolveComposableUnitName(perMatch[2], seoData);
if (topName && bottomName) return `${topName} ${seoData.modifiers.per} ${bottomName}`;
}
const modMatch = id.match(/^(square|cubic)_(.+)$/);
if (modMatch && seoData.modifiers && seoData.modifiers[modMatch[1]]) {
const baseName = resolveComposableUnitName(modMatch[2], seoData);
if (baseName) return `${seoData.modifiers[modMatch[1]]} ${baseName}`;
}
if (seoData.prefixes) {
const prefixKeys = Object.keys(seoData.prefixes).filter(Boolean).sort((a, b) => b.length - a.length);
for (const pk of prefixKeys) {
if (id.indexOf(pk) === 0) {
const baseName = resolveComposableUnitName(id.slice(pk.length), seoData);
if (baseName) return `${seoData.prefixes[pk]}${baseName.toLowerCase()}`;
}
}
}
return null;
}

function getUnitDisplayName(unit) {
if (!unit) return "";
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return unit.name;
const seoData = currentSeoData();
if (!seoData) return unit.name;
if (seoData.units && seoData.units[unit.id]) return seoData.units[unit.id];
// Currency units use their ISO code as `unit.id` (see currencyUnits()),
// which is the same key seoData.currencyNames is keyed by - reusing that
// existing dictionary here means currency pages get translated unit
// names (hero heading, dropdown, "What is a X" FAQ) from the SAME 42
// curated currency names already shipped, with no new data required.
// This dictionary previously existed but was never read by any display
// function, so currency names always fell back to English regardless of
// curation.
if (unit.dimension === "currency" && seoData.currencyNames && seoData.currencyNames[unit.id]) {
return seoData.currencyNames[unit.id];
}
return composeGeneratedUnitName(unit, seoData) || unit.name;
}

// English pluralization (pluralizeUnitName() above) does not apply to
// translated names, so translated display uses the singular translated
// form as-is rather than risk appending an English "s" to non-English
// text.
function pluralizeUnitDisplayName(unit) {
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return pluralizeUnitName(unit);
return getUnitDisplayName(unit);
}

function getUnitDisplayDefinition(unit) {
if (!unit) return "";
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return unit.definition;
const seoData = currentSeoData();
if (!seoData) return unit.definition;
if (seoData.unitDefinitions && seoData.unitDefinitions[unit.id]) return seoData.unitDefinitions[unit.id];
// Compound-rate units (density, flow, speed subset, mass_concentration
// subset, and the three agriculture rate classes - the 7 ratioUnits()
// call sites in this file) all share ONE English definition per
// dimension rather than a per-unit one (e.g. every density unit's
// `definition` field is literally "Mass per volume density."). Falling
// back to a per-dimension translated definition covers all of them with
// 7 translated sentences instead of requiring thousands of identical
// per-unit entries.
if (unit.dimension && seoData.dimensionDefinitions && seoData.dimensionDefinitions[unit.dimension]) {
return seoData.dimensionDefinitions[unit.dimension];
}
// Every generated "square_*"/"cubic_*" metric-prefix variant (square_centimeter,
// square_millimeter, cubic_decimeter, ... - squareMetricUnits()/cubicMetricUnits()
// stamp each one with the SAME fixed English sentence, not a per-prefix one) shares
// its English `definition` text byte-for-byte with square_meter/cubic_meter. Reusing
// that sibling's curated translation is not a guess - it is the identical source
// content already translated, just keyed under a different id - and it covers every
// such variant (only a handful of which are individually curated below) without
// requiring one new JSON record per prefix.
if (unit.id !== "square_meter" && unit.definition === "Square metric area unit." && seoData.unitDefinitions.square_meter) {
return seoData.unitDefinitions.square_meter;
}
if (unit.id !== "cubic_meter" && unit.definition === "Cubic metric volume unit." && seoData.unitDefinitions.cubic_meter) {
return seoData.unitDefinitions.cubic_meter;
}
return unit.definition;
}

function getCategoryDisplayName(category) {
if (!category) return "";
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return category.name;
const seoData = currentSeoData();
if (!seoData || !seoData.categories || !seoData.categories[category.id]) return category.name;
return seoData.categories[category.id].name;
}

function getCategoryDisplayDescription(category) {
if (!category) return "";
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return category.description;
const seoData = currentSeoData();
if (!seoData || !seoData.categories || !seoData.categories[category.id]) return category.description;
return seoData.categories[category.id].description;
}

function getCategoryDisplayNote(category) {
if (!category) return "";
if (currentLanguageCode === DEFAULT_LANGUAGE_CODE) return category.note;
const seoData = currentSeoData();
if (!seoData || !seoData.categories || !seoData.categories[category.id] || !seoData.categories[category.id].note) return category.note;
return seoData.categories[category.id].note;
}

// ---------------------------------------------------------------------
// DOM rewriting for the static, pre-generated SEO article (About/FAQ/
// Related conversions/info-card labels). Every element this touches has
// its original English text cached in a data attribute the first time it
// is rewritten, so switching back to English is a restore, never a
// re-derivation.
// ---------------------------------------------------------------------
function originalText(el) {
if (el.dataset.i18nSeoOriginal === undefined) el.dataset.i18nSeoOriginal = el.textContent;
return el.dataset.i18nSeoOriginal;
}
function setTranslatedText(el, text) {
if (!el || text == null) return;
originalText(el);
el.textContent = text;
}
// Same original-caching/restore contract as originalText()/setTranslatedText()
// above, but for elements whose translation needs to preserve a CHILD
// ELEMENT in place (e.g. a paragraph reading "...see <a>Are to Acre</a>."
// where only the surrounding words change, never the link itself) rather
// than replacing the whole node with plain text. Plain textContent
// mutation loses child elements entirely, and directly splicing text
// nodes around a preserved child - the first approach tried here - is
// NOT covered by restoreOriginalSeoText() (which only walks elements
// carrying data-i18n-seo-original, never bare text nodes), so switching
// back to English left stale translated text behind. innerHTML caching
// fixes that the same way the text-only path already works: cache once,
// restore by full assignment. Every caller must escapeHtml() any
// variable text it interpolates into the HTML string it passes in.
function originalHtml(el) {
if (el.dataset.i18nSeoOriginalHtml === undefined) el.dataset.i18nSeoOriginalHtml = el.innerHTML;
return el.dataset.i18nSeoOriginalHtml;
}
function setTranslatedHtml(el, html) {
if (!el || html == null) return;
originalHtml(el);
el.innerHTML = html;
}
function restoreOriginalSeoText() {
document.querySelectorAll("[data-i18n-seo-original]").forEach((el) => {
el.textContent = el.dataset.i18nSeoOriginal;
});
document.querySelectorAll("[data-i18n-seo-original-html]").forEach((el) => {
el.innerHTML = el.dataset.i18nSeoOriginalHtml;
});
}

function fillTemplate(tpl, vars) {
if (!tpl) return null;
return tpl.replace(/\{(\w+)\}/g, (match, key) => (vars[key] != null ? vars[key] : match));
}

// Same as fillTemplate, but returns null instead of text containing a
// literal, un-substituted "{PLACEHOLDER}" - used anywhere a required
// variable (e.g. a factor pulled from the page's own original text) might
// legitimately be missing, so a lookup miss falls back to leaving the
// original English untouched rather than ever showing raw template syntax
// to a visitor.
function fillTemplateSafe(tpl, vars) {
const filled = fillTemplate(tpl, vars);
if (filled == null) return null;
return /\{\w+\}/.test(filled) ? null : filled;
}

const SEO_CHROME_LABEL_MAP = {
"Formula": "formula",
"Simple example": "simple_example",
"Real-world example": "real_world_example",
"Conversion table": "conversion_table"
};

function translateChromeLabels(seoData) {
const chrome = seoData.chrome || {};
document.querySelectorAll(".info-card h3").forEach((el) => {
const key = SEO_CHROME_LABEL_MAP[originalText(el)];
if (key && chrome[key]) setTranslatedText(el, chrome[key]);
});
document.querySelectorAll(".seo-faq > h2").forEach((el) => {
if (seoData.faq && seoData.faq.faq_heading) setTranslatedText(el, seoData.faq.faq_heading);
});
document.querySelectorAll(".page-card h2").forEach((el) => {
if (originalText(el) === "Related conversions" && chrome.related_conversions) {
setTranslatedText(el, chrome.related_conversions);
}
});
}

function translateHeroAndAboutHeading(seoData, fromUnit, toUnit, category) {
const fromName = getUnitDisplayName(fromUnit);
const toName = getUnitDisplayName(toUnit);
const h1 = document.querySelector(".hero-content h1");
if (h1) setTranslatedText(h1, `${fromName} → ${toName}`);
const aboutHeading = document.querySelector(".seo-article > h2:first-child");
const chrome = seoData.chrome || {};
if (aboutHeading && chrome.about_converting && /^About Converting /.test(originalText(aboutHeading))) {
setTranslatedText(aboutHeading, `${chrome.about_converting} ${fromName} → ${toName}`);
}
// The article's lede paragraph, immediately after the "About Converting"
// h2, is built at generation time from a per-category connector sentence
// ("Comparing {A} and {B} is common in <category context>.") plus one of
// (at least) four second-clause variants:
//   1. "{A} is most often used for <fact>." - a unit-scoped "primary use"
//      fact about fromUnit only (seoData.unitPrimaryUse[fromUnit.id]).
//   2. "{A} is typically associated with <ctx>, while {B} is typically
//      associated with <ctx>." - both units get their own context clause.
//      No recovered source data for this variant yet.
//   3. "Both are <definition> units." - used when fromUnit and toUnit
//      share the exact same English definition (e.g. every generated
//      square_*/cubic_* metric-prefix pair). Reuses the SAME translated
//      definitions already surfaced via getUnitDisplayDefinition() for
//      the "Understanding X" paragraphs - no new per-unit data needed.
//   4. "Specifically: <A's definition>, and <b's definition>." - the
//      generic fallback when neither unit has special context/primary-use
//      data and their definitions differ. Also reuses
//      getUnitDisplayDefinition() for both units.
// Rather than guess which variant a given page uses, each is only
// recognized via a structural regex match against the page's REAL
// original English text (never a hardcoded English template, since that
// would duplicate the source content here) - requiring the paragraph's
// named unit(s) to equal fromUnit/toUnit's real English names, and (for
// variants 3-4) requiring the captured definition text to equal the
// unit's actual English `definition` field exactly. Only then is the
// translation reconstructed, and only if genuinely-translated data exists
// (getUnitDisplayDefinition() returning the untranslated English string
// back is treated as "no translation available", never embedded).
// Anything that doesn't match one of these exact shapes (the still-
// unmodeled variant 2, or any category/unit without translated data yet)
// safely stays in English instead of risking a wrong or mixed-language
// paragraph.
const introP = document.querySelector(".seo-article > h2:first-child + p");
if (introP && category && seoData.categoryIntroTemplate) {
const categoryTemplate = seoData.categoryIntroTemplate[category.id];
const original = originalText(introP);
const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const stripPeriod = (s) => (s ? s.replace(/[.。]+$/, "") : s);
const translatedDef = (unit) => {
const def = getUnitDisplayDefinition(unit);
return def && def !== unit.definition ? def : null;
};
if (categoryTemplate) {
const oneClauseMatch = original.match(/^Comparing (.+) and (.+) is common in .+\. (.+) is most often used for (.+)\.$/);
const bothAreMatch = original.match(/^Comparing (.+) and (.+) is common in .+\. Both are (.+) units\.$/);
const specificallyMatch = original.match(/^Comparing (.+) and (.+) is common in .+\. Specifically: (.+), and (.+)\.$/);
let sentence2 = null;
if (oneClauseMatch && oneClauseMatch[1] === fromUnit.name && oneClauseMatch[2] === toUnit.name && oneClauseMatch[3] === fromUnit.name && seoData.unitPrimaryUse) {
const primaryUseTemplate = chrome.primary_use_intro_template;
const primaryUse = seoData.unitPrimaryUse[fromUnit.id];
if (primaryUseTemplate && primaryUse) sentence2 = fillTemplateSafe(primaryUseTemplate, { UNIT: fromName, USE: primaryUse });
} else if (bothAreMatch && bothAreMatch[1] === fromUnit.name && bothAreMatch[2] === toUnit.name && bothAreMatch[3] === lowerFirst(stripPeriod(fromUnit.definition)) && bothAreMatch[3] === lowerFirst(stripPeriod(toUnit.definition))) {
const template = chrome.both_are_units_template;
const def = translatedDef(fromUnit);
if (template && def) sentence2 = fillTemplateSafe(template, { DEF: stripPeriod(def) });
} else if (specificallyMatch && specificallyMatch[1] === fromUnit.name && specificallyMatch[2] === toUnit.name && specificallyMatch[3] === stripPeriod(fromUnit.definition) && specificallyMatch[4] === lowerFirst(stripPeriod(toUnit.definition))) {
const template = chrome.specifically_intro_template;
const defA = translatedDef(fromUnit);
const defB = translatedDef(toUnit);
if (template && defA && defB) sentence2 = fillTemplateSafe(template, { DEF_A: stripPeriod(defA), DEF_B: stripPeriod(defB) });
}
if (sentence2) {
const sentence1 = fillTemplateSafe(categoryTemplate, { UNIT_A: fromName, UNIT_B: toName });
setTranslatedText(introP, `${sentence1} ${sentence2}`);
}
}
}
// The breadcrumb's own final (non-link) crumb and the visually-hidden
// #converterTitle heading both duplicate the H1's page-specific name
// ("Acres to Hectares") rather than any shared UI label, so they use
// the same already-computed fromName/toName pair the H1 above uses -
// no new translation data, just applying the existing SEO-title
// transformation to its two duplicate spots.
const breadcrumbCurrent = document.querySelector(".breadcrumb span:last-child");
if (breadcrumbCurrent) setTranslatedText(breadcrumbCurrent, `${fromName} → ${toName}`);
const converterTitle = document.getElementById("converterTitle");
if (converterTitle) setTranslatedText(converterTitle, `${fromName} → ${toName}`);
// Hero paragraph's core clause ("Convert X (sym) to Y (sym) using
// ..."): reuses buildConversionDescription() - the SAME per-category-
// type-aware sentence builder already used for #activeCategoryDescription
// (confirmed to already produce the identical clause, minus the trailing
// factor parenthetical, for every category type: temperature/currency/
// fuel/electricity/multi/default). The hero paragraph's second sentence
// ("See the formula, worked examples, ... and common uses.") and the
// factor-equation parenthetical vary per page based on which optional
// sections that specific page happens to have, with no template or
// translated data for that variability anywhere in this codebase -
// reconstructing it would mean guessing at page structure rather than
// reusing existing content, so it is intentionally left in English
// rather than risk an inaccurate claim about the page's own contents.
const heroP = document.querySelector(".hero-content p");
if (heroP && category) {
const localized = buildConversionDescription(category, fromUnit, toUnit);
if (localized) setTranslatedText(heroP, localized);
}
}

// Pulls the actual number the site's own generator already printed out of
// a FAQ answer's cached ORIGINAL English text, instead of recomputing a
// value from unit.factor. This matters because unit.factor is not a
// usable multiplicative ratio for every category: temperature units all
// carry factor 1 (the real relationship is the Kelvin-offset formula in
// toKelvin()/fromKelvin()), and fuel-economy "consumption" units need
// convertFuel()'s inversion, not a straight factor division. Re-deriving
// those independently in this translation layer risks a *different*
// kind of mismatch - disagreeing with what the same static generator
// already committed to the English page (which, on fuel-economy pages,
// is not even internally consistent between its own FAQ items - see
// PHASE_3_CORRECTNESS_REMEDIATION_REPORT.md). Reading the number back out
// of the real sentence guarantees the translated sentence always agrees
// with the English original, for every category, without hard-coding any
// category's math here.
function extractNumberFromOriginal(text) {
if (!text) return null;
const m = String(text).match(/equals?\s+(-?[\d,]+(?:\.\d+)?(?:e[+-]?\d+)?)/i);
return m ? m[1] : null;
}

// Matches each FAQ item's ENGLISH question against the deterministic
// shapes the generator actually produces (see PHASE_3_IMPLEMENTATION_REPORT.md
// for the audited pattern list) rather than assuming a fixed position,
// since not every page has every optional item (DIFFERENCE_BETWEEN/
// WHERE_USED are conditional). Anything that doesn't match a known
// pattern - or a known pattern whose named unit doesn't resolve to this
// page's actual from/to unit - is left exactly as generated.
//
// Three category types (temperature, fuel, currency) produce real
// English FAQ wording that a single generic template does not reproduce
// (confirmed against real generated pages during the correctness
// remediation audit - see PHASE_3_CORRECTNESS_REMEDIATION_REPORT.md).
// `category` is optional for backward compatibility; when omitted, only
// the generic templates are used (same behavior as before remediation).
function translateFaqItems(seoData, fromUnit, toUnit, category) {
const faq = seoData.faq || {};
const fromName = getUnitDisplayName(fromUnit);
const toName = getUnitDisplayName(toUnit);
const categoryType = category && category.type;

function templateFor(genericKey, specificPrefix) {
if (specificPrefix && faq[`${specificPrefix}_${genericKey}`]) return faq[`${specificPrefix}_${genericKey}`];
return faq[genericKey];
}

function matchUnit(name) {
const lower = String(name).trim().toLowerCase();
if (lower === fromUnit.name.toLowerCase() || lower === fromName.toLowerCase()) return fromUnit;
if (lower === toUnit.name.toLowerCase() || lower === toName.toLowerCase()) return toUnit;
return null;
}

const specificPrefix = categoryType === "temperature" ? "temp" : categoryType === "fuel" ? "fuel" : categoryType === "currency" ? "currency" : null;

// q1 ("How many X are in 1 Y?") and q2 ("How do I convert X to Y?")
// both describe the SAME forward factor, and the generic q2_answer
// template embeds {FACTOR} too - so this number is found once, up front,
// from whichever item carries the q1 pattern (its own original text is
// the only place this page guarantees the number appears in a directly
// extractable "equals N" shape), and reused for both. Without this,
// q2 would render with the literal, un-substituted "{FACTOR}" text
// whenever it is processed without ever having seen q1's answer.
let sharedFactor = null;
let sharedInvFactor = null;
document.querySelectorAll(".seo-faq .faq-item").forEach((item) => {
const qEl = item.querySelector("h3");
const aEl = item.querySelector("p");
if (!qEl || !aEl) return;
const q = originalText(qEl);
if (sharedFactor == null && /^How many .+ are in 1 .+\?$/.test(q)) {
sharedFactor = extractNumberFromOriginal(originalText(aEl));
} else if (sharedInvFactor == null && /^How do I convert .+ back to .+\?$/.test(q)) {
sharedInvFactor = extractNumberFromOriginal(originalText(aEl));
}
});
const baseVars = { FROM: fromName, TO: toName, FROM_LOWER: fromName, FACTOR: sharedFactor, INV_FACTOR: sharedInvFactor };

document.querySelectorAll(".seo-faq .faq-item").forEach((item) => {
const qEl = item.querySelector("h3");
const aEl = item.querySelector("p");
if (!qEl || !aEl) return;
const q = originalText(qEl);
let m;
if (/^How many .+ are in 1 .+\?$/.test(q)) {
if (sharedFactor == null) return;
const qTpl = templateFor("q1_question", null);
const aTpl = templateFor("q1_answer", specificPrefix);
if (qTpl) setTranslatedText(qEl, fillTemplateSafe(qTpl, baseVars));
if (aTpl) setTranslatedText(aEl, fillTemplateSafe(aTpl, baseVars));
} else if (/^How do I convert .+ back to .+\?$/.test(q)) {
if (sharedInvFactor == null) return;
if (faq.q3_question) setTranslatedText(qEl, fillTemplateSafe(faq.q3_question, baseVars));
if (faq.q3_answer) setTranslatedText(aEl, fillTemplateSafe(faq.q3_answer, baseVars));
} else if (/^How do I convert .+ to .+\?$/.test(q)) {
const qTpl = templateFor("q2_question", null);
const aTpl = templateFor("q2_answer", specificPrefix);
if (qTpl) setTranslatedText(qEl, fillTemplateSafe(qTpl, baseVars));
if (aTpl) setTranslatedText(aEl, fillTemplateSafe(aTpl, baseVars));
} else if (/^Is the .+ to .+ conversion exact\?$/.test(q)) {
const qTpl = templateFor("q6_question", null);
const aTpl = templateFor("q6_answer", specificPrefix);
if (qTpl) setTranslatedText(qEl, fillTemplateSafe(qTpl, baseVars));
if (aTpl) setTranslatedText(aEl, fillTemplateSafe(aTpl, baseVars));
} else if (categoryType === "currency" && /^Is (this|the) exchange rate exact/i.test(q)) {
if (faq.currency_q6_question) setTranslatedText(qEl, fillTemplateSafe(faq.currency_q6_question, baseVars));
if (faq.currency_q6_answer) setTranslatedText(aEl, fillTemplateSafe(faq.currency_q6_answer, baseVars));
} else if ((m = q.match(/^What is a (.+)\?$/))) {
const unit = matchUnit(m[1]);
if (unit && faq.q4_question && faq.q4_answer) {
const uName = getUnitDisplayName(unit);
const uDef = getUnitDisplayDefinition(unit);
const vars = { UNIT: uName, SYMBOL: unit.symbol, DEFINITION: uDef };
setTranslatedText(qEl, fillTemplate(faq.q4_question, vars));
setTranslatedText(aEl, fillTemplate(faq.q4_answer, vars));
}
} else if ((m = q.match(/^Where is the (.+) still used today\?$/))) {
const unit = matchUnit(m[1]);
const translatedAnswer = unit && seoData.whereUsed && seoData.whereUsed[unit.id];
if (unit && translatedAnswer && faq.where_used_question) {
setTranslatedText(qEl, fillTemplate(faq.where_used_question, { UNIT: getUnitDisplayName(unit) }));
setTranslatedText(aEl, translatedAnswer);
}
} else if ((m = q.match(/^What is the difference between (.+)\?$/))) {
const pairKey = m[1];
const translatedAnswer = seoData.differenceBetween && seoData.differenceBetween[pairKey];
if (translatedAnswer && faq.difference_question) {
setTranslatedText(qEl, fillTemplate(faq.difference_question, { PAIR: pairKey }));
setTranslatedText(aEl, translatedAnswer);
}
}
});
}

// ---------------------------------------------------------------------
// Long-form SEO article body localization (About/Reverse-conversion/
// Understanding/Where-it's-used/Unit-comparison/Uses-today/History/
// Sources sections). This is a deliberately BOUNDED extension of the
// existing i18n-seo architecture, not a new framework: every fix below
// either (a) re-renders a NUMBER-AND-UNIT-NAME sentence purely from data
// already used elsewhere on the page (getUnitDisplayName()/
// pluralizeUnitDisplayName(), and the ORIGINAL numbers/symbols, both
// left completely unchanged), (b) re-applies i18n-seo data that is
// ALREADY authored and ALREADY used for a different occurrence of the
// exact same content (seoData.whereUsed / seoData.differenceBetween,
// already used by translateFaqItems() above), (c) uses a small set of
// purely STRUCTURAL heading/label templates in the `chrome` namespace
// (parallel to the pre-existing chrome.formula/chrome.about_converting/
// chrome.related_conversions keys) for section headings whose wording is
// 100% mechanical ("Understanding {UNIT}", "History of {UNIT}", etc.) and
// therefore carries no invented factual claim, or (d) reuses new,
// per-unit-scoped data added to i18n-seo/*.json - seoData.unitUsesToday /
// seoData.unitHistory / seoData.unitSources (each keyed by unit.id) and
// seoData.unitDistinctionLabel (keyed by the same pairKey as
// differenceBetween) - which are professionally translated copies of the
// EXACT English sentences/bullets/citations already published on the
// site for that unit (numbers, dates, and unit symbols preserved
// verbatim; only the surrounding prose is translated), never invented
// facts. This data is curated incrementally, unit by unit (started with
// "acre" as the reference/pilot unit); every translateSeoArticleLongform()
// call site above that reads one of these four keys checks for its
// presence (and, for the bullet/paragraph lists, an exact item-count
// match against the original English content) before using it, so a unit
// that hasn't been curated yet - or a page whose English content ever
// changes out from under a stale translation - safely falls back to
// leaving that block in English rather than risk mismatching translated
// text to the wrong facts. See SEO_PAGE_FULL_CONTENT_LOCALIZATION_REPORT.md
// for the original audit that identified this gap.
// ---------------------------------------------------------------------

// Matches a unit-name token (allowing spaces and "/") captured from
// visible text against fromUnit/toUnit by name, case-insensitively, in
// either singular or plural form - the one shared primitive every
// helper below uses instead of assuming DOM position/order.
function matchUnitByName(token, fromUnit, toUnit) {
if (!token) return null;
const norm = String(token).trim().toLowerCase();
const candidates = [fromUnit, toUnit];
for (const unit of candidates) {
if (!unit) continue;
const singular = String(unit.name || "").toLowerCase();
const plural = String(pluralizeUnitName(unit.name) || "").toLowerCase();
if (norm === singular || norm === plural) return unit;
}
return null;
}

// Rebuilds a "{names} = {names} × {factor}" or "{amount} {name} = {amount}
// {name}." style sentence using translated, pluralized unit names in the
// SAME left/right order as the original, while leaving every number
// completely untouched (extracted verbatim from the cached original
// text, never recomputed). Returns null whenever the original text
// doesn't match one of these two purely mechanical shapes, or when
// either side's unit name can't be matched back to fromUnit/toUnit -
// callers leave the element as the original English in that case,
// exactly like every other translate*() helper's graceful-degradation
// contract in this file.
function translateNameFormulaLine(original, fromUnit, toUnit) {
let m = original.match(/^([A-Za-z][A-Za-z\s/]*?)\s*=\s*([A-Za-z][A-Za-z\s/]*?)\s*[×x]\s*([\d.,]+(?:e[+-]?\d+)?)$/i);
if (m) {
const left = matchUnitByName(m[1], fromUnit, toUnit);
const right = matchUnitByName(m[2], fromUnit, toUnit);
if (!left || !right || left === right) return null;
return `${pluralizeUnitDisplayName(left)} = ${pluralizeUnitDisplayName(right)} × ${m[3]}`;
}
m = original.match(/^([\d.,]+(?:e[+-]?\d+)?)\s+([A-Za-z][A-Za-z\s/]*?)\s*=\s*([\d.,]+(?:e[+-]?\d+)?)\s+([A-Za-z][A-Za-z\s/]*?)\.?$/i);
if (m) {
const left = matchUnitByName(m[2], fromUnit, toUnit);
const right = matchUnitByName(m[4], fromUnit, toUnit);
if (!left || !right || left === right) return null;
const period = /\.$/.test(original.trim()) ? "." : "";
return `${m[1]} ${pluralizeUnitDisplayName(left)} = ${m[3]} ${pluralizeUnitDisplayName(right)}${period}`;
}
return null;
}

// "Acre (ac)" -> "英亩（ac）" style table header / heading fragment:
// translated unit name, original symbol and punctuation shape preserved
// exactly. Returns null (leave English) if the captured name doesn't
// match fromUnit/toUnit.
function translateNameSymbolFragment(original, fromUnit, toUnit) {
const m = original.match(/^([A-Za-z][A-Za-z\s/]*?)\s*\(([^)]+)\)$/);
if (!m) return null;
const unit = matchUnitByName(m[1], fromUnit, toUnit);
if (!unit) return null;
return `${getUnitDisplayName(unit)} (${m[2]})`;
}

function translateSeoArticleLongform(seoData, fromUnit, toUnit, category) {
const chrome = seoData.chrome || {};
const faq = seoData.faq || {};
const article = document.querySelector(".seo-article");
if (!article) return;

// Formula-card and reverse-conversion-card lines that restate the
// factor using unit NAMES (not symbols) - see translateNameFormulaLine()
// above. Lines using unit SYMBOLS (e.g. "1 ac × 0.404... = 0.404... a")
// intentionally do not match either pattern and are left as-is, matching
// this project's established convention that unit symbols stay in Latin
// script in every language.
article.querySelectorAll(".info-card-formula, .info-card p > strong").forEach((el) => {
const original = originalText(el);
const translated = translateNameFormulaLine(original, fromUnit, toUnit);
if (translated) setTranslatedText(el, translated);
});

// Formula-explanation paragraph under the main "Formula" info-card.
// Three verbatim-boilerplate variants exist, confirmed by direct
// inspection of many generated pages (not assumed):
//  1. The general "This factor comes from each unit's defined
//     relationship..." sentence - a single, byte-for-byte-fixed
//     template with 5 numeric/unit slots (unit name x2, each unit's
//     own factor-to-base-unit x2, and the resulting ratio) confirmed
//     across every non-temperature, non-currency category sampled
//     (area, length, weight, density, etc.). The unit names are
//     translated via getUnitDisplayName(); every number is carried
//     over VERBATIM from the original English text via regex capture
//     (never recomputed/reformatted), so no rounding or notation
//     mismatch can be introduced.
//  2. Currency's own fixed replacement sentence ("Unlike physical
//     units, currency exchange rates are not fixed by definition..."),
//     confirmed byte-identical across every currency pair in the
//     category - a flat boilerplate string, same pattern as the
//     already-translated "Exchange rate notice." block.
//  3. Temperature's own fixed replacement sentence ("Both scales are
//     converted through Kelvin..."), confirmed byte-identical across
//     every temperature pair - same flat-boilerplate treatment.
article.querySelectorAll(".info-card p").forEach((p) => {
if (p.classList.contains("info-card-formula") || p.querySelector("strong")) return;
const original = originalText(p);
if (chrome.currency_factor_explanation_text && original === "Unlike physical units, currency exchange rates are not fixed by definition — they float continuously on foreign exchange markets. The rate used here is a snapshot and should be confirmed against a live source before any financial decision.") {
setTranslatedText(p, chrome.currency_factor_explanation_text);
return;
}
if (chrome.temperature_factor_explanation_text && original === "Both scales are converted through Kelvin as a common absolute reference point.") {
setTranslatedText(p, chrome.temperature_factor_explanation_text);
return;
}
if (!chrome.factor_explanation_template) return;
const m = original.match(/^This factor comes from each unit's defined relationship to the category's base unit: 1 (.+?) equals (.+?) base units, and 1 (.+?) equals (.+?) base units, so dividing one by the other gives the direct (.+?)-to-(.+?) factor of (.+?)\.$/);
if (!m) return;
const fromSide = matchUnitByName(m[1], fromUnit, toUnit);
const toSide = matchUnitByName(m[3], fromUnit, toUnit);
if (!fromSide || !toSide || fromSide === toSide) return;
setTranslatedText(
p,
fillTemplateSafe(chrome.factor_explanation_template, {
FROM: getUnitDisplayName(fromSide),
FROM_FACTOR: m[2],
TO: getUnitDisplayName(toSide),
TO_FACTOR: m[4],
RATIO: m[7],
})
);
});

// Conversion-table column headers ("Acre (ac)" / "Are (a)").
article.querySelectorAll(".info-card-table th").forEach((el) => {
const translated = translateNameSymbolFragment(originalText(el), fromUnit, toUnit);
if (translated) setTranslatedText(el, translated);
});

// "{FromUnit} vs. {ToUnit}" side-by-side comparison table - a distinct
// structural block (heading + <table class="info-card-table"> with
// Aspect/Family/Typical use/Where it's used rows) that only appears when
// the generator judges the two units meaningfully different in "family"
// (e.g. Angstrom vs. Astronomical unit). Not to be confused with the
// unit-distinction-note ("International acre vs. US survey acre.") block
// above, which compares two *variant* units via a differenceBetween(...)
// lookup - this table always compares the page's own fromUnit/toUnit, so
// its heading and the table's column headers can always be rebuilt
// directly from getUnitDisplayName(), and its "Where it's used" row can
// always be rebuilt from the same seoData.whereUsed(...) data used above.
// The Family/Typical use row CONTENT (free descriptive prose) has no
// translated source anywhere in i18n-seo/*.json, so - same as the
// "This factor comes from..." formula explanation - it is intentionally
// left in English (C, documented gap).
if (chrome.comparison_vs_connector) {
article.querySelectorAll("h3").forEach((h3) => {
const original = originalText(h3);
const m = original.match(/^(.+?)\s+vs\.\s+(.+)$/);
if (!m) return;
const sideA = matchUnitByName(m[1], fromUnit, toUnit);
const sideB = matchUnitByName(m[2], fromUnit, toUnit);
if (!sideA || !sideB || sideA === sideB) return;
const table = h3.nextElementSibling && h3.nextElementSibling.tagName === "TABLE" ? h3.nextElementSibling : null;
if (!table || !table.classList.contains("info-card-table")) return;
setTranslatedText(h3, `${getUnitDisplayName(sideA)}${chrome.comparison_vs_connector}${getUnitDisplayName(sideB)}`);
const headRow = table.querySelector("thead tr");
if (headRow) {
const ths = headRow.querySelectorAll("th");
if (ths.length === 3) {
if (chrome.comparison_aspect_label) setTranslatedText(ths[0], chrome.comparison_aspect_label);
setTranslatedText(ths[1], getUnitDisplayName(sideA));
setTranslatedText(ths[2], getUnitDisplayName(sideB));
}
}
table.querySelectorAll("tbody tr").forEach((tr) => {
const cells = tr.querySelectorAll("td");
if (cells.length !== 3) return;
const rowLabel = originalText(cells[0]);
if (/^Family$/i.test(rowLabel) && chrome.comparison_family_label) {
setTranslatedText(cells[0], chrome.comparison_family_label);
} else if (/^Typical use$/i.test(rowLabel) && chrome.comparison_typical_use_label) {
setTranslatedText(cells[0], chrome.comparison_typical_use_label);
} else if (/^Where it's used$/i.test(rowLabel) && chrome.where_used_label) {
setTranslatedText(cells[0], chrome.where_used_label.replace(/[:：]\s*$/, ""));
const wu = seoData.whereUsed || {};
if (wu[sideA.id]) setTranslatedText(cells[1], wu[sideA.id]);
if (wu[sideB.id]) setTranslatedText(cells[2], wu[sideB.id]);
}
});
});
}

// "Reverse conversion: {TO} to {FROM}" heading.
if (chrome.reverse_conversion_template) {
article.querySelectorAll("h3").forEach((el) => {
const m = originalText(el).match(/^Reverse conversion:\s*(.+?)\s+to\s+(.+)$/i);
if (!m) return;
const toSide = matchUnitByName(m[1], fromUnit, toUnit);
const fromSide = matchUnitByName(m[2], fromUnit, toUnit);
if (!toSide || !fromSide) return;
setTranslatedText(el, fillTemplateSafe(chrome.reverse_conversion_template, { TO: getUnitDisplayName(toSide), FROM: getUnitDisplayName(fromSide) }));
});
}

// "For a page dedicated to this direction, see {link}." - the link text
// itself is translated the same way translateRelatedConversions() below
// translates every other related-conversion link. Rebuilt via
// setTranslatedHtml() (not text-node splicing) so restoreOriginalSeoText()
// can put the original English sentence AND its original link text back
// correctly when the user switches back to English.
if (chrome.see_dedicated_page_prefix && chrome.see_dedicated_page_suffix) {
article.querySelectorAll("p").forEach((p) => {
if (p.children.length !== 1 || p.children[0].tagName !== "A") return;
const original = originalText(p);
if (!/^For a page dedicated to this direction, see .+\.$/.test(original)) return;
const a = p.children[0];
const href = a.getAttribute("href") || "";
let linkText = a.textContent;
if (typeof deriveConversionFromPath === "function") {
const linkCtx = href && deriveConversionFromPath(href);
const linkCategory = linkCtx && categoryMap.get(linkCtx.categoryId);
const linkFrom = linkCategory && getUnit(linkCategory, linkCtx.fromUnitId);
const linkTo = linkCategory && getUnit(linkCategory, linkCtx.toUnitId);
if (linkFrom && linkTo) linkText = `${getUnitDisplayName(linkFrom)} → ${getUnitDisplayName(linkTo)}`;
}
setTranslatedHtml(p, `${escapeHtml(chrome.see_dedicated_page_prefix)}<a href="${escapeHtml(href)}">${escapeHtml(linkText)}</a>${escapeHtml(chrome.see_dedicated_page_suffix)}`);
});
}

// "Understanding the {UNIT}" / "Understanding the {UNIT} ({SYMBOL})"
// heading, plus its immediately-following definition paragraph -
// simplified, for every language, to the same "{UNIT} ({SYMBOL}).
// {DEFINITION}" shape the FAQ's own "What is a {UNIT}?" answer already
// uses (faq.q4_answer) rather than attempting to reproduce the longer
// English sentence's additional "measures {dimension}"/"classified as
// {type}" clauses, for which no translated data exists anywhere in
// i18n-seo/*.json (see the quantity/family audit in
// SEO_PAGE_LONGFORM_LOCALIZATION_ARCHITECTURE_AUDIT.md).
//
// The original English paragraph wraps its dimension word in <strong>
// (e.g. "measures <strong>area</strong>"). Using setTranslatedHtml()
// here - not setTranslatedText() - is required even though the
// replacement text itself has no markup: it's what makes
// restoreOriginalSeoText() put the TRUE original HTML (bold tag
// included) back when the user switches to English, instead of a
// plain-text reconstruction that would permanently lose the <strong>
// the very first time this paragraph is translated. escapeHtml() below
// keeps this safe against a DEFINITION value that happens to contain
// HTML-significant characters.
article.querySelectorAll("h3").forEach((el) => {
const m = originalText(el).match(/^Understanding the (.+?)(?:\s*\(([^)]+)\))?$/);
if (!m) return;
const unit = matchUnitByName(m[1], fromUnit, toUnit);
if (!unit) return;
const hasSymbol = !!m[2];
const key = hasSymbol ? "understanding_with_symbol_template" : "understanding_template";
if (chrome[key]) {
setTranslatedText(el, fillTemplateSafe(chrome[key], { UNIT: getUnitDisplayName(unit), SYMBOL: unit.symbol }));
}
if (!faq.q4_answer) return;
const bodyP = el.nextElementSibling;
if (!bodyP || bodyP.tagName !== "P" || bodyP.classList.contains("unit-distinction-note") || bodyP.classList.contains("unit-origin-note")) return;
const def = getUnitDisplayDefinition(unit);
if (def) setTranslatedHtml(bodyP, escapeHtml(fillTemplateSafe(faq.q4_answer, { UNIT: getUnitDisplayName(unit), SYMBOL: unit.symbol, DEFINITION: def })));
});

// "Where it's used:" paragraphs - reuses seoData.whereUsed[unit.id],
// the SAME already-translated data translateFaqItems() above uses for
// the "Where is the {UNIT} still used today?" FAQ answer. Assigned in
// document order to whichever of fromUnit/toUnit actually has an entry
// (the generator always places the from-unit's "Understanding" section
// before the to-unit's, so first-in-document-order reliably means
// from-unit first when both have entries).
if (chrome.where_used_label) {
const whereUsedCandidates = [fromUnit, toUnit].filter((u) => seoData.whereUsed && seoData.whereUsed[u.id]);
let cursor = 0;
article.querySelectorAll("p > strong").forEach((strongEl) => {
// setTranslatedHtml() below replaces the whole paragraph's innerHTML,
// so on a second language switch this <strong> is a freshly-created
// element, not the one whose original text originalText() cached -
// the paragraph itself (p) is what persists across repeated switches,
// so once its true original HTML is cached, matching against THAT
// (rather than against strongEl's possibly-already-translated text)
// is what makes this correctly identify the same paragraph again on
// every subsequent switch, not just the first one.
const p = strongEl.parentElement;
const knownOriginal = p.dataset.i18nSeoOriginalHtml !== undefined ? p.dataset.i18nSeoOriginalHtml : originalText(strongEl);
const plainKnownOriginal = knownOriginal.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
if (!/^Where it's used:/.test(plainKnownOriginal)) return;
const unit = whereUsedCandidates[cursor];
if (!unit) return;
cursor += 1;
const translated = seoData.whereUsed[unit.id];
setTranslatedHtml(p, `<strong>${escapeHtml(chrome.where_used_label)}</strong> ${escapeHtml(translated)}`);
});
}

// Unit-comparison note (e.g. "International acre vs. US survey acre.")
// - reuses seoData.differenceBetween[pairKey], the SAME already-
// translated data translateFaqItems() above uses for the "What is the
// difference between {PAIR}?" FAQ answer. The bold pair-LABEL itself is
// looked up in the new seoData.unitDistinctionLabel[pairKey] (keyed by the
// exact same pairKey as differenceBetween, since both describe the same
// pair) - falling back to the original English label, unchanged, when a
// pair hasn't been curated yet, so uncovered pairs degrade exactly as
// before rather than showing a blank or mismatched label.
article.querySelectorAll("p.unit-distinction-note").forEach((p) => {
const strongEl = p.querySelector("strong");
if (!strongEl) return;
const label = originalText(strongEl).replace(/\.$/, "");
const pairKey = Object.keys(seoData.differenceBetween || {}).find((k) => k.toLowerCase() === label.toLowerCase());
const translated = pairKey && seoData.differenceBetween[pairKey];
if (!translated) return;
const translatedLabel = (pairKey && seoData.unitDistinctionLabel && seoData.unitDistinctionLabel[pairKey]) || originalText(strongEl);
setTranslatedHtml(p, `<strong>${escapeHtml(translatedLabel)}</strong> ${escapeHtml(translated)}`);
});

// "Uses of the {UNIT} today" heading, plus the bullet list beneath it -
// reuses the new seoData.unitUsesToday[unit.id] (an array of translated
// bullet strings, authored one-for-one from the already-published English
// <li> facts - never invented). originalHtml(list) caches the list's TRUE
// original innerHTML on first touch, so counting <li> occurrences in that
// cached string (not the possibly-already-translated live DOM) is what
// makes the length check reliable on a second or third language switch,
// not just the first. Only applied when the counts match exactly, so a
// unit that isn't curated yet (or whose English bullet count ever changes)
// safely falls back to leaving the list in English rather than
// mismatching a translated bullet to the wrong fact.
if (chrome.uses_today_template) {
article.querySelectorAll("h4").forEach((el) => {
const m = originalText(el).match(/^Uses of the (.+) today$/);
if (!m) return;
const unit = matchUnitByName(m[1], fromUnit, toUnit);
if (unit) setTranslatedText(el, fillTemplateSafe(chrome.uses_today_template, { UNIT: getUnitDisplayName(unit) }));
if (!unit) return;
const list = el.nextElementSibling;
if (!list || list.tagName !== "UL") return;
const translatedItems = seoData.unitUsesToday && seoData.unitUsesToday[unit.id];
if (!translatedItems) return;
const originalItemCount = (originalHtml(list).match(/<li>/g) || []).length;
if (originalItemCount !== translatedItems.length) return;
setTranslatedHtml(list, translatedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join(""));
});
}

// "History of the {UNIT}" heading, plus the narrative paragraph(s)
// beneath it - reuses the new seoData.unitHistory[unit.id] (an array of
// translated paragraph strings, one per already-authored English <p>).
// Every number, date, and unit symbol inside these paragraphs is
// preserved verbatim in the translated text - only the surrounding prose
// is translated, so the underlying facts never change. Collects the
// contiguous run of plain <p> siblings after the heading, stopping at the
// first non-<p> or at the "Historical origin."/unit-distinction-note
// paragraph (both already handled by their own blocks elsewhere in this
// function), and only applies the translation when the paragraph counts
// match exactly - the same conservative guard used for the Uses-today
// bullet list above.
if (chrome.history_of_template) {
article.querySelectorAll("h4").forEach((el) => {
const m = originalText(el).match(/^History of the (.+)$/);
if (!m) return;
const unit = matchUnitByName(m[1], fromUnit, toUnit);
if (unit) setTranslatedText(el, fillTemplateSafe(chrome.history_of_template, { UNIT: getUnitDisplayName(unit) }));
if (!unit) return;
const paragraphs = [];
let node = el.nextElementSibling;
while (node && node.tagName === "P" && !node.classList.contains("unit-origin-note") && !node.classList.contains("unit-distinction-note")) {
paragraphs.push(node);
node = node.nextElementSibling;
}
const translatedParas = seoData.unitHistory && seoData.unitHistory[unit.id];
if (!translatedParas || translatedParas.length !== paragraphs.length) return;
paragraphs.forEach((p, index) => setTranslatedText(p, translatedParas[index]));
});
}

// "Historical origin." label + its fixed, mechanical "{UNIT} was not the
// invention of a single named person..." sentence (confirmed identical,
// verbatim except for the unit name, across every sampled page/unit).
// Rebuilt via setTranslatedHtml() on the paragraph itself, not on the
// <strong> label alone - caching the label's own original text with
// originalText() would ALSO register the surrounding <p> for the
// plain-text restore path the first time its (unrelated) textContent
// got read, which would destroy the <strong> element (and its bold
// styling) the next time the user switches back to English. Matched
// against the paragraph's own cached original HTML (once set on the
// first pass) rather than the <strong> element's current text, since
// setTranslatedHtml() replaces that <strong> with a fresh element on
// every subsequent language switch - see the identical reasoning on the
// "Where it's used:" block above.
article.querySelectorAll("p.unit-origin-note > strong").forEach((strongEl) => {
const p = strongEl.parentElement;
const knownOriginal = p.dataset.i18nSeoOriginalHtml !== undefined ? p.dataset.i18nSeoOriginalHtml : p.textContent;
const plainOriginal = knownOriginal.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
if (!/^Historical origin\./.test(plainOriginal) || !chrome.historical_origin_label) return;
const m = plainOriginal.match(/Historical origin\.\s*(.+?) was not the invention of a single named person; it developed through the process described above\.$/);
if (!m || !chrome.no_named_inventor_template) return;
const unit = matchUnitByName(m[1], fromUnit, toUnit);
if (!unit) return;
setTranslatedHtml(p, `<strong>${escapeHtml(chrome.historical_origin_label)}</strong> ${escapeHtml(fillTemplateSafe(chrome.no_named_inventor_template, { UNIT: getUnitDisplayName(unit) }))}`);
});

// "Exchange rate notice." label + its fixed sentence - the currency
// category's own variant of the SAME p.unit-origin-note structural slot
// used by "Historical origin." above (currency pages render one or the
// other, never both). Confirmed byte-identical, with zero variable
// content, across every sampled currency pair, so - unlike the
// per-category Family/Typical-use prose elsewhere in this function -
// this is safe to translate as a flat, non-templated fixed string.
article.querySelectorAll("p.unit-origin-note > strong").forEach((strongEl) => {
const p = strongEl.parentElement;
const knownOriginal = p.dataset.i18nSeoOriginalHtml !== undefined ? p.dataset.i18nSeoOriginalHtml : p.textContent;
const plainOriginal = knownOriginal.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
if (!/^Exchange rate notice\./.test(plainOriginal) || !chrome.exchange_rate_notice_label || !chrome.exchange_rate_notice_text) return;
setTranslatedHtml(p, `<strong>${escapeHtml(chrome.exchange_rate_notice_label)}</strong> ${escapeHtml(chrome.exchange_rate_notice_text)}`);
});

// "{UNIT} — sources" heading, plus the citation list beneath it - reuses
// the new seoData.unitSources[unit.id] (an array of translated citation
// strings, one per already-authored English <li>). The organization name
// and document-title portion of each citation (e.g. "NIST — US Survey
// Foot: Revised Unit Conversion Factors") names a real, citable English
// publication and is kept verbatim in every language - only the
// descriptive clause after it is translated - so the citation stays
// findable. Same originalHtml()-based count guard as the Uses-today
// bullet list above.
if (chrome.sources_label_template) {
article.querySelectorAll(".about-sources h4").forEach((el) => {
const m = originalText(el).match(/^(.+?)\s*—\s*sources$/);
if (!m) return;
const unit = matchUnitByName(m[1], fromUnit, toUnit);
if (unit) setTranslatedText(el, fillTemplateSafe(chrome.sources_label_template, { UNIT: getUnitDisplayName(unit) }));
if (!unit) return;
const list = el.nextElementSibling;
if (!list || list.tagName !== "UL") return;
const translatedItems = seoData.unitSources && seoData.unitSources[unit.id];
if (!translatedItems) return;
const originalItemCount = (originalHtml(list).match(/<li>/g) || []).length;
if (originalItemCount !== translatedItems.length) return;
setTranslatedHtml(list, translatedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join(""));
});
}
}

// Related-conversion links are translated purely by re-deriving each
// link's own from/to unit pair from its href with the SAME
// deriveConversionFromPath() the converter widget already relies on -
// matching the "mechanically derived from translated unit names, no
// separate related-conversion prose dataset required" architecture.
function translateRelatedConversions(seoData) {
if (typeof deriveConversionFromPath !== "function") return;
document.querySelectorAll(".page-card .seo-link-list a").forEach((a) => {
const href = a.getAttribute("href");
if (!href) return;
const linkCtx = deriveConversionFromPath(href);
if (linkCtx) {
const category = categoryMap.get(linkCtx.categoryId);
const fromUnit = category && getUnit(category, linkCtx.fromUnitId);
const toUnit = category && getUnit(category, linkCtx.toUnitId);
if (fromUnit && toUnit) {
setTranslatedText(a, `${getUnitDisplayName(fromUnit)} → ${getUnitDisplayName(toUnit)}`);
return;
}
}
// "All {category} conversions" style link (single-segment href like
// "/area/") - translate using the category name only.
const segments = href.split("/").filter(Boolean);
if (segments.length === 1) {
const idForSlug = { "flow-rate": "flow", "fuel-economy": "fuel_economy" };
const categoryId = idForSlug[segments[0]] || segments[0];
const category = categoryMap.get(categoryId);
const chrome = seoData.chrome || {};
if (category && chrome.all_conversions_prefix) {
setTranslatedText(a, `${chrome.all_conversions_prefix} ${getCategoryDisplayName(category)}`);
}
}
});
}

function hydrateSeoArticleContent(seoData) {
if (!document.body || !document.body.classList.contains("seo-page")) return;
translateChromeLabels(seoData);
translateRelatedConversions(seoData);
if (typeof deriveConversionFromPath !== "function") return;
const ctx = deriveConversionFromPath(typeof preferredPagePath === "function" ? preferredPagePath() : location.pathname)
|| deriveConversionFromPath(location.pathname);
if (!ctx) return;
const category = categoryMap.get(ctx.categoryId);
if (!category) return;
const fromUnit = getUnit(category, ctx.fromUnitId);
const toUnit = getUnit(category, ctx.toUnitId);
if (!fromUnit || !toUnit) return;
translateHeroAndAboutHeading(seoData, fromUnit, toUnit, category);
translateFaqItems(seoData, fromUnit, toUnit, category);
translateSeoArticleLongform(seoData, fromUnit, toUnit, category);
}

// Re-renders the interactive converter widget's language-aware pieces
// (unit dropdown labels, active category name, definition panel, formula)
// for the currently selected category/unit pair, reusing the exact
// selection already in `state` - it does not change what is selected,
// only how its labels are displayed.
function refreshLanguageAwareConverter() {
// The left category sidebar (#categoryList) and the homepage category
// overview (#overviewGrid) are independent render targets from the
// active-converter widget below - each writes its own category
// name/description directly, so a language switch has to re-run them
// too, not just re-populate the unit dropdowns. Both renderCategoryList()
// and renderOverview() already no-op safely when their target element
// isn't present on the current page (category pages have no
// #overviewGrid; the homepage has no #categoryList), so it's safe to
// call both unconditionally here rather than branch on page type.
if (typeof renderCategoryList === "function") {
renderCategoryList(byId("unitSearch") ? byId("unitSearch").value || "" : "");
}
if (typeof renderOverview === "function") renderOverview();
// Same reasoning as the two calls above: applyTranslations() also calls
// renderStoredLists() (favorites/recent list), but it does so BEFORE
// applySeoTranslations() (which calls this function) has updated the
// global currentLanguageCode - so that earlier call renders with the
// previous language's getCategoryDisplayName() results. Re-running it
// here, after currentLanguageCode is current, is what actually localizes
// the favorites/recent button text (added for targeted homepage
// remediation item 6; previously invisible because the list items used
// the raw English category.name unconditionally, which happened to be
// correct or not depending on this exact ordering).
if (typeof renderStoredLists === "function") renderStoredLists();
// Same reasoning again: the homepage's "Popular Conversions" grid
// (#popularGrid) is rendered once at init time and otherwise never
// touched, so its category labels and (for non-English) composed
// conversion names would stay frozen in whatever language was active on
// first paint unless re-rendered here, after currentLanguageCode is
// current.
if (typeof renderPopularConversions === "function") renderPopularConversions();
// Same reasoning again: the header's "Categories" dropdown (desktop nav
// + mobile drawer submenu) is JS-rendered from NAV_CATEGORIES via
// renderCategoryDropdownMenus()/renderMobileDrawer(), both of which
// resolve their labels through getCategoryDisplayName() - so, like
// renderStoredLists()/renderPopularConversions() above, they must be
// re-run here (after currentLanguageCode/currentSeoData() are current),
// not from applyTranslations(), or they'd render the previous language.
if (typeof renderCategoryDropdownMenus === "function") renderCategoryDropdownMenus();
if (typeof renderMobileDrawer === "function" && typeof mobileDrawerReady !== "undefined" && mobileDrawerReady) renderMobileDrawer();
if (typeof state === "undefined" || !state || !state.categoryId) return;
if (!byId("fromUnit") || !byId("toUnit")) return;
const category = categoryMap.get(state.categoryId);
if (!category) return;
const nameEl = byId("activeCategoryName");
if (nameEl) nameEl.textContent = getCategoryDisplayName(category);
const kindEl = byId("activeCategoryKind");
if (kindEl) kindEl.textContent = categoryKindLabel(category);
// SEO page breadcrumb's 2nd link is this page's own category (e.g.
// "Area"), always immediately after the "Home" link handled in
// applyTranslations() above. Same English-keeps-its-own-short-label
// reasoning already established for the header's Categories dropdown
// (renderCategoryDropdownMenus()): English restores NAV_CATEGORIES' own
// short label (matching this breadcrumb's original static text, e.g.
// "Area", not the long "Area Converter" form getCategoryDisplayName()
// would otherwise return for English), while every other language uses
// getCategoryDisplayName() (the same authoritative i18n-seo short name
// already used everywhere else). The breadcrumb's href is never touched,
// so seoPageRestrictedCategoryId()/the SEO route/canonical URL are
// unaffected. The homepage has no .breadcrumb element, so this is a
// no-op there. (Shared with selectCategory(), which calls the same
// helper during initial page load so the breadcrumb is correct even
// before any language switch happens.)
updateSeoBreadcrumbCategory(category);
populateSelect(byId("fromUnit"), category.units, state.fromUnitId);
populateSelect(byId("toUnit"), category.units, state.toUnitId);
if (typeof updateConversion === "function") updateConversion();
}

// Entry point, called from applyLanguage() every time the language
// selector changes (including on initial page load, from the stored
// preference). English performs a cheap restore/refresh with no network
// request; every other language lazy-loads its JSON once, then caches it
// for the rest of the session.
function applySeoTranslations(langCode) {
currentLanguageCode = langCode;
if (langCode === DEFAULT_LANGUAGE_CODE) {
restoreOriginalSeoText();
refreshLanguageAwareConverter();
return;
}
loadSeoTranslations(langCode).then((seoData) => {
// The user may have switched languages again while this was in
// flight - never apply a stale response on top of a newer choice.
if (currentLanguageCode !== langCode || !seoData) return;
hydrateSeoArticleContent(seoData);
refreshLanguageAwareConverter();
});
}
}());
