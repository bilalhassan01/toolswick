// mortgage-calculator.js - Pure client-side Mortgage & Loan Amortization Calculator
(function () {
  'use strict';

  function init() {
    const priceEl = document.getElementById('mortPrice');
    const downEl = document.getElementById('mortDown');
    const downTypeEl = document.getElementById('mortDownType'); // '$' or '%'
    const termEl = document.getElementById('mortTerm'); // years
    const rateEl = document.getElementById('mortRate'); // annual interest %
    const taxEl = document.getElementById('mortTax'); // annual property tax
    const insEl = document.getElementById('mortIns'); // annual insurance
    const hoaEl = document.getElementById('mortHoa'); // monthly HOA
    const curEl = document.getElementById('mortCur');

    const monthlyPIEl = document.getElementById('mortMonthlyPI');
    const monthlyTotalEl = document.getElementById('mortMonthlyTotal');
    const loanAmountEl = document.getElementById('mortLoanAmount');
    const totalIntEl = document.getElementById('mortTotalInt');
    const totalCostEl = document.getElementById('mortTotalCost');
    const amortBody = document.getElementById('mortAmortBody');
    const copyBtn = document.getElementById('mortCopyBtn');

    if (!priceEl || !rateEl || !termEl) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const price = parseFloat(priceEl.value) || 0;
      const downVal = parseFloat(downEl.value) || 0;
      const isDownPct = downTypeEl ? downTypeEl.value === '%' : false;

      let downAmount = isDownPct ? price * (downVal / 100) : downVal;
      if (downAmount > price) downAmount = price;

      const principal = Math.max(0, price - downAmount);
      const termYears = parseFloat(termEl.value) || 30;
      const annualRate = parseFloat(rateEl.value) || 0;
      const monthlyRate = annualRate / 100 / 12;
      const totalPayments = termYears * 12;

      let monthlyPI = 0;
      if (monthlyRate > 0 && totalPayments > 0) {
        monthlyPI = (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
      } else if (totalPayments > 0) {
        monthlyPI = principal / totalPayments;
      }

      const annualTax = parseFloat(taxEl ? taxEl.value : 0) || 0;
      const annualIns = parseFloat(insEl ? insEl.value : 0) || 0;
      const monthlyHoa = parseFloat(hoaEl ? hoaEl.value : 0) || 0;

      const monthlyTax = annualTax / 12;
      const monthlyIns = annualIns / 12;
      const monthlyTotal = monthlyPI + monthlyTax + monthlyIns + monthlyHoa;

      const totalRepaidPI = monthlyPI * totalPayments;
      const totalInterest = Math.max(0, totalRepaidPI - principal);
      const totalCostOverall = totalRepaidPI + (annualTax * termYears) + (annualIns * termYears) + (monthlyHoa * totalPayments);

      if (monthlyPIEl) monthlyPIEl.textContent = formatCur(monthlyPI);
      if (monthlyTotalEl) monthlyTotalEl.textContent = formatCur(monthlyTotal);
      if (loanAmountEl) loanAmountEl.textContent = formatCur(principal);
      if (totalIntEl) totalIntEl.textContent = formatCur(totalInterest);
      if (totalCostEl) totalCostEl.textContent = formatCur(totalCostOverall);

      // Amortization Schedule (Yearly summary)
      if (amortBody) {
        let html = '';
        let balance = principal;
        const yearsToShow = Math.min(termYears, 30);

        for (let yr = 1; yr <= yearsToShow; yr++) {
          let yrInterest = 0;
          let yrPrincipal = 0;

          for (let m = 0; m < 12; m++) {
            if (balance <= 0) break;
            const intMonth = balance * monthlyRate;
            let princMonth = monthlyPI - intMonth;
            if (princMonth > balance) princMonth = balance;
            yrInterest += intMonth;
            yrPrincipal += princMonth;
            balance -= princMonth;
          }

          html += `<tr>
            <td style="padding:6px 10px;border-bottom:1px solid var(--border,#333);font-size:0.9rem;">Year ${yr}</td>
            <td style="padding:6px 10px;border-bottom:1px solid var(--border,#333);font-size:0.9rem;text-align:right;">${formatCur(yrPrincipal)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid var(--border,#333);font-size:0.9rem;text-align:right;">${formatCur(yrInterest)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid var(--border,#333);font-size:0.9rem;text-align:right;font-weight:600;">${formatCur(balance)}</td>
          </tr>`;
        }
        amortBody.innerHTML = html;
      }
    }

    [priceEl, downEl, downTypeEl, termEl, rateEl, taxEl, insEl, hoaEl, curEl].forEach(el => {
      if (el) el.addEventListener('input', calculate);
      if (el) el.addEventListener('change', calculate);
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Mortgage Calculation:\nHome Price: ${formatCur(parseFloat(priceEl.value) || 0)}\nLoan Amount: ${loanAmountEl.textContent}\nMonthly P&I: ${monthlyPIEl.textContent}\nTotal Monthly: ${monthlyTotalEl.textContent}\nTotal Interest: ${totalIntEl.textContent}`;
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
