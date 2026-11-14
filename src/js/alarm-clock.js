// alarm-clock.js - Client-Side Online Alarm Clock with Web Audio Alarm
(function () {
  'use strict';

  function init() {
    const clockDisplay = document.getElementById('alarmCurrentClock');
    const timeInp = document.getElementById('alarmTimeInput');
    const labelInp = document.getElementById('alarmLabelInput');
    const setBtn = document.getElementById('alarmSetBtn');
    const testBtn = document.getElementById('alarmTestBtn');
    const stopBtn = document.getElementById('alarmStopBtn');
    const statusText = document.getElementById('alarmStatusText');

    if (!clockDisplay || !timeInp) return;

    let alarmTime = null;
    let alarmLabel = 'Alarm';
    let isAlarmTriggered = false;
    let audioLoop = null;

    let sharedAudioCtx = null;
    function getAudioCtx() {
      if (!sharedAudioCtx) {
        sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
      }
      return sharedAudioCtx;
    }

    function playBeep() {
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {}
    }

    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      clockDisplay.textContent = timeStr;

      if (alarmTime && !isAlarmTriggered) {
        const currentHM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        if (currentHM === alarmTime) {
          triggerAlarm();
        }
      }
    }

    function triggerAlarm() {
      isAlarmTriggered = true;
      if (statusText) {
        statusText.textContent = `⏰ WAKE UP! ${alarmLabel} is ringing!`;
        statusText.style.color = '#ef4444';
      }
      if (stopBtn) stopBtn.style.display = 'inline-block';

      audioLoop = setInterval(playBeep, 600);
    }

    function stopAlarm() {
      clearInterval(audioLoop);
      isAlarmTriggered = false;
      alarmTime = null;
      if (stopBtn) stopBtn.style.display = 'none';
      if (statusText) {
        statusText.textContent = 'Alarm stopped.';
        statusText.style.color = 'var(--muted)';
      }
      if (setBtn) setBtn.textContent = 'Set Alarm';
    }

    if (testBtn) {
      testBtn.addEventListener('click', () => {
        playBeep();
        setTimeout(playBeep, 400);
        setTimeout(playBeep, 800);
        if (window.TK && TK.toast) TK.toast('Playing test audio chime...', 'info');
      });
    }

    if (setBtn) {
      setBtn.addEventListener('click', () => {
        if (alarmTime && !isAlarmTriggered) {
          // Cancel
          alarmTime = null;
          setBtn.textContent = 'Set Alarm';
          if (statusText) statusText.textContent = 'Alarm cancelled.';
        } else {
          alarmTime = timeInp.value;
          alarmLabel = labelInp ? labelInp.value.trim() || 'Alarm' : 'Alarm';
          if (!alarmTime) return;
          isAlarmTriggered = false;
          setBtn.textContent = 'Cancel Alarm';
          if (statusText) {
            statusText.textContent = `✓ Alarm set for ${alarmTime} (${alarmLabel}). Please leave this tab open.`;
            statusText.style.color = '#10b981';
          }
        }
      });
    }

    if (stopBtn) stopBtn.addEventListener('click', stopAlarm);

    setInterval(updateClock, 1000);
    updateClock();

    // Default alarm time to next hour
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    timeInp.value = now.toTimeString().slice(0, 5);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
