// split-bill.js - Client-Side Split Bill & Group Expense Calculator
(function () {
  'use strict';

  function init() {
    const curEl = document.getElementById('splitCur');
    const billEl = document.getElementById('splitBillInput');
    const tipEl = document.getElementById('splitTipPct');
    const taxEl = document.getElementById('splitTaxPct');
    const peopleEl = document.getElementById('splitPeopleCount');

    const totalBillEl = document.getElementById('splitTotalBill');
    const tipAmtEl = document.getElementById('splitTipAmount');
    const taxAmtEl = document.getElementById('splitTaxAmount');
    const perPersonEl = document.getElementById('splitPerPersonAmount');
    const copyBtn = document.getElementById('splitCopyBtn');

    if (!billEl || !peopleEl) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const bill = parseFloat(billEl.value) || 0;
      const tipPct = parseFloat(tipEl ? tipEl.value : 0) || 0;
      const taxPct = parseFloat(taxEl ? taxEl.value : 0) || 0;
      const people = Math.max(1, parseInt(peopleEl.value, 10) || 1);

      const taxAmount = bill * (taxPct / 100);
      const tipAmount = bill * (tipPct / 100);
      const grandTotal = bill + taxAmount + tipAmount;
      const perPerson = grandTotal / people;

      if (totalBillEl) totalBillEl.textContent = formatCur(grandTotal);
      if (tipAmtEl) tipAmtEl.textContent = formatCur(tipAmount);
      if (taxAmtEl) taxAmtEl.textContent = formatCur(taxAmount);
      if (perPersonEl) perPersonEl.textContent = formatCur(perPerson);
    }

    [curEl, billEl, tipEl, taxEl, peopleEl].forEach(el => {
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Bill Split Summary:\nGrand Total: ${totalBillEl ? totalBillEl.textContent : ''}\nNumber of People: ${peopleEl.value}\nEach Person Pays: ${perPersonEl ? perPersonEl.textContent : ''}`;
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
