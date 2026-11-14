// meme-generator.js - Pure client-side Meme Generator
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('memeFile');
    const dropZone = document.getElementById('memeDrop');
    const canvas = document.getElementById('memeCanvas');
    const workspace = document.getElementById('memeWorkspace');

    const topTextInput = document.getElementById('memeTopText');
    const bottomTextInput = document.getElementById('memeBottomText');
    const sizeInput = document.getElementById('memeSize');
    const sizeVal = document.getElementById('memeSizeVal');
    const uppercaseCheck = document.getElementById('memeCaps');
    const downloadBtn = document.getElementById('memeDownloadBtn');
    const resetBtn = document.getElementById('memeResetBtn');
    const sampleBtns = document.querySelectorAll('.meme-sample-btn');

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
        // when the caption is painted.
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

    function drawMemeText(targetCtx, text, x, y, fontSize, align = 'center') {
      if (!text) return;
      targetCtx.save();
      targetCtx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
      targetCtx.textAlign = align;
      targetCtx.fillStyle = '#ffffff';
      targetCtx.strokeStyle = '#000000';
      targetCtx.lineWidth = Math.max(3, fontSize / 9);
      targetCtx.lineJoin = 'miter';
      targetCtx.miterLimit = 2;

      targetCtx.strokeText(text, x, y);
      targetCtx.fillText(text, x, y);
      targetCtx.restore();
    }

    function render(targetCanvas = canvas) {
      if (!img) return;

      const isExport = targetCanvas !== canvas;
      const targetW = isExport ? img.width : Math.min(img.width, 680);
      const scale = targetW / img.width;
      const targetH = Math.round(img.height * scale);

      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      const targetCtx = targetCanvas.getContext('2d');

      targetCtx.clearRect(0, 0, targetW, targetH);
      targetCtx.drawImage(img, 0, 0, targetW, targetH);

      const isCaps = uppercaseCheck ? uppercaseCheck.checked : true;
      let topText = topTextInput ? topTextInput.value : '';
      let bottomText = bottomTextInput ? bottomTextInput.value : '';

      if (isCaps) {
        topText = topText.toUpperCase();
        bottomText = bottomText.toUpperCase();
      }

      const baseFontSize = parseInt(sizeInput ? sizeInput.value : 38, 10) || 38;
      const fontSize = Math.round(baseFontSize * scale);
      const padding = 16 * scale;

      // Top text
      drawMemeText(targetCtx, topText, targetW / 2, fontSize + padding, fontSize);

      // Bottom text
      drawMemeText(targetCtx, bottomText, targetW / 2, targetH - padding, fontSize);
    }

    [topTextInput, bottomTextInput].forEach(el => {
      if (el) el.addEventListener('input', () => render());
    });

    if (uppercaseCheck) uppercaseCheck.addEventListener('change', () => render());

    if (sizeInput) {
      sizeInput.addEventListener('input', () => {
        if (sizeVal) sizeVal.textContent = sizeInput.value + 'px';
        render();
      });
    }

    // Default sample meme template canvas generator
    function loadGeneratedSample(type) {
      const c = document.createElement('canvas');
      c.width = 600;
      c.height = 600;
      const sCtx = c.getContext('2d');

      if (type === 'cat') {
        sCtx.fillStyle = '#1e293b';
        sCtx.fillRect(0, 0, 600, 600);
        sCtx.font = '100px sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText('🐱', 300, 320);
      } else {
        sCtx.fillStyle = '#0f172a';
        sCtx.fillRect(0, 0, 600, 600);
        sCtx.font = '100px sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText('🚀', 300, 320);
      }

      const tempImg = new Image();
      tempImg.onload = function () {
        img = tempImg;
        render();
        if (workspace) workspace.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
      };
      tempImg.src = c.toDataURL('image/png');
    }

    sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        loadGeneratedSample(btn.getAttribute('data-sample'));
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        img = null;
        if (topTextInput) topTextInput.value = '';
        if (bottomTextInput) bottomTextInput.value = '';
        if (workspace) workspace.style.display = 'none';
        if (dropZone) dropZone.style.display = 'block';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!img) return;
        const outCanvas = document.createElement('canvas');
        render(outCanvas);
        // Re-paint the preview canvas after the export render.
        render();

        outCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'custom-meme.jpg';
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
