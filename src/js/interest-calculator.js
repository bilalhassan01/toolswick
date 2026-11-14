// interest-calculator.js - Pure client-side Simple & Compound Interest Calculator
(function () {
  'use strict';

  function init() {
    const modeEl = document.getElementById('intMode');
    const princEl = document.getElementById('intPrincipal');
    const rateEl = document.getElementById('intRate');
    const yearsEl = document.getElementById('intYears');
    const monthsEl = document.getElementById('intMonths');
    const freqEl = document.getElementById('intFreq');
    const curEl = document.getElementById('intCur');
    const compoundFreqRow = document.getElementById('intFreqRow');

    const totalIntEl = document.getElementById('intTotalInt');
    const finalBalEl = document.getElementById('intFinalBal');
    const apyEl = document.getElementById('intApy');
    const scheduleBody = document.getElementById('intScheduleBody');
    const copyBtn = document.getElementById('intCopyBtn');

    if (!princEl || !rateEl) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const P = parseFloat(princEl.value) || 0;
      const annualRatePct = parseFloat(rateEl.value) || 0;
      const r = annualRatePct / 100;
      const years = parseFloat(yearsEl.value) || 0;
      const months = parseFloat(monthsEl ? monthsEl.value : 0) || 0;
      const t = years + (months / 12);
      const isCompound = modeEl ? modeEl.value === 'compound' : true;
      const n = freqEl ? parseInt(freqEl.value, 10) || 12 : 12;

      if (compoundFreqRow) {
        compoundFreqRow.style.display = isCompound ? '' : 'none';
      }

      let totalInterest = 0;
      let finalBalance = 0;
      let apy = 0;

      if (!isCompound) {
        // Simple Interest
        totalInterest = P * r * t;
        finalBalance = P + totalInterest;
        apy = annualRatePct;
      } else {
        // Compound Interest
        if (n > 0) {
          finalBalance = P * Math.pow(1 + r / n, n * t);
          totalInterest = finalBalance - P;
          // APY = (1 + r/n)^n - 1
          apy = (Math.pow(1 + r / n, n) - 1) * 100;
        } else {
          finalBalance = P;
          totalInterest = 0;
          apy = annualRatePct;
        }
      }

      if (totalIntEl) totalIntEl.textContent = formatCur(totalInterest);
      if (finalBalEl) finalBalEl.textContent = formatCur(finalBalance);
      if (apyEl) apyEl.textContent = apy.toFixed(2) + '%';

      // Year-by-year schedule table
      if (scheduleBody) {
        let html = '';
        const wholeYears = Math.min(Math.ceil(t) || 1, 30);
        let runningP = P;

        for (let yr = 1; yr <= wholeYears; yr++) {
          const yrT = yr;
          let yrBal = 0;
          let yrIntTotal = 0;
          if (!isCompound) {
            yrIntTotal = P * r * yrT;
            yrBal = P + yrIntTotal;
          } else {
            yrBal = P * Math.pow(1 + r / n, n * yrT);
            yrIntTotal = yrBal - P;
          }
          const yrInterestYear = yr === 1 ? yrIntTotal : yrBal - runningP;
          runningP = yrBal;

          html += `<tr>
            <td style="padding:6px 10px;border-bottom:1px solid var(--border,#333);font-size:0.9rem;">Year ${yr}</td>
            <td style="padding:6px 10px;border-bottom:1px solid var(--border,#333);font-size:0.9rem;text-align:right;">${formatCur(yrInterestYear)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid var(--border,#333);font-size:0.9rem;text-align:right;">${formatCur(yrIntTotal)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid var(--border,#333);font-size:0.9rem;text-align:right;font-weight:600;">${formatCur(yrBal)}</td>
          </tr>`;
        }
        scheduleBody.innerHTML = html;
      }
    }

    [modeEl, princEl, rateEl, yearsEl, monthsEl, freqEl, curEl].forEach(el => {
      if (el) el.addEventListener('input', calculate);
      if (el) el.addEventListener('change', calculate);
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Interest Summary:\nPrincipal: ${formatCur(parseFloat(princEl.value) || 0)}\nRate: ${rateEl.value}% (${modeEl.value})\nTerm: ${yearsEl.value} yrs ${monthsEl ? monthsEl.value : 0} mos\nTotal Interest: ${totalIntEl.textContent}\nFinal Balance: ${finalBalEl.textContent}`;
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
