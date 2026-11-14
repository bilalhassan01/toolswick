// reaction-time.js - Client-Side Human Reaction Time Benchmark
(function () {
  'use strict';

  function init() {
    const box = document.getElementById('reactionBox');
    const msg = document.getElementById('reactionMsg');
    const sub = document.getElementById('reactionSub');
    const historyList = document.getElementById('reactionHistory');

    if (!box || !msg) return;

    let state = 'waiting'; // 'waiting', 'ready', 'now'
    let timer = null;
    let startTime = 0;
    const scores = [];

    function setWaiting() {
      state = 'waiting';
      box.style.background = '#3b82f6';
      msg.textContent = 'Click to Start';
      sub.textContent = 'When the red box turns GREEN, click as fast as you can!';
    }

    function setReady() {
      state = 'ready';
      box.style.background = '#ef4444';
      msg.textContent = 'Wait for green...';
      sub.textContent = 'Do not click yet!';

      // Random delay between 1.5s and 4.5s
      const delay = 1500 + Math.random() * 3000;
      timer = setTimeout(setNow, delay);
    }

    function setNow() {
      state = 'now';
      box.style.background = '#10b981';
      msg.textContent = 'CLICK NOW!';
      sub.textContent = '';
      startTime = performance.now();
    }

    box.addEventListener('click', () => {
      if (state === 'waiting') {
        setReady();
      } else if (state === 'ready') {
        clearTimeout(timer);
        state = 'waiting';
        box.style.background = '#f59e0b';
        msg.textContent = 'Too soon!';
        sub.textContent = 'You clicked before the box turned green. Click to try again.';
      } else if (state === 'now') {
        const reactionMs = Math.round(performance.now() - startTime);
        state = 'waiting';
        box.style.background = '#6366f1';
        msg.textContent = `${reactionMs} ms`;
        sub.textContent = 'Click to try again!';

        scores.push(reactionMs);
        if (historyList) {
          const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          const li = document.createElement('div');
          li.style.padding = '4px 0';
          li.style.borderBottom = '1px solid var(--border,#333);';
          li.innerHTML = `Attempt #${scores.length}: <strong>${reactionMs} ms</strong> <span style="color:var(--muted);font-size:0.8rem;">(Average: ${avg} ms)</span>`;
          historyList.prepend(li);
        }
      }
    });

    setWaiting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
