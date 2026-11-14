// webp-to-png.js - Client-Side WebP to PNG Converter with Transparency Preservation
(function () {
  'use strict';

  function init() {
    const fileInp = document.getElementById('w2pFile');
    const dropZone = document.getElementById('w2pDrop');
    const workspace = document.getElementById('w2pWorkspace');
    const preview = document.getElementById('w2pPreview');
    const infoEl = document.getElementById('w2pInfo');
    const downloadBtn = document.getElementById('w2pDownloadBtn');
    const resetBtn = document.getElementById('w2pResetBtn');

    if (!fileInp || !dropZone) return;

    let originalName = 'image.webp';
    let outputUrl = null;

    function handleFile(file) {
      if (!file) return;
      originalName = file.name;
      dropZone.style.display = 'none';
      if (workspace) workspace.style.display = 'block';

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(blob => {
          if (!blob) return;
          if (outputUrl) URL.revokeObjectURL(outputUrl);
          outputUrl = URL.createObjectURL(blob);
          if (preview) preview.src = outputUrl;
          if (infoEl) {
            infoEl.textContent = `${canvas.width} × ${canvas.height} px • ${(blob.size / 1024).toFixed(1)} KB PNG`;
          }
        }, 'image/png');
      };
      img.src = url;
    }

    fileInp.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    dropZone.addEventListener('click', () => fileInp.click());

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!outputUrl) return;
        const a = document.createElement('a');
        a.href = outputUrl;
        a.download = originalName.replace(/\.[^/.]+$/, '') + '.png';
        a.click();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (fileInp) fileInp.value = '';
        if (workspace) workspace.style.display = 'none';
        if (dropZone) dropZone.style.display = 'block';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
