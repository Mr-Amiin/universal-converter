(function () {
  "use strict";

  var config = window.UC_ADSENSE || {};
  var publisherId = config.publisherId || (typeof ADSENSE_ID !== "undefined" ? ADSENSE_ID : "");
  var enabled = Boolean(config.enabled || (typeof ADSENSE_ENABLED !== "undefined" && ADSENSE_ENABLED));
  var placeholder = !publisherId || publisherId === "ca-pub-XXXXXXXXXXXX";
  var slots = config.slots || {};
  var metaName = "google-adsense-account";
  var existingMeta = document.querySelectorAll('meta[name="' + metaName + '"]');

  if (existingMeta.length > 1) {
    for (var i = 1; i < existingMeta.length; i += 1) {
      existingMeta[i].parentNode.removeChild(existingMeta[i]);
    }
  }

  if (!existingMeta.length && publisherId) {
    var meta = document.createElement("meta");
    meta.name = metaName;
    meta.content = publisherId;
    if (document.head) {
      document.head.appendChild(meta);
    } else if (document.documentElement) {
      document.documentElement.insertBefore(meta, document.documentElement.firstChild);
    }
  } else if (existingMeta.length) {
    existingMeta[0].content = publisherId;
  }

  document.querySelectorAll("[data-ad-placement]").forEach(function (slot) {
    slot.classList.add("adsense-placeholder");
    if (!slot.textContent.trim()) slot.textContent = "Advertisement";
  });

  if (!enabled || placeholder) return;

  if (!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
    var script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(publisherId);
    document.head.appendChild(script);
  }

  function createResponsiveAd(adSlot) {
    var ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", publisherId);
    ins.setAttribute("data-ad-slot", adSlot || "REPLACE_WITH_SLOT_ID");
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");
    return ins;
  }

  document.querySelectorAll("[data-ad-placement]").forEach(function (slot) {
    if (slot.getAttribute("data-adsbygoogle-processed") === "true") return;

    var placement = slot.getAttribute("data-ad-placement");
    var adSlot = slots[placement] || "REPLACE_WITH_SLOT_ID";
    if (!enabled || placeholder || !publisherId || !adSlot || adSlot === "REPLACE_WITH_SLOT_ID") {
      slot.setAttribute("data-ad-status", "placeholder");
      return;
    }

    slot.innerHTML = "";
    slot.appendChild(createResponsiveAd(adSlot));

    var initScript = document.createElement("script");
    initScript.textContent = "(adsbygoogle = window.adsbygoogle || []).push({});";
    slot.appendChild(initScript);
    slot.setAttribute("data-adsbygoogle-processed", "true");
  });
})();
