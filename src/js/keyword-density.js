// keyword-density.js - SEO Keyword Density & N-Gram Frequency Analyzer
(function () {
  'use strict';

  const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
    'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
    'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor',
    'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out',
    'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
    'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
    'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  function init() {
    const textInp = document.getElementById('kdInput');
    const stopCheck = document.getElementById('kdStopWords');
    const minLenInp = document.getElementById('kdMinLen');
    const analyzeBtn = document.getElementById('kdAnalyzeBtn');
    const clearBtn = document.getElementById('kdClearBtn');
    const exportBtn = document.getElementById('kdExportBtn');

    const totalWordsEl = document.getElementById('kdTotalWords');
    const uniqueWordsEl = document.getElementById('kdUniqueWords');
    const readTimeEl = document.getElementById('kdReadTime');

    const table1 = document.getElementById('kdTable1');
    const table2 = document.getElementById('kdTable2');
    const table3 = document.getElementById('kdTable3');
    const resultsArea = document.getElementById('kdResults');

    if (!textInp) return;

    let current1Gram = [];

    function analyze() {
      const text = textInp.value;
      if (!text.trim()) {
        if (resultsArea) resultsArea.style.display = 'none';
        return;
      }

      const ignoreStop = stopCheck ? stopCheck.checked : true;
      const minLen = parseInt(minLenInp ? minLenInp.value : 3, 10) || 3;

      // Tokenize into clean lowercase words
      const rawWords = text.toLowerCase().match(/\b[a-z0-9'-]+\b/g) || [];
      const totalWords = rawWords.length;

      if (totalWords === 0) {
        if (resultsArea) resultsArea.style.display = 'none';
        return;
      }

      // Filter words for 1-gram
      const filteredWords = rawWords.filter(w => {
        if (w.length < minLen) return false;
        if (ignoreStop && STOP_WORDS.has(w)) return false;
        return true;
      });

      // 1-gram frequency
      const freq1 = {};
      filteredWords.forEach(w => {
        freq1[w] = (freq1[w] || 0) + 1;
      });

      // 2-gram frequency
      const freq2 = {};
      for (let i = 0; i < rawWords.length - 1; i++) {
        const w1 = rawWords[i];
        const w2 = rawWords[i + 1];
        if (ignoreStop && (STOP_WORDS.has(w1) && STOP_WORDS.has(w2))) continue;
        const phrase = `${w1} ${w2}`;
        freq2[phrase] = (freq2[phrase] || 0) + 1;
      }

      // 3-gram frequency
      const freq3 = {};
      for (let i = 0; i < rawWords.length - 2; i++) {
        const w1 = rawWords[i];
        const w2 = rawWords[i + 1];
        const w3 = rawWords[i + 2];
        if (ignoreStop && (STOP_WORDS.has(w1) && STOP_WORDS.has(w2) && STOP_WORDS.has(w3))) continue;
        const phrase = `${w1} ${w2} ${w3}`;
        freq3[phrase] = (freq3[phrase] || 0) + 1;
      }

      // Sort frequencies
      const sortF = (f) => Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const top1 = sortF(freq1);
      const top2 = sortF(freq2);
      const top3 = sortF(freq3);
      current1Gram = top1;

      // Stats
      if (totalWordsEl) totalWordsEl.textContent = totalWords.toLocaleString();
      if (uniqueWordsEl) uniqueWordsEl.textContent = Object.keys(freq1).length.toLocaleString();
      if (readTimeEl) readTimeEl.textContent = `~${Math.ceil(totalWords / 200)} min`;

      // Render helper
      function renderTable(el, list, totalRef) {
        if (!el) return;
        el.innerHTML = '';
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr style="border-bottom:1px solid var(--border);"><th style="text-align:left;padding:6px;">Keyword / Phrase</th><th style="text-align:center;padding:6px;width:70px;">Count</th><th style="text-align:right;padding:6px;width:80px;">Density</th></tr>';
        el.appendChild(thead);

        const tbody = document.createElement('tbody');
        list.forEach(([phrase, count]) => {
          const density = ((count / totalRef) * 100).toFixed(2);
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--border)';
          const warning = parseFloat(density) > 3 ? ' <span style="color:var(--bad,#ef4444);font-size:0.75rem;">(High)</span>' : '';
          tr.innerHTML = `
            <td style="padding:6px;">${phrase}</td>
            <td style="text-align:center;padding:6px;">${count}</td>
            <td style="text-align:right;padding:6px;font-weight:600;">${density}%${warning}</td>
          `;
          tbody.appendChild(tr);
        });
        el.appendChild(tbody);
      }

      renderTable(table1, top1, totalWords);
      renderTable(table2, top2, Math.max(1, totalWords - 1));
      renderTable(table3, top3, Math.max(1, totalWords - 2));

      if (resultsArea) resultsArea.style.display = 'block';
    }

    if (analyzeBtn) analyzeBtn.addEventListener('click', analyze);
    textInp.addEventListener('input', () => {
      if (textInp.value.length < 5000) analyze();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        textInp.value = '';
        if (resultsArea) resultsArea.style.display = 'none';
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (!current1Gram.length) return;
        let csv = 'Keyword,Count\n';
        current1Gram.forEach(([k, c]) => {
          csv += `"${k}",${c}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'keyword-density.csv';
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
