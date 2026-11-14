// zakat-calculator.js - Client-Side Islamic Zakat Calculator (2.5% on Wealth & Savings)
(function () {
  'use strict';

  function init() {
    const curEl = document.getElementById('zakatCur');
    const cashInp = document.getElementById('zakatCash');
    const goldInp = document.getElementById('zakatGold');
    const investInp = document.getElementById('zakatInvest');
    const debtsInp = document.getElementById('zakatDebts');
    const nisabInp = document.getElementById('zakatNisab');

    const totalWealthEl = document.getElementById('zakatTotalWealth');
    const zakatDueEl = document.getElementById('zakatDueDisplay');
    const statusEl = document.getElementById('zakatStatusDisplay');

    if (!cashInp || !zakatDueEl) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const cash = parseFloat(cashInp.value) || 0;
      const gold = parseFloat(goldInp ? goldInp.value : 0) || 0;
      const invest = parseFloat(investInp ? investInp.value : 0) || 0;
      const debts = parseFloat(debtsInp ? debtsInp.value : 0) || 0;
      const nisab = parseFloat(nisabInp ? nisabInp.value : 500) || 500;

      const netWealth = Math.max(0, (cash + gold + invest) - debts);
      const isEligible = netWealth >= nisab;
      const zakatDue = isEligible ? netWealth * 0.025 : 0; // 2.5%

      if (totalWealthEl) totalWealthEl.textContent = formatCur(netWealth);
      if (zakatDueEl) zakatDueEl.textContent = formatCur(zakatDue);

      if (statusEl) {
        if (isEligible) {
          statusEl.textContent = `✓ Nisab threshold reached (${formatCur(nisab)}). Zakat is payable.`;
          statusEl.style.color = '#10b981';
        } else {
          statusEl.textContent = `Net wealth is below the Nisab threshold (${formatCur(nisab)}). Zakat is not mandatory.`;
          statusEl.style.color = 'var(--muted)';
        }
      }
    }

    [curEl, cashInp, goldInp, investInp, debtsInp, nisabInp].forEach(el => {
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
