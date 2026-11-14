// investment-calculator.js - Client-Side Investment & Compound Growth Calculator
(function () {
  'use strict';

  function init() {
    const curEl = document.getElementById('invtCur');
    const initInp = document.getElementById('invtInitAmount');
    const monthlyInp = document.getElementById('invtMonthlyContrib');
    const rateInp = document.getElementById('invtAnnualRate');
    const yearsInp = document.getElementById('invtYears');

    const totalDisplay = document.getElementById('invtTotalDisplay');
    const totalContributedEl = document.getElementById('invtTotalContributed');
    const totalInterestEl = document.getElementById('invtTotalInterest');
    const copyBtn = document.getElementById('invtCopyBtn');

    if (!initInp || !rateInp || !yearsInp) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const initial = parseFloat(initInp.value) || 0;
      const monthly = parseFloat(monthlyInp ? monthlyInp.value : 0) || 0;
      const rate = (parseFloat(rateInp.value) || 0) / 100;
      const years = parseFloat(yearsInp.value) || 10;

      const monthlyRate = rate / 12;
      const totalMonths = Math.round(years * 12);

      let balance = initial;
      let totalContributions = initial;

      for (let m = 0; m < totalMonths; m++) {
        balance += balance * monthlyRate;
        balance += monthly;
        totalContributions += monthly;
      }

      const totalInterest = Math.max(0, balance - totalContributions);

      if (totalDisplay) totalDisplay.textContent = formatCur(balance);
      if (totalContributedEl) totalContributedEl.textContent = formatCur(totalContributions);
      if (totalInterestEl) totalInterestEl.textContent = formatCur(totalInterest);
    }

    [curEl, initInp, monthlyInp, rateInp, yearsInp].forEach(el => {
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Investment Forecast:\nTotal Value: ${totalDisplay ? totalDisplay.textContent : ''}\nTotal Contributions: ${totalContributedEl ? totalContributedEl.textContent : ''}\nTotal Growth / Interest: ${totalInterestEl ? totalInterestEl.textContent : ''}`;
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
