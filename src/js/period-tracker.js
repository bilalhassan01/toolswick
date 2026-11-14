// period-tracker.js - Client-Side Menstrual Cycle & Ovulation Window Calculator (100% Local)
(function () {
  'use strict';

  function init() {
    const lastPeriodInp = document.getElementById('periodLastDate');
    const cycleLengthInp = document.getElementById('periodCycleLength');
    const periodDaysInp = document.getElementById('periodDaysLength');
    const calcBtn = document.getElementById('periodCalcBtn');

    const nextPeriodEl = document.getElementById('periodNextDateDisplay');
    const fertileWindowEl = document.getElementById('periodFertileWindow');
    const ovulationEl = document.getElementById('periodOvulationDate');
    const daysUntilEl = document.getElementById('periodDaysUntil');

    if (!lastPeriodInp || !nextPeriodEl) return;

    function calculate() {
      const dateStr = lastPeriodInp.value;
      if (!dateStr) return;

      const lastDate = new Date(dateStr + 'T00:00:00');
      const cycleLength = parseInt(cycleLengthInp ? cycleLengthInp.value : 28, 10) || 28;
      const periodLength = parseInt(periodDaysInp ? periodDaysInp.value : 5, 10) || 5;

      // Next period = lastDate + cycleLength days
      const nextDate = new Date(lastDate.getTime() + cycleLength * 24 * 60 * 60 * 1000);

      // Ovulation occurs approximately 14 days before the NEXT period begins
      const ovulationDate = new Date(nextDate.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Fertile window is approximately 5 days before ovulation up to ovulation day
      const fertileStart = new Date(ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000);
      const fertileEnd = new Date(ovulationDate.getTime() + 1 * 24 * 60 * 60 * 1000);

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));

      nextPeriodEl.textContent = nextDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      if (ovulationEl) ovulationEl.textContent = ovulationDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (fertileWindowEl) {
        fertileWindowEl.textContent = `${fertileStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${fertileEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      }
      if (daysUntilEl) {
        daysUntilEl.textContent = daysUntil >= 0 ? `${daysUntil} days remaining` : `${Math.abs(daysUntil)} days overdue`;
      }
    }

    // Default to 2 weeks ago
    const defaultDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    lastPeriodInp.value = defaultDate.toISOString().split('T')[0];

    [lastPeriodInp, cycleLengthInp, periodDaysInp].forEach(el => {
      if (el) el.addEventListener('change', calculate);
    });

    if (calcBtn) calcBtn.addEventListener('click', calculate);

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
