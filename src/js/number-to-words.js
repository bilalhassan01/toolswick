// number-to-words.js - Client-Side Number to Words & Check Currency Formatter
(function () {
  'use strict';

  function init() {
    const numInp = document.getElementById('numWordsInput');
    const curSel = document.getElementById('numWordsCurrency');
    const caseSel = document.getElementById('numWordsCase');
    const wordsDisplay = document.getElementById('numWordsDisplay');
    const checkDisplay = document.getElementById('numWordsCheckDisplay');
    const copyBtn = document.getElementById('numWordsCopyBtn');

    if (!numInp || !wordsDisplay) return;

    const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const SCALES = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    function convertGroup(n) {
      let str = '';
      if (n >= 100) {
        str += ONES[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += TENS[Math.floor(n / 10)] + (n % 10 > 0 ? '-' + ONES[n % 10] : '') + ' ';
      } else if (n > 0) {
        str += ONES[n] + ' ';
      }
      return str.trim();
    }

    function numberToWords(num) {
      if (num === 0) return 'Zero';
      let words = '';
      let scaleIdx = 0;

      while (num > 0 && scaleIdx < SCALES.length) {
        const group = num % 1000;
        if (group > 0) {
          const groupStr = convertGroup(group);
          const scale = SCALES[scaleIdx];
          words = groupStr + (scale ? ' ' + scale : '') + (words ? ' ' + words : '');
        }
        num = Math.floor(num / 1000);
        scaleIdx++;
      }
      return words.trim();
    }

    function convert() {
      const raw = parseFloat(numInp.value) || 0;
      const integerPart = Math.floor(Math.abs(raw));
      const cents = Math.round((Math.abs(raw) - integerPart) * 100);

      let text = numberToWords(integerPart);
      if (raw < 0) text = 'Negative ' + text;

      // Speak the fractional part digit by digit (1250.75 -> "... Fifty Point Seven Five")
      const rawStr = String(numInp.value).trim();
      const decPart = rawStr.includes('.') ? rawStr.split('.')[1].replace(/[^0-9]/g, '') : '';
      if (decPart) {
        const DIGITS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const decWords = decPart.split('').map(d => DIGITS[+d]).join(' ');
        text += ' Point ' + decWords;
      }

      const caseMode = caseSel ? caseSel.value : 'title';
      let formattedWords = text;
      if (caseMode === 'upper') formattedWords = text.toUpperCase();
      else if (caseMode === 'lower') formattedWords = text.toLowerCase();

      wordsDisplay.textContent = formattedWords;

      if (checkDisplay) {
        const cur = curSel ? curSel.value : 'USD';
        let curName = 'Dollars';
        let centName = 'Cents';
        if (cur === 'EUR') { curName = 'Euros'; }
        else if (cur === 'GBP') { curName = 'Pounds'; centName = 'Pence'; }
        else if (cur === 'INR') { curName = 'Rupees'; centName = 'Paise'; }

        checkDisplay.textContent = `${text} ${curName} and ${cents}/100 ${centName} Only`;
      }
    }

    [numInp, curSel, caseSel].forEach(el => {
      if (el) {
        el.addEventListener('input', convert);
        el.addEventListener('change', convert);
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(wordsDisplay.textContent).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }

    if (!numInp.value) numInp.value = "1250.75";
    convert();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
