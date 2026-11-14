// tax-calculator.js - Pure client-side VAT & Sales Tax Calculator
(function () {
  'use strict';

  function init() {
    const modeAdd = document.getElementById('taxModeAdd');
    const modeRemove = document.getElementById('taxModeRemove');
    const amountIn = document.getElementById('taxAmount');
    const rateIn = document.getElementById('taxRate');
    const curIn = document.getElementById('taxCur');
    const netEl = document.getElementById('taxNetRes');
    const taxEl = document.getElementById('taxTaxRes');
    const grossEl = document.getElementById('taxGrossRes');
    const ratePresetBtns = document.querySelectorAll('.tax-preset-btn');
    const copyBtn = document.getElementById('taxCopyBtn');
    const netRowLabel = document.getElementById('taxNetLabel');
    const grossRowLabel = document.getElementById('taxGrossLabel');

    if (!amountIn || !rateIn) return;

    function formatCur(val) {
      const cur = curIn ? curIn.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const amount = parseFloat(amountIn.value) || 0;
      const rate = parseFloat(rateIn.value) || 0;
      const isAdd = modeAdd ? modeAdd.checked : true;

      let net = 0;
      let tax = 0;
      let gross = 0;

      if (isAdd) {
        // Amount is Net (excluding tax)
        net = amount;
        tax = amount * (rate / 100);
        gross = net + tax;
        if (netRowLabel) netRowLabel.textContent = 'Net Amount (Excl. Tax)';
        if (grossRowLabel) grossRowLabel.textContent = 'Gross Amount (Incl. Tax)';
      } else {
        // Amount is Gross (including tax)
        gross = amount;
        net = amount / (1 + rate / 100);
        tax = gross - net;
        if (netRowLabel) netRowLabel.textContent = 'Net Amount (Before Tax)';
        if (grossRowLabel) grossRowLabel.textContent = 'Original Gross (Incl. Tax)';
      }

      if (netEl) netEl.textContent = formatCur(net);
      if (taxEl) taxEl.textContent = formatCur(tax);
      if (grossEl) grossEl.textContent = formatCur(gross);
    }

    if (modeAdd) modeAdd.addEventListener('change', calculate);
    if (modeRemove) modeRemove.addEventListener('change', calculate);
    amountIn.addEventListener('input', calculate);
    rateIn.addEventListener('input', calculate);
    if (curIn) curIn.addEventListener('change', calculate);

    ratePresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        rateIn.value = btn.getAttribute('data-rate');
        calculate();
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Tax Calculation:\nNet: ${netEl.textContent}\nTax (${rateIn.value}%): ${taxEl.textContent}\nGross: ${grossEl.textContent}`;
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
