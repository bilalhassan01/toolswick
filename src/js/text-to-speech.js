// text-to-speech.js - Client-Side Text to Speech Reader using Native Web Speech API
(function () {
  'use strict';

  function init() {
    const textInp = document.getElementById('ttsInput');
    const voiceSel = document.getElementById('ttsVoiceSelect');
    const rateInp = document.getElementById('ttsRateInput');
    const rateVal = document.getElementById('ttsRateValue');
    const pitchInp = document.getElementById('ttsPitchInput');
    const pitchVal = document.getElementById('ttsPitchValue');
    const speakBtn = document.getElementById('ttsSpeakBtn');
    const pauseBtn = document.getElementById('ttsPauseBtn');
    const stopBtn = document.getElementById('ttsStopBtn');
    const clearBtn = document.getElementById('ttsClearBtn');
    const statusText = document.getElementById('ttsStatus');

    if (!textInp || !speakBtn) return;

    if (!('speechSynthesis' in window)) {
      if (statusText) statusText.textContent = 'No voices available on this device — try another browser or device.';
      return;
    }

    let voices = [];
    // getVoices() returns [] on first call in Chrome until voices finish
    // loading (voiceschanged). Only treat "no voices" as real once loading
    // has finished, or the status contradicts the populated dropdown.
    let voicesLoaded = false;

    function populateVoices() {
      try {
        voices = window.speechSynthesis.getVoices() || [];
      } catch (err) {
        voices = [];
      }

      if (!voiceSel) return;

      if (voices.length === 0) {
        voiceSel.innerHTML = '<option value="">No system voices detected</option>';
        if (voicesLoaded && statusText) {
          statusText.textContent = 'No voices available on this device — try another browser or device.';
        }
        return;
      }

      voiceSel.innerHTML = voices.map((v, i) =>
        `<option value="${i}">${v.name} (${v.lang}) ${v.default ? ' — Default' : ''}</option>`
      ).join('');
      // Voices are available — clear any stale "No voices" message.
      if (statusText) statusText.textContent = '';
    }

    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        voicesLoaded = true;
        populateVoices();
      };
    }
    // Fallback for browsers where voiceschanged never fires: re-check after
    // a short delay so a genuinely empty voice list still shows the message.
    setTimeout(() => {
      voicesLoaded = true;
      populateVoices();
    }, 1000);

    function speak() {
      if (window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          if (statusText) statusText.textContent = 'Speaking...';
          return;
        }
      }

      const text = textInp.value.trim();
      if (!text) {
        if (statusText) statusText.textContent = 'Please enter text to read aloud.';
        return;
      }

      const currentVoices = window.speechSynthesis.getVoices() || voices;
      if (!currentVoices || currentVoices.length === 0) {
        if (statusText) statusText.textContent = 'No voices available on this device — try another browser or device.';
        return;
      }

      window.speechSynthesis.cancel(); // stop any current speech
      const utter = new SpeechSynthesisUtterance(text);

      const voiceIndex = parseInt(voiceSel ? voiceSel.value : 0, 10);
      if (currentVoices[voiceIndex]) {
        utter.voice = currentVoices[voiceIndex];
      }

      utter.rate = parseFloat(rateInp ? rateInp.value : 1) || 1;
      utter.pitch = parseFloat(pitchInp ? pitchInp.value : 1) || 1;

      utter.onstart = () => {
        if (statusText) statusText.textContent = 'Speaking...';
      };
      utter.onend = () => {
        if (statusText) statusText.textContent = 'Playback completed.';
      };
      utter.onerror = (e) => {
        if (e.error === 'synthesis-failed' || e.error === 'synthesis-unavailable' || e.error === 'voice-unavailable' || !currentVoices.length) {
          if (statusText) statusText.textContent = 'No voices available on this device — try another browser or device.';
        } else if (e.error === 'interrupted' || e.error === 'canceled') {
          // Normal pause or stop, do not report as error
        } else {
          if (statusText) statusText.textContent = 'Speech playback notice: ' + (e.error || 'Stopped.');
        }
      };

      try {
        window.speechSynthesis.speak(utter);
      } catch (err) {
        if (statusText) statusText.textContent = 'No voices available on this device — try another browser or device.';
      }
    }

    speakBtn.addEventListener('click', speak);

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (window.speechSynthesis.speaking) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            pauseBtn.textContent = 'Pause';
          } else {
            window.speechSynthesis.pause();
            pauseBtn.textContent = 'Resume';
          }
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        if (statusText) statusText.textContent = 'Stopped.';
        if (pauseBtn) pauseBtn.textContent = 'Pause';
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        textInp.value = '';
        window.speechSynthesis.cancel();
        if (statusText) statusText.textContent = '';
      });
    }

    if (rateInp && rateVal) {
      rateInp.addEventListener('input', () => {
        rateVal.textContent = `${rateInp.value}x`;
      });
    }

    if (pitchInp && pitchVal) {
      pitchInp.addEventListener('input', () => {
        pitchVal.textContent = pitchInp.value;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
