// retirement-calculator.js - Client-Side Retirement Savings & Pension Goal Calculator
(function () {
  'use strict';

  function init() {
    const curEl = document.getElementById('retCur');
    const ageInp = document.getElementById('retCurrentAge');
    const retAgeInp = document.getElementById('retRetireAge');
    const savingsInp = document.getElementById('retCurrentSavings');
    const monthlyInp = document.getElementById('retMonthlySavings');
    const returnInp = document.getElementById('retReturnRate');

    const totalNestEggEl = document.getElementById('retNestEggDisplay');
    const monthlyIncomeEl = document.getElementById('retMonthlyIncomeDisplay');

    if (!ageInp || !retAgeInp || !savingsInp) return;

    // Create disclosure element if not present
    let noticeEl = document.getElementById('retDefaultNotice');
    if (!noticeEl && totalNestEggEl && totalNestEggEl.parentNode) {
      noticeEl = document.createElement('div');
      noticeEl.id = 'retDefaultNotice';
      noticeEl.style.cssText = 'font-size:0.8rem;color:var(--muted);margin-top:4px;font-style:italic;';
      totalNestEggEl.parentNode.appendChild(noticeEl);
    }

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0');
    }

    function calculate() {
      const currentAge = parseFloat(ageInp.value) || 30;
      const retireAge = parseFloat(retAgeInp.value) || 65;
      const initial = parseFloat(savingsInp.value) || 0;
      const monthly = parseFloat(monthlyInp ? monthlyInp.value : 0) || 0;

      // Handle blank return field vs explicit 0% vs explicit non-zero
      const isBlank = !returnInp || returnInp.value.trim() === '';
      const rawRate = isBlank ? 7 : (parseFloat(returnInp.value) || 0);
      const rate = rawRate / 100;

      if (noticeEl) {
        if (isBlank) {
          noticeEl.textContent = '(using default 7% return)';
          noticeEl.style.display = 'block';
        } else {
          noticeEl.textContent = '';
          noticeEl.style.display = 'none';
        }
      }

      const years = Math.max(1, retireAge - currentAge);
      const totalMonths = years * 12;
      const monthlyRate = rate / 12;

      let balance = initial;
      if (monthlyRate === 0) {
        // Explicit zero return: simple summation (,000 for 30yr /mo)
        balance = initial + (monthly * totalMonths);
      } else {
        for (let m = 0; m < totalMonths; m++) {
          balance += balance * monthlyRate;
          balance += monthly;
        }
      }

      // Safe 4% annual withdrawal rule for monthly income
      const annualWithdrawal = balance * 0.04;
      const monthlyIncome = annualWithdrawal / 12;

      if (totalNestEggEl) totalNestEggEl.textContent = formatCur(balance);
      if (monthlyIncomeEl) monthlyIncomeEl.textContent = `${formatCur(monthlyIncome)} / month (4% Rule)`;
    }

    [curEl, ageInp, retAgeInp, savingsInp, monthlyInp, returnInp].forEach(el => {
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
