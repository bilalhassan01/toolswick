// countdown-timer.js - Client-Side Interactive Countdown Timer
(function () {
  'use strict';

  function init() {
    const titleInp = document.getElementById('countTitleInput');
    const targetDateInp = document.getElementById('countTargetDate');
    const targetTimeInp = document.getElementById('countTargetTime');
    const startBtn = document.getElementById('countStartBtn');
    const resetBtn = document.getElementById('countResetBtn');

    const daysEl = document.getElementById('countDaysDisplay');
    const hoursEl = document.getElementById('countHoursDisplay');
    const minsEl = document.getElementById('countMinsDisplay');
    const secsEl = document.getElementById('countSecsDisplay');
    const bannerEl = document.getElementById('countBannerTitle');
    const statusMsgEl = document.getElementById('countStatusMsg');

    if (!targetDateInp) return;

    let timerInterval = null;

    function setDefaultTarget() {
      const now = new Date();
      // Default to Upcoming New Year (Jan 1st of next year at midnight)
      const nextYear = now.getFullYear() + 1;
      targetDateInp.value = `${nextYear}-01-01`;
      if (targetTimeInp) targetTimeInp.value = "00:00";
    }

    function updateCountdown() {
      const dateStr = targetDateInp.value;
      const timeStr = targetTimeInp ? targetTimeInp.value : '00:00';
      if (!dateStr) return;

      const target = new Date(`${dateStr}T${timeStr}:00`);
      const now = new Date();
      const diff = target - now;

      if (bannerEl && titleInp) {
        bannerEl.textContent = titleInp.value.trim() || "New Year's Eve";
      }

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        if (statusMsgEl) {
          statusMsgEl.textContent = "🎉 Time is up! The countdown has completed.";
          statusMsgEl.style.color = '#10b981';
        }
        clearInterval(timerInterval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
      if (statusMsgEl) {
        statusMsgEl.textContent = `Counting down to ${target.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} at ${timeStr}...`;
        statusMsgEl.style.color = 'var(--muted)';
      }
    }

    function startTimer() {
      clearInterval(timerInterval);
      updateCountdown();
      timerInterval = setInterval(updateCountdown, 1000);
    }

    setDefaultTarget();
    startTimer();

    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        if (titleInp) titleInp.value = "New Year's Eve";
        setDefaultTarget();
        startTimer();
      });
    }

    [titleInp, targetDateInp, targetTimeInp].forEach(el => {
      if (el) el.addEventListener('change', updateCountdown);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
