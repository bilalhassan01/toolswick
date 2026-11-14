// metronome.js - Client-Side Precision Metronome with Web Audio API
(function () {
  'use strict';

  function init() {
    const bpmSlider = document.getElementById('metroBpmSlider');
    const bpmDisplay = document.getElementById('metroBpmDisplay');
    const bpmDecreaseBtn = document.getElementById('metroDecreaseBtn');
    const bpmIncreaseBtn = document.getElementById('metroIncreaseBtn');
    const beatsSel = document.getElementById('metroBeatsSelect');
    const startStopBtn = document.getElementById('metroStartStopBtn');
    const visualDot = document.getElementById('metroVisualDot');

    if (!bpmSlider || !startStopBtn) return;

    let isRunning = false;
    let bpm = 120;
    let beatsPerMeasure = 4;
    let currentBeat = 0;
    let timer = null;
    let audioCtx = null;

    function playClick(isFirstBeat) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // High pitch for first beat (1000Hz), regular for other beats (800Hz)
        osc.frequency.setValueAtTime(isFirstBeat ? 1200 : 800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);

        // Flash dot
        if (visualDot) {
          visualDot.style.background = isFirstBeat ? '#ef4444' : '#10b981';
          visualDot.style.transform = 'scale(1.3)';
          setTimeout(() => {
            visualDot.style.background = 'var(--muted)';
            visualDot.style.transform = 'scale(1)';
          }, 80);
        }
      } catch (e) {}
    }

    function tick() {
      currentBeat = (currentBeat % beatsPerMeasure) + 1;
      playClick(currentBeat === 1);
    }

    function start() {
      isRunning = true;
      currentBeat = 0;
      startStopBtn.textContent = 'Stop Metronome';
      startStopBtn.classList.add('active');
      const intervalMs = (60 / bpm) * 1000;
      tick();
      timer = setInterval(tick, intervalMs);
    }

    function stop() {
      isRunning = false;
      clearInterval(timer);
      startStopBtn.textContent = 'Start Metronome';
      startStopBtn.classList.remove('active');
    }

    function updateBpm(newBpm) {
      bpm = Math.max(30, Math.min(250, newBpm));
      bpmSlider.value = bpm;
      if (bpmDisplay) bpmDisplay.textContent = `${bpm} BPM`;
      if (isRunning) {
        clearInterval(timer);
        timer = setInterval(tick, (60 / bpm) * 1000);
      }
    }

    startStopBtn.addEventListener('click', () => {
      if (isRunning) stop();
      else start();
    });

    bpmSlider.addEventListener('input', () => updateBpm(parseInt(bpmSlider.value, 10)));
    if (bpmDecreaseBtn) bpmDecreaseBtn.addEventListener('click', () => updateBpm(bpm - 1));
    if (bpmIncreaseBtn) bpmIncreaseBtn.addEventListener('click', () => updateBpm(bpm + 1));
    if (beatsSel) beatsSel.addEventListener('change', () => {
      beatsPerMeasure = parseInt(beatsSel.value, 10) || 4;
      currentBeat = 0;
    });


    // Tap Tempo Implementation
    const tapBtn = document.getElementById('metroTapBtn');
    let tapTimes = [];
    if (tapBtn) {
      tapBtn.addEventListener('click', () => {
        const now = Date.now();
        tapTimes = tapTimes.filter(t => now - t < 3000);
        tapTimes.push(now);
        if (tapTimes.length >= 2) {
          const intervals = [];
          for (let i = 1; i < tapTimes.length; i++) {
            intervals.push(tapTimes[i] - tapTimes[i - 1]);
          }
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const calculatedBpm = Math.round(60000 / avgInterval);
          updateBpm(calculatedBpm);
        }
        tapBtn.textContent = `🥁 Tap (${tapTimes.length})`;
        clearTimeout(tapBtn._resetTimer);
        tapBtn._resetTimer = setTimeout(() => {
          tapBtn.textContent = '🥁 Tap Tempo';
          tapTimes = [];
        }, 2200);
      });
    }

    updateBpm(120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
