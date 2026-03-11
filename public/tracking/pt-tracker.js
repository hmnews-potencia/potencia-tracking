/**
 * Potencia Tracker v1.0.0
 * Lightweight tracking script for UTM attribution and conversion tracking.
 * Usage: <script src="https://your-domain.com/tracking/pt-tracker.js" data-project="project-slug" data-api="https://your-domain.com" async defer></script>
 */
(function () {
  'use strict';

  var COOKIE_NAME = '_ptk_id';
  var COOKIE_DAYS = 180;
  var STORAGE_KEY = 'ptk_utm';
  var SESSION_KEY = 'ptk_pv_sent';
  var UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  // --- Config ---
  var scriptTag = document.currentScript;
  if (!scriptTag) return;

  var projectSlug = scriptTag.getAttribute('data-project');
  var apiBase = scriptTag.getAttribute('data-api') || '';

  if (!projectSlug) {
    console.warn('[PotenciaTracker] data-project attribute is required.');
    return;
  }

  var apiUrl = apiBase.replace(/\/+$/, '') + '/api/track';

  // --- Cookie Helpers ---
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  // --- UUID v4 Generator ---
  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // --- Tracking ID ---
  var trackingId = getCookie(COOKIE_NAME);
  if (!trackingId) {
    trackingId = generateUUID();
    setCookie(COOKIE_NAME, trackingId, COOKIE_DAYS);
  }

  // --- UTM Parsing ---
  function getUtmFromUrl() {
    var params = {};
    try {
      var search = new URLSearchParams(window.location.search);
      for (var i = 0; i < UTM_PARAMS.length; i++) {
        var val = search.get(UTM_PARAMS[i]);
        if (val) params[UTM_PARAMS[i]] = val;
      }
    } catch {
      // Fallback for older browsers
    }
    return params;
  }

  function persistUtm(params) {
    if (Object.keys(params).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
      } catch {
        // localStorage not available
      }
    }
  }

  function getStoredUtm() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Read current UTM from URL and persist
  var currentUtm = getUtmFromUrl();
  if (Object.keys(currentUtm).length > 0) {
    persistUtm(currentUtm);
  }

  // Merge: URL UTMs take priority, fallback to stored
  var utm = Object.keys(currentUtm).length > 0 ? currentUtm : getStoredUtm();

  // --- Send Event ---
  function sendEvent(eventType, extraData) {
    var payload = {
      project_slug: projectSlug,
      tracking_id: trackingId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      utm_source: utm.utm_source || '',
      utm_medium: utm.utm_medium || '',
      utm_campaign: utm.utm_campaign || '',
      utm_content: utm.utm_content || null,
      utm_term: utm.utm_term || null,
      page_url: window.location.href,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent
    };

    if (extraData) {
      payload.conversion_data = extraData;
    }

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(apiUrl, JSON.stringify(payload));
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', apiUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
      }
    } catch {
      // Silently fail — never break host page
    }
  }

  // --- Pageview (with deduplication) ---
  function sendPageview() {
    try {
      var sessionFlag = sessionStorage.getItem(SESSION_KEY);
      var currentPath = window.location.pathname + window.location.search;

      if (sessionFlag === currentPath) return; // Already sent for this page

      sessionStorage.setItem(SESSION_KEY, currentPath);
    } catch {
      // sessionStorage not available, send anyway
    }

    sendEvent('pageview');
  }

  // --- Public API ---
  window.PotenciaTracker = {
    trackConversion: function (data) {
      sendEvent('conversion', data || {});
    },
    getTrackingId: function () {
      return trackingId;
    }
  };

  // --- Init ---
  sendPageview();
})();
