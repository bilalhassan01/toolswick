// statistics-calculator.js - Client-Side Descriptive Statistics Calculator (Sample vs Population & Quartiles)
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('statInput');
    const calcBtn = document.getElementById('statCalcBtn');
    const clearBtn = document.getElementById('statClearBtn');

    const countEl = document.getElementById('statCount');
    const sumEl = document.getElementById('statSum');
    const meanEl = document.getElementById('statMean');
    const medianEl = document.getElementById('statMedian');
    const modeEl = document.getElementById('statMode');
    const stdDevEl = document.getElementById('statStdDev');
    const varianceEl = document.getElementById('statVariance');
    const popStdDevEl = document.getElementById('statPopStdDev');
    const popVarianceEl = document.getElementById('statPopVariance');
    const minEl = document.getElementById('statMin');
    const maxEl = document.getElementById('statMax');
    const rangeEl = document.getElementById('statRange');
    const q1El = document.getElementById('statQ1');
    const q3El = document.getElementById('statQ3');
    const iqrEl = document.getElementById('statIqr');

    if (!input) return;

    function parseNumbers() {
      return input.value
        .split(/[\s,;\n]+/)
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n));
    }

    function calculate() {
      const numbers = parseNumbers();
      if (numbers.length === 0) {
        [countEl, sumEl, meanEl, medianEl, modeEl, stdDevEl, varianceEl, popStdDevEl, popVarianceEl, minEl, maxEl, rangeEl, q1El, q3El, iqrEl].forEach(el => {
          if (el) el.textContent = '--';
        });
        return;
      }

      numbers.sort((a, b) => a - b);
      const n = numbers.length;
      const sum = numbers.reduce((a, b) => a + b, 0);
      const mean = sum / n;

      // Median
      let median = 0;
      if (n % 2 === 0) {
        median = (numbers[n / 2 - 1] + numbers[n / 2]) / 2;
      } else {
        median = numbers[Math.floor(n / 2)];
      }

      // Mode
      const counts = {};
      let maxFreq = 0;
      numbers.forEach(num => {
        counts[num] = (counts[num] || 0) + 1;
        if (counts[num] > maxFreq) maxFreq = counts[num];
      });
      const modes = Object.keys(counts).filter(k => counts[k] === maxFreq && maxFreq > 1);
      const modeStr = modes.length > 0 ? modes.join(', ') : 'None (All distinct)';

      // Variance & Std Dev:
      // Population variance divides by n
      // Sample variance divides by n - 1
      let sumSqDiff = 0;
      for (let i = 0; i < n; i++) {
        sumSqDiff += Math.pow(numbers[i] - mean, 2);
      }
      const sampleVariance = n > 1 ? sumSqDiff / (n - 1) : 0;
      const sampleStdDev = Math.sqrt(sampleVariance);

      const popVariance = sumSqDiff / n;
      const popStdDev = Math.sqrt(popVariance);

      const min = numbers[0];
      const max = numbers[n - 1];
      const range = max - min;

      function getPercentile(arr, p) {
        if (arr.length === 1) return arr[0];
        const idx = (arr.length - 1) * p;
        const low = Math.floor(idx);
        const high = Math.ceil(idx);
        const weight = idx - low;
        return arr[low] * (1 - weight) + arr[high] * weight;
      }
      const q1 = getPercentile(numbers, 0.25);
      const q3 = getPercentile(numbers, 0.75);
      const iqr = q3 - q1;

      if (countEl) countEl.textContent = n;
      if (sumEl) sumEl.textContent = sum.toFixed(2);
      if (meanEl) meanEl.textContent = mean.toFixed(4);
      if (medianEl) medianEl.textContent = median.toFixed(4);
      if (modeEl) modeEl.textContent = modeStr;
      if (stdDevEl) stdDevEl.textContent = sampleStdDev.toFixed(4);
      if (varianceEl) varianceEl.textContent = sampleVariance.toFixed(4);
      if (popStdDevEl) popStdDevEl.textContent = popStdDev.toFixed(4);
      if (popVarianceEl) popVarianceEl.textContent = popVariance.toFixed(4);
      if (minEl) minEl.textContent = min;
      if (maxEl) maxEl.textContent = max;
      if (rangeEl) rangeEl.textContent = range.toFixed(2);
      if (q1El) q1El.textContent = q1.toFixed(2);
      if (q3El) q3El.textContent = q3.toFixed(2);
      if (iqrEl) iqrEl.textContent = iqr.toFixed(2);
    }

    input.addEventListener('input', calculate);
    if (calcBtn) calcBtn.addEventListener('click', calculate);
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        calculate();
      });
    }

    if (!input.value) {
      input.value = "12, 15, 23, 23, 34, 45, 56, 67, 78, 89, 90";
    }
    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
