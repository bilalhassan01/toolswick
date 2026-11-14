/* Toolswick EXIF Metadata Remover - 100% Client-Side.
   Detects and strips sensitive metadata (GPS, camera info, timestamps) from photos in browser memory. Zero uploads. */
(function () {
  "use strict";

  var $ = TK.$;
  var curFile = null;
  var detectedTags = [];

  // Parse basic EXIF markers from JPEG buffer
  function parseExif(buffer) {
    var view = new DataView(buffer);
    var tags = [];
    if (view.getUint16(0, false) !== 0xFFD8) {
      return tags; // Not a standard JPEG
    }

    var length = view.byteLength;
    var offset = 2;

    while (offset < length - 4) {
      var marker = view.getUint16(offset, false);
      offset += 2;
      var blockLength = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xFFE1) { // APP1 Marker (EXIF or XMP)
        var header = "";
        for (var i = 0; i < 4; i++) {
          header += String.fromCharCode(view.getUint8(offset + i));
        }

        if (header === "Exif") {
          tags.push({ name: "EXIF Header", value: "Present" });
          // Check TIFF header
          var tiffOffset = offset + 6;
          var isLittleEndian = view.getUint16(tiffOffset, false) === 0x4949;

          var ifdOffset = tiffOffset + view.getUint32(tiffOffset + 4, isLittleEndian);
          if (ifdOffset < length - 2) {
            var numEntries = view.getUint16(ifdOffset, isLittleEndian);
            var curEntry = ifdOffset + 2;

            for (var j = 0; j < numEntries && curEntry < length - 12; j++, curEntry += 12) {
              var tag = view.getUint16(curEntry, isLittleEndian);
              if (tag === 0x010F) tags.push({ name: "Camera Manufacturer", value: "Detected", icon: "📷" });
              if (tag === 0x0110) tags.push({ name: "Camera / Device Model", value: "Detected", icon: "📱" });
              if (tag === 0x0131) tags.push({ name: "Software / Editing App", value: "Detected", icon: "💻" });
              if (tag === 0x0132 || tag === 0x9003) tags.push({ name: "Creation Date & Time", value: "Detected", icon: "📅" });
              if (tag === 0x8825) tags.push({ name: "GPS Location Coordinates", value: "⚠️ GPS Geotag Embedded", isSensitive: true, icon: "📍" });
            }
          }
        } else if (header === "http") {
          tags.push({ name: "XMP Metadata Package", value: "Present", icon: "📄" });
        }
      } else if (marker === 0xFFE2) {
        tags.push({ name: "ICC Color Profile / Extended Metadata", value: "Present", icon: "🎨" });
      } else if (marker === 0xFFEE) {
        tags.push({ name: "Adobe Segment Metadata", value: "Present", icon: "🏷️" });
      }

      offset += blockLength - 2;
    }

    return tags;
  }

  function show() {
    var panel = $("#panel");
    if (panel) panel.hidden = !curFile;
    if (!curFile) return;

    var fileInfo = $("#fileinfo");
    if (fileInfo) {
      fileInfo.textContent = curFile.name + " · " + TK.bytes(curFile.size);
    }
  }

  function renderReport() {
    var report = $("#metadataReport");
    if (!report) return;

    if (!detectedTags.length) {
      report.innerHTML =
        '<div class="meta-notice ok">' +
          "<strong>✓ No EXIF metadata or GPS tags detected.</strong>" +
          "<p>This image appears to be clean, but re-exporting will guarantee all residual headers are sanitized.</p>" +
        "</div>";
      return;
    }

    var hasGps = detectedTags.some(function (t) { return t.isSensitive; });
    var noticeClass = hasGps ? "meta-notice alert" : "meta-notice warn";

    var tagsHtml = detectedTags.map(function (t) {
      return (
        '<div class="meta-tag-item' + (t.isSensitive ? " sensitive" : "") + '">' +
          '<span class="tag-icon">' + (t.icon || "ℹ️") + "</span>" +
          '<div class="tag-text">' +
            "<strong>" + TK.esc(t.name) + "</strong>" +
            "<span>" + TK.esc(t.value) + "</span>" +
          "</div>" +
        "</div>"
      );
    }).join("");

    report.innerHTML =
      '<div class="' + noticeClass + '">' +
        (hasGps
          ? "<strong>⚠️ Sensitive GPS Location Data Detected!</strong><p>This image contains embedded geographic coordinates that expose where this photo was taken.</p>"
          : "<strong>Metadata Found:</strong><p>The following hardware and timestamp tags were discovered in your file.</p>") +
      "</div>" +
      '<div class="meta-tag-grid">' + tagsHtml + "</div>";
  }

  async function load(files) {
    var f = files[0];
    if (!f) return;
    try {
      var isJpeg = await TK.checkMagicBytes(f, "jpeg");
      var isPng = await TK.checkMagicBytes(f, "png");
      if (!isJpeg && !isPng && !/\.(jpe?g|png|webp)$/i.test(f.name)) {
        TK.toast("Please upload a JPG or PNG photo.", "error");
        return;
      }

      var buf = await f.arrayBuffer();
      detectedTags = parseExif(buf);
      curFile = f;
      show();
      renderReport();
    } catch (e) {
      curFile = null;
      detectedTags = [];
      TK.toast("Could not read file metadata.", "error");
    }
  }

  var stripBtn = $("#stripBtn");
  if (stripBtn) {
    stripBtn.addEventListener("click", async function () {
      if (!curFile) return;
      var btn = this;
      var origLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Stripping metadata…";

      try {
        var bmp = await createImageBitmap(curFile);
        var canvas = document.createElement("canvas");
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        var ctx = canvas.getContext("2d");

        var isPng = curFile.type === "image/png" || /\.png$/i.test(curFile.name);
        if (!isPng) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, bmp.width, bmp.height);
        }
        ctx.drawImage(bmp, 0, 0);
        bmp.close(); // Immediate memory release

        var mime = isPng ? "image/png" : "image/jpeg";
        var quality = isPng ? undefined : 0.94;

        var cleanBlob = await new Promise(function (resolve) {
          canvas.toBlob(resolve, mime, quality);
        });

        if (!cleanBlob) {
          throw new Error("Failed to export clean image.");
        }

        var base = TK.baseName(curFile.name);
        var ext = isPng ? "png" : "jpg";
        TK.save(base + "-no-exif." + ext, cleanBlob);
        TK.toast("Clean image downloaded! All EXIF and GPS data stripped.", "success");
      } catch (err) {
        TK.toast(err.message || "Could not strip metadata.", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = origLabel;
      }
    });
  }

  var clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      curFile = null;
      detectedTags = [];
      show();
    });
  }

  var drop = $("#drop");
  if (drop) {
    TK.dropzone(drop, load, function (f) {
      return /^image\//i.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name);
    });
  }

  show();
})();
