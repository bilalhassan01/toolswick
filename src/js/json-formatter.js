/* Toolswick JSON Formatter & Validator - 100% Client-Side. */
(function () {
  "use strict";

  var $ = TK.$;

  function sortKeys(v) {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (v && typeof v === "object") {
      var o = {};
      Object.keys(v).sort().forEach(function (k) {
        o[k] = sortKeys(v[k]);
      });
      return o;
    }
    return v;
  }

  function run(minify) {
    var src = $("#in") ? $("#in").value : "";
    var msg = $("#msg");
    var out = $("#out");
    if (!out || !msg) return;

    if (!src.trim()) {
      msg.className = "hint";
      msg.textContent = "Paste or type JSON data above to format or validate.";
      out.value = "";
      return;
    }

    if (src.length > 5000000) { // 5MB guard to prevent thread lock
      msg.className = "bad";
      msg.textContent = "File is very large (" + TK.bytes(src.length) + "). Formatting may take several seconds.";
    }

    try {
      var data = JSON.parse(src);
      var indentVal = $("#indent") ? $("#indent").value : "2";
      var ind = indentVal === "tab" ? "\t" : parseInt(indentVal, 10);
      var sortCheck = $("#sort") && $("#sort").checked;

      if (sortCheck) {
        data = sortKeys(data);
      }

      var formatted = minify ? JSON.stringify(data) : JSON.stringify(data, null, ind);
      out.value = formatted;
      msg.className = "ok";
      msg.textContent = "✓ Valid JSON · " + TK.bytes(new Blob([formatted]).size);
      TK.recordSuccess();
    } catch (e) {
      out.value = "";
      msg.className = "bad";
      msg.textContent = "✗ Invalid JSON: " + e.message;
    }
  }

  var fmtBtn = $("#fmtBtn");
  if (fmtBtn) fmtBtn.addEventListener("click", function () { run(false); });

  var minBtn = $("#minBtn");
  if (minBtn) minBtn.addEventListener("click", function () { run(true); });

  var clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if ($("#in")) $("#in").value = "";
      if ($("#out")) $("#out").value = "";
      if ($("#msg")) $("#msg").textContent = "";
      var fileInput = $("#jsonFileInput");
      if (fileInput) fileInput.value = "";
    });
  }

  var fileInput = $("#jsonFileInput");
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        TK.toast("File exceeds 5MB limit (" + TK.bytes(file.size) + ").", "error");
        fileInput.value = "";
        return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        var inEl = $("#in");
        if (inEl) {
          inEl.value = e.target.result;
          run(false);
        }
        fileInput.value = "";
        TK.toast("JSON file loaded successfully.", "success");
      };
      reader.onerror = function () {
        TK.toast("Failed to read JSON file.", "error");
        fileInput.value = "";
      };
      reader.readAsText(file);
    });
  }

  var copyBtn = $("#copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var out = $("#out");
      var v = out ? out.value : "";
      if (!v) {
        TK.toast("Nothing to copy yet.", "error");
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(
          function () { TK.toast("Copied JSON to clipboard!", "success"); },
          function () {
            out.select();
            TK.toast("Press Ctrl+C to copy selected text.");
          }
        );
      } else {
        out.select();
        TK.toast("Press Ctrl+C to copy selected text.");
      }
    });
  }
})();
