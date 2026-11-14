// vat-calculator.js - Client-Side Value Added Tax (VAT) Calculator
(function () {
  'use strict';

  function init() {
    const modeAddBtn = document.getElementById('vatModeAdd');
    const modeRemoveBtn = document.getElementById('vatModeRemove');
    const curEl = document.getElementById('vatCur');
    const amountEl = document.getElementById('vatAmountInput');
    const rateEl = document.getElementById('vatRateInput');
    const presetBtns = document.querySelectorAll('.vat-rate-btn');

    const netEl = document.getElementById('vatNetDisplay');
    const taxEl = document.getElementById('vatTaxDisplay');
    const grossEl = document.getElementById('vatGrossDisplay');
    const copyBtn = document.getElementById('vatCopyBtn');

    if (!amountEl || !rateEl) return;

    let mode = 'add'; // 'add' or 'remove'

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const inputAmount = parseFloat(amountEl.value) || 0;
      const rate = parseFloat(rateEl.value) || 0;

      let net = 0;
      let tax = 0;
      let gross = 0;

      if (mode === 'add') {
        net = inputAmount;
        tax = net * (rate / 100);
        gross = net + tax;
      } else {
        gross = inputAmount;
        net = gross / (1 + rate / 100);
        tax = gross - net;
      }

      if (netEl) netEl.textContent = formatCur(net);
      if (taxEl) taxEl.textContent = formatCur(tax);
      if (grossEl) grossEl.textContent = formatCur(gross);
    }

    if (modeAddBtn && modeRemoveBtn) {
      modeAddBtn.addEventListener('click', () => {
        mode = 'add';
        // 'active' alone does nothing for .btn (no .btn.active rule in CSS);
        // the teal look is the base .btn and the inactive look is .btn.ghost,
        // so the ghost class must be toggled too, or the visual never moves.
        modeAddBtn.classList.add('active');
        modeAddBtn.classList.remove('ghost');
        modeRemoveBtn.classList.remove('active');
        modeRemoveBtn.classList.add('ghost');
        calculate();
      });
      modeRemoveBtn.addEventListener('click', () => {
        mode = 'remove';
        modeRemoveBtn.classList.add('active');
        modeRemoveBtn.classList.remove('ghost');
        modeAddBtn.classList.remove('active');
        modeAddBtn.classList.add('ghost');
        calculate();
      });
    }

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const r = btn.getAttribute('data-rate');
        if (r) {
          rateEl.value = r;
          calculate();
        }
      });
    });

    [curEl, amountEl, rateEl].forEach(el => {
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `VAT Breakdown (${mode === 'add' ? 'Added' : 'Extracted'}):\nNet Price: ${netEl ? netEl.textContent : ''}\nVAT (${rateEl.value}%): ${taxEl ? taxEl.textContent : ''}\nGross Total: ${grossEl ? grossEl.textContent : ''}`;
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
