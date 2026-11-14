// fuel-calculator.js - Pure client-side Fuel Cost & Economy Calculator
(function () {
  'use strict';

  function init() {
    const unitEl = document.getElementById('fuelUnit'); // 'metric' or 'imperial'
    const distEl = document.getElementById('fuelDist');
    const econEl = document.getElementById('fuelEcon');
    const priceEl = document.getElementById('fuelPrice');
    const passEl = document.getElementById('fuelPass');
    const curEl = document.getElementById('fuelCur');

    const distUnitLabel = document.getElementById('fuelDistUnit');
    const econLabel = document.getElementById('fuelEconLabel');
    const priceUnitLabel = document.getElementById('fuelPriceUnit');

    const totalFuelEl = document.getElementById('fuelTotalFuel');
    const totalCostEl = document.getElementById('fuelTotalCost');
    const costPassEl = document.getElementById('fuelCostPass');
    const costDistEl = document.getElementById('fuelCostDist');
    const equivEconEl = document.getElementById('fuelEquivEcon');
    const copyBtn = document.getElementById('fuelCopyBtn');

    if (!distEl || !econEl || !priceEl) return;

    function formatCur(val) {
      const cur = curEl ? curEl.value : '$';
      return cur + ' ' + (Number.isFinite(val) ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');
    }

    function calculate() {
      const isMetric = unitEl ? unitEl.value === 'metric' : true;
      const distance = parseFloat(distEl.value) || 0;
      const econ = parseFloat(econEl.value) || 0;
      const price = parseFloat(priceEl.value) || 0;
      const pass = Math.max(1, parseInt(passEl.value, 10) || 1);

      // Labels update
      if (distUnitLabel) distUnitLabel.textContent = isMetric ? 'km' : 'miles';
      if (econLabel) econLabel.textContent = isMetric ? 'Fuel Economy (L/100km)' : 'Fuel Economy (MPG)';
      if (priceUnitLabel) priceUnitLabel.textContent = isMetric ? 'Price per Liter' : 'Price per Gallon';

      let fuelNeeded = 0;
      let totalCost = 0;
      let costPerDist = 0;
      let equiv = '';

      if (isMetric) {
        // L/100km
        // fuel (liters) = (distance / 100) * econ
        if (econ > 0) {
          fuelNeeded = (distance / 100) * econ;
          // Equivalent MPG (US) = 235.215 / (L/100km)
          equiv = (235.215 / econ).toFixed(1) + ' MPG (US)';
        }
      } else {
        // MPG
        // fuel (gallons) = distance / econ
        if (econ > 0) {
          fuelNeeded = distance / econ;
          // Equivalent L/100km = 235.215 / MPG
          equiv = (235.215 / econ).toFixed(1) + ' L/100km';
        }
      }

      totalCost = fuelNeeded * price;
      const costPerPass = totalCost / pass;
      if (distance > 0) {
        costPerDist = totalCost / distance;
      }

      const fuelUnitStr = isMetric ? ' Liters' : ' Gallons';
      const distUnitStr = isMetric ? '/km' : '/mi';

      if (totalFuelEl) totalFuelEl.textContent = fuelNeeded.toFixed(2) + fuelUnitStr;
      if (totalCostEl) totalCostEl.textContent = formatCur(totalCost);
      if (costPassEl) costPassEl.textContent = formatCur(costPerPass);
      if (costDistEl) costDistEl.textContent = formatCur(costPerDist) + ' ' + distUnitStr;
      if (equivEconEl) equivEconEl.textContent = equiv || '-';
    }

    [unitEl, distEl, econEl, priceEl, passEl, curEl].forEach(el => {
      if (el) el.addEventListener('input', calculate);
      if (el) el.addEventListener('change', calculate);
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Trip Fuel Summary:\nDistance: ${distEl.value} ${distUnitLabel.textContent}\nFuel Needed: ${totalFuelEl.textContent}\nTotal Cost: ${totalCostEl.textContent}\nCost per Passenger: ${costPassEl.textContent}`;
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
