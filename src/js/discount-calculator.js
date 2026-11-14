// discount-calculator.js - Pure client-side Discount & Sale Price Calculator
(function () {
  'use strict';

  function init() {
    const curEl = document.getElementById('discCur');
    const priceEl = document.getElementById('discPrice');
    const pctEl = document.getElementById('discPct');
    const taxEl = document.getElementById('discTax');

    const finalPriceEl = document.getElementById('discFinalPrice');
    const savingsEl = document.getElementById('discSavings');
    const taxAmtEl = document.getElementById('discTaxAmt');
    const copyBtn = document.getElementById('discCopyBtn');
    const presetBtns = document.querySelectorAll('.disc-preset-btn');

    if (!priceEl || !pctEl) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      const formatted = (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
      return cur + ' ' + formatted;
    }

    function calculate() {
      const origPrice = parseFloat(priceEl.value) || 0;
      const discountPct = parseFloat(pctEl.value) || 0;
      const taxRate = parseFloat(taxEl ? taxEl.value : 0) || 0;

      const discountAmount = origPrice * (discountPct / 100);
      const discountedSubtotal = Math.max(0, origPrice - discountAmount);
      const taxAmount = discountedSubtotal * (taxRate / 100);
      const finalPrice = discountedSubtotal + taxAmount;

      if (finalPriceEl) finalPriceEl.textContent = formatCur(finalPrice);
      if (savingsEl) savingsEl.textContent = formatCur(discountAmount) + ' (' + discountPct + '%)';
      if (taxAmtEl) taxAmtEl.textContent = formatCur(taxAmount);
    }

    presetBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const pct = btn.getAttribute('data-pct');
        if (pct) {
          pctEl.value = pct;
          calculate();
        }
      });
    });

    [curEl, priceEl, pctEl, taxEl].forEach(el => {
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        const cur = curEl ? curEl.value : '$';
        const origPrice = parseFloat(priceEl.value) || 0;
        const discountPct = parseFloat(pctEl.value) || 0;
        const savingsText = savingsEl ? savingsEl.textContent : '';
        const finalText = finalPriceEl ? finalPriceEl.textContent : '';

        const text = `Discount Calculation:\nOriginal Price: ${cur} ${origPrice.toFixed(2)}\nDiscount: ${discountPct}%\nTotal Savings: ${savingsText}\nFinal Price: ${finalText}`;
        navigator.clipboard.writeText(text).then(function () {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(function () { copyBtn.textContent = old; }, 1500);
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
