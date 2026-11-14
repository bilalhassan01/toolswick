// Strong Random Password Generator
(function(){
  var lenRange = document.getElementById('pwLength');
  var lenVal = document.getElementById('pwLengthVal');
  var cbUpper = document.getElementById('pwUpper');
  var cbLower = document.getElementById('pwLower');
  var cbNum = document.getElementById('pwNum');
  var cbSym = document.getElementById('pwSym');
  var cbAmb = document.getElementById('pwAmb');
  var out = document.getElementById('pwOutput');
  var genBtn = document.getElementById('pwGenerate');
  var copyBtn = document.getElementById('pwCopy');
  var strengthBar = document.getElementById('pwStrengthBar');
  var strengthText = document.getElementById('pwStrengthText');

  var UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var LOWER = 'abcdefghijklmnopqrstuvwxyz';
  var NUMS = '0123456789';
  var SYMS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  var AMBIGUOUS = /[l1IO0o]/g;

  function updateLengthLabel(){
    if(lenVal && lenRange) lenVal.textContent = lenRange.value;
  }

  function getSecureRandomInt(max){
    var array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  function generatePassword(){
    if(!out || !lenRange) return;
    var len = parseInt(lenRange.value, 10) || 16;
    var upper = cbUpper && cbUpper.checked;
    var lower = cbLower && cbLower.checked;
    var nums = cbNum && cbNum.checked;
    var syms = cbSym && cbSym.checked;
    var noAmb = cbAmb && cbAmb.checked;

    var chars = '';
    if(upper) chars += UPPER;
    if(lower) chars += LOWER;
    if(nums) chars += NUMS;
    if(syms) chars += SYMS;

    if(noAmb){
      chars = chars.replace(AMBIGUOUS, '');
    }

    if(!chars){
      chars = LOWER;
      if(cbLower) cbLower.checked = true;
    }

    var pw = '';
    for(var i=0; i<len; i++){
      pw += chars[getSecureRandomInt(chars.length)];
    }

    out.value = pw;
    calculateStrength(pw);
  }

  function calculateStrength(pw){
    var score = 0;
    if(pw.length >= 8) score++;
    if(pw.length >= 12) score++;
    if(pw.length >= 16) score++;
    if(/[A-Z]/.test(pw)) score++;
    if(/[a-z]/.test(pw)) score++;
    if(/[0-9]/.test(pw)) score++;
    if(/[^A-Za-z0-9]/.test(pw)) score++;

    var label = 'Weak';
    var color = '#ef4444';
    var pct = '25%';

    if(score >= 6){
      label = 'Very Strong';
      color = '#22c55e';
      pct = '100%';
    } else if(score >= 4){
      label = 'Strong';
      color = '#10b981';
      pct = '75%';
    } else if(score >= 3){
      label = 'Medium';
      color = '#f59e0b';
      pct = '50%';
    }

    if(strengthText) strengthText.textContent = label;
    if(strengthBar){
      strengthBar.style.width = pct;
      strengthBar.style.backgroundColor = color;
    }
  }

  if(lenRange){
    lenRange.addEventListener('input', function(){
      updateLengthLabel();
      generatePassword();
    });
  }

  [cbUpper, cbLower, cbNum, cbSym, cbAmb].forEach(function(cb){
    if(cb) cb.addEventListener('change', generatePassword);
  });

  if(genBtn) genBtn.addEventListener('click', generatePassword);

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out || !out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy Password'; }, 1500);
    });
  });

  updateLengthLabel();
  generatePassword();
})();
