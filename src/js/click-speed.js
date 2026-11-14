// click-speed.js - Client-Side Clicks Per Second (CPS) Speed Test
(function () {
  'use strict';

  function init() {
    const clickArea = document.getElementById('cpsClickArea');
    const timerDisplay = document.getElementById('cpsTimerDisplay');
    const scoreDisplay = document.getElementById('cpsScoreDisplay');
    const cpsDisplay = document.getElementById('cpsCurrentCps');
    const durationSel = document.getElementById('cpsDurationSelect');
    const restartBtn = document.getElementById('cpsRestartBtn');

    if (!clickArea || !timerDisplay) return;

    let clicks = 0;
    let duration = 5;
    let timeLeft = 5;
    let isRunning = false;
    let interval = null;

    function reset() {
      clearInterval(interval);
      isRunning = false;
      clicks = 0;
      duration = parseInt(durationSel ? durationSel.value : 5, 10) || 5;
      timeLeft = duration;
      timerDisplay.textContent = `${timeLeft}s`;
      scoreDisplay.textContent = '0';
      if (cpsDisplay) cpsDisplay.textContent = '0.0 CPS';
      clickArea.style.pointerEvents = 'auto';
    }

    clickArea.addEventListener('click', () => {
      if (!isRunning) {
        isRunning = true;
        interval = setInterval(() => {
          timeLeft--;
          timerDisplay.textContent = `${timeLeft}s`;
          if (timeLeft <= 0) {
            clearInterval(interval);
            clickArea.style.pointerEvents = 'none';
            const finalCps = parseFloat((clicks / duration).toFixed(1));
            let rank = '🐢 Turtle';
            if (finalCps >= 10) rank = '🐆 Cheetah (Pro Gamer)';
            else if (finalCps >= 7) rank = '🐇 Rabbit (High Speed)';
            else if (finalCps >= 5) rank = '🚶 Human (Good Average)';
            else if (finalCps >= 3) rank = '🦥 Sloth (Slow & Steady)';
            if (cpsDisplay) cpsDisplay.innerHTML = `${finalCps} CPS &bull; <span style="color:#10b981;font-weight:700;">${rank}</span>`;
          }
        }, 1000);
      }

      clicks++;
      scoreDisplay.textContent = clicks;
      const elapsed = duration - timeLeft;
      const curCps = elapsed > 0 ? (clicks / elapsed).toFixed(1) : (clicks).toFixed(1);
      if (cpsDisplay) cpsDisplay.textContent = `${curCps} CPS`;
    });

    if (durationSel) durationSel.addEventListener('change', reset);
    if (restartBtn) restartBtn.addEventListener('click', reset);

    reset();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
