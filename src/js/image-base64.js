// image-base64.js - Pure client-side Image to Base64 and Base64 to Image converter
(function () {
  'use strict';

  function init() {
    const tabImg2B64 = document.getElementById('b64TabImg2B64');
    const tabB642Img = document.getElementById('b64TabB642Img');
    const panelImg2B64 = document.getElementById('b64PanelImg2B64');
    const panelB642Img = document.getElementById('b64PanelB642Img');

    if (tabImg2B64 && tabB642Img) {
      tabImg2B64.addEventListener('click', () => {
        tabImg2B64.classList.add('active');
        tabB642Img.classList.remove('active');
        if (panelImg2B64) panelImg2B64.style.display = 'block';
        if (panelB642Img) panelB642Img.style.display = 'none';
      });
      tabB642Img.addEventListener('click', () => {
        tabB642Img.classList.add('active');
        tabImg2B64.classList.remove('active');
        if (panelImg2B64) panelImg2B64.style.display = 'none';
        if (panelB642Img) panelB642Img.style.display = 'block';
      });
    }

    // --- Tab 1: Image -> Base64 ---
    const fileInput = document.getElementById('b64File');
    const dropZone = document.getElementById('b64Drop');
    const b64Text = document.getElementById('b64Output');
    const copyRawBtn = document.getElementById('b64CopyRaw');
    const copyHtmlBtn = document.getElementById('b64CopyHtml');
    const copyCssBtn = document.getElementById('b64CopyCss');
    const lengthInfo = document.getElementById('b64LengthInfo');
    const thumbImg = document.getElementById('b64Thumb');
    const resultBox = document.getElementById('b64ResultBox');

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl = e.target.result;
        if (b64Text) b64Text.value = dataUrl;
        if (thumbImg) thumbImg.src = dataUrl;
        if (lengthInfo) {
          lengthInfo.textContent = `${dataUrl.length.toLocaleString()} characters (${(dataUrl.length / 1024).toFixed(1)} KB)`;
        }
        if (resultBox) resultBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
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

    function setupCopy(btn, getText) {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const text = getText();
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
          const old = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = old), 1500);
        });
      });
    }

    setupCopy(copyRawBtn, () => b64Text.value);
    setupCopy(copyHtmlBtn, () => `<img src="${b64Text.value}" alt="Embedded Base64 Image" />`);
    setupCopy(copyCssBtn, () => `background-image: url("${b64Text.value}");`);

    // --- Tab 2: Base64 -> Image ---
    const inputB64 = document.getElementById('b64InputText');
    const decodeBtn = document.getElementById('b64DecodeBtn');
    const previewCanvas = document.getElementById('b64PreviewCanvas');
    const downloadPngBtn = document.getElementById('b64DownloadPng');
    const downloadJpgBtn = document.getElementById('b64DownloadJpg');
    const decodeResult = document.getElementById('b64DecodeResult');
    const decodeError = document.getElementById('b64DecodeError');

    function decodeBase64() {
      let raw = inputB64 ? inputB64.value.trim() : '';
      if (!raw) return;

      if (!raw.startsWith('data:image/')) {
        // Assume png if raw base64 without prefix
        raw = 'data:image/png;base64,' + raw;
      }

      const img = new Image();
      img.onload = function () {
        if (decodeError) decodeError.style.display = 'none';
        if (decodeResult) decodeResult.style.display = 'block';

        previewCanvas.width = img.width;
        previewCanvas.height = img.height;
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);

        if (downloadPngBtn) {
          downloadPngBtn.onclick = function () {
            const a = document.createElement('a');
            a.href = raw;
            a.download = 'decoded-image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
        }

        if (downloadJpgBtn) {
          downloadJpgBtn.onclick = function () {
            previewCanvas.toBlob(blob => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'decoded-image.jpg';
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 1000);
            }, 'image/jpeg', 0.92);
          };
        }
      };
      img.onerror = function () {
        if (decodeError) {
          decodeError.textContent = 'Invalid Base64 image string. Please verify the code and prefix.';
          decodeError.style.display = 'block';
        }
        if (decodeResult) decodeResult.style.display = 'none';
      };
      img.src = raw;
    }

    if (decodeBtn) decodeBtn.addEventListener('click', decodeBase64);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
