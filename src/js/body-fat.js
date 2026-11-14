// body-fat.js - Client-Side US Navy Body Fat Calculator & Lean Body Mass
(function () {
  'use strict';

  function init() {
    const genderSel = document.getElementById('bfGender');
    const unitSel = document.getElementById('bfUnit');
    const heightInp = document.getElementById('bfHeight');
    const weightInp = document.getElementById('bfWeight');
    const neckInp = document.getElementById('bfNeck');
    const waistInp = document.getElementById('bfWaist');
    const hipInp = document.getElementById('bfHip');
    const hipRow = document.getElementById('bfHipRow');
    const weightUnitLabel = document.getElementById('bfWeightUnitLabel');

    const resultBfEl = document.getElementById('bfResultPct');
    const categoryEl = document.getElementById('bfCategoryDisplay');
    const leanMassEl = document.getElementById('bfLeanMassDisplay');

    if (!heightInp || !neckInp || !waistInp) return;

    function getCategory(pct, isMale) {
      if (isMale) {
        if (pct < 6) return 'Essential Fat';
        if (pct < 14) return 'Athletes';
        if (pct < 18) return 'Fitness';
        if (pct < 25) return 'Average';
        return 'Obese';
      } else {
        if (pct < 14) return 'Essential Fat';
        if (pct < 21) return 'Athletes';
        if (pct < 25) return 'Fitness';
        if (pct < 32) return 'Average';
        return 'Obese';
      }
    }

    function calculate() {
      const isMale = genderSel ? genderSel.value === 'male' : true;
      const isMetric = unitSel ? unitSel.value === 'metric' : true;

      if (weightUnitLabel) weightUnitLabel.textContent = isMetric ? 'kg' : 'lbs';
      if (hipRow) hipRow.style.display = isMale ? 'none' : 'block';

      let h = parseFloat(heightInp.value) || (isMetric ? 175 : 69);
      let wt = parseFloat(weightInp ? weightInp.value : (isMetric ? 75 : 165)) || (isMetric ? 75 : 165);
      let n = parseFloat(neckInp.value) || (isMetric ? 40 : 16);
      let w = parseFloat(waistInp.value) || (isMetric ? 85 : 34);
      let hp = parseFloat(hipInp ? hipInp.value : (isMetric ? 95 : 38)) || (isMetric ? 95 : 38);

      // Convert inches to cm if imperial for formula
      let cmH = isMetric ? h : h * 2.54;
      let cmN = isMetric ? n : n * 2.54;
      let cmW = isMetric ? w : w * 2.54;
      let cmHp = isMetric ? hp : hp * 2.54;

      let bf = 0;
      // US Navy Body Fat Formula (cm measurements):
      // Men: 495 / (1.0324 - 0.19077 × log10(waist - neck) + 0.15456 × log10(height)) - 450
      // Women: 495 / (1.29579 - 0.35004 × log10(waist + hip - neck) + 0.22100 × log10(height)) - 450
      if (isMale) {
        const diff = Math.max(1, cmW - cmN);
        bf = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(cmH)) - 450;
      } else {
        const sum = Math.max(1, cmW + cmHp - cmN);
        bf = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.221 * Math.log10(cmH)) - 450;
      }

      bf = Math.max(2, Math.min(60, bf));
      const category = getCategory(bf, isMale);

      // Lean Body Mass calculation: Total Weight * (1 - (BF / 100))
      const leanMass = wt * (1 - (bf / 100));

      if (resultBfEl) resultBfEl.textContent = `${bf.toFixed(1)}%`;
      if (categoryEl) categoryEl.textContent = `Classification: ${category}`;
      if (leanMassEl) leanMassEl.textContent = `${leanMass.toFixed(1)} kg (${(100 - bf).toFixed(1)}% lean)`;
    }

    [genderSel, unitSel, heightInp, weightInp, neckInp, waistInp, hipInp].forEach(el => {
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
