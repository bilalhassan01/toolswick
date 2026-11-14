// sleep-calculator.js - Client-Side 90-Minute Sleep Cycle Calculator
(function () {
  'use strict';

  function init() {
    const wakeModeBtn = document.getElementById('sleepModeWake');
    const bedModeBtn = document.getElementById('sleepModeBed');
    const timeInp = document.getElementById('sleepTimeInput');
    const calcBtn = document.getElementById('sleepCalcBtn');
    const resultsContainer = document.getElementById('sleepResultsList');
    const headingEl = document.getElementById('sleepHeading');

    if (!timeInp || !resultsContainer) return;

    let mode = 'wake'; // 'wake' = calculating bedtimes for a wake time; 'bed' = wake times for bedtime

    function calculate() {
      const timeVal = timeInp.value;
      if (!timeVal) return;
      const [hours, mins] = timeVal.split(':').map(Number);

      const target = new Date();
      target.setHours(hours, mins, 0, 0);

      // Sleep cycles are 90 minutes (1.5 hours) + 14 minutes average time to fall asleep
      const cycles = [6, 5, 4, 3]; // 9 hrs, 7.5 hrs, 6 hrs, 4.5 hrs
      const results = [];

      cycles.forEach(c => {
        const totalMinutes = c * 90 + 14;
        const d = new Date(target.getTime());
        if (mode === 'wake') {
          // Subtract time to find bedtime
          d.setMinutes(d.getMinutes() - totalMinutes);
        } else {
          // Add time to find wake time
          d.setMinutes(d.getMinutes() + totalMinutes);
        }

        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        results.push({ cycles: c, hours: (c * 1.5).toFixed(1), time: timeStr, ideal: c === 5 || c === 6 });
      });

      if (headingEl) {
        headingEl.textContent = mode === 'wake'
          ? 'Optimal Bedtimes (90-min Sleep Cycles):'
          : 'Optimal Wake-Up Times (90-min Sleep Cycles):';
      }

      resultsContainer.innerHTML = results.map(r => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;margin-bottom:8px;background:var(--surface,#222);border:1.5px solid ${r.ideal ? '#10b981' : 'var(--border,#333)'};border-radius:8px;">
          <div>
            <strong style="font-size:1.4rem;color:${r.ideal ? '#10b981' : 'inherit'};">${r.time}</strong>
            <span style="display:block;font-size:0.8rem;color:var(--muted);">${r.cycles} Cycles (${r.hours} Hours of sleep)</span>
          </div>
          ${r.ideal ? '<span class="badge good" style="font-size:0.75rem;padding:3px 8px;border-radius:4px;background:rgba(16,185,129,0.15);color:#10b981;font-weight:600;">Recommended</span>' : ''}
        </div>`
      ).join('');
    }

    if (wakeModeBtn && bedModeBtn) {
      wakeModeBtn.addEventListener('click', () => {
        mode = 'wake';
        wakeModeBtn.classList.add('active');
        wakeModeBtn.classList.remove('ghost');
        bedModeBtn.classList.remove('active');
        bedModeBtn.classList.add('ghost');
        calculate();
      });

      bedModeBtn.addEventListener('click', () => {
        mode = 'bed';
        bedModeBtn.classList.add('active');
        bedModeBtn.classList.remove('ghost');
        wakeModeBtn.classList.remove('active');
        wakeModeBtn.classList.add('ghost');
        calculate();
      });
    }

    if (calcBtn) calcBtn.addEventListener('click', calculate);
    timeInp.addEventListener('change', calculate);

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
