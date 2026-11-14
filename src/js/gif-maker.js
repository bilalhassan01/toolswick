// gif-maker.js - 100% Client-Side Animated GIF Generator
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('gifFileInput');
    const dropZone = document.getElementById('gifDropZone');
    const previewContainer = document.getElementById('gifFrameList');
    const generateBtn = document.getElementById('gifGenerateBtn');
    const delayInput = document.getElementById('gifDelayInput');
    const delayVal = document.getElementById('gifDelayVal');
    const widthSelect = document.getElementById('gifWidthSelect');
    const outputContainer = document.getElementById('gifOutputContainer');
    const resultImg = document.getElementById('gifResultImg');
    const downloadBtn = document.getElementById('gifDownloadBtn');
    const resultMeta = document.getElementById('gifResultMeta');

    if (!fileInput || !generateBtn) return;

    let frames = []; // Array of loaded Image elements

    if (delayInput && delayVal) {
      delayInput.addEventListener('input', () => {
        delayVal.textContent = `${delayInput.value} ms`;
      });
    }

    function handleFiles(files) {
      if (!files || !files.length) return;
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            frames.push({ img, name: file.name });
            renderThumbnails();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '';
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '';
        if (e.dataTransfer && e.dataTransfer.files) {
          handleFiles(e.dataTransfer.files);
        }
      });
      dropZone.addEventListener('click', () => fileInput.click());
    }

    function renderThumbnails() {
      if (!previewContainer) return;
      previewContainer.innerHTML = '';
      frames.forEach((frame, idx) => {
        const thumb = document.createElement('div');
        thumb.style.position = 'relative';
        thumb.style.width = '80px';
        thumb.style.height = '80px';
        thumb.style.borderRadius = '6px';
        thumb.style.overflow = 'hidden';
        thumb.style.border = '1px solid var(--border,#333)';
        thumb.style.background = '#000';

        const img = document.createElement('img');
        img.src = frame.img.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = '×';
        delBtn.style.position = 'absolute';
        delBtn.style.top = '2px';
        delBtn.style.right = '2px';
        delBtn.style.background = 'rgba(239,68,68,0.85)';
        delBtn.style.color = '#fff';
        delBtn.style.border = 'none';
        delBtn.style.borderRadius = '50%';
        delBtn.style.width = '18px';
        delBtn.style.height = '18px';
        delBtn.style.cursor = 'pointer';
        delBtn.style.fontSize = '12px';
        delBtn.style.lineHeight = '1';
        delBtn.title = 'Remove frame';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          frames.splice(idx, 1);
          renderThumbnails();
        });

        const badge = document.createElement('span');
        badge.textContent = `#${idx + 1}`;
        badge.style.position = 'absolute';
        badge.style.bottom = '2px';
        badge.style.left = '2px';
        badge.style.background = 'rgba(0,0,0,0.65)';
        badge.style.color = '#fff';
        badge.style.fontSize = '10px';
        badge.style.padding = '1px 4px';
        badge.style.borderRadius = '3px';

        thumb.appendChild(img);
        thumb.appendChild(delBtn);
        thumb.appendChild(badge);
        previewContainer.appendChild(thumb);
      });

      generateBtn.disabled = frames.length < 2;
      generateBtn.textContent = frames.length < 2
        ? `Upload at least 2 frames (${frames.length}/2)`
        : `Create Animated GIF (${frames.length} frames)`;
    }

    // Lightweight GIF89a LZW Encoder in pure JavaScript
    function encodeGif(framesList, targetWidth, delayMs) {
      const targetHeight = Math.round(targetWidth * (framesList[0].img.height / framesList[0].img.width)) || targetWidth;
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      const out = [];

      function writeByte(b) { out.push(b & 0xff); }
      function writeWord(w) { writeByte(w & 0xff); writeByte((w >> 8) & 0xff); }
      function writeString(s) { for (let i = 0; i < s.length; i++) writeByte(s.charCodeAt(i)); }

      // 1. Header
      writeString("GIF89a");

      // 2. Logical Screen Descriptor
      writeWord(targetWidth);
      writeWord(targetHeight);
      writeByte(0x70); // GCT Flag (no global table), Color Res 8-bit, 256 colors
      writeByte(0);    // Background color index
      writeByte(0);    // Pixel aspect ratio

      // 3. Netscape 2.0 Loop Extension (Infinite looping)
      writeByte(0x21); // Extension Introducer
      writeByte(0xFF); // Application Extension Label
      writeByte(11);   // Block Size
      writeString("NETSCAPE2.0");
      writeByte(3);    // Sub-block data size
      writeByte(1);    // Loop sub-block ID
      writeWord(0);    // Loop count (0 = infinite)
      writeByte(0);    // Block Terminator

      const delayHundredths = Math.max(2, Math.round(delayMs / 10));

      // 4. Encode each frame
      framesList.forEach(frame => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(frame.img, 0, 0, targetWidth, targetHeight);

        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
        const totalPixels = targetWidth * targetHeight;

        // Simple 6x6x6 color quantization to 216 web-safe colors + grayscale
        const palette = [];
        for (let r = 0; r < 6; r++) {
          for (let g = 0; g < 6; g++) {
            for (let b = 0; b < 6; b++) {
              palette.push([r * 51, g * 51, b * 51]);
            }
          }
        }
        while (palette.length < 256) palette.push([0, 0, 0]);

        const indices = new Uint8Array(totalPixels);
        for (let i = 0; i < totalPixels; i++) {
          const r = imgData[i * 4];
          const g = imgData[i * 4 + 1];
          const b = imgData[i * 4 + 2];
          const ri = Math.min(5, Math.round(r / 51));
          const gi = Math.min(5, Math.round(g / 51));
          const bi = Math.min(5, Math.round(b / 51));
          indices[i] = ri * 36 + gi * 6 + bi;
        }

        // Graphic Control Extension (Delay + Disposal)
        writeByte(0x21); // Extension Introducer
        writeByte(0xF9); // Graphic Control Label
        writeByte(4);    // Block size
        writeByte(0x04); // Disposal method (Do not dispose)
        writeWord(delayHundredths); // Frame delay
        writeByte(0);    // Transparent color index
        writeByte(0);    // Block Terminator

        // Image Descriptor
        writeByte(0x2C); // Image Separator
        writeWord(0);    // Left position
        writeWord(0);    // Top position
        writeWord(targetWidth);
        writeWord(targetHeight);
        writeByte(0x87); // Local color table flag, 8-bit table (256 colors)

        // Local Color Table
        for (let c = 0; c < 256; c++) {
          writeByte(palette[c][0]);
          writeByte(palette[c][1]);
          writeByte(palette[c][2]);
        }

        // LZW Image Data
        const minCodeSize = 8;
        writeByte(minCodeSize);

        // Simple LZW encoder for GIF
        const clearCode = 1 << minCodeSize;
        const eoiCode = clearCode + 1;

        let curCodeSize = minCodeSize + 1;
        let nextCode = eoiCode + 1;
        const maxCode = 4096;

        let accum = 0;
        let accumBits = 0;
        const buffer = [];

        function writeBits(code, size) {
          accum |= (code << accumBits);
          accumBits += size;
          while (accumBits >= 8) {
            buffer.push(accum & 0xff);
            accum >>= 8;
            accumBits -= 8;
            if (buffer.length === 254) {
              writeByte(buffer.length);
              for (let k = 0; k < buffer.length; k++) writeByte(buffer[k]);
              buffer.length = 0;
            }
          }
        }

        writeBits(clearCode, curCodeSize);

        const dict = new Map();
        function initDict() {
          dict.clear();
          for (let c = 0; c < clearCode; c++) dict.set(String.fromCharCode(c), c);
          curCodeSize = minCodeSize + 1;
          nextCode = eoiCode + 1;
        }
        initDict();

        let prefix = String.fromCharCode(indices[0]);
        for (let i = 1; i < totalPixels; i++) {
          const char = String.fromCharCode(indices[i]);
          const combined = prefix + char;
          if (dict.has(combined)) {
            prefix = combined;
          } else {
            writeBits(dict.get(prefix), curCodeSize);
            if (nextCode < maxCode) {
              dict.set(combined, nextCode++);
              if (nextCode > (1 << curCodeSize) && curCodeSize < 12) {
                curCodeSize++;
              }
            } else {
              writeBits(clearCode, curCodeSize);
              initDict();
            }
            prefix = char;
          }
        }
        writeBits(dict.get(prefix), curCodeSize);
        writeBits(eoiCode, curCodeSize);

        if (accumBits > 0) {
          buffer.push(accum & 0xff);
        }
        if (buffer.length > 0) {
          writeByte(buffer.length);
          for (let k = 0; k < buffer.length; k++) writeByte(buffer[k]);
          buffer.length = 0;
        }
        writeByte(0); // Block Terminator
      });

      // 5. Trailer
      writeByte(0x3B);

      return new Uint8Array(out);
    }

    generateBtn.addEventListener('click', () => {
      if (frames.length < 2) return;
      generateBtn.disabled = true;
      generateBtn.textContent = 'Generating animated GIF...';

      const delayMs = parseInt(delayInput ? delayInput.value : 300, 10) || 300;
      const targetW = parseInt(widthSelect ? widthSelect.value : 480, 10) || 480;

      setTimeout(() => {
        try {
          const gifBytes = encodeGif(frames, targetW, delayMs);
          const blob = new Blob([gifBytes], { type: 'image/gif' });
          const url = URL.createObjectURL(blob);

          if (resultImg) resultImg.src = url;
          if (resultMeta) {
            resultMeta.textContent = `Dimensions: ${targetW}px • Frames: ${frames.length} • Size: ${(blob.size / 1024).toFixed(1)} KB`;
          }
          if (downloadBtn) {
            downloadBtn.onclick = () => {
              const a = document.createElement('a');
              a.href = url;
              a.download = `animated-${targetW}px.gif`;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => document.body.removeChild(a), 500);
            };
          }
          if (outputContainer) outputContainer.style.display = 'block';
          if (window.TK && TK.toast) TK.toast('Animated GIF created successfully!', 'success');
        } catch (e) {
          console.error(e);
          if (window.TK && TK.toast) TK.toast('Failed to generate GIF: ' + e.message, 'error');
        } finally {
          generateBtn.disabled = false;
          generateBtn.textContent = `Create Animated GIF (${frames.length} frames)`;
        }
      }, 50);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
