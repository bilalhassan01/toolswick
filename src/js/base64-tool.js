/* Toolswick Base64 Encoder / Decoder / File Converter - 100% Client-Side.
   Encodes, decodes, and converts files to/from Base64 in browser memory. Zero uploads. */
(function () {
  "use strict";

  var $ = TK.$;

  // UTF-8 safe text to Base64
  function utf8ToBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var binString = "";
    for (var i = 0; i < bytes.length; i++) {
      binString += String.fromCharCode(bytes[i]);
    }
    return btoa(binString);
  }

  // UTF-8 safe Base64 to text
  function base64ToUtf8(b64) {
    var cleanB64 = b64.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
    while (cleanB64.length % 4 !== 0) {
      cleanB64 += "=";
    }
    var binString = atob(cleanB64);
    var bytes = new Uint8Array(binString.length);
    for (var i = 0; i < binString.length; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  // --- MODE 1: TEXT ENCODE / DECODE ---
  function runTextConversion(encodeMode) {
    var inText = $("#textIn") ? $("#textIn").value : "";
    var outEl = $("#textOut");
    var msgEl = $("#textMsg");
    if (!outEl || !msgEl) return;

    if (!inText.trim()) {
      outEl.value = "";
      msgEl.textContent = "Enter text to encode or Base64 to decode.";
      return;
    }

    try {
      if (encodeMode) {
        var b64 = utf8ToBase64(inText);
        var urlSafe = $("#urlSafeCheck") && $("#urlSafeCheck").checked;
        if (urlSafe) {
          b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }
        outEl.value = b64;
        msgEl.className = "ok";
        msgEl.textContent = "✓ Encoded (" + TK.bytes(inText.length) + " text → " + TK.bytes(b64.length) + " Base64)";
      } else {
        var text = base64ToUtf8(inText);
        outEl.value = text;
        msgEl.className = "ok";
        msgEl.textContent = "✓ Decoded successfully (" + TK.bytes(inText.length) + " Base64 → " + TK.bytes(text.length) + " text)";
      }
      TK.recordSuccess();
    } catch (e) {
      outEl.value = "";
      msgEl.className = "bad";
      msgEl.textContent = "✗ Conversion failed: " + e.message;
    }
  }

  var encodeTextBtn = $("#encodeTextBtn");
  if (encodeTextBtn) encodeTextBtn.addEventListener("click", function () { runTextConversion(true); });

  var decodeTextBtn = $("#decodeTextBtn");
  if (decodeTextBtn) decodeTextBtn.addEventListener("click", function () { runTextConversion(false); });

  var copyTextBtn = $("#copyTextBtn");
  if (copyTextBtn) {
    copyTextBtn.addEventListener("click", function () {
      var outEl = $("#textOut");
      if (!outEl || !outEl.value) {
        TK.toast("Nothing to copy yet.", "error");
        return;
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(outEl.value).then(
          function () { TK.toast("Copied result to clipboard!", "success"); },
          function () { outEl.select(); TK.toast("Press Ctrl+C to copy."); }
        );
      } else {
        outEl.select();
        TK.toast("Press Ctrl+C to copy.");
      }
    });
  }

  // --- MODE 2: FILE TO BASE64 ---
  async function loadFileForBase64(files) {
    var f = files[0];
    if (!f) return;
    var outEl = $("#fileBase64Out");
    var metaEl = $("#fileMetaOut");
    if (!outEl) return;

    try {
      var reader = new FileReader();
      reader.onload = function (e) {
        var dataUrl = e.target.result;
        var rawB64 = dataUrl.split(",")[1] || "";
        var isRawOnly = $("#rawB64Only") && $("#rawB64Only").checked;
        outEl.value = isRawOnly ? rawB64 : dataUrl;
        if (metaEl) {
          metaEl.innerHTML =
            "<strong>" + TK.esc(f.name) + "</strong> · " +
            (f.type || "application/octet-stream") + " · Original: " + TK.bytes(f.size) +
            " → Base64: " + TK.bytes(outEl.value.length);
        }
        TK.toast("File converted to Base64.", "success");
        TK.recordSuccess();
      };
      reader.readAsDataURL(f);
    } catch (err) {
      TK.toast("Failed to convert file to Base64.", "error");
    }
  }

  var rawB64Only = $("#rawB64Only");
  if (rawB64Only) {
    rawB64Only.addEventListener("change", function () {
      var outEl = $("#fileBase64Out");
      if (!outEl || !outEl.value) return;
      var curVal = outEl.value;
      if (rawB64Only.checked && curVal.indexOf("data:") === 0) {
        outEl.value = curVal.split(",")[1] || "";
      }
    });
  }

  var copyFileB64Btn = $("#copyFileB64Btn");
  if (copyFileB64Btn) {
    copyFileB64Btn.addEventListener("click", function () {
      var outEl = $("#fileBase64Out");
      if (!outEl || !outEl.value) {
        TK.toast("Nothing to copy yet.", "error");
        return;
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(outEl.value).then(
          function () { TK.toast("Base64 string copied to clipboard!", "success"); },
          function () { outEl.select(); TK.toast("Press Ctrl+C to copy."); }
        );
      } else {
        outEl.select();
        TK.toast("Press Ctrl+C to copy.");
      }
    });
  }

  var fileDrop = $("#fileDrop");
  if (fileDrop) {
    TK.dropzone(fileDrop, loadFileForBase64);
  }

  // --- MODE 3: BASE64 TO FILE DOWNLOAD ---
  var b64ToFileBtn = $("#b64ToFileBtn");
  if (b64ToFileBtn) {
    b64ToFileBtn.addEventListener("click", function () {
      var raw = $("#b64FileInput") ? $("#b64FileInput").value.trim() : "";
      if (!raw) {
        TK.toast("Paste a Base64 string or Data URI first.", "error");
        return;
      }

      var mime = "application/octet-stream";
      var dataPart = raw;

      if (raw.indexOf("data:") === 0) {
        var commaIndex = raw.indexOf(",");
        if (commaIndex !== -1) {
          var header = raw.slice(0, commaIndex);
          dataPart = raw.slice(commaIndex + 1);
          var mimeMatch = /^data:(.*?)(;base64)?$/.exec(header);
          if (mimeMatch && mimeMatch[1]) {
            mime = mimeMatch[1];
          }
        }
      }

      var extMap = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "image/gif": "gif",
        "application/pdf": "pdf",
        "text/plain": "txt",
        "application/json": "json"
      };

      var ext = extMap[mime] || "bin";
      var outFileName = "reconstructed-file." + ext;

      try {
        var cleanB64 = dataPart.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
        while (cleanB64.length % 4 !== 0) cleanB64 += "=";
        var binary = atob(cleanB64);
        var len = binary.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        var blob = new Blob([bytes], { type: mime });
        TK.save(outFileName, blob);
        TK.toast("Reconstructed " + ext.toUpperCase() + " file downloaded (" + TK.bytes(len) + ").", "success");
      } catch (err) {
        TK.toast("Failed to parse Base64 into binary: " + err.message, "error");
      }
    });
  }

  // Mode switcher tabs
  var modeTabs = TK.$$(".b64-mode-tab");
  modeTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      modeTabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      var targetMode = tab.dataset.mode;
      TK.$$(".b64-mode-panel").forEach(function (panel) {
        panel.hidden = panel.id !== targetMode;
      });
    });
  });
})();
