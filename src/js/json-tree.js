// json-tree.js - Client-Side Interactive JSON Tree Viewer with Real-Time Search & Collapsible Nodes
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('jsonTreeInput');
    const treeContainer = document.getElementById('jsonTreeContainer');
    const parseBtn = document.getElementById('jsonTreeParseBtn');
    const expandBtn = document.getElementById('jsonTreeExpandBtn');
    const collapseBtn = document.getElementById('jsonTreeCollapseBtn');
    const clearBtn = document.getElementById('jsonTreeClearBtn');
    const searchInp = document.getElementById('jsonTreeSearch');
    const errorEl = document.getElementById('jsonTreeError');
    const statsEl = document.getElementById('jsonTreeStats');

    if (!input || !treeContainer) return;

    function createNode(key, value, isLast) {
      const type = Array.isArray(value) ? 'array' : (value === null ? 'null' : typeof value);
      const li = document.createElement('li');
      li.className = 'json-tree-item';
      li.style.margin = '2px 0';
      li.style.lineHeight = '1.6';

      const keySpan = key !== null ? `<span class="json-key" style="color:#0284c7;font-weight:700;">"${key}"</span>: ` : '';

      if (type === 'object' || type === 'array') {
        const isArr = type === 'array';
        const openBracket = isArr ? '[' : '{';
        const closeBracket = isArr ? ']' : '}';
        const count = isArr ? value.length : Object.keys(value).length;

        const toggleBtn = document.createElement('span');
        toggleBtn.textContent = '▼ ';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.userSelect = 'none';
        toggleBtn.style.color = '#0d9488';
        toggleBtn.style.fontWeight = 'bold';
        toggleBtn.style.display = 'inline-block';
        toggleBtn.style.width = '16px';

        const header = document.createElement('span');
        header.innerHTML = `${keySpan}${openBracket} <span style="color:#64748b;font-size:0.75rem;">// ${count} ${count === 1 ? 'item' : 'items'}</span>`;

        const ul = document.createElement('ul');
        ul.className = 'json-tree-children';
        ul.style.listStyle = 'none';
        ul.style.paddingLeft = '20px';
        ul.style.margin = '2px 0';

        if (isArr) {
          value.forEach((v, idx) => {
            ul.appendChild(createNode(idx, v, idx === value.length - 1));
          });
        } else {
          const keys = Object.keys(value);
          keys.forEach((k, idx) => {
            ul.appendChild(createNode(k, value[k], idx === keys.length - 1));
          });
        }

        const footer = document.createElement('div');
        footer.textContent = closeBracket + (isLast ? '' : ',');
        footer.style.color = '#64748b';

        toggleBtn.addEventListener('click', () => {
          const isHidden = ul.style.display === 'none';
          ul.style.display = isHidden ? 'block' : 'none';
          toggleBtn.textContent = isHidden ? '▼ ' : '▶ ';
        });

        li.appendChild(toggleBtn);
        li.appendChild(header);
        li.appendChild(ul);
        li.appendChild(footer);
      } else {
        let valHtml = '';
        if (type === 'string') {
          valHtml = `<span style="color:#16a34a;">"${value.replace(/"/g, '&quot;')}"</span>`;
        } else if (type === 'number') {
          valHtml = `<span style="color:#d97706;font-weight:600;">${value}</span>`;
        } else if (type === 'boolean') {
          valHtml = `<span style="color:#7c3aed;font-weight:600;">${value}</span>`;
        } else if (type === 'null') {
          valHtml = `<span style="color:#94a3b8;font-style:italic;">null</span>`;
        }

        li.innerHTML = `<span style="display:inline-block;width:16px;"></span>${keySpan}${valHtml}${isLast ? '' : ','}`;
      }

      return li;
    }

    function parseAndRender() {
      const text = input.value.trim();
      if (!text) {
        treeContainer.innerHTML = '<p style="color:var(--muted);text-align:center;padding:24px;">Paste JSON above and click Build Tree View to inspect structure.</p>';
        if (errorEl) errorEl.textContent = '';
        if (statsEl) statsEl.textContent = '';
        return;
      }

      try {
        const parsed = JSON.parse(text);
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.style.display = 'none';
        }

        const rootUl = document.createElement('ul');
        rootUl.style.listStyle = 'none';
        rootUl.style.paddingLeft = '0';
        rootUl.style.margin = '0';
        rootUl.appendChild(createNode(null, parsed, true));

        treeContainer.innerHTML = '';
        treeContainer.appendChild(rootUl);

        const bytes = new Blob([text]).size;
        const keys = typeof parsed === 'object' && parsed !== null ? (Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length) : 1;
        if (statsEl) statsEl.textContent = `Valid JSON • ${(bytes / 1024).toFixed(1)} KB • ${keys} top-level nodes`;

        if (searchInp && searchInp.value) {
          filterTree(searchInp.value.trim().toLowerCase());
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = `JSON Syntax Error: ${err.message}`;
          errorEl.style.display = 'block';
        }
      }
    }

    function filterTree(q) {
      const items = treeContainer.querySelectorAll('.json-tree-item');
      if (!q) {
        items.forEach(el => {
          el.style.opacity = '1';
          el.style.backgroundColor = 'transparent';
        });
        return;
      }
      items.forEach(el => {
        const txt = el.textContent.toLowerCase();
        if (txt.includes(q)) {
          el.style.opacity = '1';
          el.style.backgroundColor = 'rgba(13, 148, 136, 0.12)';
          let p = el.parentElement;
          while (p && p !== treeContainer) {
            if (p.tagName === 'UL') p.style.display = 'block';
            p = p.parentElement;
          }
        } else {
          el.style.opacity = '0.35';
          el.style.backgroundColor = 'transparent';
        }
      });
    }

    if (parseBtn) parseBtn.addEventListener('click', parseAndRender);

    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        const uls = treeContainer.querySelectorAll('.json-tree-children');
        uls.forEach(ul => { ul.style.display = 'block'; });
        const toggles = treeContainer.querySelectorAll('.json-tree-item > span:first-child');
        toggles.forEach(t => { if (t.textContent.includes('▶')) t.textContent = '▼ '; });
      });
    }

    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        const uls = treeContainer.querySelectorAll('.json-tree-children');
        uls.forEach(ul => { ul.style.display = 'none'; });
        const toggles = treeContainer.querySelectorAll('.json-tree-item > span:first-child');
        toggles.forEach(t => { if (t.textContent.includes('▼')) t.textContent = '▶ '; });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        treeContainer.innerHTML = '<p style="color:var(--muted);text-align:center;padding:24px;">JSON input cleared.</p>';
        if (errorEl) errorEl.style.display = 'none';
        if (statsEl) statsEl.textContent = '';
      });
    }

    if (searchInp) {
      searchInp.addEventListener('input', () => {
        filterTree(searchInp.value.trim().toLowerCase());
      });
    }

    // Default sample JSON
    if (!input.value) {
      input.value = JSON.stringify({
        "app": "Toolswick",
        "version": "2.0",
        "verified": true,
        "toolsCount": 170,
        "features": ["100% Client-Side", "Zero Server Uploads", "Instant Download Buttons"],
        "privacy": {
          "tracking": false,
          "localStorageOnly": true
        }
      }, null, 2);
      parseAndRender();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
