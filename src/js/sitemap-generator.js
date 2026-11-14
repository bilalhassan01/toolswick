// sitemap-generator.js - Standard XML Sitemap Generator
(function () {
  'use strict';

  function init() {
    const urlsInp = document.getElementById('smUrls');
    const baseUrlInp = document.getElementById('smBaseUrl');
    const freqSel = document.getElementById('smChangeFreq');
    const prioSel = document.getElementById('smPriority');
    const includeDateCheck = document.getElementById('smIncludeDate');

    const generateBtn = document.getElementById('smGenerateBtn');
    const outputEl = document.getElementById('smOutput');
    const copyBtn = document.getElementById('smCopyBtn');
    const dlBtn = document.getElementById('smDlBtn');
    const countEl = document.getElementById('smCount');

    if (!urlsInp || !outputEl) return;

    function generate() {
      const raw = urlsInp.value.trim();
      if (!raw) {
        outputEl.value = '';
        if (countEl) countEl.textContent = '';
        return;
      }

      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      let baseUrl = (baseUrlInp && baseUrlInp.value.trim()) || '';
      if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';

      const freq = freqSel ? freqSel.value : 'weekly';
      const prio = prioSel ? prioSel.value : '0.8';
      const includeDate = includeDateCheck ? includeDateCheck.checked : true;
      const today = new Date().toISOString().split('T')[0];

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      let validCount = 0;
      let skippedCount = 0;
      lines.forEach(line => {
        let fullUrl = line;
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
          if (baseUrl) {
            fullUrl = baseUrl + fullUrl.replace(/^\//, '');
          } else if (fullUrl.startsWith('/')) {
            // A bare path with no Base URL cannot become a valid absolute URL
            // ('https://' + '/audit/' would be the invalid 'https:///audit/').
            skippedCount++;
            return;
          } else {
            fullUrl = 'https://' + fullUrl;
          }
        }

        // XML escape
        const safeUrl = fullUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

        xml += '  <url>\n';
        xml += `    <loc>${safeUrl}</loc>\n`;
        if (includeDate) {
          xml += `    <lastmod>${today}</lastmod>\n`;
        }
        if (freq !== 'none') {
          xml += `    <changefreq>${freq}</changefreq>\n`;
        }
        if (prio !== 'none') {
          xml += `    <priority>${prio}</priority>\n`;
        }
        xml += '  </url>\n';
        validCount++;
      });

      xml += '</urlset>\n';
      outputEl.value = xml;
      if (countEl) countEl.textContent = `${validCount} URLs generated in sitemap` + (skippedCount ? ` · ${skippedCount} skipped (bare path — set a Base URL)` : '');
    }

    if (generateBtn) generateBtn.addEventListener('click', generate);
    urlsInp.addEventListener('input', generate);
    if (baseUrlInp) baseUrlInp.addEventListener('input', generate);
    if (freqSel) freqSel.addEventListener('change', generate);
    if (prioSel) prioSel.addEventListener('change', generate);
    if (includeDateCheck) includeDateCheck.addEventListener('change', generate);

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!outputEl.value) return;
        navigator.clipboard.writeText(outputEl.value).then(() => {
          if (window.TK && TK.toast) TK.toast('Sitemap XML copied to clipboard!', 'success');
        });
      });
    }

    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        if (!outputEl.value) return;
        const blob = new Blob([outputEl.value], { type: 'application/xml;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sitemap.xml';
        a.click();
      });
    }

    // Default sample URLs
    urlsInp.value = 'https://example.com/\nhttps://example.com/about\nhttps://example.com/services\nhttps://example.com/contact';
    generate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
