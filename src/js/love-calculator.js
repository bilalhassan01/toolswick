// love-calculator.js - Client-Side Fun Name Match & Love Compatibility Calculator
(function () {
  'use strict';

  function init() {
    const name1Inp = document.getElementById('loveName1');
    const name2Inp = document.getElementById('loveName2');
    const calcBtn = document.getElementById('loveCalcBtn');
    const scoreDisplay = document.getElementById('loveScoreDisplay');
    const msgDisplay = document.getElementById('loveMessageDisplay');

    if (!name1Inp || !name2Inp || !calcBtn) return;

    function computeMatch(n1, n2) {
      const combined = (n1 + n2).toLowerCase().replace(/[^a-z]/g, '');
      if (!combined) return 50;

      // Deterministic hash based on letters
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        hash = (hash * 31 + combined.charCodeAt(i)) % 100000;
      }

      // Output score between 40% and 99% for fun
      return 45 + (Math.abs(hash) % 55);
    }

    function calculate() {
      const n1 = name1Inp.value.trim();
      const n2 = name2Inp.value.trim();
      if (!n1 || !n2) {
        if (msgDisplay) msgDisplay.textContent = 'Please enter both names.';
        return;
      }

      const score = computeMatch(n1, n2);
      if (scoreDisplay) scoreDisplay.textContent = `${score}%`;

      let message = 'A promising romantic spark!';
      if (score >= 90) message = '❤️ Soulmates! An extraordinary, deeply harmonious connection.';
      else if (score >= 80) message = '💖 High Chemistry! Great mutual respect and passion.';
      else if (score >= 65) message = '✨ Solid Connection! Strong potential with open communication.';
      else message = '🌱 Opposites Attract! Balance and curiosity keep things interesting.';

      if (msgDisplay) msgDisplay.textContent = message;
    }

    calcBtn.addEventListener('click', calculate);

    if (!name1Inp.value && !name2Inp.value) {
      name1Inp.value = "Romeo";
      name2Inp.value = "Juliet";
      calculate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
