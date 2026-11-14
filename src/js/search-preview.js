// search-preview.js - Real-Time Google SERP Simulator (Desktop & Mobile)
(function () {
  'use strict';

  function init() {
    const titleInp = document.getElementById('spvTitle');
    const urlInp = document.getElementById('spvUrl');
    const descInp = document.getElementById('spvDesc');

    const titleCountEl = document.getElementById('spvTitleCount');
    const descCountEl = document.getElementById('spvDescCount');
    const pixelBarEl = document.getElementById('spvPixelBar');
    const pixelWidthEl = document.getElementById('spvPixelWidth');

    const tabs = document.querySelectorAll('.serp-tab');
    const desktopView = document.getElementById('serpDesktop');
    const mobileView = document.getElementById('serpMobile');

    // Desktop elements
    const dUrl = document.getElementById('dSerpUrl');
    const dTitle = document.getElementById('dSerpTitle');
    const dDesc = document.getElementById('dSerpDesc');

    // Mobile elements
    const mUrl = document.getElementById('mSerpUrl');
    const mTitle = document.getElementById('mSerpTitle');
    const mDesc = document.getElementById('mSerpDesc');

    const copyBtn = document.getElementById('spvCopyBtn');

    if (!titleInp || !desktopView) return;

    // Canvas to measure exact Google Arial 20px font pixel width
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = '20px Arial, sans-serif';

    function update() {
      const title = titleInp.value.trim() || 'Toolswick - Free Client-Side Web Utilities & Image Tools';
      const rawUrl = urlInp.value.trim() || 'https://toolswick.com/tools/image-cropper';
      const desc = descInp.value.trim() || 'Fast, secure, and private browser-based utilities. Crop photos, reorder PDFs, and inspect files with zero uploads and total client-side privacy.';

      // Format breadcrumb URL
      let cleanUrl = rawUrl;
      try {
        const u = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl);
        const parts = u.pathname.split('/').filter(Boolean);
        cleanUrl = u.origin + (parts.length ? ' › ' + parts.join(' › ') : '');
      } catch (e) {
        cleanUrl = rawUrl;
      }

      // Pixel width calculation (Google desktop truncates at ~600px)
      const pixelWidth = Math.round(measureCtx.measureText(title).width);
      if (pixelWidthEl) pixelWidthEl.textContent = `${pixelWidth}px / ~600px`;
      if (pixelBarEl) {
        const pct = Math.min(100, (pixelWidth / 600) * 100);
        pixelBarEl.style.width = pct + '%';
        pixelBarEl.style.backgroundColor = pixelWidth > 600 ? 'var(--bad,#ef4444)' : 'var(--accent,#6366f1)';
      }

      // Counters
      const titleLen = title.length;
      if (titleCountEl) {
        titleCountEl.textContent = `${titleLen} / 60 characters`;
        titleCountEl.style.color = titleLen > 60 ? 'var(--bad,#ef4444)' : 'inherit';
      }

      const descLen = desc.length;
      if (descCountEl) {
        descCountEl.textContent = `${descLen} / 160 characters`;
        descCountEl.style.color = descLen > 160 ? 'var(--bad,#ef4444)' : 'inherit';
      }

      // Update Desktop SERP
      if (dUrl) dUrl.textContent = cleanUrl;
      if (dTitle) dTitle.textContent = title;
      if (dDesc) dDesc.textContent = desc;

      // Update Mobile SERP
      if (mUrl) mUrl.textContent = cleanUrl;
      if (mTitle) mTitle.textContent = title;
      if (mDesc) mDesc.textContent = desc;
    }

    [titleInp, urlInp, descInp].forEach(inp => {
      inp.addEventListener('input', update);
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        if (mode === 'desktop') {
          desktopView.style.display = 'block';
          mobileView.style.display = 'none';
        } else {
          desktopView.style.display = 'none';
          mobileView.style.display = 'block';
        }
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const title = titleInp.value.trim();
        const desc = descInp.value.trim();
        const tags = `<title>${title}</title>\n<meta name="description" content="${desc}">`;
        navigator.clipboard.writeText(tags).then(() => {
          if (window.TK && TK.toast) TK.toast('SEO HTML tags copied!', 'success');
        });
      });
    }

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
