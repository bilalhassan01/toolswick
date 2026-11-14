// word-counter.js - Client-Side Word, Character, Sentence and Text Statistics
(function () {
  'use strict';

  function init() {
    var textEl = document.getElementById("text");
    var clearBtn = document.getElementById("clearBtn");
    var uploadBtn = document.getElementById("wordUploadBtn");
    var fileInput = document.getElementById("wordFileInput");

    if (!textEl) return;

    function calc() {
      var t = textEl.value || "";
      var trimmed = t.trim();
      var words = trimmed ? trimmed.split(/\s+/).length : 0;
      var sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || []).length : 0;
      var paras = trimmed ? trimmed.split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length : 0;

      function mins(wpm) {
        var m = words / wpm;
        return words === 0 ? "0 sec" : m < 1 ? Math.max(1, Math.round(m * 60)) + " sec" : Math.round(m * 10) / 10 + " min";
      }

      function estReadingTime(w) {
        if (w === 0) return "0 min";
        var m = Math.round((w / 200) * 2) / 2;
        return Math.max(0.5, m) + " min";
      }

      var vals = {
        w: words,
        c: t.length,
        cs: t.replace(/\s/g, "").length,
        s: sentences,
        p: paras,
        rt: estReadingTime(words),
        st: mins(130)
      };

      Object.keys(vals).forEach(function (k) {
        var el = document.getElementById("v-" + k);
        if (el) el.textContent = typeof vals[k] === "number" ? vals[k].toLocaleString() : vals[k];
      });
    }

    textEl.addEventListener("input", calc);

    // Drag and drop text files directly onto the textarea
    textEl.addEventListener("dragover", function (e) {
      e.preventDefault();
      textEl.style.borderColor = "var(--primary)";
    });
    textEl.addEventListener("dragleave", function () {
      textEl.style.borderColor = "";
    });
    textEl.addEventListener("drop", function (e) {
      e.preventDefault();
      textEl.style.borderColor = "";
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        textEl.value = "";
        calc();
        textEl.focus();
      });
    }

    function loadFile(file) {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        if (window.TK && TK.toast) TK.toast("File exceeds 10MB limit.", "error");
        if (fileInput) fileInput.value = "";
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        var content = (e.target && e.target.result) || "";
        textEl.value = content;
        calc();
        if (fileInput) fileInput.value = "";
        if (window.TK && TK.toast) TK.toast("Loaded " + file.name + " (" + (file.size / 1024).toFixed(1) + " KB)", "success");
      };
      reader.onerror = function () {
        if (window.TK && TK.toast) TK.toast("Failed to read text file.", "error");
        if (fileInput) fileInput.value = "";
      };
      reader.readAsText(file, "UTF-8");
    }

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener("click", function () {
        fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", function (e) {
        var file = (e.target && e.target.files && e.target.files[0]) || (fileInput.files && fileInput.files[0]);
        if (file) loadFile(file);
      });
    }

    calc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
