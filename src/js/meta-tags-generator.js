// meta-tags-generator.js - Complete SEO, Open Graph & Twitter Card Meta Tag Suite
(function () {
  'use strict';

  function init() {
    const titleInp = document.getElementById('metaTitle');
    const descInp = document.getElementById('metaDesc');
    const kwInp = document.getElementById('metaKeywords');
    const authorInp = document.getElementById('metaAuthor');
    const canonInp = document.getElementById('metaCanonical');
    const robotsSel = document.getElementById('metaRobots');

    const ogTypeSel = document.getElementById('metaOgType');
    const ogImgInp = document.getElementById('metaOgImage');
    const twCardSel = document.getElementById('metaTwCard');
    const twHandleInp = document.getElementById('metaTwHandle');

    const outputEl = document.getElementById('metaOutput');
    const copyBtn = document.getElementById('metaCopyBtn');

    if (!titleInp || !outputEl) return;

    function esc(s) {
      return (s || '').replace(/"/g, '&quot;');
    }

    function generate() {
      const title = titleInp.value.trim() || 'My Website Title';
      const desc = descInp.value.trim() || 'A short, engaging description of what this page offers.';
      const kw = kwInp.value.trim();
      const author = authorInp.value.trim();
      const canon = canonInp.value.trim();
      const robots = robotsSel ? robotsSel.value : 'index, follow';

      const ogType = ogTypeSel ? ogTypeSel.value : 'website';
      const ogImg = ogImgInp ? ogImgInp.value.trim() : '';
      const twCard = twCardSel ? twCardSel.value : 'summary_large_image';
      const twHandle = twHandleInp ? twHandleInp.value.trim() : '';

      let tags = '<!-- Primary Meta Tags -->\n';
      tags += `<title>${esc(title)}</title>\n`;
      tags += `<meta name="title" content="${esc(title)}">\n`;
      tags += `<meta name="description" content="${esc(desc)}">\n`;
      if (kw) tags += `<meta name="keywords" content="${esc(kw)}">\n`;
      if (author) tags += `<meta name="author" content="${esc(author)}">\n`;
      tags += `<meta name="robots" content="${esc(robots)}">\n`;
      if (canon) tags += `<link rel="canonical" href="${esc(canon)}">\n`;

      tags += '\n<!-- Open Graph / Facebook / LinkedIn -->\n';
      tags += `<meta property="og:type" content="${esc(ogType)}">\n`;
      if (canon) tags += `<meta property="og:url" content="${esc(canon)}">\n`;
      tags += `<meta property="og:title" content="${esc(title)}">\n`;
      tags += `<meta property="og:description" content="${esc(desc)}">\n`;
      if (ogImg) tags += `<meta property="og:image" content="${esc(ogImg)}">\n`;

      tags += '\n<!-- Twitter -->\n';
      tags += `<meta property="twitter:card" content="${esc(twCard)}">\n`;
      if (canon) tags += `<meta property="twitter:url" content="${esc(canon)}">\n`;
      tags += `<meta property="twitter:title" content="${esc(title)}">\n`;
      tags += `<meta property="twitter:description" content="${esc(desc)}">\n`;
      if (ogImg) tags += `<meta property="twitter:image" content="${esc(ogImg)}">\n`;
      if (twHandle) tags += `<meta property="twitter:site" content="${esc(twHandle)}">\n`;

      outputEl.value = tags;
    }

    [titleInp, descInp, kwInp, authorInp, canonInp, robotsSel, ogTypeSel, ogImgInp, twCardSel, twHandleInp].forEach(inp => {
      if (inp) inp.addEventListener('input', generate);
      if (inp) inp.addEventListener('change', generate);
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!outputEl.value) return;
        navigator.clipboard.writeText(outputEl.value).then(() => {
          if (window.TK && TK.toast) TK.toast('Meta tags copied to clipboard!', 'success');
        });
      });
    }

    generate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
