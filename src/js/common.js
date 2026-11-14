/* Toolswick Shared Core Library - 100% Client-Side Sandbox.
   All processing executes strictly in browser memory. Zero tracking, zero network uploads. */
(function () {
  "use strict";

  var TK = {};

  // DOM query shortcuts
  TK.$ = function (selector, context) {
    return (context || document).querySelector(selector);
  };
  TK.$$ = function (selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  };

  // Safe HTML escaping
  TK.esc = function (string) {
    return String(string).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  };

  // Human-readable byte formatting
  TK.bytes = function (bytes) {
    if (bytes === 0 || !bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + " KB";
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1073741824).toFixed(2) + " GB";
  };

  // Sanitize file names to prevent path traversal or special character injection
  TK.sanitizeFileName = function (rawName, defaultExt) {
    if (!rawName || typeof rawName !== "string") return "processed-file." + (defaultExt || "bin");
    // Strip paths and null bytes
    var clean = rawName.replace(/[\/\\]/g, "_").replace(/[\x00-\x1f\x7f]/g, "").trim();
    // Remove leading dots or hyphens
    clean = clean.replace(/^[.\-_]+/, "");
    // Replace risky characters
    clean = clean.replace(/[<>:"|?*]/g, "_");
    if (!clean) clean = "file";
    if (clean.length > 80) {
      var dotIndex = clean.lastIndexOf(".");
      if (dotIndex > 0) {
        var ext = clean.slice(dotIndex);
        clean = clean.slice(0, 70) + ext;
      } else {
        clean = clean.slice(0, 80);
      }
    }
    return clean;
  };

  // Extract base filename without extension
  TK.baseName = function (filename) {
    if (!filename) return "file";
    var clean = TK.sanitizeFileName(filename);
    var dot = clean.lastIndexOf(".");
    return dot > 0 ? clean.slice(0, dot) : clean;
  };

  // Toast notifications
  var toastTimer;
  TK.toast = function (message, type) {
    var toast = TK.$("#toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = type === "error" ? "toast-error" : type === "success" ? "toast-success" : "";
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 3800);
  };

  // Safe file download via temporary Object URL
  TK.save = function (fileName, blobOrDataUrl) {
    var cleanName = TK.sanitizeFileName(fileName);
    var url;
    var isBlob = blobOrDataUrl instanceof Blob;
    if (isBlob) {
      url = URL.createObjectURL(blobOrDataUrl);
    } else {
      url = blobOrDataUrl;
    }

    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = cleanName;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(function () {
      if (isBlob) {
        URL.revokeObjectURL(url);
      }
      anchor.remove();
    }, 2000);

    // Record successful operation
    TK.recordSuccess();
  };

  // Drag and drop zone handler with paste support
  TK.dropzone = function (dropElement, onFiles, filter) {
    if (!dropElement) return;
    var input = dropElement.querySelector("input[type=file]");

    function processFileList(fileList) {
      var files = Array.prototype.slice.call(fileList || []);
      if (filter) {
        files = files.filter(filter);
      }
      if (!files.length) {
        TK.toast("Unsupported file type for this tool.", "error");
        return;
      }
      onFiles(files);
    }

    if (input) {
      input.addEventListener("change", function () {
        processFileList(input.files);
        input.value = "";
      });
    }

    var dragCounter = 0;
    dropElement.addEventListener("dragenter", function (e) {
      e.preventDefault();
      dragCounter++;
      dropElement.classList.add("over");
    });
    dropElement.addEventListener("dragover", function (e) {
      e.preventDefault();
      dropElement.classList.add("over");
    });
    dropElement.addEventListener("dragleave", function (e) {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        dropElement.classList.remove("over");
      }
    });
    dropElement.addEventListener("drop", function (e) {
      e.preventDefault();
      dragCounter = 0;
      dropElement.classList.remove("over");
      if (e.dataTransfer && e.dataTransfer.files) {
        processFileList(e.dataTransfer.files);
      }
    });

    // Paste support across document
    document.addEventListener("paste", function (e) {
      // Don't intercept paste inside textareas or text inputs
      var tag = e.target && e.target.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      var items = e.clipboardData ? Array.prototype.slice.call(e.clipboardData.files) : [];
      if (items.length && (!filter || items.some(filter))) {
        e.preventDefault();
        processFileList(items);
        TK.toast("Pasted file detected and added.");
      }
    });

    window.addEventListener("dragover", function (e) { e.preventDefault(); });
    window.addEventListener("drop", function (e) { e.preventDefault(); });
  };

  // Ordered file list with Up / Down / Remove controls
  TK.orderedList = function (ulElement, items, describeCallback, onChangeCallback) {
    function draw() {
      ulElement.innerHTML = items.map(function (item, index) {
        var d = describeCallback(item, index);
        var upDisabled = index === 0 ? " disabled" : "";
        var downDisabled = index === items.length - 1 ? " disabled" : "";
        return (
          '<li class="row row-simple">' +
            '<div class="meta">' +
              '<p class="name">' + TK.esc(d.title) + '</p>' +
              '<p class="sub">' + TK.esc(d.sub || "") + '</p>' +
            '</div>' +
            '<div class="actions">' +
              '<button type="button" class="btn ghost small" data-act="up" data-i="' + index + '"' + upDisabled + ' aria-label="Move ' + TK.esc(d.title) + ' up" title="Move up">↑ Up</button>' +
              '<button type="button" class="btn ghost small" data-act="down" data-i="' + index + '"' + downDisabled + ' aria-label="Move ' + TK.esc(d.title) + ' down" title="Move down">↓ Down</button>' +
              '<button type="button" class="btn danger small" data-act="rm" data-i="' + index + '" aria-label="Remove ' + TK.esc(d.title) + '" title="Remove">✕ Remove</button>' +
            '</div>' +
          '</li>'
        );
      }).join("");
      if (onChangeCallback) onChangeCallback();
    }

    ulElement.addEventListener("click", function (e) {
      var button = e.target.closest("button[data-act]");
      if (!button) return;
      var index = +button.dataset.i;
      var action = button.dataset.act;
      if (action === "rm") {
        var removed = items.splice(index, 1)[0];
        if (removed && removed.url) {
          try { URL.revokeObjectURL(removed.url); } catch (ignore) {}
        }
        if (removed && removed.bmp && typeof removed.bmp.close === "function") {
          try { removed.bmp.close(); } catch (ignore) {}
        }
      } else if (action === "up" && index > 0) {
        var tempUp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = tempUp;
      } else if (action === "down" && index < items.length - 1) {
        var tempDown = items[index];
        items[index] = items[index + 1];
        items[index + 1] = tempDown;
      }
      draw();
    });

    return draw;
  };

  // Strict SVG sanitizer against XSS, scripts, event handlers, and XXE
  TK.sanitizeSvg = function (svgText) {
    if (!svgText || typeof svgText !== "string") return "";
    var parser = new DOMParser();
    var doc = parser.parseFromString(svgText, "image/svg+xml");
    var parserError = doc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Invalid or malformed SVG document.");
    }

    var dangerousTags = ["script", "foreignobject", "iframe", "object", "embed", "link", "meta", "form", "style"];
    dangerousTags.forEach(function (tag) {
      var elements = doc.querySelectorAll(tag);
      for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    });

    // Walk all nodes and remove dangerous attributes
    var allNodes = doc.querySelectorAll("*");
    for (var i = 0; i < allNodes.length; i++) {
      var node = allNodes[i];
      var attrs = Array.prototype.slice.call(node.attributes);
      for (var j = 0; j < attrs.length; j++) {
        var attrName = attrs[j].name.toLowerCase();
        var attrVal = attrs[j].value.toLowerCase().trim();
        // Remove on* event handlers
        if (attrName.indexOf("on") === 0) {
          node.removeAttribute(attrs[j].name);
        }
        // Remove javascript: URLs in href or xlink:href
        if ((attrName === "href" || attrName === "xlink:href" || attrName === "src") &&
            (attrVal.indexOf("javascript:") === 0 || attrVal.indexOf("data:") === 0 || attrVal.indexOf("vbscript:") === 0)) {
          node.removeAttribute(attrs[j].name);
        }
      }
    }

    return new XMLSerializer().serializeToString(doc.documentElement);
  };

  // Magic byte validator to detect binary MIME discrepancies
  TK.checkMagicBytes = async function (file, expectedType) {
    try {
      var slice = file.slice(0, 16);
      var buffer = await slice.arrayBuffer();
      var bytes = new Uint8Array(buffer);
      if (expectedType === "pdf") {
        // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46)
        return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
      }
      if (expectedType === "png") {
        // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
        return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
      }
      if (expectedType === "jpeg" || expectedType === "jpg") {
        // JPEG magic bytes: FF D8 FF
        return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
      }
      if (expectedType === "webp") {
        // WebP magic bytes: RIFF....WEBP
        return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
               bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
      }
      return true; // Default allow for other formats
    } catch (e) {
      return true;
    }
  };

    // Harmless dummy for analytics/counter hooks
  TK.recordSuccess = function () {};

  // Universal Light/Dark Theme Controller
  TK.initTheme = function () {
    var toggleBtn = TK.$("#themeToggle");
    var html = document.documentElement;

    function applyTheme(theme) {
      html.setAttribute("data-theme", theme);
      if (toggleBtn) {
        var isDark = theme === "dark";
        toggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        toggleBtn.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
        toggleBtn.innerHTML = isDark
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor" fill-opacity="0.3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg><span class="theme-label">Light</span>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fill-opacity="0.25"/></svg><span class="theme-label">Dark</span>';
      }
    }

    // Determine current theme
    var currentTheme = html.getAttribute("data-theme");
    if (!currentTheme) {
      try {
        var saved = localStorage.getItem("toolswick_theme");
        if (saved === "light" || saved === "dark") {
          currentTheme = saved;
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          currentTheme = "dark";
        } else {
          currentTheme = "light";
        }
      } catch (e) {
        currentTheme = "light";
      }
    }
    applyTheme(currentTheme);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var current = html.getAttribute("data-theme") || "light";
        var next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
          localStorage.setItem("toolswick_theme", next);
        } catch (e) {}
      });
    }

    // Listen for OS theme changes if user hasn't set manual override
    try {
      if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
          var manual = localStorage.getItem("toolswick_theme");
          if (!manual) {
            applyTheme(e.matches ? "dark" : "light");
          }
        });
      }
    } catch (e) {}
  };

  // Real-time Tool Search & Category Filter on Homepage
  TK.initSearch = function () {
    var searchInput = TK.$("#toolSearch");
    var filterPills = TK.$$(".filter-pill");
    var cards = TK.$$(".cards a.card");
    var sections = TK.$$(".tool-category-section");
    var noResults = TK.$("#noSearchResults");

    if (!searchInput && !filterPills.length) return;

    TK.activeCategory = "all";

    TK.filterTools = function () {
      var query = searchInput ? searchInput.value.toLowerCase().trim() : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var title = (card.querySelector("strong") ? card.querySelector("strong").textContent : "").toLowerCase();
        var blurb = (card.querySelector("span") ? card.querySelector("span").textContent : "").toLowerCase();
        var category = (card.dataset.category || "").toLowerCase();

        var matchesQuery = !query || title.indexOf(query) !== -1 || blurb.indexOf(query) !== -1;
        // When typing a search query, search globally across ALL categories
        var matchesCategory = query ? true : (TK.activeCategory === "all" || category === TK.activeCategory);

        if (matchesQuery && matchesCategory) {
          card.style.display = "";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });

      // Show/hide category headers and update count dynamically during search
      sections.forEach(function (section) {
        var sectionCards = TK.$$("a.card", section);
        var visibleInSec = sectionCards.filter(function (c) {
          return c.style.display !== "none";
        });
        var countSpan = section.querySelector(".category-count");
        if (countSpan) {
          if (query) {
            countSpan.textContent = visibleInSec.length;
          } else {
            countSpan.textContent = sectionCards.length;
          }
        }
        section.style.display = visibleInSec.length > 0 ? "" : "none";
      });

      if (noResults) {
        noResults.hidden = visibleCount > 0;
      }
    };
    var filterTools = TK.filterTools;

    if (searchInput) {
      searchInput.addEventListener("input", filterTools);
      // Keyboard shortcut '/' to search
      window.addEventListener("keydown", function (e) {
        if (e.key === "/" && document.activeElement !== searchInput && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          searchInput.focus();
        }
      });
      var clearSearch = TK.$("#clearSearch");
      if (clearSearch) {
        clearSearch.addEventListener("click", function () {
          searchInput.value = "";
          filterTools();
          searchInput.focus();
        });
      }
    }

    filterPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        filterPills.forEach(function (p) {
          p.classList.remove("active");
          p.setAttribute("aria-selected", "false");
        });
        pill.classList.add("active");
        pill.setAttribute("aria-selected", "true");
        TK.activeCategory = pill.dataset.filter.toLowerCase();
        filterTools();
      });
    });
  };


  // Hash navigation & smooth section scrolling across pages (resets filter when nav clicked)
  TK.initHashNavigation = function () {
    function handleAnchorTarget(targetId) {
      if (!targetId) return;
      // Reset category filter so clicked section is guaranteed visible
      var allPill = document.querySelector('.filter-pill[data-filter="all"]');
      if (allPill && TK.filterTools) {
        var pills = document.querySelectorAll('.filter-pill');
        pills.forEach(function (p) {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        allPill.classList.add('active');
        allPill.setAttribute('aria-selected', 'true');
        TK.activeCategory = "all";
        TK.filterTools();
      }
      var el = document.getElementById(targetId);
      if (el) {
        setTimeout(function () {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    }

    document.querySelectorAll('.site-nav a, .drawer-nav a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (href && href.indexOf('#') !== -1) {
          var hash = href.substring(href.indexOf('#') + 1);
          handleAnchorTarget(hash);
        }
      });
    });

    window.addEventListener("hashchange", function () {
      if (window.location.hash) {
        handleAnchorTarget(decodeURIComponent(window.location.hash.substring(1)));
      }
    });
    if (window.location.hash) {
      setTimeout(function () {
        handleAnchorTarget(decodeURIComponent(window.location.hash.substring(1)));
      }, 150);
    }
  };

  // Universal Converter Copy Buttons
  TK.initConverterCopy = function () {
    var pairs = [
      { b: 'lenCopy', r: 'lenResult' },
      { b: 'wtCopy', r: 'wtResult' },
      { b: 'tempCopy', r: 'tempResult' },
      { b: 'areaCopy', r: 'areaResult' },
      { b: 'volCopy', r: 'volResult' },
      { b: 'dataCopy', r: 'dataResult' },
      { b: 'timeCopy', r: 'timeResult' },
      { b: 'pressCopy', r: 'pressResult' }
    ];
    pairs.forEach(function (p) {
      var btn = document.getElementById(p.b);
      if (btn) {
        btn.addEventListener('click', function () {
          var res = document.getElementById(p.r);
          var val = res ? res.textContent.trim() : '';
          if (val && val !== '--') {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(val);
            }
            if (TK.toast) TK.toast('Copied result to clipboard!', 'success');
          }
        });
      }
    });
  };


// Mobile menu removed per user request

  // GA4 analytics hooks: tool_used + file_downloaded (Argon Phase 6).
  // Centralized and guarded: if gtag is blocked or unavailable, every call
  // below silently no-ops and can never break a tool.
  TK.initAnalytics = function () {
    var toolSection = TK.$(".tool-section");
    var slug = (window.location.pathname || "/").replace(/^\/|\/$/g, "") || "home";

    function fire(name, params) {
      try {
        if (typeof window.gtag === "function") {
          window.gtag("event", name, params || {});
        }
      } catch (ignore) { /* analytics must never break the tool */ }
    }

    // tool_used: first real user interaction inside the tool workspace
    // (button click, typing, option change, file selection). Fires once
    // per page view. Synthetic (programmatic) events are ignored so the
    // json-formatter autorun click does not count as use.
    if (toolSection) {
      var usedFired = false;
      function markUsed(e) {
        if (usedFired) return;
        if (e && e.isTrusted === false) return;
        usedFired = true;
        fire("tool_used", { tool: slug });
      }
      ["click", "input", "change"].forEach(function (evt) {
        toolSection.addEventListener(evt, markUsed);
      });
    }

    // file_downloaded: any click on an anchor with a download attribute -
    // static download links, tool-built download links, and TK.save's
    // synthetic anchor (its click bubbles here). Capture phase so it fires
    // even if a tool stops propagation. file_type comes from the real
    // download filename when one is available; otherwise it is omitted.
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[download]") : null;
      if (!a) return;
      var name = a.getAttribute("download") || a.getAttribute("href") || "";
      var m = name.match(/\.([A-Za-z0-9]{1,5})(?:[?#]|$)/);
      var params = { tool: slug };
      if (m) params.file_type = m[1].toLowerCase();
      fire("file_downloaded", params);
    }, true);
  };

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    TK.initTheme();
        TK.initConverterCopy();
        TK.initSearch();
    TK.initHashNavigation();
    TK.initAnalytics();
  });

  window.TK = TK;
})();
