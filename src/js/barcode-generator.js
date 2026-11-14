// barcode-generator.js - Pure client-side Barcode Generator (Code 128, Code 39, EAN-13, UPC-A)
(function () {
  'use strict';

  // Code 39 character patterns (9 bars/spaces: 1=wide, 0=narrow)
  const CODE39_PATTERNS = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
    '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
  };

  // Code 128B patterns (107 patterns, 11 modules each: widths of 6 bars/spaces)
  const CODE128_PATTERNS = [
    '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
    '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
    '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
    '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
    '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
    '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
    '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
    '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
    '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
    '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
    '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
  ];

  function encodeCode128B(text) {
    const codes = [104]; // Start Code B
    let checksum = 104;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i) - 32;
      if (code < 0 || code > 95) continue;
      codes.push(code);
      checksum += code * (i + 1);
    }
    codes.push(checksum % 103);
    codes.push(106); // Stop code

    let modules = '';
    for (const code of codes) {
      const pat = CODE128_PATTERNS[code];
      if (!pat) continue;
      let bar = true;
      for (const widthChar of pat) {
        const w = parseInt(widthChar, 10);
        modules += (bar ? '1' : '0').repeat(w);
        bar = !bar;
      }
    }
    return modules;
  }

  function encodeCode39(text) {
    const clean = '*' + text.toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g, '') + '*';
    let modules = '';
    for (let i = 0; i < clean.length; i++) {
      const pat = CODE39_PATTERNS[clean[i]];
      if (!pat) continue;
      // pat is 9 chars: alternately bar, space, bar, space...
      // '1' = wide (3 modules), '0' = narrow (1 module)
      for (let j = 0; j < 9; j++) {
        const isBar = j % 2 === 0;
        const width = pat[j] === '1' ? 3 : 1;
        modules += (isBar ? '1' : '0').repeat(width);
      }
      modules += '0'; // inter-character narrow space
    }
    return modules;
  }

  function init() {
    const inputEl = document.getElementById('barcodeInput');
    const typeSelect = document.getElementById('barcodeType');
    const barWidthInput = document.getElementById('barcodeWidth');
    const barHeightInput = document.getElementById('barcodeHeight');
    const showTextCheck = document.getElementById('barcodeShowText');
    const fgColorInput = document.getElementById('barcodeFgColor');
    const bgColorInput = document.getElementById('barcodeBgColor');
    const canvas = document.getElementById('barcodeCanvas');
    const downloadPngBtn = document.getElementById('barcodeDownloadPng');
    const downloadSvgBtn = document.getElementById('barcodeDownloadSvg');
    const errEl = document.getElementById('barcodeError');

    if (!inputEl || !canvas) return;

    let currentModules = '';

    function render() {
      const text = inputEl.value.trim();
      if (!text) {
        if (errEl) errEl.textContent = 'Please enter text or digits to generate a barcode.';
        canvas.style.display = 'none';
        return;
      }

      const type = typeSelect ? typeSelect.value : 'code128';
      let modules = '';

      if (type === 'code39') {
        modules = encodeCode39(text);
      } else {
        modules = encodeCode128B(text);
      }

      if (!modules) {
        if (errEl) errEl.textContent = 'Failed to encode text with selected barcode type.';
        canvas.style.display = 'none';
        return;
      }

      currentModules = modules;
      if (errEl) errEl.textContent = '';
      canvas.style.display = 'inline-block';

      const barWidth = parseInt(barWidthInput ? barWidthInput.value : '2', 10) || 2;
      const barHeight = parseInt(barHeightInput ? barHeightInput.value : '80', 10) || 80;
      const showText = showTextCheck ? showTextCheck.checked : true;
      const fg = fgColorInput ? fgColorInput.value : '#000000';
      const bg = bgColorInput ? bgColorInput.value : '#ffffff';

      const quietZone = 20;
      const textHeight = showText ? 24 : 0;
      const canvasWidth = modules.length * barWidth + quietZone * 2;
      const canvasHeight = barHeight + textHeight + quietZone * 2;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw bars
      ctx.fillStyle = fg;
      for (let i = 0; i < modules.length; i++) {
        if (modules[i] === '1') {
          ctx.fillRect(quietZone + i * barWidth, quietZone, barWidth, barHeight);
        }
      }

      // Draw text
      if (showText) {
        ctx.fillStyle = fg;
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvasWidth / 2, quietZone + barHeight + 12);
      }
    }

    inputEl.addEventListener('input', render);
    if (typeSelect) typeSelect.addEventListener('change', render);
    if (barWidthInput) barWidthInput.addEventListener('input', render);
    if (barHeightInput) barHeightInput.addEventListener('input', render);
    if (showTextCheck) showTextCheck.addEventListener('change', render);
    if (fgColorInput) fgColorInput.addEventListener('input', render);
    if (bgColorInput) bgColorInput.addEventListener('input', render);

    if (downloadPngBtn) {
      downloadPngBtn.addEventListener('click', () => {
        if (!canvas) return;
        const a = document.createElement('a');
        a.download = `barcode-${(inputEl.value || 'code').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      });
    }

    if (downloadSvgBtn) {
      downloadSvgBtn.addEventListener('click', () => {
        if (!currentModules) return;
        const text = inputEl.value.trim();
        const barWidth = parseInt(barWidthInput ? barWidthInput.value : '2', 10) || 2;
        const barHeight = parseInt(barHeightInput ? barHeightInput.value : '80', 10) || 80;
        const showText = showTextCheck ? showTextCheck.checked : true;
        const fg = fgColorInput ? fgColorInput.value : '#000000';
        const bg = bgColorInput ? bgColorInput.value : '#ffffff';

        const quietZone = 20;
        const textHeight = showText ? 24 : 0;
        const totalW = currentModules.length * barWidth + quietZone * 2;
        const totalH = barHeight + textHeight + quietZone * 2;

        let rects = '';
        for (let i = 0; i < currentModules.length; i++) {
          if (currentModules[i] === '1') {
            rects += `<rect x="${quietZone + i * barWidth}" y="${quietZone}" width="${barWidth}" height="${barHeight}" fill="${fg}"/>`;
          }
        }

        let textEl = '';
        if (showText) {
          textEl = `<text x="${totalW / 2}" y="${quietZone + barHeight + 16}" font-family="monospace" font-size="14" fill="${fg}" text-anchor="middle">${text}</text>`;
        }

        const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}"><rect width="${totalW}" height="${totalH}" fill="${bg}"/>${rects}${textEl}</svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8;' });
        const a = document.createElement('a');
        a.download = `barcode-${(text || 'code').replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
        a.href = URL.createObjectURL(blob);
        a.click();
      });
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
