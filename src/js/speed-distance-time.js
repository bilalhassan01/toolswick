// speed-distance-time.js - Client-Side Speed, Distance, and Travel Time Calculator
(function () {
  'use strict';

  function init() {
    const solveSel = document.getElementById('sdtSolveFor');
    const speedInp = document.getElementById('sdtSpeed');
    const distInp = document.getElementById('sdtDistance');
    const timeInp = document.getElementById('sdtTime');

    const resultValEl = document.getElementById('sdtResultValue');
    const formulaEl = document.getElementById('sdtFormulaDisplay');

    if (!solveSel || !resultValEl) return;

    function calculate() {
      const solve = solveSel.value; // 'speed', 'distance', 'time'
      const speed = parseFloat(speedInp ? speedInp.value : 0) || 0;
      const dist = parseFloat(distInp ? distInp.value : 0) || 0;
      const time = parseFloat(timeInp ? timeInp.value : 0) || 0;

      if (solve === 'speed') {
        if (speedInp) speedInp.disabled = true;
        if (distInp) distInp.disabled = false;
        if (timeInp) timeInp.disabled = false;

        if (time <= 0) {
          resultValEl.textContent = 'Time must be > 0';
          return;
        }
        const s = dist / time;
        const sMph = s * 0.621371;
        resultValEl.textContent = `${s.toFixed(2)} km/h (${sMph.toFixed(2)} mph)`;
        if (formulaEl) formulaEl.textContent = `Speed = Distance ÷ Time = ${dist} ÷ ${time}`;
      } else if (solve === 'distance') {
        if (speedInp) speedInp.disabled = false;
        if (distInp) distInp.disabled = true;
        if (timeInp) timeInp.disabled = false;

        const d = speed * time;
        const dMiles = d * 0.621371;
        resultValEl.textContent = `${d.toFixed(2)} km (${dMiles.toFixed(2)} miles)`;
        if (formulaEl) formulaEl.textContent = `Distance = Speed × Time = ${speed} × ${time}`;
      } else if (solve === 'time') {
        if (speedInp) speedInp.disabled = false;
        if (distInp) distInp.disabled = false;
        if (timeInp) timeInp.disabled = true;

        if (speed <= 0) {
          resultValEl.textContent = 'Speed must be > 0';
          return;
        }
        const t = dist / speed;
        const hours = Math.floor(t);
        const mins = Math.round((t - hours) * 60);
        resultValEl.textContent = `${hours}h ${mins}m (${t.toFixed(2)} hours)`;
        if (formulaEl) formulaEl.textContent = `Time = Distance ÷ Speed = ${dist} ÷ ${speed}`;
      }
    }

    solveSel.addEventListener('change', calculate);
    [speedInp, distInp, timeInp].forEach(el => {
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
