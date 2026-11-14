// image-effects.js - Pure client-side Image Effects & Filter Studio
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('effFile');
    const dropZone = document.getElementById('effDrop');
    const canvas = document.getElementById('effCanvas');
    const workspace = document.getElementById('effWorkspace');

    const borderInput = document.getElementById('effBorder');
    const borderVal = document.getElementById('effBorderVal');
    const borderColor = document.getElementById('effBorderColor');
    const radiusInput = document.getElementById('effRadius');
    const radiusVal = document.getElementById('effRadiusVal');
    const grayInput = document.getElementById('effGray');
    const grayVal = document.getElementById('effGrayVal');
    const brightInput = document.getElementById('effBright');
    const brightVal = document.getElementById('effBrightVal');
    const contrastInput = document.getElementById('effContrast');
    const contrastVal = document.getElementById('effContrastVal');
    const blurInput = document.getElementById('effBlur');
    const blurVal = document.getElementById('effBlurVal');
    const pixelInput = document.getElementById('effPixel');
    const pixelVal = document.getElementById('effPixelVal');
    const resetBtn = document.getElementById('effResetBtn');
    const downloadBtn = document.getElementById('effDownloadBtn');

    if (!canvas || !fileInput) return;
    const ctx = canvas.getContext('2d');
    let img = null;

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const tempImg = new Image();
      tempImg.onload = function () {
        img = tempImg;
        URL.revokeObjectURL(url);
        render();
        if (workspace) workspace.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
      };
      tempImg.src = url;
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

    function renderImage(targetCanvas, scale = 1) {
      const borderWidth = Math.round((parseInt(borderInput ? borderInput.value : 0, 10) || 0) * scale);
      const borderCol = borderColor ? borderColor.value : '#ffffff';
      const cornerRadius = Math.round((parseInt(radiusInput ? radiusInput.value : 0, 10) || 0) * scale);
      const gray = parseInt(grayInput ? grayInput.value : 0, 10) || 0;
      const bright = parseInt(brightInput ? brightInput.value : 100, 10) || 100;
      const contrast = parseInt(contrastInput ? contrastInput.value : 100, 10) || 100;
      const blur = Math.round((parseInt(blurInput ? blurInput.value : 0, 10) || 0) * scale);
      const pixelSize = parseInt(pixelInput ? pixelInput.value : 1, 10) || 1;

      const baseW = Math.round(img.width * scale);
      const baseH = Math.round(img.height * scale);
      const totalW = baseW + borderWidth * 2;
      const totalH = baseH + borderWidth * 2;

      targetCanvas.width = totalW;
      targetCanvas.height = totalH;
      const tCtx = targetCanvas.getContext('2d');

      tCtx.clearRect(0, 0, totalW, totalH);

      // Border background
      if (borderWidth > 0) {
        tCtx.fillStyle = borderCol;
        tCtx.fillRect(0, 0, totalW, totalH);
      }

      // Draw image inside border with rounded corners clip
      tCtx.save();
      tCtx.translate(borderWidth, borderWidth);

      if (cornerRadius > 0) {
        tCtx.beginPath();
        tCtx.moveTo(cornerRadius, 0);
        tCtx.lineTo(baseW - cornerRadius, 0);
        tCtx.quadraticCurveTo(baseW, 0, baseW, cornerRadius);
        tCtx.lineTo(baseW, baseH - cornerRadius);
        tCtx.quadraticCurveTo(baseW, baseH, baseW - cornerRadius, baseH);
        tCtx.lineTo(cornerRadius, baseH);
        tCtx.quadraticCurveTo(0, baseH, 0, baseH - cornerRadius);
        tCtx.lineTo(0, cornerRadius);
        tCtx.quadraticCurveTo(0, 0, cornerRadius, 0);
        tCtx.closePath();
        tCtx.clip();
      }

      // Filters
      tCtx.filter = `grayscale(${gray}%) brightness(${bright}%) contrast(${contrast}%) blur(${blur}px)`;

      if (pixelSize > 1) {
        // Pixelation effect via small intermediate offscreen canvas
        const pCanvas = document.createElement('canvas');
        const pW = Math.max(1, Math.round(baseW / (pixelSize * 3)));
        const pH = Math.max(1, Math.round(baseH / (pixelSize * 3)));
        pCanvas.width = pW;
        pCanvas.height = pH;
        const pCtx = pCanvas.getContext('2d');
        pCtx.drawImage(img, 0, 0, pW, pH);

        tCtx.imageSmoothingEnabled = false;
        tCtx.drawImage(pCanvas, 0, 0, pW, pH, 0, 0, baseW, baseH);
      } else {
        tCtx.drawImage(img, 0, 0, baseW, baseH);
      }

      tCtx.restore();
    }

    function render() {
      if (!img) return;
      const maxW = 680;
      const scale = img.width > maxW ? maxW / img.width : 1;
      renderImage(canvas, scale);
    }

    function bindSlider(el, valEl, unit = '') {
      if (!el) return;
      el.addEventListener('input', () => {
        if (valEl) valEl.textContent = el.value + unit;
        render();
      });
    }

    bindSlider(borderInput, borderVal, 'px');
    bindSlider(radiusInput, radiusVal, 'px');
    bindSlider(grayInput, grayVal, '%');
    bindSlider(brightInput, brightVal, '%');
    bindSlider(contrastInput, contrastVal, '%');
    bindSlider(blurInput, blurVal, 'px');
    bindSlider(pixelInput, pixelVal, 'x');
    if (borderColor) borderColor.addEventListener('input', render);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (borderInput) borderInput.value = '0';
        if (borderVal) borderVal.textContent = '0px';
        if (radiusInput) radiusInput.value = '0';
        if (radiusVal) radiusVal.textContent = '0px';
        if (grayInput) grayInput.value = '0';
        if (grayVal) grayVal.textContent = '0%';
        if (brightInput) brightInput.value = '100';
        if (brightVal) brightVal.textContent = '100%';
        if (contrastInput) contrastInput.value = '100';
        if (contrastVal) contrastVal.textContent = '100%';
        if (blurInput) blurInput.value = '0';
        if (blurVal) blurVal.textContent = '0px';
        if (pixelInput) pixelInput.value = '1';
        if (pixelVal) pixelVal.textContent = '1x';
        render();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!img) return;
        const outCanvas = document.createElement('canvas');
        renderImage(outCanvas, 1.0);

        outCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'edited-photo.png';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
        }, 'image/png');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
