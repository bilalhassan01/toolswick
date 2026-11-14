// random-picker.js - Client-Side Random Item Picker & Raffle Winner Generator
(function () {
  'use strict';

  function init() {
    const listInp = document.getElementById('pickerListInput');
    const pickBtn = document.getElementById('pickerPickBtn');
    const shuffleBtn = document.getElementById('pickerShuffleBtn');
    const winnerDisplay = document.getElementById('pickerWinnerDisplay');
    const historyList = document.getElementById('pickerHistoryList');
    const countInp = document.getElementById('pickerCountInput');

    if (!listInp || !pickBtn) return;

    function getItems() {
      return listInp.value
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
    }

    function pickWinner() {
      const items = getItems();
      if (items.length === 0) {
        if (winnerDisplay) winnerDisplay.textContent = 'Please enter at least 1 item.';
        return;
      }

      pickBtn.disabled = true;
      let counter = 0;
      const totalSteps = 20;

      // Animation shuffle effect
      const interval = setInterval(() => {
        const randIndex = Math.floor(Math.random() * items.length);
        if (winnerDisplay) winnerDisplay.textContent = items[randIndex];
        counter++;

        if (counter >= totalSteps) {
          clearInterval(interval);
          pickBtn.disabled = false;
          const winnerIndex = Math.floor(Math.random() * items.length);
          const finalWinner = items[winnerIndex];
          if (winnerDisplay) {
            winnerDisplay.textContent = `🎉 ${finalWinner}`;
            winnerDisplay.style.color = '#10b981';
          }

          if (historyList) {
            const li = document.createElement('div');
            li.style.padding = '4px 0';
            li.style.borderBottom = '1px solid var(--border,#333);';
            li.innerHTML = `<span style="color:var(--muted);">${new Date().toLocaleTimeString()}:</span> <strong>${finalWinner}</strong>`;
            historyList.prepend(li);
          }
        }
      }, 50);
    }

    function shuffle() {
      const items = getItems();
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      listInp.value = items.join('\n');
    }

    pickBtn.addEventListener('click', pickWinner);
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffle);

    if (!listInp.value) {
      listInp.value = "Apple\nBanana\nCherry\nDragonfruit\nElderberry";
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
