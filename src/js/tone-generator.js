// tone-generator.js - Client-Side Audio Tone & Frequency Generator (Web Audio API)
(function () {
  'use strict';

  function init() {
    const waveSel = document.getElementById('toneWaveSelect');
    const freqSlider = document.getElementById('toneFreqSlider');
    const freqInput = document.getElementById('toneFreqInput');
    const volSlider = document.getElementById('toneVolSlider');
    const playBtn = document.getElementById('tonePlayBtn');
    const presetBtns = document.querySelectorAll('.tone-preset-btn');

    if (!freqSlider || !playBtn) return;

    let audioCtx = null;
    let oscillator = null;
    let gainNode = null;
    let isPlaying = false;

    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = parseFloat(volSlider ? volSlider.value : 0.2) || 0.2;
        gainNode.connect(audioCtx.destination);
      }
    }

    function startTone() {
      initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      oscillator = audioCtx.createOscillator();
      oscillator.type = waveSel ? waveSel.value : 'sine';
      oscillator.frequency.setValueAtTime(parseFloat(freqInput ? freqInput.value : 440) || 440, audioCtx.currentTime);

      oscillator.connect(gainNode);
      oscillator.start();
      isPlaying = true;
      playBtn.textContent = 'Stop Tone';
      playBtn.classList.add('active');
    }

    function stopTone() {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
      }
      isPlaying = false;
      playBtn.textContent = 'Play Tone';
      playBtn.classList.remove('active');
    }

    function updateFreq(val) {
      val = Math.max(20, Math.min(20000, val));
      if (freqSlider) freqSlider.value = val;
      if (freqInput) freqInput.value = val;
      if (oscillator && audioCtx) {
        oscillator.frequency.setValueAtTime(val, audioCtx.currentTime);
      }
    }

    playBtn.addEventListener('click', () => {
      if (isPlaying) stopTone();
      else startTone();
    });

    if (waveSel) {
      waveSel.addEventListener('change', () => {
        if (oscillator) oscillator.type = waveSel.value;
      });
    }

    if (freqSlider) freqSlider.addEventListener('input', () => updateFreq(parseFloat(freqSlider.value)));
    if (freqInput) freqInput.addEventListener('input', () => updateFreq(parseFloat(freqInput.value)));

    if (volSlider) {
      volSlider.addEventListener('input', () => {
        if (gainNode && audioCtx) {
          gainNode.gain.setValueAtTime(parseFloat(volSlider.value), audioCtx.currentTime);
        }
      });
    }

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const hz = parseFloat(btn.getAttribute('data-hz'));
        if (hz) updateFreq(hz);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
