// world-clock.js - Pure client-side World Clock & Timezone Converter
(function () {
  'use strict';

  const CITIES = [
    { name: 'UTC / GMT', zone: 'UTC', country: 'Universal' },
    { name: 'New York', zone: 'America/New_York', country: 'United States (EDT/EST)' },
    { name: 'London', zone: 'Europe/London', country: 'United Kingdom (BST/GMT)' },
    { name: 'Paris / Berlin', zone: 'Europe/Paris', country: 'Central Europe (CEST/CET)' },
    { name: 'Dubai', zone: 'Asia/Dubai', country: 'UAE (GST)' },
    { name: 'Karachi / Islamabad', zone: 'Asia/Karachi', country: 'Pakistan (PKT)' },
    { name: 'Tokyo', zone: 'Asia/Tokyo', country: 'Japan (JST)' },
    { name: 'Sydney', zone: 'Australia/Sydney', country: 'Australia (AEST/AEDT)' },
    { name: 'Los Angeles', zone: 'America/Los_Angeles', country: 'United States (PDT/PST)' }
  ];

  function init() {
    const gridEl = document.getElementById('worldClockGrid');
    const modeLiveBtn = document.getElementById('worldClockLiveBtn');
    const plannerRow = document.getElementById('worldClockPlanner');
    const planDateIn = document.getElementById('worldPlanDate');
    const planTimeIn = document.getElementById('worldPlanTime');
    const planZoneIn = document.getElementById('worldPlanZone');

    if (!gridEl) return;

    let isLive = true;
    let timerId = null;

    // Populate planner zones dropdown
    if (planZoneIn) {
      planZoneIn.innerHTML = CITIES.map(c => `<option value="${c.zone}">${c.name} (${c.zone})</option>`).join('');
    }

    // Initialize planner defaults
    const now = new Date();
    if (planDateIn) planDateIn.value = now.toISOString().split('T')[0];
    if (planTimeIn) {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      planTimeIn.value = `${hh}:${mm}`;
    }

    function renderClocks(targetDate) {
      let html = '';

      CITIES.forEach(city => {
        let timeStr = '';
        let dateStr = '';
        let offsetStr = '';

        try {
          const timeFmt = new Intl.DateTimeFormat('en-US', {
            timeZone: city.zone,
            hour: '2-digit',
            minute: '2-digit',
            second: isLive ? '2-digit' : undefined,
            hour12: true
          });
          const dateFmt = new Intl.DateTimeFormat('en-US', {
            timeZone: city.zone,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          const tzFmt = new Intl.DateTimeFormat('en-US', {
            timeZone: city.zone,
            timeZoneName: 'short'
          });

          timeStr = timeFmt.format(targetDate);
          dateStr = dateFmt.format(targetDate);

          const parts = tzFmt.formatToParts(targetDate);
          const tzPart = parts.find(p => p.type === 'timeZoneName');
          offsetStr = tzPart ? tzPart.value : '';
        } catch (e) {
          timeStr = '--:--';
        }

        html += `
          <div class="card-box" style="padding:14px;border:1px solid var(--border,#333);border-radius:10px;background:var(--surface-card,#ffffff);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
              <div>
                <strong style="font-size:1.05rem;display:block;">${city.name}</strong>
                <span style="font-size:0.75rem;color:var(--muted,#888);">${city.country}</span>
              </div>
              <span style="font-size:0.75rem;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,0.08);">${offsetStr}</span>
            </div>
            <div style="font-size:1.6rem;font-weight:700;font-variant-numeric:tabular-nums;color:#38bdf8;margin:8px 0 4px 0;">
              ${timeStr}
            </div>
            <div style="font-size:0.8rem;color:var(--muted,#aaa);">
              ${dateStr}
            </div>
          </div>
        `;
      });

      gridEl.innerHTML = html;
    }

    function tick() {
      if (isLive) {
        renderClocks(new Date());
      }
    }

    function startLive() {
      isLive = true;
      if (modeLiveBtn) {
        modeLiveBtn.classList.add('active');
        modeLiveBtn.textContent = '● Live Syncing';
      }
      if (plannerRow) plannerRow.style.opacity = '0.5';
      tick();
      if (!timerId) timerId = setInterval(tick, 1000);
    }

    function stopLive() {
      isLive = false;
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      if (modeLiveBtn) {
        modeLiveBtn.classList.remove('active');
        modeLiveBtn.textContent = 'Resume Live Sync';
      }
      if (plannerRow) plannerRow.style.opacity = '1';
    }

    function getUtcTimestamp(year, month, day, hours, mins, tz) {
      const estimate = Date.UTC(year, month - 1, day, hours, mins, 0);
      try {
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
        const offsetMs = wallClockAtEstimate - estimate;
        return estimate - offsetMs;
      } catch (e) {
        return estimate;
      }
    }

    function updateFromPlanner() {
      stopLive();
      const dStr = planDateIn ? planDateIn.value : '';
      const tStr = planTimeIn ? planTimeIn.value : '';
      const zone = planZoneIn ? planZoneIn.value : 'UTC';

      if (!dStr || !tStr) return;

      const [y, m, d] = dStr.split('-').map(Number);
      const [h, min] = tStr.split(':').map(Number);
      const utcMs = getUtcTimestamp(y, m, d, h, min, zone);
      const tempDate = new Date(utcMs);

      renderClocks(tempDate);
    }

    if (modeLiveBtn) {
      modeLiveBtn.addEventListener('click', () => {
        if (!isLive) startLive();
      });
    }

    if (planDateIn) planDateIn.addEventListener('input', updateFromPlanner);
    if (planTimeIn) planTimeIn.addEventListener('input', updateFromPlanner);
    if (planZoneIn) planZoneIn.addEventListener('change', updateFromPlanner);

    startLive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
