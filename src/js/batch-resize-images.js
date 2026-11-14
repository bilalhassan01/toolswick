// batch-resize-images.js - Client-Side Batch Image Resizer with ZIP Export
(function () {
  'use strict';

  function init() {
    const fileInp = document.getElementById('batchResizeFile');
    const dropZone = document.getElementById('batchResizeDrop');
    const workspace = document.getElementById('batchResizeWorkspace');
    const widthInp = document.getElementById('batchResizeWidth');
    const heightInp = document.getElementById('batchResizeHeight');
    const modeSel = document.getElementById('batchResizeMode');
    const fmtSel = document.getElementById('batchResizeFmt');
    const processBtn = document.getElementById('batchResizeProcessBtn');
    const downloadZipBtn = document.getElementById('batchResizeDownloadZipBtn');
    const statusText = document.getElementById('batchResizeStatus');
    const fileListEl = document.getElementById('batchResizeFileList');

    if (!fileInp || !dropZone) return;

    let selectedFiles = [];
    let processedBlobs = [];

    function handleFiles(files) {
      selectedFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (selectedFiles.length === 0) return;

      dropZone.style.display = 'none';
      if (workspace) workspace.style.display = 'block';

      if (fileListEl) {
        fileListEl.innerHTML = selectedFiles.map((f, i) =>
          `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border,#333);font-size:0.85rem;">
            <span>${i + 1}. ${f.name}</span>
            <span style="color:var(--muted);">${(f.size / 1024).toFixed(1)} KB</span>
          </div>`
        ).join('');
      }

      if (statusText) statusText.textContent = `${selectedFiles.length} images ready for resizing.`;
    }

    fileInp.addEventListener('change', e => {
      if (e.target.files && e.target.files.length) handleFiles(e.target.files);
    });

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
    dropZone.addEventListener('click', () => fileInp.click());

    async function processImages() {
      if (selectedFiles.length === 0) return;
      processedBlobs = [];
      const targetW = parseInt(widthInp ? widthInp.value : 1200, 10) || 1200;
      const targetH = parseInt(heightInp ? heightInp.value : 800, 10) || 800;
      const mode = modeSel ? modeSel.value : 'width';
      const fmt = fmtSel ? fmtSel.value : 'original';

      if (statusText) statusText.textContent = `Processing images (0 / ${selectedFiles.length})...`;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const blob = await resizeSingle(file, targetW, targetH, mode, fmt);
        processedBlobs.push({ name: getOutputName(file.name, fmt), blob });
        if (statusText) statusText.textContent = `Processing images (${i + 1} / ${selectedFiles.length})...`;
      }

      if (statusText) statusText.textContent = `✓ All ${selectedFiles.length} images resized successfully!`;
      if (downloadZipBtn) downloadZipBtn.style.display = 'inline-block';
    }

    function getOutputName(origName, fmt) {
      const base = origName.replace(/\.[^/.]+$/, '');
      if (fmt === 'png') return `${base}-resized.png`;
      if (fmt === 'jpg') return `${base}-resized.jpg`;
      if (fmt === 'webp') return `${base}-resized.webp`;
      return `${base}-resized.${origName.split('.').pop()}`;
    }

    function resizeSingle(file, targetW, targetH, mode, fmt) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          let w = img.width;
          let h = img.height;

          if (mode === 'width') {
            w = targetW;
            h = Math.round(img.height * (targetW / img.width));
          } else if (mode === 'height') {
            h = targetH;
            w = Math.round(img.width * (targetH / img.height));
          } else if (mode === 'exact') {
            w = targetW;
            h = targetH;
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);

          let mime = file.type;
          if (fmt === 'jpg') mime = 'image/jpeg';
          else if (fmt === 'png') mime = 'image/png';
          else if (fmt === 'webp') mime = 'image/webp';

          canvas.toBlob(b => resolve(b), mime, 0.92);
        };
        img.onerror = reject;
        img.src = url;
      });
    }

    if (processBtn) processBtn.addEventListener('click', processImages);

    if (downloadZipBtn) {
      downloadZipBtn.addEventListener('click', async () => {
        if (!window.JSZip || processedBlobs.length === 0) return;
        downloadZipBtn.textContent = 'Packaging ZIP...';
        const zip = new window.JSZip();
        processedBlobs.forEach(item => {
          zip.file(item.name, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipBlob);
        a.download = `toolswick-resized-images-${Date.now()}.zip`;
        a.click();
        downloadZipBtn.textContent = 'Download All as ZIP';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
