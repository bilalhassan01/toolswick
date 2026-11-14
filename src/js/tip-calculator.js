// tip-calculator.js - Client-Side Tip Calculator
(function () {
  'use strict';

  function init() {
    const curEl = document.getElementById('tipCur');
    const billEl = document.getElementById('tipBillInput');
    const tipPctEl = document.getElementById('tipPctInput');
    const splitEl = document.getElementById('tipSplitInput');
    const presetBtns = document.querySelectorAll('.tip-preset-btn');

    const tipAmtEl = document.getElementById('tipAmountDisplay');
    const totalEl = document.getElementById('tipTotalDisplay');
    const perPersonEl = document.getElementById('tipPerPersonDisplay');
    const copyBtn = document.getElementById('tipCopyBtn');

    if (!billEl || !tipPctEl) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const bill = parseFloat(billEl.value) || 0;
      const pct = parseFloat(tipPctEl.value) || 0;
      const split = Math.max(1, parseInt(splitEl ? splitEl.value : 1, 10) || 1);

      const tipTotal = bill * (pct / 100);
      const grandTotal = bill + tipTotal;
      const perPerson = grandTotal / split;

      if (tipAmtEl) tipAmtEl.textContent = formatCur(tipTotal);
      if (totalEl) totalEl.textContent = formatCur(grandTotal);
      if (perPersonEl) perPersonEl.textContent = formatCur(perPerson);
    }

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const pct = btn.getAttribute('data-pct');
        if (pct) {
          tipPctEl.value = pct;
          calculate();
        }
      });
    });

    [curEl, billEl, tipPctEl, splitEl].forEach(el => {
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Tip Breakdown:\nBill: ${formatCur(parseFloat(billEl.value) || 0)}\nTip (${tipPctEl.value}%): ${tipAmtEl ? tipAmtEl.textContent : ''}\nTotal: ${totalEl ? totalEl.textContent : ''}\nPer Person: ${perPersonEl ? perPersonEl.textContent : ''}`;
        navigator.clipboard.writeText(text).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
