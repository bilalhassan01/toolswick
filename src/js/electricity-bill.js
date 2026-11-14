// electricity-bill.js - Client-Side Electricity Consumption & Power Bill Calculator
(function () {
  'use strict';

  function init() {
    const curEl = document.getElementById('elecCur');
    const wattsInp = document.getElementById('elecWatts');
    const hoursInp = document.getElementById('elecHoursPerDay');
    const rateInp = document.getElementById('elecRatePerKwh');

    const dailyKwhEl = document.getElementById('elecDailyKwh');
    const monthlyKwhEl = document.getElementById('elecMonthlyKwh');
    const dailyCostEl = document.getElementById('elecDailyCost');
    const monthlyCostEl = document.getElementById('elecMonthlyCost');
    const yearlyCostEl = document.getElementById('elecYearlyCost');

    if (!wattsInp || !hoursInp || !rateInp) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const watts = parseFloat(wattsInp.value) || 0;
      const hours = parseFloat(hoursInp.value) || 0;
      const rate = parseFloat(rateInp.value) || 0.15; // $/kWh

      const dailyKwh = (watts * hours) / 1000;
      const monthlyKwh = dailyKwh * 30;
      const yearlyKwh = dailyKwh * 365;

      const dailyCost = dailyKwh * rate;
      const monthlyCost = monthlyKwh * rate;
      const yearlyCost = yearlyKwh * rate;

      if (dailyKwhEl) dailyKwhEl.textContent = `${dailyKwh.toFixed(2)} kWh`;
      if (monthlyKwhEl) monthlyKwhEl.textContent = `${monthlyKwh.toFixed(1)} kWh`;
      if (dailyCostEl) dailyCostEl.textContent = formatCur(dailyCost);
      if (monthlyCostEl) monthlyCostEl.textContent = formatCur(monthlyCost);
      if (yearlyCostEl) yearlyCostEl.textContent = formatCur(yearlyCost);
    }

    [curEl, wattsInp, hoursInp, rateInp].forEach(el => {
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
