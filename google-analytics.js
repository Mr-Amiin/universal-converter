(function () {
  "use strict";

  var config = window.UC_GOOGLE_ANALYTICS || {};
  var measurementId = config.measurementId || "";
  var isPlaceholder = !measurementId || measurementId === "GA_MEASUREMENT_ID";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  if (!config.enabled || isPlaceholder) {
    window.UC_GA_READY = false;
    return;
  }

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    anonymize_ip: config.anonymizeIp !== false
  });
  window.UC_GA_READY = true;
})();
