// file-info.js - Client-side File Inspector & Metadata Viewer
(function () {
  'use strict';

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = (bytes / Math.pow(k, i)).toFixed(2);
    return `${val} ${sizes[i]}`;
  }

  function bufferToHexDump(buffer) {
    const bytes = new Uint8Array(buffer.slice(0, 64));
    let lines = [];
    for (let i = 0; i < bytes.length; i += 16) {
      const slice = bytes.slice(i, i + 16);
      const offset = i.toString(16).padStart(4, '0');
      let hexParts = [];
      let asciiParts = [];
      for (let j = 0; j < 16; j++) {
        if (j < slice.length) {
          hexParts.push(slice[j].toString(16).padStart(2, '0'));
          const c = slice[j];
          asciiParts.push((c >= 32 && c <= 126) ? String.fromCharCode(c) : '.');
        } else {
          hexParts.push('  ');
        }
      }
      lines.push(`${offset}  ${hexParts.slice(0, 8).join(' ')}  ${hexParts.slice(8).join(' ')}  |${asciiParts.join('')}|`);
    }
    return lines.join('\n');
  }

  async function computeSha256(buffer) {
    if (!crypto || !crypto.subtle) return 'Crypto API not supported in browser';
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function init() {
    const fileInput = document.getElementById('fiFileInput');
    const dropZone = document.getElementById('fiFileDrop');
    const resultsBox = document.getElementById('fiResults');

    const nameEl = document.getElementById('fiName');
    const extEl = document.getElementById('fiExt');
    const sizeBytesEl = document.getElementById('fiSizeBytes');
    const sizeFmtEl = document.getElementById('fiSizeFmt');
    const typeEl = document.getElementById('fiType');
    const dateEl = document.getElementById('fiDate');
    const sha256El = document.getElementById('fiSha256');
    const hexDumpEl = document.getElementById('fiHexDump');

    const copyHashBtn = document.getElementById('fiCopyHashBtn');
    const copySummaryBtn = document.getElementById('fiCopySummaryBtn');

    if (!fileInput) return;

    async function handleFile(file) {
      if (!file) return;

      const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'none';
      const lastMod = new Date(file.lastModified);

      if (nameEl) nameEl.textContent = file.name;
      if (extEl) extEl.textContent = ext ? `.${ext}` : 'None';
      if (sizeBytesEl) sizeBytesEl.textContent = file.size.toLocaleString() + ' bytes';
      if (sizeFmtEl) sizeFmtEl.textContent = formatBytes(file.size);
      if (typeEl) typeEl.textContent = file.type || 'Unknown / Binary';
      if (dateEl) dateEl.textContent = `${lastMod.toLocaleString()} (${lastMod.toISOString()})`;

      if (resultsBox) resultsBox.style.display = 'block';

      try {
        const buffer = await file.arrayBuffer();
        if (hexDumpEl) {
          hexDumpEl.textContent = bufferToHexDump(buffer);
        }
        if (sha256El) {
          sha256El.textContent = 'Calculating…';
          const hash = await computeSha256(buffer);
          sha256El.textContent = hash;
        }
      } catch (err) {
        console.error(err);
        if (hexDumpEl) hexDumpEl.textContent = 'Error reading file data.';
        if (sha256El) sha256El.textContent = 'Error computing hash.';
      }
    }

    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });

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

    if (copyHashBtn) {
      copyHashBtn.addEventListener('click', () => {
        const hash = sha256El ? sha256El.textContent : '';
        if (hash && hash !== 'Calculating…') {
          navigator.clipboard.writeText(hash).then(() => {
            if (window.TK && TK.toast) TK.toast('SHA-256 hash copied!', 'success');
          });
        }
      });
    }

    if (copySummaryBtn) {
      copySummaryBtn.addEventListener('click', () => {
        const summary = [
          `File: ${nameEl ? nameEl.textContent : ''}`,
          `Size: ${sizeBytesEl ? sizeBytesEl.textContent : ''} (${sizeFmtEl ? sizeFmtEl.textContent : ''})`,
          `MIME Type: ${typeEl ? typeEl.textContent : ''}`,
          `Last Modified: ${dateEl ? dateEl.textContent : ''}`,
          `SHA-256: ${sha256El ? sha256El.textContent : ''}`
        ].join('\n');
        navigator.clipboard.writeText(summary).then(() => {
          if (window.TK && TK.toast) TK.toast('File details copied to clipboard!', 'success');
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
