// html-formatter.js - Client-Side HTML Formatter & Minifier
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('htmlFmtInput');
    const output = document.getElementById('htmlFmtOutput');
    const formatBtn = document.getElementById('htmlFmtFormatBtn');
    const minifyBtn = document.getElementById('htmlFmtMinifyBtn');
    const copyBtn = document.getElementById('htmlFmtCopyBtn');
    const clearBtn = document.getElementById('htmlFmtClearBtn');
    const indentSel = document.getElementById('htmlFmtIndent');

    if (!input || !output) return;

    function formatHtml(html, indentSize) {
      const indentStr = ' '.repeat(indentSize);
      let formatted = '';
      let indentLevel = 0;

      // Clean extra whitespace between tags
      const tokens = html.replace(/>\s*</g, '><').trim().match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || [];

      const voidTags = new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype'
      ]);

      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i].trim();
        if (!token) continue;

        if (token.startsWith('</')) {
          // Closing tag
          indentLevel = Math.max(0, indentLevel - 1);
          formatted += indentStr.repeat(indentLevel) + token + '\n';
        } else if (token.startsWith('<') && !token.startsWith('<!--')) {
          // Opening tag or self-closing
          const tagNameMatch = token.match(/^<([a-zA-Z0-9\-]+)/);
          const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
          const isSelfClosing = token.endsWith('/>') || voidTags.has(tagName);

          formatted += indentStr.repeat(indentLevel) + token + '\n';
          if (!isSelfClosing) {
            indentLevel++;
          }
        } else if (token.startsWith('<!--')) {
          // Comment
          formatted += indentStr.repeat(indentLevel) + token + '\n';
        } else {
          // Text content
          formatted += indentStr.repeat(indentLevel) + token + '\n';
        }
      }

      return formatted.trim();
    }

    function minifyHtml(html) {
      return html
        .replace(/<!--[\s\S]*?-->/g, '') // remove comments
        .replace(/\s+/g, ' ')            // collapse whitespace
        .replace(/>\s+</g, '><')         // remove space between tags
        .trim();
    }

    function runFormat() {
      const text = input.value;
      if (!text.trim()) { output.value = ''; return; }
      const indentSize = parseInt(indentSel ? indentSel.value : 2, 10) || 2;
      output.value = formatHtml(text, indentSize);
    }

    function runMinify() {
      const text = input.value;
      if (!text.trim()) { output.value = ''; return; }
      output.value = minifyHtml(text);
    }

    if (formatBtn) formatBtn.addEventListener('click', runFormat);
    if (minifyBtn) minifyBtn.addEventListener('click', runMinify);

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!output.value) return;
        navigator.clipboard.writeText(output.value).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        output.value = '';
        input.focus();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
