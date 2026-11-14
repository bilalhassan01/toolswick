// watermark-image.js - Pure client-side photo watermarking
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('wmFile');
    const dropZone = document.getElementById('wmDrop');
    const canvas = document.getElementById('wmCanvas');
    const workspace = document.getElementById('wmWorkspace');

    const textInput = document.getElementById('wmText');
    const fontSelect = document.getElementById('wmFont');
    const sizeInput = document.getElementById('wmSize');
    const sizeVal = document.getElementById('wmSizeVal');
    const colorInput = document.getElementById('wmColor');
    const opacityInput = document.getElementById('wmOpacity');
    const opacityVal = document.getElementById('wmOpacityVal');
    const posBtns = document.querySelectorAll('.wm-pos-btn');
    const downloadBtn = document.getElementById('wmDownloadBtn');
    const fmtSelect = document.getElementById('wmFmt');

    if (!canvas || !fileInput) return;
    const ctx = canvas.getContext('2d');

    let img = null;
    let position = 'bottom-right';

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

    function drawWatermark(c, targetCtx, scale) {
      const text = textInput ? textInput.value || '© Copyright' : '© Copyright';
      const font = fontSelect ? fontSelect.value : 'sans-serif';
      const baseSize = parseInt(sizeInput ? sizeInput.value : 32, 10) || 32;
      const scaledSize = Math.round(baseSize * scale);
      const color = colorInput ? colorInput.value : '#ffffff';
      const opacity = parseInt(opacityInput ? opacityInput.value : 75, 10) / 100;

      targetCtx.save();
      targetCtx.font = `600 ${scaledSize}px ${font}`;
      targetCtx.fillStyle = color;
      targetCtx.globalAlpha = opacity;

      // Drop shadow for readability
      targetCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      targetCtx.shadowBlur = 4 * scale;
      targetCtx.shadowOffsetX = 2 * scale;
      targetCtx.shadowOffsetY = 2 * scale;

      const padding = 24 * scale;
      const metrics = targetCtx.measureText(text);
      const textW = metrics.width;
      const textH = scaledSize;

      let x = padding;
      let y = padding + textH;

      if (position.includes('center')) {
        x = (c.width - textW) / 2;
      } else if (position.includes('right')) {
        x = c.width - textW - padding;
      }

      if (position.startsWith('middle')) {
        y = (c.height + textH) / 2;
      } else if (position.startsWith('bottom')) {
        y = c.height - padding;
      }

      targetCtx.fillText(text, x, y);
      targetCtx.restore();
    }

    function render() {
      if (!img) return;
      const maxW = 680;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawWatermark(canvas, ctx, scale);
    }

    [textInput, fontSelect, colorInput].forEach(el => {
      if (el) el.addEventListener('input', render);
    });

    if (sizeInput) {
      sizeInput.addEventListener('input', () => {
        if (sizeVal) sizeVal.textContent = sizeInput.value + 'px';
        render();
      });
    }

    if (opacityInput) {
      opacityInput.addEventListener('input', () => {
        if (opacityVal) opacityVal.textContent = opacityInput.value + '%';
        render();
      });
    }

    posBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        posBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        position = btn.getAttribute('data-pos');
        render();
      });
    });

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!img) return;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = img.width;
        outCanvas.height = img.height;
        const outCtx = outCanvas.getContext('2d');

        outCtx.drawImage(img, 0, 0);
        drawWatermark(outCanvas, outCtx, 1.0);

        const fmt = fmtSelect ? fmtSelect.value : 'png';
        const mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
        const ext = fmt === 'jpg' ? 'jpg' : 'png';

        outCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `watermarked-photo.${ext}`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
        }, mime, 0.92);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
