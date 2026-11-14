// pomodoro-timer.js - Client-Side Pomodoro Productivity Timer with Web Audio Alarm
(function () {
  'use strict';

  function init() {
    const timeDisplay = document.getElementById('pomoTimeDisplay');
    const modeBadge = document.getElementById('pomoModeBadge');
    const startPauseBtn = document.getElementById('pomoStartPauseBtn');
    const resetBtn = document.getElementById('pomoResetBtn');
    const skipBtn = document.getElementById('pomoSkipBtn');

    const workTab = document.getElementById('pomoTabWork');
    const shortTab = document.getElementById('pomoTabShort');
    const longTab = document.getElementById('pomoTabLong');

    const workMinsInp = document.getElementById('pomoWorkMins');
    const shortMinsInp = document.getElementById('pomoShortMins');
    const longMinsInp = document.getElementById('pomoLongMins');

    const soundSel = document.getElementById('pomoSoundSelect');
    const testSoundBtn = document.getElementById('pomoTestSoundBtn');

    if (!timeDisplay || !startPauseBtn) return;

    let mode = 'work'; // 'work', 'short', 'long'
    let timeLeft = 25 * 60;
    let isRunning = false;
    let timer = null;
    let completedSessions = 0;

    function playAlarm() {
      const soundType = soundSel ? soundSel.value : 'chime';
      if (soundType === 'mute') return;

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        if (soundType === 'digital') {
          // Double beep
          for (let i = 0; i < 2; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime + i * 0.2);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.2 + 0.15);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + i * 0.2);
            osc.stop(audioCtx.currentTime + i * 0.2 + 0.15);
          }
        } else if (soundType === 'bell') {
          // Low resonant bell
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 1.2);
        } else {
          // Zen chime
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 1.0);
        }
      } catch (e) {
        console.error('Audio chime error', e);
      }
    }

    if (testSoundBtn) {
      testSoundBtn.addEventListener('click', playAlarm);
    }

    function updateDisplay() {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      timeDisplay.textContent = str;
      document.title = `${str} - ${mode === 'work' ? 'Focus' : 'Break'} | Toolswick`;
    }

    function setMode(newMode) {
      mode = newMode;
      isRunning = false;
      clearInterval(timer);
      startPauseBtn.textContent = 'Start Focus';
      startPauseBtn.className = 'btn primary';

      if (workTab && shortTab && longTab) {
        workTab.className = mode === 'work' ? 'btn active' : 'btn ghost';
        shortTab.className = mode === 'short' ? 'btn active' : 'btn ghost';
        longTab.className = mode === 'long' ? 'btn active' : 'btn ghost';
      }

      if (modeBadge) {
        if (mode === 'work') {
          modeBadge.textContent = 'Focus Session';
          modeBadge.style.color = '#10b981';
          timeLeft = (parseInt(workMinsInp.value, 10) || 25) * 60;
        } else if (mode === 'short') {
          modeBadge.textContent = 'Short Break';
          modeBadge.style.color = '#38bdf8';
          timeLeft = (parseInt(shortMinsInp.value, 10) || 5) * 60;
        } else {
          modeBadge.textContent = 'Long Break';
          modeBadge.style.color = '#a855f7';
          timeLeft = (parseInt(longMinsInp.value, 10) || 15) * 60;
        }
      }
      updateDisplay();
    }

    function tick() {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timer);
        isRunning = false;
        playAlarm();

        if (mode === 'work') {
          completedSessions++;
          if (completedSessions % 4 === 0) {
            setMode('long');
          } else {
            setMode('short');
          }
        } else {
          setMode('work');
        }
      }
    }

    startPauseBtn.addEventListener('click', () => {
      if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startPauseBtn.textContent = 'Resume';
      } else {
        isRunning = true;
        startPauseBtn.textContent = 'Pause';
        timer = setInterval(tick, 1000);
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        setMode(mode);
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (mode === 'work') setMode('short');
        else setMode('work');
      });
    }

    // Keep the preset tab labels in sync with the custom durations, so a
    // custom Focus length (e.g. 40m) does not leave the tab reading "25m".
    function syncTabLabels() {
      if (workTab) workTab.textContent = 'Focus (' + (parseInt(workMinsInp.value, 10) || 25) + 'm)';
      if (shortTab) shortTab.textContent = 'Short Break (' + (parseInt(shortMinsInp.value, 10) || 5) + 'm)';
      if (longTab) longTab.textContent = 'Long Break (' + (parseInt(longMinsInp.value, 10) || 15) + 'm)';
    }

    if (workTab) workTab.addEventListener('click', () => setMode('work'));
    if (shortTab) shortTab.addEventListener('click', () => setMode('short'));
    if (longTab) longTab.addEventListener('click', () => setMode('long'));

    [workMinsInp, shortMinsInp, longMinsInp].forEach(inp => {
      if (inp) {
        // Listen to 'input' as well as 'change': 'change' only fires on blur,
        // so a duration edited last (e.g. Long Break) left its tab stale
        // until the field lost focus. 'input' syncs the label immediately.
        inp.addEventListener('input', () => { syncTabLabels(); setMode(mode); });
        inp.addEventListener('change', () => { syncTabLabels(); setMode(mode); });
      }
    });

    syncTabLabels();
    setMode('work');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
