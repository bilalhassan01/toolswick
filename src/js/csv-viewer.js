// csv-viewer.js - Interactive CSV Viewer, Table, Search & Exporter
(function () {
  'use strict';

  function parseCsv(text, delimiter) {
    if (!delimiter || delimiter === 'auto') {
      const firstLine = text.split('\n')[0] || '';
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const semiCount = (firstLine.match(/;/g) || []).length;
      if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t';
      else if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';
      else delimiter = ',';
    }

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
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++; // CRLF
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell !== '' || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  function init() {
    const fileInput = document.getElementById('csvFileInput');
    const dropZone = document.getElementById('csvDropZone');
    const pasteInput = document.getElementById('csvPasteInput');
    const parseBtn = document.getElementById('csvParseBtn');
    const clearBtn = document.getElementById('csvClearBtn');

    const delimSelect = document.getElementById('csvDelimiter');
    const headerCheck = document.getElementById('csvHeaderCheck');

    const tableArea = document.getElementById('csvTableArea');
    const statsEl = document.getElementById('csvStats');
    const searchInput = document.getElementById('csvSearchInput');
    const pageSizeSelect = document.getElementById('csvPageSize');
    const tableEl = document.getElementById('csvTable');

    const prevBtn = document.getElementById('csvPrevBtn');
    const nextBtn = document.getElementById('csvNextBtn');
    const pageInfo = document.getElementById('csvPageInfo');

    const exportCsvBtn = document.getElementById('csvExportCsvBtn');
    const exportJsonBtn = document.getElementById('csvExportJsonBtn');

    if (!fileInput && !pasteInput) return;

    let parsedHeaders = [];
    let parsedRows = [];
    let filteredRows = [];
    let currentPage = 1;
    let pageSize = 25;
    let sortCol = null;
    let sortAsc = true;

    function renderTable() {
      if (!tableEl) return;
      tableEl.innerHTML = '';

      if (parsedHeaders.length === 0 && parsedRows.length === 0) {
        if (tableArea) tableArea.style.display = 'none';
        return;
      }

      if (tableArea) tableArea.style.display = 'block';

      // Apply search filter
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
      if (!query) {
        filteredRows = [...parsedRows];
      } else {
        filteredRows = parsedRows.filter(row =>
          row.some(cell => String(cell).toLowerCase().includes(query))
        );
      }

      // Apply sorting
      if (sortCol !== null) {
        filteredRows.sort((a, b) => {
          const valA = a[sortCol] || '';
          const valB = b[sortCol] || '';
          const numA = parseFloat(valA);
          const numB = parseFloat(valB);
          if (!isNaN(numA) && !isNaN(numB)) {
            return sortAsc ? numA - numB : numB - numA;
          }
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
      }

      // Pagination
      const totalRows = filteredRows.length;
      let startIdx = 0;
      let endIdx = totalRows;

      if (pageSize !== 'all') {
        const pSize = parseInt(pageSize, 10);
        const maxPages = Math.max(1, Math.ceil(totalRows / pSize));
        if (currentPage > maxPages) currentPage = maxPages;
        if (currentPage < 1) currentPage = 1;

        startIdx = (currentPage - 1) * pSize;
        endIdx = Math.min(startIdx + pSize, totalRows);

        if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${maxPages} (${totalRows} total rows)`;
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= maxPages;
      } else {
        if (pageInfo) pageInfo.textContent = `Showing all ${totalRows} rows`;
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
      }

      const rowsToShow = filteredRows.slice(startIdx, endIdx);

      // Render thead
      const thead = document.createElement('thead');
      const trHead = document.createElement('tr');
      parsedHeaders.forEach((colName, idx) => {
        const th = document.createElement('th');
        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';
        let arrow = '';
        if (sortCol === idx) {
          arrow = sortAsc ? ' ↑' : ' ↓';
        }
        th.textContent = colName + arrow;
        th.addEventListener('click', () => {
          if (sortCol === idx) {
            sortAsc = !sortAsc;
          } else {
            sortCol = idx;
            sortAsc = true;
          }
          renderTable();
        });
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      tableEl.appendChild(thead);

      // Render tbody
      const tbody = document.createElement('tbody');
      rowsToShow.forEach(row => {
        const tr = document.createElement('tr');
        parsedHeaders.forEach((_, colIdx) => {
          const td = document.createElement('td');
          td.textContent = row[colIdx] !== undefined ? row[colIdx] : '';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      tableEl.appendChild(tbody);

      if (statsEl) {
        statsEl.textContent = totalRows === parsedRows.length
          ? `${parsedRows.length} rows · ${parsedHeaders.length} columns`
          : `${totalRows} of ${parsedRows.length} rows · ${parsedHeaders.length} columns`;
      }
    }

    function processContent(text) {
      if (!text || !text.trim()) {
        if (window.TK && TK.toast) TK.toast('Please select a file or paste CSV text.', 'warning');
        return;
      }

      const delimiter = delimSelect ? delimSelect.value : 'auto';
      const hasHeader = headerCheck ? headerCheck.checked : true;

      const allRows = parseCsv(text, delimiter);
      if (allRows.length === 0) {
        if (window.TK && TK.toast) TK.toast('No rows found in CSV data.', 'warning');
        return;
      }

      if (hasHeader) {
        parsedHeaders = allRows[0];
        parsedRows = allRows.slice(1);
      } else {
        const colCount = Math.max(...allRows.map(r => r.length));
        parsedHeaders = Array.from({ length: colCount }, (_, i) => `Col ${i + 1}`);
        parsedRows = allRows;
      }

      currentPage = 1;
      sortCol = null;
      sortAsc = true;
      renderTable();
    }

    if (fileInput) {
      fileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = ev => {
            const content = ev.target.result;
            if (pasteInput) pasteInput.value = content.length > 50000 ? content.slice(0, 50000) + '... (truncated view)' : content;
            processContent(content);
          };
          reader.readAsText(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const reader = new FileReader();
          reader.onload = ev => {
            const content = ev.target.result;
            if (pasteInput) pasteInput.value = content.length > 50000 ? content.slice(0, 50000) + '... (truncated view)' : content;
            processContent(content);
          };
          reader.readAsText(e.dataTransfer.files[0]);
        }
      });
      dropZone.addEventListener('click', () => fileInput.click());
    }

    if (parseBtn) {
      parseBtn.addEventListener('click', () => {
        if (pasteInput) processContent(pasteInput.value);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (pasteInput) pasteInput.value = '';
        if (fileInput) fileInput.value = '';
        parsedHeaders = [];
        parsedRows = [];
        filteredRows = [];
        if (tableArea) tableArea.style.display = 'none';
        if (statsEl) statsEl.textContent = '';
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderTable();
      });
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', () => {
        pageSize = pageSizeSelect.value === 'all' ? 'all' : parseInt(pageSizeSelect.value, 10);
        currentPage = 1;
        renderTable();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTable();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentPage++;
        renderTable();
      });
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        if (parsedHeaders.length === 0) return;
        const out = [parsedHeaders, ...filteredRows].map(row =>
          row.map(cell => {
            const s = String(cell || '');
            return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
          }).join(',')
        ).join('\n');

        const blob = new Blob([out], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported-table.csv';
        a.click();
      });
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        if (parsedHeaders.length === 0) return;
        const jsonObj = filteredRows.map(row => {
          const item = {};
          parsedHeaders.forEach((h, idx) => {
            item[h] = row[idx] !== undefined ? row[idx] : null;
          });
          return item;
        });

        const blob = new Blob([JSON.stringify(jsonObj, null, 2)], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported-data.json';
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
