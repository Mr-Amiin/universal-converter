(function () {
"use strict";
// Single source of truth for the site-wide "Categories" nav dropdown.
// Every page's dropdown (desktop #categoriesNavMenu and mobile
// #categoriesNavMenuMobile) is rendered from this list by
// renderCategoryDropdownMenus() below, so adding, removing, or
// reordering a category here updates every page automatically.
const NAV_CATEGORIES = [
{ href: "/length/", label: "Length" },
{ href: "/area/", label: "Area" },
{ href: "/volume/", label: "Volume" },
{ href: "/weight/", label: "Weight" },
{ href: "/temperature/", label: "Temperature" },
{ href: "/time/", label: "Time" },
{ href: "/speed/", label: "Speed" },
{ href: "/pressure/", label: "Pressure" },
{ href: "/power/", label: "Power" },
{ href: "/energy/", label: "Energy" },
{ href: "/electricity/", label: "Electricity" },
{ href: "/frequency/", label: "Frequency" },
{ href: "/angle/", label: "Angle" },
{ href: "/digital/", label: "Digital storage" },
{ href: "/currency/", label: "Currency" },
{ href: "/density/", label: "Density" },
{ href: "/flow-rate/", label: "Flow Rate" },
{ href: "/agriculture/", label: "Agriculture" },
{ href: "/astronomy/", label: "Astronomy" },
{ href: "/chemistry/", label: "Chemistry" },
{ href: "/cooking/", label: "Cooking" },
{ href: "/engineering/", label: "Engineering" },
{ href: "/force/", label: "Force" },
{ href: "/fuel-economy/", label: "Fuel Economy" },
{ href: "/radiation/", label: "Radiation" },
{ href: "/scientific/", label: "Scientific" },
{ href: "/torque/", label: "Torque" }
];
function renderCategoryDropdownMenus() {
const menus = document.querySelectorAll("#categoriesNavMenu, #categoriesNavMenuMobile");
if (!menus.length) return;
const itemsHtml = NAV_CATEGORIES.map(
(category) => `<li><a href="${category.href}">${category.label}</a></li>`
).join("");
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
const unitCountSuffix = restrictedId ? ` (${categoryMap.get(restrictedId).units.length.toLocaleString("en-US")} units)` : "";
return `<li><a class="mobile-drawer-category-link" href="${category.href}">${icon}<span>${category.label}${unitCountSuffix}</span></a></li>`;
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
const TRANSLATIONS = {
en: {
nav: { home: "Home", converter: "Converter", categories: "Categories", allCategories: "All categories", calculators: "Calculators", popular: "Popular", guides: "Guides", sitemap: "Sitemap", about: "About", contact: "Contact", search: "Search", language: "Language", theme: "Theme", menu: "Menu" },
converter: { searchAllUnits: "Search all units", fromUnit: "From Unit", toUnit: "To Unit", swap: "Swap units", decimalControl: "Decimal control", notation: "Notation", notationAuto: "Auto", notationDecimal: "Decimal", notationScientific: "Scientific", notationEngineering: "Engineering", result: "Result", copyResult: "Copy result", share: "Share", favorite: "Favorite", contextValues: "Context values", fromDefinition: "From definition", toDefinition: "To definition", formula: "Formula", enterValue: "Enter a number to convert", useDecimalNotation: "Use decimal or scientific notation, such as 1.25e6." },
sidebar: { advertisement: "Advertisement", favoriteConverters: "Favorite converters", recentlyUsed: "Recently used", conversionHistory: "Conversion history", clear: "Clear", noFavorites: "No favorites yet. Save a converter to keep it here.", noRecent: "Recent converters will appear here after you use them.", noHistory: "Your latest conversions stay on this device and work offline." },
common: { resultCopied: "Result copied to clipboard.", copyUnavailable: "Copy is unavailable in this browser, but the result is ready to select.", shareOpened: "Share dialog opened.", shareCopied: "Share text copied to clipboard.", shareCancelled: "Share was cancelled or unavailable.", addApiEndpoint: "Add an API endpoint or use offline fallback rates.", couldNotLoadRates: "Could not load live rates. Offline fallback remains active." },
categories: { unitsLabel: "units", conversionPagesLabel: "conversion pages" },
homepage: { heroTitle: "Convert Any Unit Instantly", heroDescription: "Universal Converter is a free, all-in-one conversion platform covering 27 measurement categories and over 6,400 units, including length, weight, temperature, volume, currency, digital storage, pressure, agriculture, astronomy, cooking, and engineering. Search or browse by category, get instant accurate results with source definitions and formulas, and use the same converter for everyday tasks, scientific work, and business calculations, online or offline.", chipLength: "Length", chipWeight: "Weight", chipTemperature: "Temperature", chipVolume: "Volume", chipPressure: "Pressure", chipDigital: "Digital Storage", chipCurrency: "Currency", chipAgriculture: "Agriculture", chipFlow: "Flow Rate", adSpace: "Ad space", adSpaceCalculatorText: "Display ads help keep this calculator free to use.", adSpaceSiteText: "Display ads help keep this site free to use." },
messages: { sameUnit: "Same-unit conversion.", currencyOfflineNote: "Currency uses offline fallback rates unless live API rates were loaded.", temperatureNote: "Temperature conversion uses Kelvin as the intermediate absolute scale.", chooseCompatibleFamiliesMessage: "Choose compatible unit families", differentThingsNote: "{FROM} and {TO} measure different things.", fuelZeroMessage: "Enter a nonzero fuel economy value", fuelInvertNote: "Consumption units invert the efficiency value.", fuelSupportsNote: "Fuel economy supports both distance-per-volume and volume-per-distance units.", electricitySameFamilyNote: "Electrical units in the same family convert directly.", electricityNeedContextMessage: "Add the needed electrical context", electricityNeedContextNote: "Cross-family electrical calculations need voltage, current, resistance, or hours.", electricityContextNote: "Electrical result uses the context values shown above.", conversionUnavailableMessage: "Conversion unavailable", needCompatibleUnitsNote: "This conversion needs compatible units.", resultsUpdateNote: "Results update instantly as you type." }
},
es: {
nav: { home: "Inicio", converter: "Conversor", categories: "Categorías", allCategories: "Todas las categorías", calculators: "Calculadoras", popular: "Popular", guides: "Guías", sitemap: "Mapa del sitio", about: "Acerca de", contact: "Contacto", search: "Buscar", language: "Idioma", theme: "Tema", menu: "Menú" },
converter: { searchAllUnits: "Buscar todas las unidades", fromUnit: "Unidad de origen", toUnit: "Unidad de destino", swap: "Intercambiar unidades", decimalControl: "Control de decimales", notation: "Notación", notationAuto: "Automática", notationDecimal: "Decimal", notationScientific: "Científica", notationEngineering: "Ingeniería", result: "Resultado", copyResult: "Copiar resultado", share: "Compartir", favorite: "Favorito", contextValues: "Valores de contexto", fromDefinition: "Definición de origen", toDefinition: "Definición de destino", formula: "Fórmula", enterValue: "Introduce un número para convertir", useDecimalNotation: "Usa notación decimal o científica, como 1.25e6." },
sidebar: { advertisement: "Publicidad", favoriteConverters: "Conversores favoritos", recentlyUsed: "Usados recientemente", conversionHistory: "Historial de conversiones", clear: "Borrar", noFavorites: "Aún no hay favoritos. Guarda un conversor para verlo aquí.", noRecent: "Los conversores recientes aparecerán aquí después de usarlos.", noHistory: "Tus conversiones más recientes permanecen en este dispositivo y funcionan sin conexión." },
common: { resultCopied: "Resultado copiado al portapapeles.", copyUnavailable: "Copiar no está disponible en este navegador, pero el resultado está listo para seleccionar.", shareOpened: "Se abrió el diálogo para compartir.", shareCopied: "Texto para compartir copiado al portapapeles.", shareCancelled: "Se canceló o no está disponible la función de compartir.", addApiEndpoint: "Agrega un endpoint de API o usa las tasas sin conexión.", couldNotLoadRates: "No se pudieron cargar las tasas en vivo. Sigue activo el modo sin conexión." },
categories: { unitsLabel: "unidades", conversionPagesLabel: "páginas de conversión" },
homepage: { heroTitle: "Convierte cualquier unidad al instante", heroDescription: "Universal Converter es una plataforma de conversión gratuita y todo en uno que cubre 27 categorías de medición y más de 6400 unidades, incluyendo longitud, peso, temperatura, volumen, moneda, almacenamiento digital, presión, agricultura, astronomía, cocina e ingeniería. Busca o navega por categoría, obtén resultados precisos al instante con definiciones y fórmulas de referencia, y usa el mismo conversor para tareas cotidianas, trabajo científico y cálculos empresariales, en línea o sin conexión.", chipLength: "Longitud", chipWeight: "Peso", chipTemperature: "Temperatura", chipVolume: "Volumen", chipPressure: "Presión", chipDigital: "Almacenamiento digital", chipCurrency: "Moneda", chipAgriculture: "Agricultura", chipFlow: "Caudal", adSpace: "Espacio publicitario", adSpaceCalculatorText: "Los anuncios ayudan a mantener esta calculadora gratuita.", adSpaceSiteText: "Los anuncios ayudan a mantener este sitio gratuito." },
messages: { sameUnit: "Conversión entre la misma unidad.", currencyOfflineNote: "La moneda usa tasas de referencia sin conexión a menos que se hayan cargado tasas en vivo de la API.", temperatureNote: "La conversión de temperatura usa Kelvin como escala absoluta intermedia.", chooseCompatibleFamiliesMessage: "Elige familias de unidades compatibles", differentThingsNote: "{FROM} y {TO} miden cosas diferentes.", fuelZeroMessage: "Introduce un valor de consumo de combustible distinto de cero", fuelInvertNote: "Las unidades de consumo invierten el valor de eficiencia.", fuelSupportsNote: "El consumo de combustible admite unidades de distancia por volumen y de volumen por distancia.", electricitySameFamilyNote: "Las unidades eléctricas de la misma familia se convierten directamente.", electricityNeedContextMessage: "Añade el contexto eléctrico necesario", electricityNeedContextNote: "Los cálculos eléctricos entre familias distintas necesitan voltaje, corriente, resistencia u horas.", electricityContextNote: "El resultado eléctrico usa los valores de contexto mostrados arriba.", conversionUnavailableMessage: "Conversión no disponible", needCompatibleUnitsNote: "Esta conversión necesita unidades compatibles.", resultsUpdateNote: "Los resultados se actualizan al instante mientras escribes." }
},
fr: {
nav: { home: "Accueil", converter: "Convertisseur", categories: "Catégories", allCategories: "Toutes les catégories", calculators: "Calculatrices", popular: "Populaire", guides: "Guides", sitemap: "Plan du site", about: "À propos", contact: "Contact", search: "Rechercher", language: "Langue", theme: "Thème", menu: "Menu" },
converter: { searchAllUnits: "Rechercher toutes les unités", fromUnit: "Unité de départ", toUnit: "Unité d'arrivée", swap: "Inverser les unités", decimalControl: "Contrôle des décimales", notation: "Notation", notationAuto: "Automatique", notationDecimal: "Décimale", notationScientific: "Scientifique", notationEngineering: "Ingénierie", result: "Résultat", copyResult: "Copier le résultat", share: "Partager", favorite: "Favori", contextValues: "Valeurs de contexte", fromDefinition: "Définition de départ", toDefinition: "Définition d'arrivée", formula: "Formule", enterValue: "Entrez un nombre à convertir", useDecimalNotation: "Utilisez la notation décimale ou scientifique, par exemple 1.25e6." },
sidebar: { advertisement: "Publicité", favoriteConverters: "Convertisseurs favoris", recentlyUsed: "Utilisés récemment", conversionHistory: "Historique des conversions", clear: "Effacer", noFavorites: "Aucun favori pour l'instant. Enregistrez un convertisseur pour le retrouver ici.", noRecent: "Les convertisseurs récents apparaîtront ici après utilisation.", noHistory: "Vos dernières conversions restent sur cet appareil et fonctionnent hors ligne." },
common: { resultCopied: "Résultat copié dans le presse-papiers.", copyUnavailable: "La copie n'est pas disponible dans ce navigateur, mais le résultat peut être sélectionné.", shareOpened: "Boîte de dialogue de partage ouverte.", shareCopied: "Texte de partage copié dans le presse-papiers.", shareCancelled: "Le partage a été annulé ou n'est pas disponible.", addApiEndpoint: "Ajoutez un point d'accès API ou utilisez les taux hors ligne.", couldNotLoadRates: "Impossible de charger les taux en direct. Le mode hors ligne reste actif." },
categories: { unitsLabel: "unités", conversionPagesLabel: "pages de conversion" },
homepage: { heroTitle: "Convertissez n'importe quelle unité instantanément", heroDescription: "Universal Converter est une plateforme de conversion gratuite et tout-en-un couvrant 27 catégories de mesure et plus de 6 400 unités, notamment la longueur, le poids, la température, le volume, la devise, le stockage numérique, la pression, l'agriculture, l'astronomie, la cuisine et l'ingénierie. Recherchez ou parcourez par catégorie, obtenez des résultats précis et instantanés avec des définitions et formules sources, et utilisez le même convertisseur pour les tâches quotidiennes, le travail scientifique et les calculs professionnels, en ligne ou hors ligne.", chipLength: "Longueur", chipWeight: "Poids", chipTemperature: "Température", chipVolume: "Volume", chipPressure: "Pression", chipDigital: "Stockage numérique", chipCurrency: "Devise", chipAgriculture: "Agriculture", chipFlow: "Débit", adSpace: "Espace publicitaire", adSpaceCalculatorText: "Les publicités aident à garder cette calculatrice gratuite.", adSpaceSiteText: "Les publicités aident à garder ce site gratuit." },
messages: { sameUnit: "Conversion entre unités identiques.", currencyOfflineNote: "La devise utilise des taux de référence hors ligne, sauf si des taux en direct de l'API ont été chargés.", temperatureNote: "La conversion de température utilise le Kelvin comme échelle absolue intermédiaire.", chooseCompatibleFamiliesMessage: "Choisissez des familles d'unités compatibles", differentThingsNote: "{FROM} et {TO} mesurent des choses différentes.", fuelZeroMessage: "Entrez une valeur de consommation de carburant non nulle", fuelInvertNote: "Les unités de consommation inversent la valeur d'efficacité.", fuelSupportsNote: "La consommation de carburant prend en charge les unités de distance par volume et de volume par distance.", electricitySameFamilyNote: "Les unités électriques de la même famille se convertissent directement.", electricityNeedContextMessage: "Ajoutez le contexte électrique nécessaire", electricityNeedContextNote: "Les calculs électriques entre familles différentes nécessitent une tension, un courant, une résistance ou des heures.", electricityContextNote: "Le résultat électrique utilise les valeurs de contexte affichées ci-dessus.", conversionUnavailableMessage: "Conversion indisponible", needCompatibleUnitsNote: "Cette conversion nécessite des unités compatibles.", resultsUpdateNote: "Les résultats se mettent à jour instantanément pendant que vous tapez." }
},
de: {
nav: { home: "Startseite", converter: "Umrechner", categories: "Kategorien", allCategories: "Alle Kategorien", calculators: "Rechner", popular: "Beliebt", guides: "Anleitungen", sitemap: "Sitemap", about: "Über uns", contact: "Kontakt", search: "Suche", language: "Sprache", theme: "Design", menu: "Menü" },
converter: { searchAllUnits: "Alle Einheiten durchsuchen", fromUnit: "Von-Einheit", toUnit: "Zu-Einheit", swap: "Einheiten tauschen", decimalControl: "Dezimalstellen", notation: "Schreibweise", notationAuto: "Automatisch", notationDecimal: "Dezimal", notationScientific: "Wissenschaftlich", notationEngineering: "Technisch", result: "Ergebnis", copyResult: "Ergebnis kopieren", share: "Teilen", favorite: "Favorit", contextValues: "Kontextwerte", fromDefinition: "Definition (von)", toDefinition: "Definition (zu)", formula: "Formel", enterValue: "Zahl zum Umrechnen eingeben", useDecimalNotation: "Verwenden Sie Dezimal- oder wissenschaftliche Schreibweise, z. B. 1.25e6." },
sidebar: { advertisement: "Werbung", favoriteConverters: "Favorisierte Umrechner", recentlyUsed: "Zuletzt verwendet", conversionHistory: "Umrechnungsverlauf", clear: "Löschen", noFavorites: "Noch keine Favoriten. Speichern Sie einen Umrechner, damit er hier erscheint.", noRecent: "Zuletzt verwendete Umrechner erscheinen hier nach der Nutzung.", noHistory: "Ihre letzten Umrechnungen bleiben auf diesem Gerät gespeichert und funktionieren offline." },
common: { resultCopied: "Ergebnis in die Zwischenablage kopiert.", copyUnavailable: "Kopieren ist in diesem Browser nicht verfügbar, das Ergebnis kann aber markiert werden.", shareOpened: "Teilen-Dialog geöffnet.", shareCopied: "Text zum Teilen in die Zwischenablage kopiert.", shareCancelled: "Teilen wurde abgebrochen oder ist nicht verfügbar.", addApiEndpoint: "Fügen Sie einen API-Endpunkt hinzu oder nutzen Sie die Offline-Kurse.", couldNotLoadRates: "Live-Kurse konnten nicht geladen werden. Der Offline-Modus bleibt aktiv." },
categories: { unitsLabel: "Einheiten", conversionPagesLabel: "Umrechnungsseiten" },
homepage: { heroTitle: "Beliebige Einheiten sofort umrechnen", heroDescription: "Universal Converter ist eine kostenlose Alles-in-einem-Umrechnungsplattform mit 27 Maßkategorien und über 6.400 Einheiten, darunter Länge, Gewicht, Temperatur, Volumen, Währung, digitaler Speicher, Druck, Landwirtschaft, Astronomie, Kochen und Technik. Suchen oder durchsuchen Sie nach Kategorie, erhalten Sie sofort genaue Ergebnisse mit Quellendefinitionen und Formeln, und verwenden Sie denselben Umrechner für alltägliche Aufgaben, wissenschaftliche Arbeit und geschäftliche Berechnungen, online oder offline.", chipLength: "Länge", chipWeight: "Gewicht", chipTemperature: "Temperatur", chipVolume: "Volumen", chipPressure: "Druck", chipDigital: "Digitaler Speicher", chipCurrency: "Währung", chipAgriculture: "Landwirtschaft", chipFlow: "Durchfluss", adSpace: "Werbefläche", adSpaceCalculatorText: "Anzeigen helfen, diesen Rechner kostenlos zu halten.", adSpaceSiteText: "Anzeigen helfen, diese Website kostenlos zu halten." },
messages: { sameUnit: "Umrechnung innerhalb derselben Einheit.", currencyOfflineNote: "Bei Währungen werden Offline-Ersatzkurse verwendet, sofern keine Live-API-Kurse geladen wurden.", temperatureNote: "Die Temperaturumrechnung verwendet Kelvin als absolute Zwischenskala.", chooseCompatibleFamiliesMessage: "Wählen Sie kompatible Einheitenfamilien", differentThingsNote: "{FROM} und {TO} messen unterschiedliche Dinge.", fuelZeroMessage: "Geben Sie einen Kraftstoffverbrauchswert ungleich null ein", fuelInvertNote: "Verbrauchseinheiten kehren den Effizienzwert um.", fuelSupportsNote: "Der Kraftstoffverbrauch unterstützt sowohl Strecke-pro-Volumen- als auch Volumen-pro-Strecke-Einheiten.", electricitySameFamilyNote: "Elektrische Einheiten derselben Familie werden direkt umgerechnet.", electricityNeedContextMessage: "Fügen Sie den benötigten elektrischen Kontext hinzu", electricityNeedContextNote: "Familienübergreifende elektrische Berechnungen benötigen Spannung, Strom, Widerstand oder Stunden.", electricityContextNote: "Das elektrische Ergebnis verwendet die oben gezeigten Kontextwerte.", conversionUnavailableMessage: "Umrechnung nicht verfügbar", needCompatibleUnitsNote: "Diese Umrechnung benötigt kompatible Einheiten.", resultsUpdateNote: "Die Ergebnisse werden beim Tippen sofort aktualisiert." }
},
pt: {
nav: { home: "Início", converter: "Conversor", categories: "Categorias", allCategories: "Todas as categorias", calculators: "Calculadoras", popular: "Popular", guides: "Guias", sitemap: "Mapa do site", about: "Sobre", contact: "Contato", search: "Pesquisar", language: "Idioma", theme: "Tema", menu: "Menu" },
converter: { searchAllUnits: "Pesquisar todas as unidades", fromUnit: "Unidade de origem", toUnit: "Unidade de destino", swap: "Trocar unidades", decimalControl: "Controle de casas decimais", notation: "Notação", notationAuto: "Automática", notationDecimal: "Decimal", notationScientific: "Científica", notationEngineering: "Engenharia", result: "Resultado", copyResult: "Copiar resultado", share: "Compartilhar", favorite: "Favorito", contextValues: "Valores de contexto", fromDefinition: "Definição de origem", toDefinition: "Definição de destino", formula: "Fórmula", enterValue: "Digite um número para converter", useDecimalNotation: "Use notação decimal ou científica, como 1.25e6." },
sidebar: { advertisement: "Publicidade", favoriteConverters: "Conversores favoritos", recentlyUsed: "Usados recentemente", conversionHistory: "Histórico de conversões", clear: "Limpar", noFavorites: "Ainda não há favoritos. Salve um conversor para vê-lo aqui.", noRecent: "Os conversores recentes aparecerão aqui após o uso.", noHistory: "Suas conversões mais recentes ficam neste dispositivo e funcionam offline." },
common: { resultCopied: "Resultado copiado para a área de transferência.", copyUnavailable: "A cópia não está disponível neste navegador, mas o resultado pode ser selecionado.", shareOpened: "Caixa de diálogo de compartilhamento aberta.", shareCopied: "Texto de compartilhamento copiado para a área de transferência.", shareCancelled: "O compartilhamento foi cancelado ou não está disponível.", addApiEndpoint: "Adicione um endpoint de API ou use as taxas offline.", couldNotLoadRates: "Não foi possível carregar as taxas em tempo real. O modo offline continua ativo." },
categories: { unitsLabel: "unidades", conversionPagesLabel: "páginas de conversão" },
homepage: { heroTitle: "Converta qualquer unidade instantaneamente", heroDescription: "Universal Converter é uma plataforma de conversão gratuita e completa que abrange 27 categorias de medição e mais de 6.400 unidades, incluindo comprimento, peso, temperatura, volume, moeda, armazenamento digital, pressão, agricultura, astronomia, culinária e engenharia. Pesquise ou navegue por categoria, obtenha resultados precisos instantâneos com definições e fórmulas de referência, e use o mesmo conversor para tarefas do dia a dia, trabalho científico e cálculos empresariais, on-line ou off-line.", chipLength: "Comprimento", chipWeight: "Peso", chipTemperature: "Temperatura", chipVolume: "Volume", chipPressure: "Pressão", chipDigital: "Armazenamento digital", chipCurrency: "Moeda", chipAgriculture: "Agricultura", chipFlow: "Vazão", adSpace: "Espaço publicitário", adSpaceCalculatorText: "Os anúncios ajudam a manter esta calculadora gratuita.", adSpaceSiteText: "Os anúncios ajudam a manter este site gratuito." },
messages: { sameUnit: "Conversão entre a mesma unidade.", currencyOfflineNote: "A moeda usa taxas de referência offline, a menos que taxas da API em tempo real tenham sido carregadas.", temperatureNote: "A conversão de temperatura usa Kelvin como escala absoluta intermediária.", chooseCompatibleFamiliesMessage: "Escolha famílias de unidades compatíveis", differentThingsNote: "{FROM} e {TO} medem coisas diferentes.", fuelZeroMessage: "Insira um valor de consumo de combustível diferente de zero", fuelInvertNote: "As unidades de consumo invertem o valor de eficiência.", fuelSupportsNote: "O consumo de combustível aceita unidades de distância por volume e de volume por distância.", electricitySameFamilyNote: "Unidades elétricas da mesma família são convertidas diretamente.", electricityNeedContextMessage: "Adicione o contexto elétrico necessário", electricityNeedContextNote: "Cálculos elétricos entre famílias diferentes precisam de tensão, corrente, resistência ou horas.", electricityContextNote: "O resultado elétrico usa os valores de contexto mostrados acima.", conversionUnavailableMessage: "Conversão indisponível", needCompatibleUnitsNote: "Esta conversão precisa de unidades compatíveis.", resultsUpdateNote: "Os resultados são atualizados instantaneamente enquanto você digita." }
},
it: {
nav: { home: "Home", converter: "Convertitore", categories: "Categorie", allCategories: "Tutte le categorie", calculators: "Calcolatrici", popular: "Popolare", guides: "Guide", sitemap: "Mappa del sito", about: "Chi siamo", contact: "Contatti", search: "Cerca", language: "Lingua", theme: "Tema", menu: "Menu" },
converter: { searchAllUnits: "Cerca tutte le unità", fromUnit: "Unità di partenza", toUnit: "Unità di arrivo", swap: "Scambia unità", decimalControl: "Controllo decimali", notation: "Notazione", notationAuto: "Automatica", notationDecimal: "Decimale", notationScientific: "Scientifica", notationEngineering: "Ingegneristica", result: "Risultato", copyResult: "Copia risultato", share: "Condividi", favorite: "Preferito", contextValues: "Valori di contesto", fromDefinition: "Definizione di partenza", toDefinition: "Definizione di arrivo", formula: "Formula", enterValue: "Inserisci un numero da convertire", useDecimalNotation: "Usa la notazione decimale o scientifica, ad esempio 1.25e6." },
sidebar: { advertisement: "Pubblicità", favoriteConverters: "Convertitori preferiti", recentlyUsed: "Usati di recente", conversionHistory: "Cronologia conversioni", clear: "Cancella", noFavorites: "Nessun preferito ancora. Salva un convertitore per trovarlo qui.", noRecent: "I convertitori recenti appariranno qui dopo l'uso.", noHistory: "Le tue conversioni più recenti restano su questo dispositivo e funzionano offline." },
common: { resultCopied: "Risultato copiato negli appunti.", copyUnavailable: "La copia non è disponibile in questo browser, ma il risultato è pronto per essere selezionato.", shareOpened: "Finestra di condivisione aperta.", shareCopied: "Testo di condivisione copiato negli appunti.", shareCancelled: "La condivisione è stata annullata o non è disponibile.", addApiEndpoint: "Aggiungi un endpoint API oppure usa i tassi offline.", couldNotLoadRates: "Impossibile caricare i tassi in tempo reale. La modalità offline resta attiva." },
categories: { unitsLabel: "unità", conversionPagesLabel: "pagine di conversione" },
homepage: { heroTitle: "Converti qualsiasi unità all'istante", heroDescription: "Universal Converter è una piattaforma di conversione gratuita e completa che copre 27 categorie di misura e oltre 6.400 unità, tra cui lunghezza, peso, temperatura, volume, valuta, archiviazione digitale, pressione, agricoltura, astronomia, cucina e ingegneria. Cerca o sfoglia per categoria, ottieni risultati accurati e immediati con definizioni e formule di riferimento, e usa lo stesso convertitore per attività quotidiane, lavoro scientifico e calcoli aziendali, online o offline.", chipLength: "Lunghezza", chipWeight: "Peso", chipTemperature: "Temperatura", chipVolume: "Volume", chipPressure: "Pressione", chipDigital: "Archiviazione digitale", chipCurrency: "Valuta", chipAgriculture: "Agricoltura", chipFlow: "Portata", adSpace: "Spazio pubblicitario", adSpaceCalculatorText: "Gli annunci aiutano a mantenere gratuita questa calcolatrice.", adSpaceSiteText: "Gli annunci aiutano a mantenere gratuito questo sito." },
messages: { sameUnit: "Conversione tra la stessa unità.", currencyOfflineNote: "La valuta utilizza tassi di riferimento offline, a meno che non siano stati caricati tassi API in tempo reale.", temperatureNote: "La conversione della temperatura utilizza il Kelvin come scala assoluta intermedia.", chooseCompatibleFamiliesMessage: "Scegli famiglie di unità compatibili", differentThingsNote: "{FROM} e {TO} misurano cose diverse.", fuelZeroMessage: "Inserisci un valore di consumo carburante diverso da zero", fuelInvertNote: "Le unità di consumo invertono il valore di efficienza.", fuelSupportsNote: "Il consumo di carburante supporta sia unità di distanza per volume sia di volume per distanza.", electricitySameFamilyNote: "Le unità elettriche della stessa famiglia si convertono direttamente.", electricityNeedContextMessage: "Aggiungi il contesto elettrico necessario", electricityNeedContextNote: "I calcoli elettrici tra famiglie diverse richiedono tensione, corrente, resistenza o ore.", electricityContextNote: "Il risultato elettrico utilizza i valori di contesto mostrati sopra.", conversionUnavailableMessage: "Conversione non disponibile", needCompatibleUnitsNote: "Questa conversione richiede unità compatibili.", resultsUpdateNote: "I risultati si aggiornano istantaneamente mentre digiti." }
},
ar: {
nav: { home: "الرئيسية", converter: "المحوّل", categories: "الفئات", allCategories: "كل الفئات", calculators: "الحاسبات", popular: "الأكثر استخدامًا", guides: "الأدلة", sitemap: "خريطة الموقع", about: "من نحن", contact: "تواصل معنا", search: "بحث", language: "اللغة", theme: "المظهر", menu: "القائمة" },
converter: { searchAllUnits: "ابحث في كل الوحدات", fromUnit: "الوحدة الأصلية", toUnit: "الوحدة الهدف", swap: "تبديل الوحدتين", decimalControl: "عدد الخانات العشرية", notation: "طريقة العرض", notationAuto: "تلقائي", notationDecimal: "عشري", notationScientific: "علمي", notationEngineering: "هندسي", result: "النتيجة", copyResult: "نسخ النتيجة", share: "مشاركة", favorite: "المفضلة", contextValues: "قيم سياقية إضافية", fromDefinition: "تعريف الوحدة الأصلية", toDefinition: "تعريف الوحدة الهدف", formula: "المعادلة", enterValue: "أدخل رقمًا للتحويل", useDecimalNotation: "استخدم الصيغة العشرية أو العلمية، مثل 1.25e6." },
sidebar: { advertisement: "إعلان", favoriteConverters: "المحوّلات المفضّلة", recentlyUsed: "المستخدَمة مؤخرًا", conversionHistory: "سجل التحويلات", clear: "مسح", noFavorites: "لا توجد مفضلة بعد. احفظ محوّلًا ليظهر هنا.", noRecent: "ستظهر المحوّلات المستخدمة مؤخرًا هنا بعد استخدامها.", noHistory: "تبقى آخر تحويلاتك محفوظة على هذا الجهاز وتعمل دون اتصال بالإنترنت." },
common: { resultCopied: "تم نسخ النتيجة إلى الحافظة.", copyUnavailable: "النسخ غير متاح في هذا المتصفح، لكن النتيجة جاهزة للتحديد.", shareOpened: "تم فتح نافذة المشاركة.", shareCopied: "تم نسخ نص المشاركة إلى الحافظة.", shareCancelled: "تم إلغاء المشاركة أو أنها غير متاحة.", addApiEndpoint: "أضف نقطة وصول API أو استخدم الأسعار غير المتصلة.", couldNotLoadRates: "تعذّر تحميل الأسعار المباشرة. لا يزال الوضع غير المتصل نشطًا." },
categories: { unitsLabel: "وحدة", conversionPagesLabel: "صفحة تحويل" },
homepage: { heroTitle: "حوّل أي وحدة فورًا", heroDescription: "Universal Converter منصة تحويل مجانية شاملة تغطي 27 فئة قياس وأكثر من 6400 وحدة، بما في ذلك الطول والوزن ودرجة الحرارة والحجم والعملة والتخزين الرقمي والضغط والزراعة والفلك والطهي والهندسة. ابحث أو تصفّح حسب الفئة، واحصل على نتائج دقيقة فورية مع التعريفات والصيغ المرجعية، واستخدم نفس المحوّل للمهام اليومية والعمل العلمي والحسابات التجارية، سواء عبر الإنترنت أو بدونه.", chipLength: "الطول", chipWeight: "الوزن", chipTemperature: "درجة الحرارة", chipVolume: "الحجم", chipPressure: "الضغط", chipDigital: "التخزين الرقمي", chipCurrency: "العملة", chipAgriculture: "الزراعة", chipFlow: "معدل التدفق", adSpace: "مساحة إعلانية", adSpaceCalculatorText: "تساعد الإعلانات في إبقاء هذه الحاسبة مجانية.", adSpaceSiteText: "تساعد الإعلانات في إبقاء هذا الموقع مجانيًا." },
messages: { sameUnit: "تحويل بين نفس الوحدة.", currencyOfflineNote: "تستخدم العملة أسعارًا احتياطية غير متصلة ما لم يتم تحميل أسعار مباشرة من واجهة برمجة التطبيقات.", temperatureNote: "يستخدم تحويل درجة الحرارة مقياس كلفن كمقياس مطلق وسيط.", chooseCompatibleFamiliesMessage: "اختر عائلات وحدات متوافقة", differentThingsNote: "{FROM} و{TO} تقيسان أشياء مختلفة.", fuelZeroMessage: "أدخل قيمة كفاءة وقود غير صفرية", fuelInvertNote: "تعكس وحدات الاستهلاك قيمة الكفاءة.", fuelSupportsNote: "تدعم كفاءة استهلاك الوقود وحدات المسافة لكل حجم ووحدات الحجم لكل مسافة.", electricitySameFamilyNote: "تتحول الوحدات الكهربائية من نفس العائلة مباشرة.", electricityNeedContextMessage: "أضف السياق الكهربائي المطلوب", electricityNeedContextNote: "تحتاج الحسابات الكهربائية بين العائلات المختلفة إلى الجهد أو التيار أو المقاومة أو الساعات.", electricityContextNote: "تستخدم النتيجة الكهربائية قيم السياق الموضحة أعلاه.", conversionUnavailableMessage: "التحويل غير متاح", needCompatibleUnitsNote: "يحتاج هذا التحويل إلى وحدات متوافقة.", resultsUpdateNote: "يتم تحديث النتائج فوريًا أثناء الكتابة." }
},
zh: {
nav: { home: "首页", converter: "换算器", categories: "分类", allCategories: "所有分类", calculators: "计算器", popular: "热门", guides: "指南", sitemap: "网站地图", about: "关于我们", contact: "联系我们", search: "搜索", language: "语言", theme: "主题", menu: "菜单" },
converter: { searchAllUnits: "搜索所有单位", fromUnit: "原单位", toUnit: "目标单位", swap: "交换单位", decimalControl: "小数位数", notation: "表示法", notationAuto: "自动", notationDecimal: "小数", notationScientific: "科学计数法", notationEngineering: "工程计数法", result: "结果", copyResult: "复制结果", share: "分享", favorite: "收藏", contextValues: "附加参数", fromDefinition: "原单位定义", toDefinition: "目标单位定义", formula: "换算公式", enterValue: "输入要换算的数值", useDecimalNotation: "请使用小数或科学计数法，例如 1.25e6。" },
sidebar: { advertisement: "广告", favoriteConverters: "收藏的换算器", recentlyUsed: "最近使用", conversionHistory: "换算记录", clear: "清除", noFavorites: "暂无收藏。保存一个换算器后会显示在这里。", noRecent: "使用过的换算器会在此处显示。", noHistory: "最近的换算记录保存在本设备上，离线也可使用。" },
common: { resultCopied: "结果已复制到剪贴板。", copyUnavailable: "此浏览器不支持复制，但结果已可供选中。", shareOpened: "已打开分享窗口。", shareCopied: "分享文本已复制到剪贴板。", shareCancelled: "分享已取消或不可用。", addApiEndpoint: "请添加 API 端点，或使用离线备用汇率。", couldNotLoadRates: "无法加载实时汇率，已继续使用离线备用汇率。" },
categories: { unitsLabel: "个单位", conversionPagesLabel: "个换算页面" },
homepage: { heroTitle: "即时换算任意单位", heroDescription: "Universal Converter 是一个免费的一体化换算平台，涵盖 27 个计量类别和超过 6,400 个单位，包括长度、重量、温度、体积、货币、数字存储、压力、农业、天文、烹饪和工程。按类别搜索或浏览，即时获得带有原始定义和公式的精确结果，并可将同一换算器用于日常任务、科学工作和商业计算，无论在线还是离线。", chipLength: "长度", chipWeight: "重量", chipTemperature: "温度", chipVolume: "体积", chipPressure: "压力", chipDigital: "数字存储", chipCurrency: "货币", chipAgriculture: "农业", chipFlow: "流量", adSpace: "广告位", adSpaceCalculatorText: "展示广告有助于让这个计算器保持免费。", adSpaceSiteText: "展示广告有助于让本网站保持免费。" },
messages: { sameUnit: "相同单位之间的换算。", currencyOfflineNote: "除非已加载实时 API 汇率，否则货币换算使用离线备用汇率。", temperatureNote: "温度换算以开尔文作为中间绝对温标。", chooseCompatibleFamiliesMessage: "请选择兼容的单位族", differentThingsNote: "{FROM} 和 {TO} 衡量的是不同的量。", fuelZeroMessage: "请输入非零的燃油经济性数值", fuelInvertNote: "消耗类单位会将效率值取倒数。", fuelSupportsNote: "燃油经济性同时支持“距离每体积”和“体积每距离”两类单位。", electricitySameFamilyNote: "同一族的电气单位可直接换算。", electricityNeedContextMessage: "请添加所需的电气上下文参数", electricityNeedContextNote: "跨族电气计算需要电压、电流、电阻或时间（小时）。", electricityContextNote: "电气结果使用上方显示的上下文参数值。", conversionUnavailableMessage: "无法进行换算", needCompatibleUnitsNote: "此换算需要兼容的单位。", resultsUpdateNote: "结果会随着输入即时更新。" }
},
ja: {
nav: { home: "ホーム", converter: "コンバーター", categories: "カテゴリー", allCategories: "すべてのカテゴリー", calculators: "計算ツール", popular: "人気", guides: "ガイド", sitemap: "サイトマップ", about: "サイトについて", contact: "お問い合わせ", search: "検索", language: "言語", theme: "テーマ", menu: "メニュー" },
converter: { searchAllUnits: "すべての単位を検索", fromUnit: "変換元の単位", toUnit: "変換先の単位", swap: "単位を入れ替え", decimalControl: "小数点以下の桁数", notation: "表記形式", notationAuto: "自動", notationDecimal: "小数", notationScientific: "指数表記", notationEngineering: "工学表記", result: "結果", copyResult: "結果をコピー", share: "共有", favorite: "お気に入り", contextValues: "追加パラメータ", fromDefinition: "変換元単位の定義", toDefinition: "変換先単位の定義", formula: "計算式", enterValue: "変換する数値を入力してください", useDecimalNotation: "1.25e6 のように小数表記または指数表記を使用してください。" },
sidebar: { advertisement: "広告", favoriteConverters: "お気に入りのコンバーター", recentlyUsed: "最近使用したもの", conversionHistory: "変換履歴", clear: "削除", noFavorites: "お気に入りはまだありません。コンバーターを保存するとここに表示されます。", noRecent: "使用したコンバーターがここに表示されます。", noHistory: "最近の変換履歴はこの端末に保存され、オフラインでも利用できます。" },
common: { resultCopied: "結果をクリップボードにコピーしました。", copyUnavailable: "このブラウザではコピーを利用できませんが、結果は選択できます。", shareOpened: "共有ダイアログを開きました。", shareCopied: "共有用のテキストをクリップボードにコピーしました。", shareCancelled: "共有がキャンセルされたか、利用できません。", addApiEndpoint: "APIエンドポイントを追加するか、オフラインの参考レートを使用してください。", couldNotLoadRates: "最新レートを取得できませんでした。オフラインの参考レートを引き続き使用します。" },
categories: { unitsLabel: "単位", conversionPagesLabel: "変換ページ" },
homepage: { heroTitle: "あらゆる単位を即座に変換", heroDescription: "Universal Converterは、長さ、重さ、温度、体積、通貨、デジタルストレージ、圧力、農業、天文学、料理、工学など、27の測定カテゴリーと6,400以上の単位をカバーする無料のオールインワン変換プラットフォームです。カテゴリーで検索・閲覧し、出典となる定義や計算式とともに即座に正確な結果を取得でき、日常のタスクから科学的作業、ビジネス計算まで、オンラインでもオフラインでも同じコンバーターを使用できます。", chipLength: "長さ", chipWeight: "重さ", chipTemperature: "温度", chipVolume: "体積", chipPressure: "圧力", chipDigital: "デジタルストレージ", chipCurrency: "通貨", chipAgriculture: "農業", chipFlow: "流量", adSpace: "広告スペース", adSpaceCalculatorText: "広告の表示は、この計算ツールを無料で提供するのに役立っています。", adSpaceSiteText: "広告の表示は、このサイトを無料で提供するのに役立っています。" },
messages: { sameUnit: "同一単位間の変換です。", currencyOfflineNote: "ライブAPIレートが読み込まれていない場合、通貨はオフラインの参考レートを使用します。", temperatureNote: "温度変換では、絶対温度の中間スケールとしてケルビンを使用します。", chooseCompatibleFamiliesMessage: "互換性のある単位グループを選択してください", differentThingsNote: "{FROM}と{TO}は異なる量を測定します。", fuelZeroMessage: "0以外の燃費値を入力してください", fuelInvertNote: "消費量系の単位は効率値を逆数にします。", fuelSupportsNote: "燃費は「距離÷体積」と「体積÷距離」の両方の単位に対応しています。", electricitySameFamilyNote: "同じグループの電気単位は直接変換されます。", electricityNeedContextMessage: "必要な電気パラメータを追加してください", electricityNeedContextNote: "グループをまたぐ電気計算には、電圧・電流・抵抗・時間のいずれかが必要です。", electricityContextNote: "電気の結果には上記のパラメータ値が使用されています。", conversionUnavailableMessage: "この変換は利用できません", needCompatibleUnitsNote: "この変換には互換性のある単位が必要です。", resultsUpdateNote: "入力すると結果が即座に更新されます。" }
},
ko: {
nav: { home: "홈", converter: "변환기", categories: "카테고리", allCategories: "전체 카테고리", calculators: "계산기", popular: "인기", guides: "가이드", sitemap: "사이트맵", about: "소개", contact: "문의하기", search: "검색", language: "언어", theme: "테마", menu: "메뉴" },
converter: { searchAllUnits: "모든 단위 검색", fromUnit: "변환 전 단위", toUnit: "변환 후 단위", swap: "단위 바꾸기", decimalControl: "소수점 자릿수", notation: "표기 방식", notationAuto: "자동", notationDecimal: "소수", notationScientific: "지수 표기", notationEngineering: "공학 표기", result: "결과", copyResult: "결과 복사", share: "공유", favorite: "즐겨찾기", contextValues: "추가 값", fromDefinition: "변환 전 단위 정의", toDefinition: "변환 후 단위 정의", formula: "공식", enterValue: "변환할 숫자를 입력하세요", useDecimalNotation: "1.25e6과 같은 소수 또는 지수 표기를 사용하세요." },
sidebar: { advertisement: "광고", favoriteConverters: "즐겨찾는 변환기", recentlyUsed: "최근 사용", conversionHistory: "변환 기록", clear: "지우기", noFavorites: "아직 즐겨찾기가 없습니다. 변환기를 저장하면 여기에 표시됩니다.", noRecent: "최근에 사용한 변환기가 여기에 표시됩니다.", noHistory: "최근 변환 기록은 이 기기에 저장되며 오프라인에서도 사용할 수 있습니다." },
common: { resultCopied: "결과가 클립보드에 복사되었습니다.", copyUnavailable: "이 브라우저에서는 복사를 사용할 수 없지만 결과를 선택할 수 있습니다.", shareOpened: "공유 대화상자가 열렸습니다.", shareCopied: "공유 텍스트가 클립보드에 복사되었습니다.", shareCancelled: "공유가 취소되었거나 사용할 수 없습니다.", addApiEndpoint: "API 엔드포인트를 추가하거나 오프라인 참고 환율을 사용하세요.", couldNotLoadRates: "실시간 환율을 불러오지 못했습니다. 오프라인 참고 환율이 계속 사용됩니다." },
categories: { unitsLabel: "개 단위", conversionPagesLabel: "개 변환 페이지" },
homepage: { heroTitle: "모든 단위를 즉시 변환하세요", heroDescription: "Universal Converter는 길이, 무게, 온도, 부피, 통화, 디지털 저장 용량, 압력, 농업, 천문학, 요리, 공학을 포함해 27개 측정 카테고리와 6,400개 이상의 단위를 다루는 무료 올인원 변환 플랫폼입니다. 카테고리별로 검색하거나 둘러보고, 출처가 명확한 정의와 공식으로 즉시 정확한 결과를 얻으며, 온라인이든 오프라인이든 일상 업무, 과학 연구, 비즈니스 계산에 동일한 변환기를 사용할 수 있습니다.", chipLength: "길이", chipWeight: "무게", chipTemperature: "온도", chipVolume: "부피", chipPressure: "압력", chipDigital: "디지털 저장 용량", chipCurrency: "통화", chipAgriculture: "농업", chipFlow: "유량", adSpace: "광고 영역", adSpaceCalculatorText: "광고 표시는 이 계산기를 무료로 유지하는 데 도움이 됩니다.", adSpaceSiteText: "광고 표시는 이 사이트를 무료로 유지하는 데 도움이 됩니다." },
messages: { sameUnit: "동일 단위 간 변환입니다.", currencyOfflineNote: "실시간 API 환율을 불러오지 않은 경우 통화는 오프라인 참고 환율을 사용합니다.", temperatureNote: "온도 변환은 켈빈을 중간 절대 눈금으로 사용합니다.", chooseCompatibleFamiliesMessage: "호환되는 단위 그룹을 선택하세요", differentThingsNote: "{FROM}와(과) {TO}는(은) 서로 다른 대상을 측정합니다.", fuelZeroMessage: "0이 아닌 연비 값을 입력하세요", fuelInvertNote: "소비량 단위는 효율 값을 역수로 변환합니다.", fuelSupportsNote: "연비는 거리/부피 단위와 부피/거리 단위를 모두 지원합니다.", electricitySameFamilyNote: "같은 그룹의 전기 단위는 직접 변환됩니다.", electricityNeedContextMessage: "필요한 전기 관련 값을 추가하세요", electricityNeedContextNote: "다른 그룹 간 전기 계산에는 전압, 전류, 저항 또는 시간이 필요합니다.", electricityContextNote: "전기 결과는 위에 표시된 값을 사용합니다.", conversionUnavailableMessage: "변환을 사용할 수 없습니다", needCompatibleUnitsNote: "이 변환에는 호환되는 단위가 필요합니다.", resultsUpdateNote: "입력하는 즉시 결과가 업데이트됩니다." }
},
hi: {
nav: { home: "होम", converter: "कनवर्टर", categories: "श्रेणियाँ", allCategories: "सभी श्रेणियाँ", calculators: "कैलकुलेटर", popular: "लोकप्रिय", guides: "गाइड", sitemap: "साइटमैप", about: "हमारे बारे में", contact: "संपर्क करें", search: "खोजें", language: "भाषा", theme: "थीम", menu: "मेनू" },
converter: { searchAllUnits: "सभी इकाइयाँ खोजें", fromUnit: "मूल इकाई", toUnit: "लक्ष्य इकाई", swap: "इकाइयाँ बदलें", decimalControl: "दशमलव अंकों की संख्या", notation: "संकेतन", notationAuto: "स्वतः", notationDecimal: "दशमलव", notationScientific: "वैज्ञानिक", notationEngineering: "इंजीनियरिंग", result: "परिणाम", copyResult: "परिणाम कॉपी करें", share: "साझा करें", favorite: "पसंदीदा", contextValues: "अतिरिक्त मान", fromDefinition: "मूल इकाई की परिभाषा", toDefinition: "लक्ष्य इकाई की परिभाषा", formula: "सूत्र", enterValue: "बदलने के लिए एक संख्या दर्ज करें", useDecimalNotation: "दशमलव या वैज्ञानिक संकेतन का उपयोग करें, जैसे 1.25e6।" },
sidebar: { advertisement: "विज्ञापन", favoriteConverters: "पसंदीदा कनवर्टर", recentlyUsed: "हाल ही में उपयोग किए गए", conversionHistory: "रूपांतरण इतिहास", clear: "साफ़ करें", noFavorites: "अभी तक कोई पसंदीदा नहीं है। कनवर्टर सहेजें ताकि वह यहाँ दिखे।", noRecent: "हाल ही में उपयोग किए गए कनवर्टर उपयोग के बाद यहाँ दिखाई देंगे।", noHistory: "आपके नवीनतम रूपांतरण इस डिवाइस पर सुरक्षित रहते हैं और ऑफ़लाइन भी काम करते हैं।" },
common: { resultCopied: "परिणाम क्लिपबोर्ड पर कॉपी किया गया।", copyUnavailable: "इस ब्राउज़र में कॉपी करना उपलब्ध नहीं है, लेकिन परिणाम चुनने के लिए तैयार है।", shareOpened: "शेयर डायलॉग खोला गया।", shareCopied: "शेयर टेक्स्ट क्लिपबोर्ड पर कॉपी किया गया।", shareCancelled: "शेयर रद्द कर दिया गया या उपलब्ध नहीं है।", addApiEndpoint: "कोई API एंडपॉइंट जोड़ें या ऑफ़लाइन दरें उपयोग करें।", couldNotLoadRates: "लाइव दरें लोड नहीं हो सकीं। ऑफ़लाइन दरें सक्रिय रहेंगी।" },
categories: { unitsLabel: "इकाइयाँ", conversionPagesLabel: "रूपांतरण पेज" },
homepage: { heroTitle: "किसी भी इकाई को तुरंत बदलें", heroDescription: "Universal Converter एक मुफ़्त, सर्व-समावेशी रूपांतरण प्लेटफ़ॉर्म है जो 27 मापन श्रेणियों और 6,400 से अधिक इकाइयों को कवर करता है, जिनमें लंबाई, वज़न, तापमान, आयतन, मुद्रा, डिजिटल स्टोरेज, दबाव, कृषि, खगोल विज्ञान, खाना पकाना और इंजीनियरिंग शामिल हैं। श्रेणी के अनुसार खोजें या ब्राउज़ करें, स्रोत परिभाषाओं और सूत्रों के साथ तुरंत सटीक परिणाम पाएं, और रोज़मर्रा के कार्यों, वैज्ञानिक कार्य और व्यावसायिक गणनाओं के लिए ऑनलाइन या ऑफ़लाइन एक ही कनवर्टर का उपयोग करें।", chipLength: "लंबाई", chipWeight: "वज़न", chipTemperature: "तापमान", chipVolume: "आयतन", chipPressure: "दबाव", chipDigital: "डिजिटल स्टोरेज", chipCurrency: "मुद्रा", chipAgriculture: "कृषि", chipFlow: "प्रवाह दर", adSpace: "विज्ञापन स्थान", adSpaceCalculatorText: "विज्ञापन इस कैलकुलेटर को मुफ़्त रखने में मदद करते हैं।", adSpaceSiteText: "विज्ञापन इस साइट को मुफ़्त रखने में मदद करते हैं।" },
messages: { sameUnit: "समान इकाई के बीच रूपांतरण।", currencyOfflineNote: "जब तक लाइव API दरें लोड न हों, मुद्रा ऑफ़लाइन फ़ॉलबैक दरों का उपयोग करती है।", temperatureNote: "तापमान रूपांतरण मध्यवर्ती निरपेक्ष पैमाने के रूप में केल्विन का उपयोग करता है।", chooseCompatibleFamiliesMessage: "संगत इकाई समूह चुनें", differentThingsNote: "{FROM} और {TO} अलग-अलग चीज़ें मापते हैं।", fuelZeroMessage: "एक शून्येतर ईंधन दक्षता मान दर्ज करें", fuelInvertNote: "खपत इकाइयाँ दक्षता मान को व्युत्क्रम कर देती हैं।", fuelSupportsNote: "ईंधन दक्षता दूरी-प्रति-आयतन और आयतन-प्रति-दूरी, दोनों प्रकार की इकाइयों का समर्थन करती है।", electricitySameFamilyNote: "एक ही समूह की विद्युत इकाइयाँ सीधे रूपांतरित होती हैं।", electricityNeedContextMessage: "आवश्यक विद्युत संदर्भ मान जोड़ें", electricityNeedContextNote: "भिन्न समूहों के बीच विद्युत गणना के लिए वोल्टेज, करंट, प्रतिरोध या घंटे आवश्यक हैं।", electricityContextNote: "विद्युत परिणाम ऊपर दिखाए गए संदर्भ मानों का उपयोग करता है।", conversionUnavailableMessage: "रूपांतरण उपलब्ध नहीं है", needCompatibleUnitsNote: "इस रूपांतरण के लिए संगत इकाइयाँ आवश्यक हैं।", resultsUpdateNote: "टाइप करते ही परिणाम तुरंत अपडेट होते हैं।" }
},
tr: {
nav: { home: "Ana Sayfa", converter: "Dönüştürücü", categories: "Kategoriler", allCategories: "Tüm kategoriler", calculators: "Hesap Makineleri", popular: "Popüler", guides: "Rehberler", sitemap: "Site Haritası", about: "Hakkımızda", contact: "İletişim", search: "Ara", language: "Dil", theme: "Tema", menu: "Menü" },
converter: { searchAllUnits: "Tüm birimlerde ara", fromUnit: "Kaynak Birim", toUnit: "Hedef Birim", swap: "Birimleri değiştir", decimalControl: "Ondalık basamak sayısı", notation: "Gösterim", notationAuto: "Otomatik", notationDecimal: "Ondalık", notationScientific: "Bilimsel", notationEngineering: "Mühendislik", result: "Sonuç", copyResult: "Sonucu kopyala", share: "Paylaş", favorite: "Favori", contextValues: "Ek bağlam değerleri", fromDefinition: "Kaynak birim tanımı", toDefinition: "Hedef birim tanımı", formula: "Formül", enterValue: "Dönüştürülecek sayıyı girin", useDecimalNotation: "1.25e6 gibi ondalık veya bilimsel gösterim kullanın." },
sidebar: { advertisement: "Reklam", favoriteConverters: "Favori dönüştürücüler", recentlyUsed: "Son kullanılanlar", conversionHistory: "Dönüştürme geçmişi", clear: "Temizle", noFavorites: "Henüz favori yok. Burada görünmesi için bir dönüştürücü kaydedin.", noRecent: "Kullandığınız dönüştürücüler burada görünecek.", noHistory: "Son dönüştürmeleriniz bu cihazda saklanır ve çevrimdışı da çalışır." },
common: { resultCopied: "Sonuç panoya kopyalandı.", copyUnavailable: "Bu tarayıcıda kopyalama kullanılamıyor, ancak sonuç seçilmeye hazır.", shareOpened: "Paylaşım penceresi açıldı.", shareCopied: "Paylaşım metni panoya kopyalandı.", shareCancelled: "Paylaşım iptal edildi veya kullanılamıyor.", addApiEndpoint: "Bir API uç noktası ekleyin veya çevrimdışı kurları kullanın.", couldNotLoadRates: "Anlık kurlar yüklenemedi. Çevrimdışı kurlar kullanılmaya devam ediyor." },
categories: { unitsLabel: "birim", conversionPagesLabel: "dönüştürme sayfası" },
homepage: { heroTitle: "Herhangi Bir Birimi Anında Dönüştürün", heroDescription: "Universal Converter; uzunluk, ağırlık, sıcaklık, hacim, para birimi, dijital depolama, basınç, tarım, astronomi, mutfak ve mühendislik dahil olmak üzere 27 ölçüm kategorisini ve 6.400'den fazla birimi kapsayan ücretsiz, hepsi bir arada bir dönüştürme platformudur. Kategoriye göre arama yapın veya göz atın, kaynak tanımları ve formüllerle anında doğru sonuçlar alın ve aynı dönüştürücüyü günlük görevler, bilimsel çalışmalar ve iş hesaplamaları için çevrimiçi veya çevrimdışı kullanın.", chipLength: "Uzunluk", chipWeight: "Ağırlık", chipTemperature: "Sıcaklık", chipVolume: "Hacim", chipPressure: "Basınç", chipDigital: "Dijital Depolama", chipCurrency: "Para Birimi", chipAgriculture: "Tarım", chipFlow: "Akış Hızı", adSpace: "Reklam alanı", adSpaceCalculatorText: "Reklamlar bu hesap makinesinin ücretsiz kalmasına yardımcı olur.", adSpaceSiteText: "Reklamlar bu sitenin ücretsiz kalmasına yardımcı olur." },
messages: { sameUnit: "Aynı birim arasında dönüştürme.", currencyOfflineNote: "Canlı API kurları yüklenmediği sürece para birimi çevrimdışı yedek kurları kullanır.", temperatureNote: "Sıcaklık dönüşümü, ara mutlak ölçek olarak Kelvin'i kullanır.", chooseCompatibleFamiliesMessage: "Uyumlu birim gruplarını seçin", differentThingsNote: "{FROM} ve {TO} farklı şeyleri ölçer.", fuelZeroMessage: "Sıfırdan farklı bir yakıt ekonomisi değeri girin", fuelInvertNote: "Tüketim birimleri verimlilik değerini ters çevirir.", fuelSupportsNote: "Yakıt ekonomisi, hem mesafe/hacim hem de hacim/mesafe birimlerini destekler.", electricitySameFamilyNote: "Aynı gruptaki elektrik birimleri doğrudan dönüştürülür.", electricityNeedContextMessage: "Gerekli elektriksel bağlamı ekleyin", electricityNeedContextNote: "Farklı gruplar arasındaki elektrik hesaplamaları için gerilim, akım, direnç veya saat gerekir.", electricityContextNote: "Elektrik sonucu yukarıda gösterilen bağlam değerlerini kullanır.", conversionUnavailableMessage: "Dönüştürme kullanılamıyor", needCompatibleUnitsNote: "Bu dönüştürme için uyumlu birimler gereklidir.", resultsUpdateNote: "Sonuçlar siz yazarken anında güncellenir." }
},
id: {
nav: { home: "Beranda", converter: "Konverter", categories: "Kategori", allCategories: "Semua kategori", calculators: "Kalkulator", popular: "Populer", guides: "Panduan", sitemap: "Peta situs", about: "Tentang", contact: "Kontak", search: "Cari", language: "Bahasa", theme: "Tema", menu: "Menu" },
converter: { searchAllUnits: "Cari semua satuan", fromUnit: "Satuan Asal", toUnit: "Satuan Tujuan", swap: "Tukar satuan", decimalControl: "Kontrol desimal", notation: "Notasi", notationAuto: "Otomatis", notationDecimal: "Desimal", notationScientific: "Ilmiah", notationEngineering: "Rekayasa", result: "Hasil", copyResult: "Salin hasil", share: "Bagikan", favorite: "Favorit", contextValues: "Nilai konteks tambahan", fromDefinition: "Definisi satuan asal", toDefinition: "Definisi satuan tujuan", formula: "Rumus", enterValue: "Masukkan angka yang akan dikonversi", useDecimalNotation: "Gunakan notasi desimal atau ilmiah, misalnya 1.25e6." },
sidebar: { advertisement: "Iklan", favoriteConverters: "Konverter favorit", recentlyUsed: "Baru digunakan", conversionHistory: "Riwayat konversi", clear: "Hapus", noFavorites: "Belum ada favorit. Simpan konverter agar muncul di sini.", noRecent: "Konverter yang baru digunakan akan muncul di sini.", noHistory: "Konversi terbaru Anda tersimpan di perangkat ini dan tetap berfungsi secara offline." },
common: { resultCopied: "Hasil disalin ke clipboard.", copyUnavailable: "Salin tidak tersedia di browser ini, tetapi hasil siap untuk dipilih.", shareOpened: "Dialog berbagi terbuka.", shareCopied: "Teks berbagi disalin ke clipboard.", shareCancelled: "Berbagi dibatalkan atau tidak tersedia.", addApiEndpoint: "Tambahkan endpoint API atau gunakan kurs offline.", couldNotLoadRates: "Kurs langsung tidak dapat dimuat. Kurs offline tetap digunakan." },
categories: { unitsLabel: "satuan", conversionPagesLabel: "halaman konversi" },
homepage: { heroTitle: "Konversi Satuan Apa Pun secara Instan", heroDescription: "Universal Converter adalah platform konversi gratis dan serba guna yang mencakup 27 kategori pengukuran dan lebih dari 6.400 satuan, termasuk panjang, berat, suhu, volume, mata uang, penyimpanan digital, tekanan, pertanian, astronomi, memasak, dan teknik. Cari atau jelajahi berdasarkan kategori, dapatkan hasil akurat secara instan lengkap dengan definisi dan rumus sumber, dan gunakan konverter yang sama untuk tugas sehari-hari, pekerjaan ilmiah, dan perhitungan bisnis, baik online maupun offline.", chipLength: "Panjang", chipWeight: "Berat", chipTemperature: "Suhu", chipVolume: "Volume", chipPressure: "Tekanan", chipDigital: "Penyimpanan Digital", chipCurrency: "Mata Uang", chipAgriculture: "Pertanian", chipFlow: "Laju Aliran", adSpace: "Ruang iklan", adSpaceCalculatorText: "Iklan membantu menjaga kalkulator ini tetap gratis.", adSpaceSiteText: "Iklan membantu menjaga situs ini tetap gratis." },
messages: { sameUnit: "Konversi antar satuan yang sama.", currencyOfflineNote: "Mata uang menggunakan kurs cadangan offline kecuali kurs API langsung telah dimuat.", temperatureNote: "Konversi suhu menggunakan Kelvin sebagai skala absolut perantara.", chooseCompatibleFamiliesMessage: "Pilih kelompok satuan yang kompatibel", differentThingsNote: "{FROM} dan {TO} mengukur hal yang berbeda.", fuelZeroMessage: "Masukkan nilai ekonomi bahan bakar bukan nol", fuelInvertNote: "Satuan konsumsi membalik nilai efisiensi.", fuelSupportsNote: "Ekonomi bahan bakar mendukung satuan jarak-per-volume maupun volume-per-jarak.", electricitySameFamilyNote: "Satuan listrik dalam kelompok yang sama dikonversi secara langsung.", electricityNeedContextMessage: "Tambahkan konteks listrik yang diperlukan", electricityNeedContextNote: "Perhitungan listrik lintas kelompok memerlukan tegangan, arus, resistansi, atau jam.", electricityContextNote: "Hasil listrik menggunakan nilai konteks yang ditampilkan di atas.", conversionUnavailableMessage: "Konversi tidak tersedia", needCompatibleUnitsNote: "Konversi ini memerlukan satuan yang kompatibel.", resultsUpdateNote: "Hasil diperbarui secara instan saat Anda mengetik." }
},
so: {
nav: { home: "Bogga hore", converter: "Beddelaha", categories: "Qaybaha", allCategories: "Dhammaan qaybaha", calculators: "Xisaabiyayaasha", popular: "Caanka ah", guides: "Hagayaasha", sitemap: "Khariidadda bogga", about: "Nagu saabsan", contact: "Nala soo xiriir", search: "Raadi", language: "Luqadda", theme: "Muuqaalka", menu: "Menu-ga" },
converter: { searchAllUnits: "Ka raadi dhammaan cabbirrada", fromUnit: "Cabbirka laga beddelayo", toUnit: "Cabbirka loo beddelayo", swap: "Isbeddel cabbirrada", decimalControl: "Xakameynta tirooyinka jajabka", notation: "Habka muujinta", notationAuto: "Si toos ah", notationDecimal: "Jajab tobanle", notationScientific: "Sayniska", notationEngineering: "Injineernimo", result: "Natiijada", copyResult: "Koobi natiijada", share: "La wadaag", favorite: "Ku dar door bidaan", contextValues: "Qiyamka dheeraadka ah", fromDefinition: "Sharaxaadda cabbirka laga beddelayo", toDefinition: "Sharaxaadda cabbirka loo beddelayo", formula: "Qaacidada", enterValue: "Geli lambar aad beddesho", useDecimalNotation: "Isticmaal habka jajabka tobanlaha ah ama kan sayniska, sida 1.25e6." },
sidebar: { advertisement: "Xayeysiin", favoriteConverters: "Beddelayaasha door bidan", recentlyUsed: "Dhawaan la isticmaalay", conversionHistory: "Taariikhda beddelka", clear: "Nadiifi", noFavorites: "Wali ma jiraan door bidaan. Kaydi beddelaha si uu halkan uga soo muuqdo.", noRecent: "Beddelayaasha dhawaan la isticmaalay ayaa halkan ka soo muuqan doona.", noHistory: "Beddelladaada ugu dambeeyay ayaa ku hadhaya qalabkan waxayna u shaqeeyaan offline." },
common: { resultCopied: "Natiijadu waxay ku koobiyowday xarunta xusuusta.", copyUnavailable: "Koobiyaha lama heli karo biraawsarkan, laakiin natiijadu diyaar bay u tahay in la doorto.", shareOpened: "Sanduuqa wadaagista ayaa la furay.", shareCopied: "Qoraalka wadaagista ayaa ku koobiyowday xarunta xusuusta.", shareCancelled: "Wadaagistu waa la joojiyay ama lama heli karo.", addApiEndpoint: "Ku dar dhamaadka API ama isticmaal qiimayaasha offline-ka ah.", couldNotLoadRates: "Qiimayaasha toos ah lama soo geli karin. Qiimayaasha offline-ku wali way shaqeynayaan." },
categories: { unitsLabel: "cabbir", conversionPagesLabel: "bog beddel" },
homepage: { heroTitle: "Isla Markiiba U Beddel Cabbir Kasta", heroDescription: "Universal Converter waa madal beddelid oo bilaash ah oo wax walba ku jira, kaas oo daboolaya 27 qayb oo cabbir ah iyo in ka badan 6,400 oo cabbir, oo ay ku jiraan dhererka, miisaanka, heerkulka, xajmiga, lacagta, kaydinta dhijitaalka ah, cadaadiska, beeraha, xiddigiska, karinta, iyo injineernimada. Ka raadi ama ka baadh qayb ahaan, natiijooyin sax ah oo degdeg ah la hel adigoo leh sharraxaad iyo qaacido asal ah, oo isticmaal isla beddelahaas hawlaha maalinlaha ah, shaqada sayniska, iyo xisaabinta ganacsiga, si aad u xiran tahay internetka ama aadan u xirnayn.", chipLength: "Dhererka", chipWeight: "Miisaanka", chipTemperature: "Heerkulka", chipVolume: "Xajmiga", chipPressure: "Cadaadiska", chipDigital: "Kaydinta Dhijitaalka ah", chipCurrency: "Lacagta", chipAgriculture: "Beeraha", chipFlow: "Xawaaraha Qulqulka", adSpace: "Booska xayeysiiska", adSpaceCalculatorText: "Xayeysiinta waxay caawisaa in xisaabiyahan lagu sii hayo bilaash.", adSpaceSiteText: "Xayeysiinta waxay caawisaa in boggan lagu sii hayo bilaash." },
messages: { sameUnit: "Beddelka u dhexeeya isla cabbirka.", currencyOfflineNote: "Lacagtu waxay isticmaashaa qiimayaasha offline-ka ah illaa iyo inta aan la soo geli qiimayaasha API-ga toos ah.", temperatureNote: "Beddelka heerkulku wuxuu isticmaalaa Kelvin sida heerka guud ee u dhexeeya.", chooseCompatibleFamiliesMessage: "Dooro qoysaska cabbirrada is waafaqsan", differentThingsNote: "{FROM} iyo {TO} waxay cabbiraan waxyaabo kala duwan.", fuelZeroMessage: "Geli qiime dhaqaale shidaal oo aan eber ahayn", fuelInvertNote: "Cabbirrada isticmaalku waxay rogaan qiimaha waxtarka.", fuelSupportsNote: "Dhaqaalaha shidaalku wuu taageeraa labadaba cabbirrada masaafo-kor-xajmi iyo xajmi-kor-masaafo.", electricitySameFamilyNote: "Cabbirrada koronto ee isla qoyska si toos ah ayaa loo beddelaa.", electricityNeedContextMessage: "Ku dar macluumaadka korontada ee loo baahan yahay", electricityNeedContextNote: "Xisaabinta korontada ee u dhexeysa qoysas kala duwan waxay u baahan tahay voltage, current, resistance, ama saacado.", electricityContextNote: "Natiijada korontadu waxay isticmaashaa qiyamka macluumaadka ee kor lagu muujiyay.", conversionUnavailableMessage: "Beddelku ma jiro", needCompatibleUnitsNote: "Beddelkani wuxuu u baahan yahay cabbirro is waafaqsan.", resultsUpdateNote: "Natiijooyinku si degdeg ah ayey u cusboonaysiiyaan marka aad qorto." }
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
const decimal = [
["bit", "Bit", "bit", 1],
["byte", "Byte", "B", 8],
["kilobit", "Kilobit", "kb", 1e3],
["kilobyte", "KB", "KB", 8e3],
["megabit", "Megabit", "Mb", 1e6],
["megabyte", "MB", "MB", 8e6],
["gigabit", "Gigabit", "Gb", 1e9],
["gigabyte", "GB", "GB", 8e9],
["terabit", "Terabit", "Tb", 1e12],
["terabyte", "TB", "TB", 8e12],
["petabit", "Petabit", "Pb", 1e15],
["petabyte", "PB", "PB", 8e15],
["exabit", "Exabit", "Eb", 1e18],
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
return [...decimal, ...binary].map(([id, name, symbol, factor]) => u(id, name, symbol, factor, `${name} digital storage unit.`, [], "storage"));
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
if (themeText) themeText.textContent = theme === "dark" ? "Light" : "Dark";
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
document.querySelectorAll("#notationMode option").forEach((opt) => {
const map = { auto: "converter.notationAuto", decimal: "converter.notationDecimal", scientific: "converter.notationScientific", engineering: "converter.notationEngineering" };
if (map[opt.value]) opt.textContent = t(map[opt.value]);
});
document.querySelectorAll(".favorite-button").forEach((el) => { setFirstTextNode(el, t("converter.favorite")); });
document.querySelectorAll(".result-label").forEach((el) => { el.textContent = t("converter.result"); });
document.querySelectorAll("#copyButton").forEach((el) => { el.textContent = t("converter.copyResult"); });
document.querySelectorAll("#shareButton").forEach((el) => { el.textContent = t("converter.share"); });
document.querySelectorAll(".converter-ad-slot > span:first-child").forEach((el) => { el.textContent = t("sidebar.advertisement"); });
document.querySelectorAll(".definition-panel article > span:first-child").forEach((el, i) => {
const keys = ["converter.fromDefinition", "converter.toDefinition", "converter.formula"];
if (keys[i]) el.textContent = t(keys[i]);
});
document.querySelectorAll(".sidebar-ad").forEach((el) => { setFirstTextNode(el, t("sidebar.advertisement")); });
document.querySelectorAll(".activity-panel > section").forEach((section, i) => {
const keys = ["sidebar.favoriteConverters", "sidebar.recentlyUsed", "sidebar.conversionHistory"];
const heading = section.querySelector(".activity-heading h3");
const clearBtn = section.querySelector(".activity-heading button");
if (heading && keys[i]) heading.textContent = t(keys[i]);
if (clearBtn) clearBtn.textContent = t("sidebar.clear");
});
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
categorySidebarAd.textContent = "Advertisement";
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
<span class="category-meta">${category.units.length.toLocaleString("en-US")} units</span>
</span>
</span>
`;
button.addEventListener("click", () => selectCategory(category.id));
list.appendChild(button);
});
if (!matches.length) {
list.innerHTML = '<p class="empty-state">No matching converter found. Try a unit symbol, category name, or formula keyword.</p>';
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
return `
<a href="${escapeAttribute(href)}" data-conversion-name="${escapeAttribute(item.name)}" data-route="${escapeAttribute(href)}" data-category="${escapeAttribute(category.id)}" data-from="${escapeAttribute(from.id)}" data-to="${escapeAttribute(to.id)}">
<span>${escapeHtml(item.displayName || item.name)}</span>
<strong>${formatNumber(sampleAmount)} ${escapeHtml(from.symbol)} = ${sample.ok ? formatNumber(sample.value) : ""} ${escapeHtml(to.symbol)}</strong>
<small>${escapeHtml(category.name)}</small>
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
results.innerHTML = '<button type="button" disabled>No matching conversion found</button>';
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
function selectCategory(categoryId, options = {}) {
const category = categoryMap.get(categoryId) || categories[0];
const remember = options.remember !== false;
state.categoryId = category.id;
state.fromUnitId = category.defaultFrom || category.units[0].id;
state.toUnitId = category.defaultTo || category.units[Math.min(1, category.units.length - 1)].id;
byId("activeCategoryName").textContent = getCategoryDisplayName(category);
byId("activeCategoryDescription").textContent = getCategoryDisplayDescription(category);
byId("activeCategoryKind").textContent = category.type === "currency" ? "Currency calculator" : category.type === "electricity" ? "Electrical calculator" : "Converter";
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
help.textContent = "Cross-family electrical results use voltage, current, resistance, and hours. Same-family electrical units convert directly.";
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
button.innerHTML = active ? '<span aria-hidden="true">-</span> Saved' : '<span aria-hidden="true">+</span> Favorite';
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
element.innerHTML = '<span>Recently searched</span>';
searches.slice(0, 5).forEach((item) => {
if (item.categoryId && categoryMap.has(item.categoryId)) {
const button = document.createElement("button");
button.type = "button";
button.textContent = item.label;
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
element.innerHTML = history.map((item) => `
<div class="history-item">
<strong>${escapeHtml(item.text)}</strong>
<span>${escapeHtml(item.categoryName)}</span>
</div>
`).join("");
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
if (config) {
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
if (!endpoint) {
result.textContent = "Add an API endpoint or use offline fallback rates.";
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
result.textContent = "Could not load live rates. Offline fallback remains active.";
}
}
function updatePercentage() {
const value = parseInput(byId("percentValue").value);
const base = parseInput(byId("percentBase").value);
byId("percentageResult").textContent = `${formatNumber(base * value / 100)} result`;
}
function updateBmi() {
const weight = parseInput(byId("bmiWeight").value);
const heightCm = parseInput(byId("bmiHeight").value);
const bmi = weight / Math.pow(heightCm / 100, 2);
const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obesity range";
byId("bmiResult").textContent = Number.isFinite(bmi) ? `BMI ${formatNumber(bmi)} - ${label}` : "Enter weight and height";
}
function updateAge() {
const value = byId("birthDate").value;
if (!value) {
byId("ageResult").textContent = "Choose a date";
return;
}
const birth = new Date(`${value}T00:00:00`);
const today = new Date();
let years = today.getFullYear() - birth.getFullYear();
const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
if (beforeBirthday) years -= 1;
const days = Math.floor((today - birth) / 86400000);
byId("ageResult").textContent = `${years} years old, ${days.toLocaleString("en-US")} days`;
}
function updateDateCalc() {
const startValue = byId("dateStart").value;
const offset = Number(byId("dateOffset").value) || 0;
if (!startValue) {
byId("dateResult").textContent = "Choose a start date";
return;
}
const date = new Date(`${startValue}T00:00:00`);
date.setDate(date.getDate() + offset);
byId("dateResult").textContent = `${offset} days later: ${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`;
}
function updateMortgage() {
const principal = parseInput(byId("loanAmount").value);
const annualRate = parseInput(byId("loanRate").value) / 100;
const years = parseInput(byId("loanYears").value);
const months = years * 12;
const monthlyRate = annualRate / 12;
const payment = monthlyRate === 0 ? principal / months : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
byId("mortgageResult").textContent = Number.isFinite(payment) ? `${money(payment)} per month` : "Enter loan details";
}
function updateFuelCost() {
const distance = parseInput(byId("tripDistance").value);
const litersPer100 = parseInput(byId("fuelEfficiency").value);
const price = parseInput(byId("fuelPrice").value);
const cost = distance / 100 * litersPer100 * price;
byId("fuelCostResult").textContent = Number.isFinite(cost) ? `${money(cost)} estimated fuel cost` : "Enter trip details";
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
const seed = parseInput(byId("seedArea").value) * parseInput(byId("seedRate").value) * (1 + parseInput(byId("seedLoss").value) / 100);
byId("seedResult").textContent = `${formatNumber(seed)} kg seed required`;
const fertKg = parseInput(byId("fertArea").value) * parseInput(byId("fertRate").value);
const bags = fertKg / parseInput(byId("fertBags").value);
byId("fertResult").textContent = `${formatNumber(fertKg)} kg, ${formatNumber(bags)} bags`;
const yieldRate = parseInput(byId("yieldMass").value) / parseInput(byId("yieldArea").value);
const revenue = parseInput(byId("yieldMass").value) * parseInput(byId("yieldPrice").value);
byId("yieldResult").textContent = `${formatNumber(yieldRate)} t/ha, ${money(revenue)} revenue`;
const irrigation = parseInput(byId("irrigationArea").value) * 10000 * parseInput(byId("irrigationDepth").value) / 1000 / (parseInput(byId("irrigationEfficiency").value) / 100);
byId("irrigationResult").textContent = `${formatNumber(irrigation)} m3 water required`;
}
function setDefaultDates() {
const today = new Date().toISOString().slice(0, 10);
if (byId("dateStart")) byId("dateStart").value = today;
}
function money(value) {
return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}
function renderBlog() {
const grid = byId("blogGrid");
if (!grid) return;
grid.innerHTML = blogPosts.map((post) => `
<article>
<span>${escapeHtml(post.tag)}</span>
<h3>${escapeHtml(post.title)}</h3>
<p>${escapeHtml(post.summary)}</p>
<a href="${escapeAttribute(post.href || "guides.html")}">Read guide</a>
</article>
`).join("");
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
byId("newsletterStatus").textContent = "Thanks for subscribing! You're on the list.";
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
function restoreOriginalSeoText() {
document.querySelectorAll("[data-i18n-seo-original]").forEach((el) => {
el.textContent = el.dataset.i18nSeoOriginal;
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

function translateHeroAndAboutHeading(seoData, fromUnit, toUnit) {
const fromName = getUnitDisplayName(fromUnit);
const toName = getUnitDisplayName(toUnit);
const h1 = document.querySelector(".hero-content h1");
if (h1) setTranslatedText(h1, `${fromName} → ${toName}`);
const aboutHeading = document.querySelector(".seo-article > h2:first-child");
const chrome = seoData.chrome || {};
if (aboutHeading && chrome.about_converting && /^About Converting /.test(originalText(aboutHeading))) {
setTranslatedText(aboutHeading, `${chrome.about_converting} ${fromName} → ${toName}`);
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
translateHeroAndAboutHeading(seoData, fromUnit, toUnit);
translateFaqItems(seoData, fromUnit, toUnit, category);
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
if (typeof state === "undefined" || !state || !state.categoryId) return;
if (!byId("fromUnit") || !byId("toUnit")) return;
const category = categoryMap.get(state.categoryId);
if (!category) return;
const nameEl = byId("activeCategoryName");
if (nameEl) nameEl.textContent = getCategoryDisplayName(category);
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
