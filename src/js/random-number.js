// random-number.js - Client-Side Cryptographically Secure Random Number Generator
(function () {
  'use strict';

  function init() {
    const minInp = document.getElementById('rngMinInput');
    const maxInp = document.getElementById('rngMaxInput');
    const countInp = document.getElementById('rngCountInput');
    const uniqueCheck = document.getElementById('rngUniqueCheck');
    const sortSel = document.getElementById('rngSortSelect');
    const generateBtn = document.getElementById('rngGenerateBtn');
    const resultsGrid = document.getElementById('rngResultsGrid');
    const copyBtn = document.getElementById('rngCopyBtn');

    if (!minInp || !maxInp || !generateBtn) return;

    function getCryptoRandomInt(min, max) {
      const range = max - min + 1;
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return min + (array[0] % range);
    }

    function generate() {
      const min = isNaN(parseInt(minInp.value, 10)) ? 1 : parseInt(minInp.value, 10);
      const max = isNaN(parseInt(maxInp.value, 10)) ? 100 : parseInt(maxInp.value, 10);
      let count = Math.max(1, parseInt(countInp ? countInp.value : 1, 10) || 1);
      const isUnique = uniqueCheck && uniqueCheck.checked;
      const sort = sortSel ? sortSel.value : 'none';

      if (min >= max) {
        if (resultsGrid) resultsGrid.innerHTML = '<p style="color:#ef4444;">Min value must be less than Max value.</p>';
        return;
      }

      if (isUnique && count > (max - min + 1)) {
        count = max - min + 1;
        if (countInp) countInp.value = count;
      }

      const results = [];
      const set = new Set();

      while (results.length < count) {
        const num = getCryptoRandomInt(min, max);
        if (isUnique) {
          if (!set.has(num)) {
            set.add(num);
            results.push(num);
          }
        } else {
          results.push(num);
        }
      }

      if (sort === 'asc') results.sort((a, b) => a - b);
      else if (sort === 'desc') results.sort((a, b) => b - a);

      if (resultsGrid) {
        resultsGrid.innerHTML = results.map(n =>
          `<div style="display:inline-flex;align-items:center;justify-content:center;min-width:48px;height:48px;padding:8px 14px;background:var(--surface,#222);border:1px solid var(--border,#333);border-radius:8px;font-size:1.4rem;font-weight:700;color:#10b981;margin:4px;">${n}</div>`
        ).join('');
      }

      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(results.join(', ')).then(() => {
            const old = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => (copyBtn.textContent = old), 1500);
          });
        };
      }
    }

    generateBtn.addEventListener('click', generate);
    generate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
