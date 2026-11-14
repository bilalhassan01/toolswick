// Morse Code Translator & Audio Player
(function(){
  var CHAR_TO_MORSE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
  };

  var MORSE_TO_CHAR = {};
  Object.keys(CHAR_TO_MORSE).forEach(function(ch){
    MORSE_TO_CHAR[CHAR_TO_MORSE[ch]] = ch;
  });

  var modeTextToMorse = document.getElementById('modeTextToMorse');
  var modeMorseToText = document.getElementById('modeMorseToText');
  var inp = document.getElementById('mcInput');
  var out = document.getElementById('mcOutput');
  var transBtn = document.getElementById('mcTranslate');
  var copyBtn = document.getElementById('mcCopy');
  var playBtn = document.getElementById('mcPlay');
  var clearBtn = document.getElementById('mcClear');

  var currentMode = 'text-to-morse'; // or 'morse-to-text'

  function setMode(mode){
    currentMode = mode;
    if(inp) inp.placeholder = (mode === 'text-to-morse') ? 'Enter plain text here...' : 'Enter Morse code (dots and dashes, e.g. ... --- ...) here...';
  }

  if(modeTextToMorse) modeTextToMorse.addEventListener('change', function(){ if(this.checked) setMode('text-to-morse'); });
  if(modeMorseToText) modeMorseToText.addEventListener('change', function(){ if(this.checked) setMode('morse-to-text'); });

  function textToMorse(text){
    var words = text.trim().toUpperCase().split(/\s+/);
    var morseWords = words.map(function(w){
      var chars = w.split('');
      var mChars = chars.map(function(c){
        return CHAR_TO_MORSE[c] || c;
      });
      return mChars.join(' ');
    });
    return morseWords.join(' / ');
  }

  function morseToText(morse){
    // Split by slash or multiple spaces for words
    var words = morse.trim().split(/\s*\/\s*|\s{3,}/);
    var decodedWords = words.map(function(w){
      var tokens = w.trim().split(/\s+/);
      var chars = tokens.map(function(tok){
        return MORSE_TO_CHAR[tok] || tok;
      });
      return chars.join('');
    });
    return decodedWords.join(' ');
  }

  function translate(){
    if(!inp || !out) return;
    var val = inp.value;
    if(currentMode === 'text-to-morse'){
      out.value = textToMorse(val);
    } else {
      out.value = morseToText(val);
    }
  }

  if(transBtn) transBtn.addEventListener('click', translate);

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out || !out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy Output'; }, 1500);
    });
  });

  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(inp) inp.value = '';
    if(out) out.value = '';
    if(inp) inp.focus();
  });

  // Audio playback using Web Audio API
  // dot = 80ms, dash = 240ms, element-gap = 80ms, letter-gap = 240ms, word-gap = 560ms
  var audioCtx = null;
  var isPlaying = false;
  var stopPlayback = false;

  function playTone(freq, durationMs){
    return new Promise(function(resolve){
      if(stopPlayback){ resolve(); return; }
      if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if(audioCtx.state === 'suspended') audioCtx.resume();

      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + (durationMs / 1000));
      setTimeout(resolve, durationMs);
    });
  }

  function sleep(ms){
    return new Promise(function(resolve){
      setTimeout(resolve, ms);
    });
  }

  async function playMorseString(morseStr){
    isPlaying = true;
    stopPlayback = false;
    if(playBtn) playBtn.textContent = 'Stop Audio';

    for(var i = 0; i < morseStr.length; i++){
      if(stopPlayback) break;
      var ch = morseStr[i];
      if(ch === '.'){
        await playTone(600, 80);
        await sleep(80); // intra-element gap
      } else if(ch === '-'){
        await playTone(600, 240);
        await sleep(80); // intra-element gap
      } else if(ch === ' '){
        await sleep(160); // additional gap for letter gap (total 240ms)
      } else if(ch === '/'){
        await sleep(400); // word gap (total 560ms)
      }
    }

    isPlaying = false;
    stopPlayback = false;
    if(playBtn) playBtn.textContent = 'Play Audio';
  }

  if(playBtn) playBtn.addEventListener('click', function(){
    if(isPlaying){
      stopPlayback = true;
      isPlaying = false;
      playBtn.textContent = 'Play Audio';
      return;
    }
    var morse = (currentMode === 'text-to-morse') ? (out ? out.value : '') : (inp ? inp.value : '');
    if(!morse && inp){
      translate();
      morse = out ? out.value : '';
    }
    if(!morse) return;
    playMorseString(morse);
  });
})();
