// typing-speed.js - Client-Side Words Per Minute (WPM) & Accuracy Typing Test
(function () {
  'use strict';

  function init() {
    const textPromptEl = document.getElementById('typingPrompt');
    const inputEl = document.getElementById('typingInput');
    const wpmDisplay = document.getElementById('typingWpm');
    const accDisplay = document.getElementById('typingAcc');
    const timerDisplay = document.getElementById('typingTimer');
    const restartBtn = document.getElementById('typingRestartBtn');

    if (!textPromptEl || !inputEl) return;

    const PASSAGES = [
      "The quick brown fox jumps over the lazy dog near the quiet riverbank while enjoying the warm sunlight.",
      "Efficiency in web utilities requires zero server latency, clean client-side computation, and uncompromising privacy.",
      "Writing clean code demands discipline, clarity of structure, and constant attention to performance and user feedback.",
      "Programming is not merely about typing syntax; it is about decomposing complex problems into elegant simple steps."
    ];

    let currentPassage = PASSAGES[0];
    let startTime = null;
    let timerInterval = null;
    let durationSecs = 60;
    let isFinished = false;

    function renderPrompt() {
      const typed = inputEl.value;
      let html = '';
      let errors = 0;

      for (let i = 0; i < currentPassage.length; i++) {
        const char = currentPassage[i];
        if (i < typed.length) {
          if (typed[i] === char) {
            html += `<span style="color:#10b981;">${char}</span>`;
          } else {
            errors++;
            html += `<span style="color:#ef4444;background:rgba(239,68,68,0.2);">${char}</span>`;
          }
        } else if (i === typed.length) {
          html += `<span style="border-bottom:2px solid #38bdf8;">${char}</span>`;
        } else {
          html += char;
        }
      }

      textPromptEl.innerHTML = html;

      // Calculate real-time stats
      if (startTime && !isFinished) {
        const elapsedMinutes = (Date.now() - startTime) / 60000;
        const wordsTyped = typed.length / 5;
        const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
        const accuracy = typed.length > 0 ? Math.max(0, Math.round(((typed.length - errors) / typed.length) * 100)) : 100;

        if (wpmDisplay) wpmDisplay.textContent = `${wpm} WPM`;
        if (accDisplay) accDisplay.textContent = `${accuracy}%`;

        if (typed.length >= currentPassage.length) {
          finishTest();
        }
      }
    }

    function startTimer() {
      startTime = Date.now();
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, durationSecs - elapsed);
        if (timerDisplay) timerDisplay.textContent = `${remaining}s`;
        if (remaining <= 0) finishTest();
      }, 1000);
    }

    function finishTest() {
      isFinished = true;
      clearInterval(timerInterval);
      inputEl.disabled = true;
      if (timerDisplay) timerDisplay.textContent = 'Finished!';
    }

    function restart() {
      clearInterval(timerInterval);
      startTime = null;
      isFinished = false;
      inputEl.disabled = false;
      inputEl.value = '';
      currentPassage = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
      if (wpmDisplay) wpmDisplay.textContent = '0 WPM';
      if (accDisplay) accDisplay.textContent = '100%';
      if (timerDisplay) timerDisplay.textContent = '60s';
      renderPrompt();
      inputEl.focus();
    }

    inputEl.addEventListener('input', () => {
      if (!startTime && inputEl.value.length === 1) {
        startTimer();
      }
      renderPrompt();
    });

    if (restartBtn) restartBtn.addEventListener('click', restart);
    restart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
