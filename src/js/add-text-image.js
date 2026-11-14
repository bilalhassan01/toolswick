// add-text-image.js - Pure client-side photo caption & text banner overlay
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('txtFile');
    const dropZone = document.getElementById('txtDrop');
    const canvas = document.getElementById('txtCanvas');
    const workspace = document.getElementById('txtWorkspace');

    const textInput = document.getElementById('txtInput');
    const fontSelect = document.getElementById('txtFont');
    const sizeInput = document.getElementById('txtSize');
    const sizeVal = document.getElementById('txtSizeVal');
    const colorInput = document.getElementById('txtColor');
    const alignSelect = document.getElementById('txtAlign');
    const bgCheck = document.getElementById('txtBgCheck');
    const bgColorInput = document.getElementById('txtBgColor');
    const posSelect = document.getElementById('txtPos');
    const downloadBtn = document.getElementById('txtDownloadBtn');

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
        // Show the workspace BEFORE rendering, so the canvas is visible
        // when the caption is painted (a render into a hidden container
        // can leave the preview blank until a later input event).
        if (workspace) workspace.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
        render();
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

    function renderText(targetCanvas, scale = 1) {
      targetCanvas.width = Math.round(img.width * scale);
      targetCanvas.height = Math.round(img.height * scale);
      const tCtx = targetCanvas.getContext('2d');

      tCtx.drawImage(img, 0, 0, targetCanvas.width, targetCanvas.height);

      const rawText = textInput ? textInput.value || 'Sample Caption Text' : 'Sample Caption Text';
      const lines = rawText.split('\n');

      const font = fontSelect ? fontSelect.value : 'sans-serif';
      const baseSize = parseInt(sizeInput ? sizeInput.value : 36, 10) || 36;
      const fontSize = Math.round(baseSize * scale);
      const lineHeight = Math.round(fontSize * 1.3);

      const fontColor = colorInput ? colorInput.value : '#ffffff';
      const align = alignSelect ? alignSelect.value : 'center';
      const hasBg = bgCheck ? bgCheck.checked : true;
      const bgColor = bgColorInput ? bgColorInput.value : '#000000';
      const pos = posSelect ? posSelect.value : 'bottom';

      tCtx.font = `700 ${fontSize}px ${font}`;
      tCtx.textAlign = align;

      const paddingH = 30 * scale;
      const paddingV = 16 * scale;
      const totalTextH = lines.length * lineHeight;

      let yStart = paddingV + fontSize;
      if (pos === 'center') {
        yStart = (targetCanvas.height - totalTextH) / 2 + fontSize;
      } else if (pos === 'bottom') {
        yStart = targetCanvas.height - totalTextH - paddingV + fontSize;
      }

      // Draw background banner if checked
      if (hasBg) {
        tCtx.save();
        tCtx.fillStyle = bgColor;
        tCtx.globalAlpha = 0.75;
        tCtx.fillRect(0, yStart - fontSize - paddingV / 2, targetCanvas.width, totalTextH + paddingV);
        tCtx.restore();
      }

      // Draw text lines
      lines.forEach((line, idx) => {
        const curY = yStart + (idx * lineHeight);
        let curX = targetCanvas.width / 2;
        if (align === 'left') curX = paddingH;
        if (align === 'right') curX = targetCanvas.width - paddingH;

        tCtx.save();
        tCtx.fillStyle = fontColor;
        if (!hasBg) {
          tCtx.shadowColor = 'rgba(0,0,0,0.8)';
          tCtx.shadowBlur = 6 * scale;
          tCtx.shadowOffsetX = 2 * scale;
          tCtx.shadowOffsetY = 2 * scale;
        }
        tCtx.fillText(line, curX, curY);
        tCtx.restore();
      });
    }

    function render() {
      if (!img) return;
      const maxW = 680;
      const scale = img.width > maxW ? maxW / img.width : 1;
      renderText(canvas, scale);
    }

    [textInput, fontSelect, colorInput, alignSelect, bgCheck, bgColorInput, posSelect].forEach(el => {
      if (el) el.addEventListener('input', render);
      if (el) el.addEventListener('change', render);
    });

    if (sizeInput) {
      sizeInput.addEventListener('input', () => {
        if (sizeVal) sizeVal.textContent = sizeInput.value + 'px';
        render();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!img) return;
        const outCanvas = document.createElement('canvas');
        renderText(outCanvas, 1.0);
        // Re-paint the preview canvas after the export render, so the
        // caption banner cannot go missing from the preview after a download.
        render();

        outCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'captioned-photo.jpg';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
        }, 'image/jpeg', 0.94);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
