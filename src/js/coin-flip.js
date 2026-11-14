// coin-flip.js - Client-Side 3D Coin Flip Simulator
(function () {
  'use strict';

  function init() {
    const flipBtn = document.getElementById('coinFlipBtn');
    const resultDisplay = document.getElementById('coinResultDisplay');
    const coinEl = document.getElementById('coinVisual');
    const headsCountEl = document.getElementById('coinHeadsCount');
    const tailsCountEl = document.getElementById('coinTailsCount');
    const totalCountEl = document.getElementById('coinTotalCount');
    const resetBtn = document.getElementById('coinResetBtn');

    if (!flipBtn || !resultDisplay || !coinEl) return;

    let heads = 0;
    let tails = 0;
    let currentAngle = 0;

    function flip() {
      flipBtn.disabled = true;

      // Cryptographically secure 50/50 outcome
      const randBytes = new Uint8Array(1);
      window.crypto.getRandomValues(randBytes);
      const isHeads = randBytes[0] % 2 === 0;

      // Spin at least 5 full revolutions (1800deg) + land on target face:
      // Heads = 0deg mod 360, Tails = 180deg mod 360
      currentAngle += 1800;
      if (isHeads) {
        if (currentAngle % 360 !== 0) currentAngle += 180;
      } else {
        if (currentAngle % 360 === 0) currentAngle += 180;
      }

      coinEl.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.3, 1)';
      coinEl.style.transform = 'rotateY(' + currentAngle + 'deg)';

      setTimeout(function () {
        if (isHeads) {
          heads++;
          resultDisplay.textContent = '👑 HEADS';
          resultDisplay.style.color = '#eab308';
        } else {
          tails++;
          resultDisplay.textContent = '💎 TAILS';
          resultDisplay.style.color = '#38bdf8';
        }

        if (headsCountEl) headsCountEl.textContent = heads;
        if (tailsCountEl) tailsCountEl.textContent = tails;
        if (totalCountEl) totalCountEl.textContent = heads + tails;

        flipBtn.disabled = false;
      }, 1000);
    }

    flipBtn.addEventListener('click', flip);

    document.addEventListener('keydown', function (e) {
      if (e.code === 'Space' && e.target === document.body && !flipBtn.disabled) {
        e.preventDefault();
        flip();
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        heads = 0;
        tails = 0;
        currentAngle = 0;
        coinEl.style.transition = 'transform 0.4s ease';
        coinEl.style.transform = 'rotateY(0deg)';
        if (headsCountEl) headsCountEl.textContent = '0';
        if (tailsCountEl) tailsCountEl.textContent = '0';
        if (totalCountEl) totalCountEl.textContent = '0';
        resultDisplay.textContent = 'Click Flip Coin';
        resultDisplay.style.color = 'var(--ink)';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
