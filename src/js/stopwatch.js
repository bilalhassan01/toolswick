// stopwatch.js - Pure client-side Stopwatch & Countdown Timer with Web Audio alert
(function () {
  'use strict';

  function init() {
    // Mode tabs
    const tabStopwatch = document.getElementById('timerTabStopwatch');
    const tabCountdown = document.getElementById('timerTabCountdown');
    const panelStopwatch = document.getElementById('timerPanelStopwatch');
    const panelCountdown = document.getElementById('timerPanelCountdown');

    if (tabStopwatch && tabCountdown) {
      tabStopwatch.addEventListener('click', () => {
        tabStopwatch.classList.add('active');
        tabCountdown.classList.remove('active');
        if (panelStopwatch) panelStopwatch.style.display = 'block';
        if (panelCountdown) panelCountdown.style.display = 'none';
      });
      tabCountdown.addEventListener('click', () => {
        tabCountdown.classList.add('active');
        tabStopwatch.classList.remove('active');
        if (panelStopwatch) panelStopwatch.style.display = 'none';
        if (panelCountdown) panelCountdown.style.display = 'block';
      });
    }

    // --- Web Audio Chime ---
    function playChime() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

          gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.85);
        });
      } catch (e) {
        // Audio error fallback
      }
    }

    // --- 1. STOPWATCH ---
    const swDisplay = document.getElementById('swDisplay');
    const swStartBtn = document.getElementById('swStartBtn');
    const swLapBtn = document.getElementById('swLapBtn');
    const swResetBtn = document.getElementById('swResetBtn');
    const swLapList = document.getElementById('swLapList');

    let swRunning = false;
    let swStartTime = 0;
    let swElapsedTime = 0;
    let swTimerId = null;
    let swLaps = [];
    let swLastLapTime = 0;

    function formatTime(ms) {
      const totalSec = Math.floor(ms / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      const centis = Math.floor((ms % 1000) / 10);

      const hh = String(hours).padStart(2, '0');
      const mm = String(mins).padStart(2, '0');
      const ss = String(secs).padStart(2, '0');
      const cc = String(centis).padStart(2, '0');

      return `${hh}:${mm}:${ss}.${cc}`;
    }

    function swUpdate() {
      const now = performance.now();
      const currentElapsed = swElapsedTime + (now - swStartTime);
      if (swDisplay) swDisplay.textContent = formatTime(currentElapsed);
    }

    if (swStartBtn) {
      swStartBtn.addEventListener('click', () => {
        if (!swRunning) {
          // Start / Resume
          swRunning = true;
          swStartTime = performance.now();
          swTimerId = setInterval(swUpdate, 15);
          swStartBtn.textContent = 'Pause';
          swStartBtn.className = 'btn ghost bad';
          if (swLapBtn) swLapBtn.disabled = false;
        } else {
          // Pause
          swRunning = false;
          clearInterval(swTimerId);
          swTimerId = null;
          swElapsedTime += performance.now() - swStartTime;
          swStartBtn.textContent = 'Resume';
          swStartBtn.className = 'btn';
        }
      });
    }

    if (swLapBtn) {
      swLapBtn.addEventListener('click', () => {
        if (!swRunning && swElapsedTime === 0) return;
        const now = performance.now();
        const total = swRunning ? swElapsedTime + (now - swStartTime) : swElapsedTime;
        const lapDuration = total - swLastLapTime;
        swLastLapTime = total;

        swLaps.unshift({
          idx: swLaps.length + 1,
          total: total,
          duration: lapDuration
        });
        renderLaps();
      });
    }

    function renderLaps() {
      if (!swLapList) return;
      if (swLaps.length === 0) {
        swLapList.innerHTML = '<div style="color:var(--muted,#888);padding:10px;text-align:center;">No laps recorded yet.</div>';
        return;
      }

      let minLap = Infinity;
      let maxLap = -Infinity;
      if (swLaps.length >= 2) {
        swLaps.forEach(l => {
          if (l.duration < minLap) minLap = l.duration;
          if (l.duration > maxLap) maxLap = l.duration;
        });
      }

      let html = '<table style="width:100%;border-collapse:collapse;font-size:0.9rem;"><thead><tr style="border-bottom:1px solid var(--border,#444);color:var(--muted,#aaa);"><th style="padding:6px;text-align:left;">Lap #</th><th style="padding:6px;text-align:right;">Lap Time</th><th style="padding:6px;text-align:right;">Overall Split</th></tr></thead><tbody>';

      swLaps.forEach(l => {
        let color = 'inherit';
        if (l.duration === minLap && minLap !== maxLap) color = '#4ade80'; // Fastest
        if (l.duration === maxLap && minLap !== maxLap) color = '#f87171'; // Slowest

        html += `<tr style="border-bottom:1px solid var(--border,#333);color:${color};">
          <td style="padding:6px 8px;">Lap ${l.idx}</td>
          <td style="padding:6px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;">+${formatTime(l.duration)}</td>
          <td style="padding:6px 8px;text-align:right;font-variant-numeric:tabular-nums;">${formatTime(l.total)}</td>
        </tr>`;
      });

      html += '</tbody></table>';
      swLapList.innerHTML = html;
    }

    if (swResetBtn) {
      swResetBtn.addEventListener('click', () => {
        swRunning = false;
        clearInterval(swTimerId);
        swTimerId = null;
        swElapsedTime = 0;
        swLastLapTime = 0;
        swLaps = [];
        if (swDisplay) swDisplay.textContent = '00:00:00.00';
        if (swStartBtn) {
          swStartBtn.textContent = 'Start';
          swStartBtn.className = 'btn';
        }
        if (swLapBtn) swLapBtn.disabled = true;
        renderLaps();
      });
    }

    // --- 2. COUNTDOWN TIMER ---
    const cdHours = document.getElementById('cdHours');
    const cdMins = document.getElementById('cdMins');
    const cdSecs = document.getElementById('cdSecs');
    const cdDisplay = document.getElementById('cdDisplay');
    const cdProgressBar = document.getElementById('cdProgressBar');
    const cdStartBtn = document.getElementById('cdStartBtn');
    const cdResetBtn = document.getElementById('cdResetBtn');
    const cdSoundCheck = document.getElementById('cdSoundCheck');
    const cdPresets = document.querySelectorAll('.cd-preset-btn');

    let cdRunning = false;
    let cdTimerId = null;
    let cdTotalSecs = 0;
    let cdRemainingSecs = 0;

    function formatCd(secs) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function cdUpdate() {
      if (cdRemainingSecs <= 0) {
        clearInterval(cdTimerId);
        cdTimerId = null;
        cdRunning = false;
        cdRemainingSecs = 0;
        if (cdDisplay) {
          cdDisplay.textContent = '00:00:00';
          cdDisplay.style.color = '#f87171';
        }
        if (cdProgressBar) cdProgressBar.style.width = '0%';
        if (cdStartBtn) {
          cdStartBtn.textContent = 'Start';
          cdStartBtn.className = 'btn';
        }
        if (cdSoundCheck && cdSoundCheck.checked) {
          playChime();
        }
        return;
      }

      cdRemainingSecs--;
      if (cdDisplay) cdDisplay.textContent = formatCd(cdRemainingSecs);
      if (cdProgressBar && cdTotalSecs > 0) {
        const pct = (cdRemainingSecs / cdTotalSecs) * 100;
        cdProgressBar.style.width = pct + '%';
      }
    }

    if (cdStartBtn) {
      cdStartBtn.addEventListener('click', () => {
        if (!cdRunning) {
          if (cdRemainingSecs <= 0) {
            const h = parseInt(cdHours ? cdHours.value : 0, 10) || 0;
            const m = parseInt(cdMins ? cdMins.value : 0, 10) || 0;
            const s = parseInt(cdSecs ? cdSecs.value : 0, 10) || 0;
            cdTotalSecs = (h * 3600) + (m * 60) + s;
            cdRemainingSecs = cdTotalSecs;
          }

          if (cdRemainingSecs <= 0) return;

          cdRunning = true;
          if (cdDisplay) {
            cdDisplay.textContent = formatCd(cdRemainingSecs);
            cdDisplay.style.color = '#38bdf8';
          }
          if (cdProgressBar) cdProgressBar.style.width = '100%';

          cdStartBtn.textContent = 'Pause';
          cdStartBtn.className = 'btn ghost bad';
          cdTimerId = setInterval(cdUpdate, 1000);
        } else {
          // Pause
          cdRunning = false;
          clearInterval(cdTimerId);
          cdTimerId = null;
          cdStartBtn.textContent = 'Resume';
          cdStartBtn.className = 'btn';
        }
      });
    }

    if (cdResetBtn) {
      cdResetBtn.addEventListener('click', () => {
        cdRunning = false;
        clearInterval(cdTimerId);
        cdTimerId = null;
        cdTotalSecs = 0;
        cdRemainingSecs = 0;
        if (cdDisplay) {
          cdDisplay.textContent = '00:00:00';
          cdDisplay.style.color = '#38bdf8';
        }
        if (cdProgressBar) cdProgressBar.style.width = '100%';
        if (cdStartBtn) {
          cdStartBtn.textContent = 'Start';
          cdStartBtn.className = 'btn';
        }
      });
    }

    cdPresets.forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-mins'), 10) || 0;
        if (cdHours) cdHours.value = '0';
        if (cdMins) cdMins.value = mins.toString();
        if (cdSecs) cdSecs.value = '0';

        cdRunning = false;
        clearInterval(cdTimerId);
        cdTimerId = null;
        cdTotalSecs = mins * 60;
        cdRemainingSecs = cdTotalSecs;
        if (cdDisplay) {
          cdDisplay.textContent = formatCd(cdRemainingSecs);
          cdDisplay.style.color = '#38bdf8';
        }
        if (cdProgressBar) cdProgressBar.style.width = '100%';
        if (cdStartBtn) {
          cdStartBtn.textContent = 'Start';
          cdStartBtn.className = 'btn';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
