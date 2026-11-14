// batch-convert-images.js - Client-Side Batch Image Format Converter with ZIP Export
(function () {
  'use strict';

  function init() {
    const fileInp = document.getElementById('batchConvFile');
    const dropZone = document.getElementById('batchConvDrop');
    const workspace = document.getElementById('batchConvWorkspace');
    const targetFmtSel = document.getElementById('batchConvTargetFmt');
    const qualityInp = document.getElementById('batchConvQuality');
    const processBtn = document.getElementById('batchConvProcessBtn');
    const downloadZipBtn = document.getElementById('batchConvDownloadZipBtn');
    const statusText = document.getElementById('batchConvStatus');
    const fileListEl = document.getElementById('batchConvFileList');

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

      if (statusText) statusText.textContent = `${selectedFiles.length} images queued for format conversion.`;
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

    async function processConversion() {
      if (selectedFiles.length === 0) return;
      processedBlobs = [];
      const targetFmt = targetFmtSel ? targetFmtSel.value : 'webp';
      const quality = (parseInt(qualityInp ? qualityInp.value : 85, 10) || 85) / 100;

      let mime = 'image/webp';
      let ext = 'webp';
      if (targetFmt === 'jpg') { mime = 'image/jpeg'; ext = 'jpg'; }
      else if (targetFmt === 'png') { mime = 'image/png'; ext = 'png'; }

      if (statusText) statusText.textContent = `Converting images (0 / ${selectedFiles.length})...`;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const blob = await convertSingle(file, mime, quality);
        const outName = file.name.replace(/\.[^/.]+$/, '') + '.' + ext;
        processedBlobs.push({ name: outName, blob });
        if (statusText) statusText.textContent = `Converting images (${i + 1} / ${selectedFiles.length})...`;
      }

      if (statusText) statusText.textContent = `✓ Successfully converted ${selectedFiles.length} images to ${targetFmt.toUpperCase()}!`;
      if (downloadZipBtn) downloadZipBtn.style.display = 'inline-block';
    }

    function convertSingle(file, mime, quality) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (mime === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(b => resolve(b), mime, quality);
        };
        img.onerror = reject;
        img.src = url;
      });
    }

    if (processBtn) processBtn.addEventListener('click', processConversion);

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
        a.download = `toolswick-converted-${targetFmtSel.value}-${Date.now()}.zip`;
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
