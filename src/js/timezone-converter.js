// timezone-converter.js - Client-Side World Time Zone Converter using Native Intl API
(function () {
  'use strict';

  function init() {
    const timeInp = document.getElementById('tzTimeInput');
    const dateInp = document.getElementById('tzDateInput');
    const fromSel = document.getElementById('tzFromSelect');
    const toSel = document.getElementById('tzToSelect');
    const swapBtn = document.getElementById('tzSwapBtn');
    const nowBtn = document.getElementById('tzNowBtn');

    const resultTimeEl = document.getElementById('tzResultTime');
    const resultDateEl = document.getElementById('tzResultDate');
    const diffEl = document.getElementById('tzDiffDisplay');
    const copyBtn = document.getElementById('tzCopyBtn');

    if (!timeInp || !fromSel || !toSel) return;

    const MAJOR_ZONES = [
      { name: "Karachi, Pakistan (PKT, UTC+5)", tz: "Asia/Karachi" },
      { name: "London, UK (GMT / BST)", tz: "Europe/London" },
      { name: "New York, USA (EST / EDT)", tz: "America/New_York" },
      { name: "UTC (Coordinated Universal Time)", tz: "UTC" },
      { name: "Dubai, UAE (GST, UTC+4)", tz: "Asia/Dubai" },
      { name: "India / Mumbai (IST, UTC+5:30)", tz: "Asia/Kolkata" },
      { name: "Dhaka, Bangladesh (BST, UTC+6)", tz: "Asia/Dhaka" },
      { name: "Chicago, USA (CST / CDT)", tz: "America/Chicago" },
      { name: "Los Angeles, USA (PST / PDT)", tz: "America/Los_Angeles" },
      { name: "Denver, USA (MST / MDT)", tz: "America/Denver" },
      { name: "Paris, France (CET / CEST)", tz: "Europe/Paris" },
      { name: "Berlin, Germany (CET / CEST)", tz: "Europe/Berlin" },
      { name: "Cairo, Egypt (EEST / EET)", tz: "Africa/Cairo" },
      { name: "Singapore (SGT, UTC+8)", tz: "Asia/Singapore" },
      { name: "Tokyo, Japan (JST, UTC+9)", tz: "Asia/Tokyo" },
      { name: "Sydney, Australia (AEST / AEDT)", tz: "Australia/Sydney" },
      { name: "Auckland, New Zealand (NZST / NZDT)", tz: "Pacific/Auckland" },
      { name: "São Paulo, Brazil (BRT)", tz: "America/Sao_Paulo" },
      { name: "Toronto, Canada (EST / EDT)", tz: "America/Toronto" }
    ];

    function populateZones() {
      const opts = MAJOR_ZONES.map(z => `<option value="${z.tz}">${z.name}</option>`).join('');
      fromSel.innerHTML = opts;
      toSel.innerHTML = opts;

      // Default: Karachi -> London
      fromSel.value = "Asia/Karachi";
      toSel.value = "Europe/London";
    }

    function setNow() {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const da = String(now.getDate()).padStart(2, '0');
      const hr = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');

      if (dateInp) dateInp.value = `${yr}-${mo}-${da}`;
      if (timeInp) timeInp.value = `${hr}:${mi}`;
      convert();
    }

    // Convert local wall-clock time in fromTz into exact UTC epoch ms
    function getUtcTimestamp(year, month, day, hours, mins, tz) {
      // Step 1: Estimated UTC timestamp
      const estimate = Date.UTC(year, month - 1, day, hours, mins, 0);

      // Step 2: Format estimate in source timezone to find timezone offset
      const d = new Date(estimate);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      });

      const parts = {};
      formatter.formatToParts(d).forEach(p => { parts[p.type] = p.value; });

      const wallClockAtEstimate = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second)
      );

      // Offset between wall clock in target timezone and UTC
      const offsetMs = wallClockAtEstimate - estimate;

      // Exact UTC timestamp corresponding to entered wall-clock time
      return estimate - offsetMs;
    }

    function convert() {
      const dateStr = dateInp ? dateInp.value : '';
      const timeStr = timeInp ? timeInp.value : '';
      if (!dateStr || !timeStr) return;

      const [hours, mins] = timeStr.split(':').map(Number);
      const [year, month, day] = dateStr.split('-').map(Number);

      const fromTz = fromSel.value;
      const toTz = toSel.value;

      try {
        const utcMs = getUtcTimestamp(year, month, day, hours, mins, fromTz);
        const targetDate = new Date(utcMs);

        const timeFmt = new Intl.DateTimeFormat('en-US', {
          timeZone: toTz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        const dateFmt = new Intl.DateTimeFormat('en-US', {
          timeZone: toTz,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const resTime = timeFmt.format(targetDate);
        const resDate = dateFmt.format(targetDate);

        if (resultTimeEl) resultTimeEl.textContent = resTime;
        if (resultDateEl) resultDateEl.textContent = resDate;

        // Calculate offset difference between timezones
        const fromName = fromSel.options[fromSel.selectedIndex].text.split('(')[0].trim();
        const toName = toSel.options[toSel.selectedIndex].text.split('(')[0].trim();

        if (diffEl) {
          diffEl.textContent = `${fromName} → ${toName}`;
        }
      } catch (e) {
        if (resultTimeEl) resultTimeEl.textContent = 'Error computing time';
      }
    }

    populateZones();
    setNow();

    [timeInp, dateInp, fromSel, toSel].forEach(el => {
      if (el) {
        el.addEventListener('input', convert);
        el.addEventListener('change', convert);
      }
    });

    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const tmp = fromSel.value;
        fromSel.value = toSel.value;
        toSel.value = tmp;
        convert();
      });
    }

    if (nowBtn) nowBtn.addEventListener('click', setNow);

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `${resultTimeEl ? resultTimeEl.textContent : ''} (${resultDateEl ? resultDateEl.textContent : ''}) in ${toSel.options[toSel.selectedIndex].text}`;
        navigator.clipboard.writeText(text).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
