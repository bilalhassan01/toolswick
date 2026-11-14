// data-uri.js - Client-side RFC 2397 Data URI Generator & Decoder
(function () {
  'use strict';

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  function getExtFromMime(mime) {
    const map = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'text/html': 'html',
      'text/css': 'css',
      'application/json': 'json',
      'application/javascript': 'js',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'video/mp4': 'mp4'
    };
    return map[mime.toLowerCase()] || 'bin';
  }

  function init() {
    const tabs = document.querySelectorAll('.data-uri-tab');
    const encodeSec = document.getElementById('dataUriEncodeSec');
    const decodeSec = document.getElementById('dataUriDecodeSec');

    // Generator elements
    const genFileInput = document.getElementById('dataUriFile');
    const genDrop = document.getElementById('dataUriDrop');
    const genMimeInput = document.getElementById('dataUriMime');
    const genOutput = document.getElementById('dataUriOutput');
    const genHtmlImg = document.getElementById('dataUriHtmlImg');
    const genCssBg = document.getElementById('dataUriCssBg');
    const genPreview = document.getElementById('dataUriPreview');
    const genStats = document.getElementById('dataUriStats');

    const copyUriBtn = document.getElementById('dataUriCopyUriBtn');
    const copyImgBtn = document.getElementById('dataUriCopyImgBtn');
    const copyCssBtn = document.getElementById('dataUriCopyCssBtn');

    // Decoder elements
    const decInput = document.getElementById('dataUriDecInput');
    const decBtn = document.getElementById('dataUriDecBtn');
    const decInfo = document.getElementById('dataUriDecInfo');
    const decPreview = document.getElementById('dataUriDecPreview');
    const decDownloadBtn = document.getElementById('dataUriDecDownloadBtn');

    let currentDecodedBlob = null;
    let suggestedDecodedName = 'file.bin';

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        if (mode === 'encode') {
          if (encodeSec) encodeSec.style.display = 'block';
          if (decodeSec) decodeSec.style.display = 'none';
        } else {
          if (encodeSec) encodeSec.style.display = 'none';
          if (decodeSec) decodeSec.style.display = 'block';
        }
      });
    });

    function generateDataUri(file) {
      if (!file) return;
      const mime = (genMimeInput && genMimeInput.value.trim()) || file.type || 'application/octet-stream';
      const reader = new FileReader();

      reader.onload = ev => {
        const dataUrl = ev.target.result;
        if (genOutput) genOutput.value = dataUrl;
        if (genHtmlImg) genHtmlImg.value = `<img src="${dataUrl}" alt="embedded image" />`;
        if (genCssBg) genCssBg.value = `background-image: url('${dataUrl}');`;

        if (genStats) {
          genStats.textContent = `File: ${file.name} · Original: ${formatBytes(file.size)} · Data URI string length: ${dataUrl.length.toLocaleString()} characters`;
        }

        if (genPreview) {
          if (mime.startsWith('image/')) {
            genPreview.innerHTML = `<img src="${dataUrl}" style="max-width:100%;max-height:220px;border-radius:6px;border:1px solid var(--border);" />`;
            genPreview.style.display = 'block';
          } else {
            genPreview.style.display = 'none';
          }
        }
      };

      reader.readAsDataURL(file);
    }

    if (genFileInput) {
      genFileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) generateDataUri(e.target.files[0]);
      });
    }

    if (genDrop) {
      genDrop.addEventListener('dragover', e => { e.preventDefault(); genDrop.classList.add('dragover'); });
      genDrop.addEventListener('dragleave', () => genDrop.classList.remove('dragover'));
      genDrop.addEventListener('drop', e => {
        e.preventDefault();
        genDrop.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) generateDataUri(e.dataTransfer.files[0]);
      });
      genDrop.addEventListener('click', () => genFileInput.click());
    }

    function setupCopy(btn, targetEl, label) {
      if (!btn || !targetEl) return;
      btn.addEventListener('click', () => {
        if (!targetEl.value) return;
        navigator.clipboard.writeText(targetEl.value).then(() => {
          if (window.TK && TK.toast) TK.toast(label + ' copied to clipboard!', 'success');
        });
      });
    }

    setupCopy(copyUriBtn, genOutput, 'Data URI');
    setupCopy(copyImgBtn, genHtmlImg, 'HTML Image tag');
    setupCopy(copyCssBtn, genCssBg, 'CSS background snippet');

    // Decode handler
    function decodeDataUri() {
      if (!decInput) return;
      const raw = decInput.value.trim();
      if (!raw) {
        if (window.TK && TK.toast) TK.toast('Please enter a Data URI to decode.', 'warning');
        return;
      }

      const match = raw.match(/^data:([^;,]+)?(?:;charset=([^;,]+))?(;base64)?,(.*)$/is);
      if (!match) {
        if (window.TK && TK.toast) TK.toast('Invalid RFC 2397 Data URI format.', 'error');
        return;
      }

      const mime = match[1] || 'text/plain';
      const isBase64 = !!match[3];
      const dataStr = match[4];

      try {
        let byteArray;
        if (isBase64) {
          const binaryStr = atob(dataStr.replace(/\s+/g, ''));
          byteArray = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            byteArray[i] = binaryStr.charCodeAt(i);
          }
        } else {
          const decodedText = decodeURIComponent(dataStr);
          const encoder = new TextEncoder();
          byteArray = encoder.encode(decodedText);
        }

        currentDecodedBlob = new Blob([byteArray], { type: mime });
        suggestedDecodedName = `decoded-file.${getExtFromMime(mime)}`;

        if (decInfo) {
          decInfo.innerHTML = `<strong>MIME:</strong> ${mime} &nbsp;·&nbsp; <strong>Encoding:</strong> ${isBase64 ? 'Base64' : 'URL-encoded'} &nbsp;·&nbsp; <strong>Payload:</strong> ${formatBytes(byteArray.length)}`;
          decInfo.style.display = 'block';
        }

        if (decDownloadBtn) {
          decDownloadBtn.style.display = 'inline-flex';
          decDownloadBtn.textContent = `Download Decoded File (${formatBytes(byteArray.length)})`;
        }

        if (decPreview) {
          if (mime.startsWith('image/')) {
            const url = URL.createObjectURL(currentDecodedBlob);
            decPreview.innerHTML = `<img src="${url}" style="max-width:100%;max-height:240px;border-radius:6px;border:1px solid var(--border);" />`;
            decPreview.style.display = 'block';
          } else if (mime.startsWith('text/')) {
            const text = new TextDecoder().decode(byteArray.slice(0, 1000));
            decPreview.innerHTML = `<pre style="max-height:160px;overflow:auto;background:var(--card);padding:10px;border-radius:6px;font-size:0.85rem;">${text.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</pre>`;
            decPreview.style.display = 'block';
          } else {
            decPreview.style.display = 'none';
          }
        }

        if (window.TK && TK.toast) TK.toast('Data URI parsed successfully!', 'success');
      } catch (err) {
        console.error(err);
        if (window.TK && TK.toast) TK.toast('Failed to decode Data URI: ' + err.message, 'error');
      }
    }

    if (decBtn) decBtn.addEventListener('click', decodeDataUri);

    if (decDownloadBtn) {
      decDownloadBtn.addEventListener('click', () => {
        if (!currentDecodedBlob) return;
        const url = URL.createObjectURL(currentDecodedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = suggestedDecodedName;
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
