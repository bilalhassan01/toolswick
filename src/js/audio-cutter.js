// audio-cutter.js - Client-Side Audio Trimmer & Slicer with Visual Waveform (Web Audio API)
(function () {
  'use strict';

  function init() {
    const fileInp = document.getElementById('audioCutFile');
    const dropZone = document.getElementById('audioCutDrop');
    const workspace = document.getElementById('audioCutWorkspace');
    const startInp = document.getElementById('audioCutStart');
    const endInp = document.getElementById('audioCutEnd');
    const startSlider = document.getElementById('audioCutStartSlider');
    const endSlider = document.getElementById('audioCutEndSlider');
    const canvas = document.getElementById('audioWaveformCanvas');
    const previewBtn = document.getElementById('audioCutPreviewBtn');
    const cutBtn = document.getElementById('audioCutProcessBtn');
    const statusText = document.getElementById('audioCutStatus');
    const downloadBtn = document.getElementById('audioCutDownloadBtn');

    if (!fileInp || !dropZone) return;

    let audioBuffer = null;
    let fileName = 'audio-trimmed.wav';
    let audioCtx = null;
    let currentSource = null;
    let isPlaying = false;

    function getAudioCtx() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    function drawWaveform() {
      if (!canvas || !audioBuffer) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / w);
      const duration = audioBuffer.duration;

      const startSec = parseFloat(startInp ? startInp.value : 0) || 0;
      const endSec = parseFloat(endInp ? endInp.value : duration) || duration;

      const startX = (startSec / duration) * w;
      const endX = (endSec / duration) * w;

      ctx.clearRect(0, 0, w, h);

      // Shaded active selection region
      ctx.fillStyle = 'rgba(13, 148, 136, 0.18)';
      ctx.fillRect(startX, 0, Math.max(2, endX - startX), h);

      // Selection boundary lines
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0); ctx.lineTo(startX, h);
      ctx.moveTo(endX, 0); ctx.lineTo(endX, h);
      ctx.stroke();

      // Waveform bars
      const amp = h / 2;
      for (let i = 0; i < w; i++) {
        let min = 1.0;
        let max = -1.0;
        const offset = i * step;
        for (let j = 0; j < step && (offset + j) < data.length; j++) {
          const val = data[offset + j];
          if (val < min) min = val;
          if (val > max) max = val;
        }

        const barH = Math.max(2, (max - min) * amp * 0.9);
        const y = amp - (barH / 2);

        ctx.fillStyle = (i >= startX && i <= endX) ? '#0d9488' : '#94a3b8';
        ctx.fillRect(i, y, 1, barH);
      }
    }

    function syncInputsFromSliders() {
      if (!audioBuffer) return;
      const duration = audioBuffer.duration;
      let sVal = parseFloat(startSlider ? startSlider.value : 0);
      let eVal = parseFloat(endSlider ? endSlider.value : 100);

      if (sVal > eVal) {
        sVal = eVal;
        if (startSlider) startSlider.value = sVal;
      }

      const sSec = (sVal / 100) * duration;
      const eSec = (eVal / 100) * duration;

      if (startInp) startInp.value = sSec.toFixed(2);
      if (endInp) endInp.value = eSec.toFixed(2);
      drawWaveform();
    }

    function syncSlidersFromInputs() {
      if (!audioBuffer) return;
      const duration = audioBuffer.duration;
      const sSec = parseFloat(startInp ? startInp.value : 0) || 0;
      const eSec = parseFloat(endInp ? endInp.value : duration) || duration;

      if (startSlider) startSlider.value = Math.max(0, Math.min(100, (sSec / duration) * 100));
      if (endSlider) endSlider.value = Math.max(0, Math.min(100, (eSec / duration) * 100));
      drawWaveform();
    }

    function audioBufferToWav(buffer, startSec, endSec) {
      const sampleRate = buffer.sampleRate;
      const numChannels = buffer.numberOfChannels;
      const startOffset = Math.floor(startSec * sampleRate);
      const endOffset = Math.min(buffer.length, Math.floor(endSec * sampleRate));
      const frameCount = Math.max(1, endOffset - startOffset);

      const wavBuffer = new ArrayBuffer(44 + frameCount * numChannels * 2);
      const view = new DataView(wavBuffer);

      function writeString(offset, string) {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
      }

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + frameCount * numChannels * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * 2, true);
      view.setUint16(32, numChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, frameCount * numChannels * 2, true);

      let offset = 44;
      for (let i = 0; i < frameCount; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
          const sample = buffer.getChannelData(ch)[startOffset + i] || 0;
          const clamped = Math.max(-1, Math.min(1, sample));
          view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
          offset += 2;
        }
      }

      return new Blob([view], { type: 'audio/wav' });
    }

    async function handleFile(file) {
      if (!file) return;
      fileName = file.name.replace(/\.[^/.]+$/, '') + '-trimmed.wav';
      if (statusText) statusText.textContent = 'Decoding visual waveform...';
      dropZone.style.display = 'none';
      if (workspace) workspace.style.display = 'block';

      try {
        const ctx = getAudioCtx();
        // Decode does not need a running AudioContext — resume in the
        // background instead of awaiting it, or decoding can hang forever
        // in browsers where audio is blocked (headless / no output).
        if (ctx.state === 'suspended') { ctx.resume().catch(function () {}); }
        const arrayBuf = await file.arrayBuffer();
        audioBuffer = await ctx.decodeAudioData(arrayBuf);

        const duration = audioBuffer.duration;
        if (startInp) { startInp.value = '0.00'; startInp.max = duration; }
        if (endInp) { endInp.value = Math.min(duration, 30).toFixed(2); endInp.max = duration; }
        if (startSlider) { startSlider.value = 0; }
        if (endSlider) { endSlider.value = Math.min(100, (30 / duration) * 100); }

        if (canvas) {
          canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth || 600 : 600;
          canvas.height = 120;
          drawWaveform();
        }

        if (statusText) statusText.textContent = `Waveform ready: ${duration.toFixed(1)}s total audio duration.`;
      } catch (e) {
        console.error(e);
        if (statusText) statusText.textContent = 'Audio decoding error: ' + e.message;
      }
    }

    function stopPreview() {
      if (currentSource) {
        try { currentSource.stop(); } catch(e) {}
        currentSource = null;
      }
      isPlaying = false;
      if (previewBtn) previewBtn.innerHTML = '▶ Preview Selection';
    }

    if (previewBtn) {
      previewBtn.addEventListener('click', async () => {
        if (!audioBuffer) return;
        if (isPlaying) {
          stopPreview();
          return;
        }

        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();

        const duration = audioBuffer.duration;
        const start = Math.max(0, parseFloat(startInp ? startInp.value : 0) || 0);
        const end = Math.min(duration, parseFloat(endInp ? endInp.value : duration) || duration);
        const playLen = Math.max(0.1, end - start);

        currentSource = ctx.createBufferSource();
        currentSource.buffer = audioBuffer;
        currentSource.connect(ctx.destination);
        currentSource.start(0, start, playLen);
        isPlaying = true;
        previewBtn.innerHTML = '⏹ Stop Preview';

        currentSource.onended = () => {
          stopPreview();
        };
      });
    }

    if (startSlider) startSlider.addEventListener('input', syncInputsFromSliders);
    if (endSlider) endSlider.addEventListener('input', syncInputsFromSliders);
    if (startInp) startInp.addEventListener('input', syncSlidersFromInputs);
    if (endInp) endInp.addEventListener('input', syncSlidersFromInputs);

    fileInp.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    dropZone.addEventListener('click', () => fileInp.click());

    if (cutBtn) {
      cutBtn.addEventListener('click', () => {
        if (!audioBuffer) return;
        const duration = audioBuffer.duration;
        const start = Math.max(0, parseFloat(startInp ? startInp.value : 0) || 0);
        const end = Math.min(duration, parseFloat(endInp ? endInp.value : 10) || 10);

        if (start >= end) {
          if (statusText) statusText.textContent = 'Start time must be less than end time.';
          return;
        }

        const wavBlob = audioBufferToWav(audioBuffer, start, end);
        const url = URL.createObjectURL(wavBlob);

        if (downloadBtn) {
          downloadBtn.style.display = 'inline-flex';
          downloadBtn.className = 'btn btn-primary';
          downloadBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Trimmed Audio (' + (wavBlob.size / 1024).toFixed(1) + ' KB)';
          downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
          downloadBtn.click();
        }
        if (statusText) statusText.textContent = `✓ Trimmed ${(end - start).toFixed(1)}s audio ready for download!`;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
