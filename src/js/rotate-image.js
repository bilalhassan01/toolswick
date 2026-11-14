// rotate-image.js - Pure client-side image rotation and flipping
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('rotFile');
    const dropZone = document.getElementById('rotDrop');
    const canvas = document.getElementById('rotCanvas');
    const workspace = document.getElementById('rotWorkspace');
    const rotCwBtn = document.getElementById('rotCwBtn');
    const rotCcwBtn = document.getElementById('rotCcwBtn');
    const rot180Btn = document.getElementById('rot180Btn');
    const flipHBtn = document.getElementById('flipHBtn');
    const flipVBtn = document.getElementById('flipVBtn');
    const resetBtn = document.getElementById('rotResetBtn');
    const downloadBtn = document.getElementById('rotDownloadBtn');
    const fmtSelect = document.getElementById('rotFmt');
    const dimsInfo = document.getElementById('rotDimsInfo');

    if (!canvas || !fileInput) return;
    const ctx = canvas.getContext('2d');

    let img = null;
    let rotation = 0; // 0, 90, 180, 270
    let flipH = false;
    let flipV = false;

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const tempImg = new Image();
      tempImg.onload = function () {
        img = tempImg;
        URL.revokeObjectURL(url);
        rotation = 0;
        flipH = false;
        flipV = false;
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

    function render() {
      if (!img) return;

      const isSwapped = rotation === 90 || rotation === 270;
      const targetW = isSwapped ? img.height : img.width;
      const targetH = isSwapped ? img.width : img.height;

      // Fit to max display width
      const maxW = 680;
      const scale = targetW > maxW ? maxW / targetW : 1;
      canvas.width = Math.round(targetW * scale);
      canvas.height = Math.round(targetH * scale);

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);

      // Flip
      const scaleX = flipH ? -1 : 1;
      const scaleY = flipV ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      const drawW = Math.round(img.width * scale);
      const drawH = Math.round(img.height * scale);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      if (dimsInfo) {
        dimsInfo.textContent = `${targetW} × ${targetH} px | Rotation: ${rotation}° | Flip: ${flipH ? 'H ' : ''}${flipV ? 'V' : '' || 'None'}`;
      }
    }

    if (rotCwBtn) {
      rotCwBtn.addEventListener('click', () => {
        rotation = (rotation + 90) % 360;
        render();
      });
    }

    if (rotCcwBtn) {
      rotCcwBtn.addEventListener('click', () => {
        rotation = (rotation + 270) % 360;
        render();
      });
    }

    if (rot180Btn) {
      rot180Btn.addEventListener('click', () => {
        rotation = (rotation + 180) % 360;
        render();
      });
    }

    if (flipHBtn) {
      flipHBtn.addEventListener('click', () => {
        flipH = !flipH;
        render();
      });
    }

    if (flipVBtn) {
      flipVBtn.addEventListener('click', () => {
        flipV = !flipV;
        render();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        rotation = 0;
        flipH = false;
        flipV = false;
        render();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!img) return;

        const isSwapped = rotation === 90 || rotation === 270;
        const outW = isSwapped ? img.height : img.width;
        const outH = isSwapped ? img.width : img.height;

        const outCanvas = document.createElement('canvas');
        outCanvas.width = outW;
        outCanvas.height = outH;
        const outCtx = outCanvas.getContext('2d');

        outCtx.save();
        outCtx.translate(outW / 2, outH / 2);
        outCtx.rotate((rotation * Math.PI) / 180);
        outCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        outCtx.drawImage(img, -img.width / 2, -img.height / 2);
        outCtx.restore();

        const fmt = fmtSelect ? fmtSelect.value : 'png';
        const mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
        const ext = fmt === 'jpg' ? 'jpg' : 'png';

        outCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `transformed-photo.${ext}`;
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
