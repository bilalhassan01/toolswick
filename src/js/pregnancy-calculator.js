// pregnancy-calculator.js - Client-Side Pregnancy Due Date & Trimester Milestones Calculator
(function () {
  'use strict';

  function init() {
    const lmpDateInp = document.getElementById('pregLmpDate');
    const cycleLengthInp = document.getElementById('pregCycleLength');
    const calcBtn = document.getElementById('pregCalcBtn');

    const dueDateEl = document.getElementById('pregDueDateDisplay');
    const currentWeekEl = document.getElementById('pregCurrentWeekDisplay');
    const trimesterEl = document.getElementById('pregTrimesterDisplay');
    const daysRemainingEl = document.getElementById('pregDaysRemaining');

    if (!lmpDateInp || !dueDateEl) return;

    function calculate() {
      const lmpStr = lmpDateInp.value;
      if (!lmpStr) return;

      const lmp = new Date(lmpStr + 'T00:00:00');
      const cycle = parseInt(cycleLengthInp ? cycleLengthInp.value : 28, 10) || 28;
      const cycleAdjustment = cycle - 28;

      // Naegele's Rule: LMP + 280 days (40 weeks) + cycle adjustment
      const dueDate = new Date(lmp.getTime() + (280 + cycleAdjustment) * 24 * 60 * 60 * 1000);
      const now = new Date();

      const elapsedMs = now - lmp;
      const elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
      const weeks = Math.floor(elapsedDays / 7);
      const days = elapsedDays % 7;

      dueDateEl.textContent = dueDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      if (currentWeekEl) {
        currentWeekEl.textContent = `${weeks} weeks, ${days} days`;
      }

      if (trimesterEl) {
        let tri = 'First Trimester (Weeks 1 - 12)';
        if (weeks > 40) {
          tri = 'Post-Term (Past Estimated Due Date)';
        } else if (weeks >= 27) {
          tri = 'Third Trimester (Weeks 27 - 40)';
        } else if (weeks >= 13) {
          tri = 'Second Trimester (Weeks 13 - 26)';
        }
        trimesterEl.textContent = tri;
      }

      if (daysRemainingEl) {
        if (now > dueDate) {
          const overdueDays = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
          daysRemainingEl.textContent = `${overdueDays} day${overdueDays !== 1 ? "s" : ""} past estimated due date`;
          daysRemainingEl.style.color = '#f59e0b';
        } else {
          const remainingDays = Math.max(0, Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)));
          daysRemainingEl.textContent = `${remainingDays} day${remainingDays !== 1 ? "s" : ""} to due date`;
          daysRemainingEl.style.color = 'var(--muted)';
        }
      }
    }

    // Set default LMP to 8 weeks ago
    const defaultDate = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
    lmpDateInp.value = defaultDate.toISOString().split('T')[0];

    lmpDateInp.addEventListener('change', calculate);
    if (cycleLengthInp) cycleLengthInp.addEventListener('change', calculate);
    if (calcBtn) calcBtn.addEventListener('click', calculate);

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
