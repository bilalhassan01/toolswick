// gzip-tool.js - Pure client-side GZIP Compression & Decompression with Web Streams
(function () {
  'use strict';

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  function init() {
    const tabs = document.querySelectorAll('.gzip-mode-tab');
    const compBox = document.getElementById('gzipCompressSection');
    const decompBox = document.getElementById('gzipDecompressSection');

    // Compress elements
    const compFileInput = document.getElementById('gzipCompFile');
    const compDrop = document.getElementById('gzipCompDrop');
    const compFileInfo = document.getElementById('gzipCompFileInfo');
    const compBtn = document.getElementById('gzipCompBtn');
    const compResults = document.getElementById('gzipCompResults');
    const compStats = document.getElementById('gzipCompStats');
    const compDownloadBtn = document.getElementById('gzipCompDownloadBtn');

    // Decompress elements
    const decompFileInput = document.getElementById('gzipDecompFile');
    const decompDrop = document.getElementById('gzipDecompDrop');
    const decompFileInfo = document.getElementById('gzipDecompFileInfo');
    const decompBtn = document.getElementById('gzipDecompBtn');
    const decompResults = document.getElementById('gzipDecompResults');
    const decompStats = document.getElementById('gzipDecompStats');
    const decompDownloadBtn = document.getElementById('gzipDecompDownloadBtn');

    let compSelectedFile = null;
    let decompSelectedFile = null;
    let compResultBlob = null;
    let decompResultBlob = null;

    if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined') {
      const err = 'Your browser does not support native CompressionStream / DecompressionStream.';
      if (compDrop) compDrop.innerHTML = `<p class="bad">${err}</p>`;
      if (decompDrop) decompDrop.innerHTML = `<p class="bad">${err}</p>`;
      return;
    }

    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        if (mode === 'compress') {
          if (compBox) compBox.style.display = 'block';
          if (decompBox) decompBox.style.display = 'none';
        } else {
          if (compBox) compBox.style.display = 'none';
          if (decompBox) decompBox.style.display = 'block';
        }
      });
    });

    // Compression handler
    function handleCompFile(file) {
      if (!file) return;
      compSelectedFile = file;
      if (compFileInfo) compFileInfo.textContent = `${file.name} · ${formatBytes(file.size)}`;
      if (compBtn) compBtn.disabled = false;
      if (compResults) compResults.style.display = 'none';
    }

    if (compFileInput) {
      compFileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) handleCompFile(e.target.files[0]);
      });
    }

    if (compDrop) {
      compDrop.addEventListener('dragover', e => { e.preventDefault(); compDrop.classList.add('dragover'); });
      compDrop.addEventListener('dragleave', () => compDrop.classList.remove('dragover'));
      compDrop.addEventListener('drop', e => {
        e.preventDefault();
        compDrop.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleCompFile(e.dataTransfer.files[0]);
      });
      compDrop.addEventListener('click', () => compFileInput.click());
    }

    if (compBtn) {
      compBtn.addEventListener('click', async () => {
        if (!compSelectedFile) return;
        compBtn.disabled = true;
        compBtn.textContent = 'Compressing…';

        try {
          const stream = compSelectedFile.stream().pipeThrough(new CompressionStream('gzip'));
          const response = new Response(stream);
          compResultBlob = await response.blob();

          const origSize = compSelectedFile.size;
          const newSize = compResultBlob.size;
          const diffPct = origSize > 0 ? (((origSize - newSize) / origSize) * 100).toFixed(1) : 0;
          const savedLabel = newSize > origSize
            ? `<span style="color:#f59e0b;font-weight:600">+${(-diffPct).toFixed(1)}% larger (gzip overhead on a tiny file)</span>`
            : `<span style="color:var(--accent);font-weight:600">${diffPct}% saved</span>`;

          if (compStats) {
            compStats.innerHTML = `Original: <strong>${formatBytes(origSize)}</strong> &nbsp;→&nbsp; GZIP: <strong>${formatBytes(newSize)}</strong> &nbsp;·&nbsp; ${savedLabel}`;
          }

          if (compResults) compResults.style.display = 'block';
          if (window.TK && TK.toast) TK.toast('File compressed to GZIP successfully!', 'success');
        } catch (err) {
          console.error(err);
          if (window.TK && TK.toast) TK.toast('Compression failed: ' + err.message, 'error');
        } finally {
          compBtn.disabled = false;
          compBtn.textContent = 'Compress to .gz';
        }
      });
    }

    if (compDownloadBtn) {
      compDownloadBtn.addEventListener('click', () => {
        if (!compResultBlob || !compSelectedFile) return;
        const url = URL.createObjectURL(compResultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = compSelectedFile.name + '.gz';
        a.click();
      });
    }

    // Decompression handler
    function handleDecompFile(file) {
      if (!file) return;
      decompSelectedFile = file;
      if (decompFileInfo) decompFileInfo.textContent = `${file.name} · ${formatBytes(file.size)}`;
      if (decompBtn) decompBtn.disabled = false;
      if (decompResults) decompResults.style.display = 'none';
    }

    if (decompFileInput) {
      decompFileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) handleDecompFile(e.target.files[0]);
      });
    }

    if (decompDrop) {
      decompDrop.addEventListener('dragover', e => { e.preventDefault(); decompDrop.classList.add('dragover'); });
      decompDrop.addEventListener('dragleave', () => decompDrop.classList.remove('dragover'));
      decompDrop.addEventListener('drop', e => {
        e.preventDefault();
        decompDrop.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleDecompFile(e.dataTransfer.files[0]);
      });
      decompDrop.addEventListener('click', () => decompFileInput.click());
    }

    if (decompBtn) {
      decompBtn.addEventListener('click', async () => {
        if (!decompSelectedFile) return;
        decompBtn.disabled = true;
        decompBtn.textContent = 'Extracting…';

        try {
          const stream = decompSelectedFile.stream().pipeThrough(new DecompressionStream('gzip'));
          const response = new Response(stream);
          decompResultBlob = await response.blob();

          const origSize = decompSelectedFile.size;
          const newSize = decompResultBlob.size;

          if (decompStats) {
            decompStats.innerHTML = `Compressed: <strong>${formatBytes(origSize)}</strong> &nbsp;→&nbsp; Extracted: <strong>${formatBytes(newSize)}</strong>`;
          }

          if (decompResults) decompResults.style.display = 'block';
          if (window.TK && TK.toast) TK.toast('GZIP archive extracted successfully!', 'success');
        } catch (err) {
          console.error(err);
          if (window.TK && TK.toast) TK.toast('Extraction failed: File may not be a valid GZIP archive.', 'error');
        } finally {
          decompBtn.disabled = false;
          decompBtn.textContent = 'Extract GZIP Archive';
        }
      });
    }

    if (decompDownloadBtn) {
      decompDownloadBtn.addEventListener('click', () => {
        if (!decompResultBlob || !decompSelectedFile) return;
        let outName = decompSelectedFile.name.replace(/\.gz$/i, '');
        if (outName === decompSelectedFile.name) outName = outName + '.extracted';
        const url = URL.createObjectURL(decompResultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outName;
        a.click();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
