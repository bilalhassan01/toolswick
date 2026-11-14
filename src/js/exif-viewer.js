// exif-viewer.js - Pure client-side binary EXIF metadata parser
(function () {
  'use strict';

  function parseExif(buffer) {
    const view = new DataView(buffer);
    if (view.getUint16(0, false) !== 0xFFD8) return null; // Not a JPEG

    let offset = 2;
    const length = buffer.byteLength;

    while (offset < length) {
      if (view.getUint8(offset) !== 0xFF) return null;
      const marker = view.getUint8(offset + 1);

      // APP1 Marker containing EXIF
      if (marker === 0xE1) {
        return readExifSegment(view, offset + 4, view.getUint16(offset + 2, false) - 2);
      }
      offset += 2 + view.getUint16(offset + 2, false);
    }
    return null;
  }

  function readExifSegment(view, start, maxLen) {
    // Check "Exif\0\0"
    if (view.getUint32(start, false) !== 0x45786966 || view.getUint16(start + 4, false) !== 0x0000) {
      return null;
    }

    const tiffStart = start + 6;
    const isLittleEndian = view.getUint16(tiffStart, false) === 0x4949; // 'II'

    if (view.getUint16(tiffStart + 2, isLittleEndian) !== 0x002A) return null; // 42 marker

    const firstIfdOffset = view.getUint32(tiffStart + 4, isLittleEndian);
    if (firstIfdOffset < 8) return null;

    const tags = {};
    readTags(view, tiffStart, tiffStart + firstIfdOffset, isLittleEndian, tags);

    // If ExifIFD pointer exists
    if (tags[0x8769]) {
      readTags(view, tiffStart, tiffStart + tags[0x8769], isLittleEndian, tags);
    }

    // If GPSInfo pointer exists
    if (tags[0x8825]) {
      const gpsTags = {};
      readTags(view, tiffStart, tiffStart + tags[0x8825], isLittleEndian, gpsTags);
      tags.gps = gpsTags;
    }

    return tags;
  }

  function readTags(view, tiffStart, ifdStart, isLE, outTags) {
    if (ifdStart + 2 > view.byteLength) return;
    const count = view.getUint16(ifdStart, isLE);

    for (let i = 0; i < count; i++) {
      const entryOffset = ifdStart + 2 + i * 12;
      if (entryOffset + 12 > view.byteLength) break;

      const tag = view.getUint16(entryOffset, isLE);
      const type = view.getUint16(entryOffset + 2, isLE);
      const numValues = view.getUint32(entryOffset + 4, isLE);
      const valueOffset = entryOffset + 8;

      let val = null;
      if (type === 2) {
        // ASCII String
        const dataOffset = numValues > 4 ? tiffStart + view.getUint32(valueOffset, isLE) : valueOffset;
        let str = '';
        for (let j = 0; j < numValues - 1; j++) {
          if (dataOffset + j < view.byteLength) {
            str += String.fromCharCode(view.getUint8(dataOffset + j));
          }
        }
        val = str.trim();
      } else if (type === 3) {
        // SHORT (16-bit)
        val = view.getUint16(valueOffset, isLE);
      } else if (type === 4) {
        // LONG (32-bit)
        val = view.getUint32(valueOffset, isLE);
      } else if (type === 5 || type === 10) {
        // RATIONAL (one value, or several — GPS stores 3: deg/min/sec)
        const dataOffset = tiffStart + view.getUint32(valueOffset, isLE);
        const vals = [];
        for (let k = 0; k < numValues; k++) {
          const off = dataOffset + k * 8;
          if (off + 8 <= view.byteLength) {
            const num = view.getUint32(off, isLE);
            const den = view.getUint32(off + 4, isLE);
            vals.push(den !== 0 ? num / den : num);
          }
        }
        val = vals.length === 1 ? vals[0] : vals;
      }
      outTags[tag] = val;
    }
  }

  function init() {
    const fileInput = document.getElementById('exifFile');
    const dropZone = document.getElementById('exifDrop');
    const tableBody = document.getElementById('exifTableBody');
    const previewImg = document.getElementById('exifThumb');
    const fileNameEl = document.getElementById('exifFileName');
    const fileSizeEl = document.getElementById('exifFileSize');
    const resultBox = document.getElementById('exifResult');
    const copyBtn = document.getElementById('exifCopyBtn');
    const jsonBtn = document.getElementById('exifJsonBtn');
    const noExifMsg = document.getElementById('exifEmptyMsg');

    if (!fileInput || !tableBody) return;

    let parsedExifData = null;

    function handleFile(file) {
      if (!file) return;

      if (fileNameEl) fileNameEl.textContent = file.name;
      if (fileSizeEl) fileSizeEl.textContent = (file.size / 1024).toFixed(1) + ' KB (' + file.type + ')';

      const objUrl = URL.createObjectURL(file);
      if (previewImg) previewImg.src = objUrl;

      const reader = new FileReader();
      reader.onload = function (e) {
        const buffer = e.target.result;
        parsedExifData = parseExif(buffer);
        renderExif(parsedExifData, file);
        if (resultBox) resultBox.style.display = 'block';
      };
      reader.readAsArrayBuffer(file);
    }

    if (fileInput) {
      fileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      });
      dropZone.addEventListener('click', () => fileInput.click());
    }

    function gpsToDecimal(dms, ref) {
      if (!Array.isArray(dms) || dms.length < 3) return null;
      let dec = dms[0] + dms[1] / 60 + dms[2] / 3600;
      if (ref === 'S' || ref === 'W') dec = -dec;
      return dec;
    }

    function renderExif(tags, file) {
      if (!tableBody) return;
      tableBody.innerHTML = '';

      if (!tags) {
        if (noExifMsg) noExifMsg.style.display = 'block';
        return;
      }
      if (noExifMsg) noExifMsg.style.display = 'none';

      const rows = [
        { label: 'Camera Make', val: tags[0x010F] || 'Unknown' },
        { label: 'Camera Model', val: tags[0x0110] || 'Unknown' },
        { label: 'Date & Time Taken', val: tags[0x9003] || tags[0x0132] || 'Not specified' },
        { label: 'Exposure Time (Shutter)', val: tags[0x829A] ? (tags[0x829A] < 1 ? `1/${Math.round(1 / tags[0x829A])}s` : `${tags[0x829A]}s`) : 'N/A' },
        { label: 'F-Number (Aperture)', val: tags[0x829D] ? `f/${tags[0x829D].toFixed(1)}` : 'N/A' },
        { label: 'ISO Speed Rating', val: tags[0x8827] ? `ISO ${tags[0x8827]}` : 'N/A' },
        { label: 'Focal Length', val: tags[0x920A] ? `${tags[0x920A].toFixed(1)} mm` : 'N/A' },
        { label: 'Software / Firmware', val: tags[0x0131] || 'N/A' },
        { label: 'Flash Mode', val: tags[0x9209] !== undefined ? (tags[0x9209] === 0 ? 'No Flash' : 'Flash Fired') : 'N/A' }
      ];

      // GPS — show the real coordinates (deg/min/sec -> decimal) when present
      if (tags.gps) {
        const g = tags.gps;
        const lat = gpsToDecimal(g[0x0002], g[0x0001]);
        const lon = gpsToDecimal(g[0x0004], g[0x0003]);
        let gpsVal = 'Detected (Geotagged metadata present in photo)';
        if (lat !== null && lon !== null) {
          const latH = (g[0x0001] || 'N').toUpperCase();
          const lonH = (g[0x0003] || 'E').toUpperCase();
          gpsVal = Math.abs(lat).toFixed(4) + '° ' + latH + ', ' + Math.abs(lon).toFixed(4) + '° ' + lonH +
            ' <a href="https://maps.google.com/?q=' + lat.toFixed(4) + ',' + lon.toFixed(4) + '" target="_blank" rel="noopener">View on map</a>';
        }
        rows.push({ label: 'GPS Coordinates', val: gpsVal });
      }

      let html = '';
      rows.forEach(r => {
        html += `
          <tr style="border-bottom:1px solid var(--border,#333);">
            <td style="padding:8px 10px;font-weight:600;color:var(--muted,#aaa);">${r.label}</td>
            <td style="padding:8px 10px;font-family:monospace;font-size:0.95rem;">${r.val}</td>
          </tr>
        `;
      });
      tableBody.innerHTML = html;
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!tableBody) return;
        let text = 'Photo EXIF Details:\n';
        tableBody.querySelectorAll('tr').forEach(tr => {
          const cells = tr.querySelectorAll('td');
          if (cells.length === 2) text += `${cells[0].textContent}: ${cells[1].textContent}\n`;
        });
        navigator.clipboard.writeText(text).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }

    if (jsonBtn) {
      jsonBtn.addEventListener('click', () => {
        if (!parsedExifData) return;
        const json = JSON.stringify(parsedExifData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exif-metadata.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1000);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
