// favicon-generator.js - Pure client-side Favicon & App Icon Generator
(function () {
  'use strict';

  const SIZES = [
    { size: 16, name: 'favicon-16x16.png', desc: 'Browser Tab Icon' },
    { size: 32, name: 'favicon-32x32.png', desc: 'Standard Desktop Favicon' },
    { size: 48, name: 'favicon-48x48.png', desc: 'High-DPI Desktop Icon' },
    { size: 180, name: 'apple-touch-icon.png', desc: 'Apple iOS Touch Icon' },
    { size: 192, name: 'android-chrome-192x192.png', desc: 'Android Chrome Homescreen' }
  ];

  function init() {
    const fileInput = document.getElementById('favFile');
    const dropZone = document.getElementById('favDrop');
    const gridEl = document.getElementById('favGrid');
    const htmlCodeEl = document.getElementById('favHtmlCode');
    const copyHtmlBtn = document.getElementById('favCopyHtml');
    const zipBtn = document.getElementById('favZipBtn');
    const workspace = document.getElementById('favWorkspace');

    if (!fileInput) return;
    let loadedImg = null;
    let generatedBlobs = {};

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) {
        if (window.TK && TK.toast) TK.toast('Please select an image file (PNG, JPG, SVG, WebP).', 'error');
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        loadedImg = img;
        URL.revokeObjectURL(url);
        renderFavicons();
        if (workspace) workspace.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
      };
      img.onerror = function() {
        URL.revokeObjectURL(url);
        if (window.TK && TK.toast) TK.toast('Could not open image file.', 'error');
      };
      img.src = url;
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

    function renderFavicons() {
      if (!loadedImg || !gridEl) return;
      gridEl.innerHTML = '';
      generatedBlobs = {};

      const minDim = Math.min(loadedImg.width, loadedImg.height);
      const sx = (loadedImg.width - minDim) / 2;
      const sy = (loadedImg.height - minDim) / 2;

      SIZES.forEach(item => {
        const c = document.createElement('canvas');
        c.width = item.size;
        c.height = item.size;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(loadedImg, sx, sy, minDim, minDim, 0, 0, item.size, item.size);

        c.toBlob(blob => {
          if (!blob) return;
          generatedBlobs[item.name] = blob;

          const card = document.createElement('div');
          card.className = 'card-box';
          card.style.cssText = 'text-align:center;padding:16px;display:flex;flex-direction:column;align-items:center;border-radius:12px;background:var(--surface);border:1px solid var(--line);box-shadow:0 2px 6px rgba(0,0,0,0.04);';

          const previewUrl = URL.createObjectURL(blob);
          const previewSize = Math.max(32, Math.min(item.size, 80));

          card.innerHTML = `
            <div style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:var(--surface-raised);border-radius:8px;margin-bottom:10px;border:1px dashed var(--line-strong);">
              <img src="${previewUrl}" style="width:${previewSize}px;height:${previewSize}px;image-rendering:pixelated;" alt="${item.name}" />
            </div>
            <strong style="font-size:0.95rem;display:block;color:var(--ink);">${item.size} × ${item.size}</strong>
            <span style="font-size:0.78rem;color:var(--muted);margin-bottom:12px;">${item.desc}</span>
            <button type="button" class="btn btn-primary small fav-dl-btn" style="margin-top:auto;font-size:0.8rem;padding:6px 14px;width:100%;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PNG
            </button>
          `;

          card.querySelector('.fav-dl-btn').addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = item.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });

          gridEl.appendChild(card);
        }, 'image/png');
      });

      if (htmlCodeEl) {
        htmlCodeEl.value = `<!-- Standard Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">`;
      }
    }

    if (copyHtmlBtn && htmlCodeEl) {
      copyHtmlBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(htmlCodeEl.value).then(() => {
          const old = copyHtmlBtn.textContent;
          copyHtmlBtn.textContent = 'Copied!';
          setTimeout(() => (copyHtmlBtn.textContent = old), 1500);
        });
      });
    }

    if (zipBtn) {
      zipBtn.addEventListener('click', async () => {
        if (!window.JSZip) {
          if (window.TK && TK.toast) TK.toast('ZIP library is loading. Please retry in a moment.', 'error');
          return;
        }
        if (Object.keys(generatedBlobs).length === 0) {
          if (window.TK && TK.toast) TK.toast('Please upload an image first to generate favicons.', 'error');
          return;
        }
        zipBtn.disabled = true;
        zipBtn.textContent = 'Creating ZIP…';

        try {
          const zip = new window.JSZip();
          for (const [name, blob] of Object.entries(generatedBlobs)) {
            zip.file(name, blob);
          }
          if (htmlCodeEl) {
            zip.file('favicon-html-code.html', htmlCodeEl.value);
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'favicons-bundle.zip';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
          if (window.TK && TK.toast) TK.toast('Favicons ZIP package downloaded!', 'success');
        } catch (e) {
          console.error('ZIP error:', e);
          if (window.TK && TK.toast) TK.toast('Failed to generate ZIP.', 'error');
        } finally {
          zipBtn.disabled = false;
          zipBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download All (ZIP)';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
