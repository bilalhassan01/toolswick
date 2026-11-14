// dice-roller.js - Client-Side Polyhedral Dice Roller (d4 to d100)
(function () {
  'use strict';

  function init() {
    const diceTypeSel = document.getElementById('diceTypeSelect');
    const diceCountInp = document.getElementById('diceCountInput');
    const modifierInp = document.getElementById('diceModifierInput');
    const rollBtn = document.getElementById('diceRollBtn');
    const totalDisplay = document.getElementById('diceTotalDisplay');
    const breakdownDisplay = document.getElementById('diceBreakdownDisplay');
    const historyList = document.getElementById('diceHistoryList');

    if (!rollBtn || !totalDisplay) return;

    function getCryptoRandom(max) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return (array[0] % max) + 1;
    }

    function roll() {
      const sides = parseInt(diceTypeSel ? diceTypeSel.value : 6, 10) || 6;
      const count = Math.max(1, parseInt(diceCountInp ? diceCountInp.value : 1, 10) || 1);
      const modifier = parseInt(modifierInp ? modifierInp.value : 0, 10) || 0;

      const rolls = [];
      let sum = 0;

      for (let i = 0; i < count; i++) {
        const val = getCryptoRandom(sides);
        rolls.push(val);
        sum += val;
      }

      const total = sum + modifier;

      totalDisplay.textContent = total;
      if (breakdownDisplay) {
        const modStr = modifier !== 0 ? ` ${modifier >= 0 ? '+' : '-'} ${Math.abs(modifier)}` : '';
        breakdownDisplay.textContent = `[${rolls.join(', ')}]${modStr} = ${total}`;
      }

      if (historyList) {
        const row = document.createElement('div');
        row.style.padding = '4px 0';
        row.style.borderBottom = '1px solid var(--border,#333)';
        row.style.fontSize = '0.85rem';
        row.innerHTML = `<span style="color:var(--muted);">${count}d${sides}:</span> <strong>${total}</strong> <span style="color:var(--muted);font-size:0.8rem;">(${rolls.join(', ')})</span>`;
        historyList.prepend(row);
      }
    }

    rollBtn.addEventListener('click', roll);
    roll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
