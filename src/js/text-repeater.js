// text-repeater.js - Client-Side Multi-Line Text Multiplier & Repeater
(function () {
  'use strict';

  function init() {
    const textInp = document.getElementById('repTextInput');
    const countInp = document.getElementById('repCountInput');
    const sepSel = document.getElementById('repSeparator');
    const repeatBtn = document.getElementById('repRepeatBtn');
    const outputEl = document.getElementById('repOutput');
    const copyBtn = document.getElementById('repCopyBtn');
    const clearBtn = document.getElementById('repClearBtn');

    if (!textInp || !outputEl) return;

    function runRepeat() {
      const text = textInp.value;
      const count = Math.max(1, Math.min(10000, parseInt(countInp ? countInp.value : 10, 10) || 10));
      const sepType = sepSel ? sepSel.value : 'newline';

      let sep = '\n';
      if (sepType === 'space') sep = ' ';
      else if (sepType === 'comma') sep = ', ';
      else if (sepType === 'none') sep = '';

      const repeated = Array(count).fill(text).join(sep);
      outputEl.value = repeated;
    }

    if (repeatBtn) repeatBtn.addEventListener('click', runRepeat);
    [textInp, countInp, sepSel].forEach(el => {
      if (el) el.addEventListener('input', runRepeat);
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!outputEl.value) return;
        navigator.clipboard.writeText(outputEl.value).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        textInp.value = '';
        outputEl.value = '';
      });
    }

    if (!textInp.value) {
      textInp.value = "Hello World!";
      runRepeat();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
