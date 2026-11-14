// css-formatter.js - Client-Side CSS Formatter & Minifier
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('cssFmtInput');
    const output = document.getElementById('cssFmtOutput');
    const formatBtn = document.getElementById('cssFmtFormatBtn');
    const minifyBtn = document.getElementById('cssFmtMinifyBtn');
    const copyBtn = document.getElementById('cssFmtCopyBtn');
    const clearBtn = document.getElementById('cssFmtClearBtn');
    const indentSel = document.getElementById('cssFmtIndent');

    if (!input || !output) return;

    function formatCss(css, indentSize) {
      const indentStr = ' '.repeat(indentSize);
      let formatted = '';
      let indentLevel = 0;

      // Normalize comments and spacing
      css = css.replace(/\/\*[\s\S]*?\*\//g, m => '\n' + m + '\n');
      css = css.replace(/\s+/g, ' ').replace(/\s*\{\s*/g, ' {\n').replace(/\s*;\s*/g, ';\n').replace(/\s*\}\s*/g, '\n}\n');

      const lines = css.split('\n').map(l => l.trim()).filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.endsWith('}')) {
          indentLevel = Math.max(0, indentLevel - 1);
          formatted += indentStr.repeat(indentLevel) + line + '\n\n';
        } else if (line.endsWith('{')) {
          formatted += indentStr.repeat(indentLevel) + line + '\n';
          indentLevel++;
        } else {
          // Property or declaration — always end with a semicolon
          if (line.includes(':')) {
            const parts = line.split(':');
            const prop = parts[0].trim();
            const val = parts.slice(1).join(':').trim();
            formatted += indentStr.repeat(indentLevel) + prop + ': ' + val + (val.endsWith(';') ? '' : ';') + '\n';
          } else {
            formatted += indentStr.repeat(indentLevel) + line + '\n';
          }
        }
      }

      return formatted.trim();
    }

    function minifyCss(css) {
      return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s+/g, ' ')            // collapse whitespace
        .replace(/\s*([\{\}:;,])\s*/g, '$1') // remove space around separators
        .replace(/;}/g, '}')             // remove trailing semicolon
        .trim();
    }

    function runFormat() {
      const text = input.value;
      if (!text.trim()) { output.value = ''; return; }
      const indentSize = parseInt(indentSel ? indentSel.value : 2, 10) || 2;
      output.value = formatCss(text, indentSize);
    }

    function runMinify() {
      const text = input.value;
      if (!text.trim()) { output.value = ''; return; }
      output.value = minifyCss(text);
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
