// image-info.js - Pure client-side Image Dimensions & Resolution Inspector
(function () {
  'use strict';

  function gcd(a, b) {
    a = Math.round(Math.abs(a));
    b = Math.round(Math.abs(b));
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  function init() {
    const fileInput = document.getElementById('infoFile');
    const dropZone = document.getElementById('infoDrop');
    const thumbImg = document.getElementById('infoThumb');
    const resultBox = document.getElementById('infoResult');
    const copyBtn = document.getElementById('infoCopyBtn');

    const resDims = document.getElementById('infoDims');
    const resMp = document.getElementById('infoMp');
    const resAspect = document.getElementById('infoAspect');
    const resSize = document.getElementById('infoSize');
    const resType = document.getElementById('infoType');
    const resPrint = document.getElementById('infoPrint');
    const resRam = document.getElementById('infoRam');

    if (!fileInput) return;

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = function () {
        if (thumbImg) thumbImg.src = url;

        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const mp = ((w * h) / 1000000).toFixed(2);

        // Aspect ratio simplification
        const d = gcd(w, h);
        const aspectW = w / d;
        const aspectH = h / d;
        const decAspect = (w / h).toFixed(2);

        // File size
        const sizeKb = (file.size / 1024).toFixed(1);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        const sizeStr = file.size > 1048576 ? `${sizeMb} MB (${file.size.toLocaleString()} bytes)` : `${sizeKb} KB (${file.size.toLocaleString()} bytes)`;

        // Print size at 300 DPI
        const printInW = (w / 300).toFixed(1);
        const printInH = (h / 300).toFixed(1);
        const printCmW = ((w / 300) * 2.54).toFixed(1);
        const printCmH = ((h / 300) * 2.54).toFixed(1);

        // Raw RGBA memory footprint (w * h * 4 bytes)
        const ramMb = ((w * h * 4) / (1024 * 1024)).toFixed(1);

        if (resDims) resDims.textContent = `${w} × ${h} px`;
        if (resMp) resMp.textContent = `${mp} Megapixels (${(w * h).toLocaleString()} pixels)`;
        if (resAspect) resAspect.textContent = `${aspectW}:${aspectH} (${decAspect}:1)`;
        if (resSize) resSize.textContent = sizeStr;
        if (resType) resType.textContent = `${file.type || 'image'} (${file.name})`;
        if (resPrint) resPrint.textContent = `${printInW}" × ${printInH}" (${printCmW} × ${printCmH} cm) @ 300 DPI`;
        if (resRam) resRam.textContent = `~${ramMb} MB uncompressed in RAM`;

        if (resultBox) resultBox.style.display = 'block';
      };
      img.src = url;
    }

    if (fileInput) {
      fileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      });
      dropZone.addEventListener('click', () => fileInput.click());
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `Image Specifications:\nResolution: ${resDims.textContent}\nMegapixels: ${resMp.textContent}\nAspect Ratio: ${resAspect.textContent}\nFile Size: ${resSize.textContent}\nFormat: ${resType.textContent}\nPrint Dimensions: ${resPrint.textContent}`;
        navigator.clipboard.writeText(text).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
