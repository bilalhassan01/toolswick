// salary-calculator.js - Pure client-side Salary & Hourly Wage Calculator
(function () {
  'use strict';

  function init() {
    const typeEl = document.getElementById('salType'); // 'hourly' or 'annual'
    const amountEl = document.getElementById('salAmount');
    const hoursEl = document.getElementById('salHours');
    const daysEl = document.getElementById('salDays');
    const weeksEl = document.getElementById('salWeeks');
    const curEl = document.getElementById('salCur');

    // Overtime
    const otHoursEl = document.getElementById('salOtHours');
    const otMultEl = document.getElementById('salOtMult');

    // Results
    const resHourly = document.getElementById('salResHourly');
    const resDaily = document.getElementById('salResDaily');
    const resWeekly = document.getElementById('salResWeekly');
    const resBiweekly = document.getElementById('salResBiweekly');
    const resSemimonthly = document.getElementById('salResSemimonthly');
    const resMonthly = document.getElementById('salResMonthly');
    const resAnnual = document.getElementById('salResAnnual');
    const resOtTotal = document.getElementById('salResOtTotal');
    const resGrandTotal = document.getElementById('salResGrandTotal');
    const copyBtn = document.getElementById('salCopyBtn');

    if (!amountEl || !hoursEl) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const isHourly = typeEl ? typeEl.value === 'hourly' : true;
      const amount = parseFloat(amountEl.value) || 0;
      const hoursPerWeek = parseFloat(hoursEl.value) || 40;
      const daysPerWeek = parseFloat(daysEl ? daysEl.value : 5) || 5;
      const weeksPerYear = parseFloat(weeksEl ? weeksEl.value : 52) || 52;
      const otHours = parseFloat(otHoursEl ? otHoursEl.value : 0) || 0;
      const otMultiplier = parseFloat(otMultEl ? otMultEl.value : 1.5) || 1.5;

      const totalRegularHours = hoursPerWeek * weeksPerYear;
      let hourlyRate = 0;
      let annualBase = 0;

      if (isHourly) {
        hourlyRate = amount;
        annualBase = hourlyRate * totalRegularHours;
      } else {
        annualBase = amount;
        hourlyRate = totalRegularHours > 0 ? annualBase / totalRegularHours : 0;
      }

      const dailyPay = daysPerWeek > 0 ? (hourlyRate * hoursPerWeek) / daysPerWeek : 0;
      const weeklyPay = hourlyRate * hoursPerWeek;
      const biweeklyPay = weeklyPay * 2;
      const annualPay = annualBase;
      const semimonthlyPay = annualPay / 24;
      const monthlyPay = annualPay / 12;

      // Overtime
      const otHourlyRate = hourlyRate * otMultiplier;
      const otAnnual = otHours * otHourlyRate * weeksPerYear;
      const grandTotalAnnual = annualPay + otAnnual;

      if (resHourly) resHourly.textContent = formatCur(hourlyRate);
      if (resDaily) resDaily.textContent = formatCur(dailyPay);
      if (resWeekly) resWeekly.textContent = formatCur(weeklyPay);
      if (resBiweekly) resBiweekly.textContent = formatCur(biweeklyPay);
      if (resSemimonthly) resSemimonthly.textContent = formatCur(semimonthlyPay);
      if (resMonthly) resMonthly.textContent = formatCur(monthlyPay);
      if (resAnnual) resAnnual.textContent = formatCur(annualPay);
      if (resOtTotal) resOtTotal.textContent = formatCur(otAnnual);
      if (resGrandTotal) resGrandTotal.textContent = formatCur(grandTotalAnnual);
    }

    [typeEl, amountEl, hoursEl, daysEl, weeksEl, curEl, otHoursEl, otMultEl].forEach(el => {
      if (el) el.addEventListener('input', calculate);
      if (el) el.addEventListener('change', calculate);
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Salary Breakdown:\nHourly: ${resHourly.textContent}\nWeekly: ${resWeekly.textContent}\nMonthly: ${resMonthly.textContent}\nAnnual: ${resAnnual.textContent}\nWith Overtime: ${resGrandTotal.textContent}`;
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
