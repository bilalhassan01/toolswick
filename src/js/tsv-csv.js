// tsv-csv.js - Bidirectional TSV <-> CSV Converter
(function () {
  'use strict';

  function parseDelimited(text, delimiter) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell !== '' || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }

    return rows;
  }

  function formatDelimited(rows, delimiter, trim) {
    return rows.map(row =>
      row.map(cell => {
        let val = trim ? cell.trim() : cell;
        if (val.includes(delimiter) || val.includes('"') || val.includes('\n') || val.includes('\r')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(delimiter)
    ).join('\n');
  }

  function init() {
    const modeTabs = document.querySelectorAll('.tsv-csv-mode');
    const inputEl = document.getElementById('tsvCsvInput');
    const outputEl = document.getElementById('tsvCsvOutput');
    const fileInput = document.getElementById('tsvCsvFile');
    const openBtn = document.getElementById('tsvCsvOpenBtn');
    const convertBtn = document.getElementById('tsvCsvConvertBtn');
    const copyBtn = document.getElementById('tsvCsvCopyBtn');
    const downloadBtn = document.getElementById('tsvCsvDownloadBtn');
    const clearBtn = document.getElementById('tsvCsvClearBtn');
    const trimCheck = document.getElementById('tsvCsvTrim');
    const statsEl = document.getElementById('tsvCsvStats');

    if (!inputEl) return;

    let mode = 'tsv-to-csv'; // or 'csv-to-tsv'

    function convert() {
      const text = inputEl.value;
      if (!text.trim()) {
        outputEl.value = '';
        if (statsEl) statsEl.textContent = '';
        return;
      }

      const trim = trimCheck ? trimCheck.checked : false;

      if (mode === 'tsv-to-csv') {
        const rows = parseDelimited(text, '\t');
        const csv = formatDelimited(rows, ',', trim);
        outputEl.value = csv;
        if (statsEl) statsEl.textContent = `${rows.length} rows converted to CSV`;
      } else {
        const rows = parseDelimited(text, ',');
        const tsv = formatDelimited(rows, '\t', trim);
        outputEl.value = tsv;
        if (statsEl) statsEl.textContent = `${rows.length} rows converted to TSV`;
      }
    }

    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        mode = tab.dataset.mode;

        // Swap input and output if output has content
        if (outputEl.value) {
          const temp = inputEl.value;
          inputEl.value = outputEl.value;
          outputEl.value = '';
        }
        convert();
      });
    });

    if (convertBtn) convertBtn.addEventListener('click', convert);
    if (inputEl) inputEl.addEventListener('input', convert);
    if (trimCheck) trimCheck.addEventListener('change', convert);

    if (openBtn && fileInput) {
      openBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = ev => {
            inputEl.value = ev.target.result;
            // auto-select mode by extension
            if (file.name.endsWith('.tsv')) {
              mode = 'tsv-to-csv';
              modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === 'tsv-to-csv'));
            } else if (file.name.endsWith('.csv')) {
              mode = 'csv-to-tsv';
              modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === 'csv-to-tsv'));
            }
            convert();
          };
          reader.readAsText(file);
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!outputEl.value) return;
        navigator.clipboard.writeText(outputEl.value).then(() => {
          if (window.TK && TK.toast) TK.toast('Output copied to clipboard!', 'success');
        });
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!outputEl.value) return;
        const isCsv = mode === 'tsv-to-csv';
        const blob = new Blob([outputEl.value], { type: isCsv ? 'text/csv;charset=utf-8;' : 'text/tab-separated-values;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = isCsv ? 'converted.csv' : 'converted.tsv';
        a.click();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        outputEl.value = '';
        if (fileInput) fileInput.value = '';
        if (statsEl) statsEl.textContent = '';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
