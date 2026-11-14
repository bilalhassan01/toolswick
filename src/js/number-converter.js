// Number Base Converter (Binary, Octal, Decimal, Hex)
(function(){
  var binIn = document.getElementById('nbBin');
  var octIn = document.getElementById('nbOct');
  var decIn = document.getElementById('nbDec');
  var hexIn = document.getElementById('nbHex');
  var clearBtn = document.getElementById('nbClear');
  var errEl = document.getElementById('nbErr');

  function updateAllFromBigInt(val, source){
    if(errEl) errEl.textContent = '';
    if(val === null){
      if(source !== 'bin' && binIn) binIn.value = '';
      if(source !== 'oct' && octIn) octIn.value = '';
      if(source !== 'dec' && decIn) decIn.value = '';
      if(source !== 'hex' && hexIn) hexIn.value = '';
      return;
    }
    if(source !== 'bin' && binIn) binIn.value = val.toString(2);
    if(source !== 'oct' && octIn) octIn.value = val.toString(8);
    if(source !== 'dec' && decIn) decIn.value = val.toString(10);
    if(source !== 'hex' && hexIn) hexIn.value = val.toString(16).toUpperCase();
  }

  function handleInput(el, base, source){
    var raw = el.value.trim();
    if(!raw){
      updateAllFromBigInt(null, source);
      return;
    }
    try {
      var val;
      if(base === 2){
        if(/[^01]/.test(raw)) throw new Error('Invalid binary digit (must be 0 or 1)');
        val = BigInt('0b' + raw);
      } else if(base === 8){
        if(/[^0-7]/.test(raw)) throw new Error('Invalid octal digit (must be 0-7)');
        val = BigInt('0o' + raw);
      } else if(base === 10){
        if(/[^0-9]/.test(raw)) throw new Error('Invalid decimal digit (must be 0-9)');
        val = BigInt(raw);
      } else if(base === 16){
        if(/[^0-9a-fA-F]/.test(raw)) throw new Error('Invalid hexadecimal digit (must be 0-9, A-F)');
        val = BigInt('0x' + raw);
      }
      updateAllFromBigInt(val, source);
    } catch(e) {
      if(errEl) errEl.textContent = e.message;
    }
  }

  if(binIn) binIn.addEventListener('input', function(){ handleInput(binIn, 2, 'bin'); });
  if(octIn) octIn.addEventListener('input', function(){ handleInput(octIn, 8, 'oct'); });
  if(decIn) decIn.addEventListener('input', function(){ handleInput(decIn, 10, 'dec'); });
  if(hexIn) hexIn.addEventListener('input', function(){ handleInput(hexIn, 16, 'hex'); });

  // Copy buttons
  document.querySelectorAll('.copy-nb-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var targetId = btn.dataset.target;
      var targetEl = document.getElementById(targetId);
      if(!targetEl || !targetEl.value) return;
      navigator.clipboard.writeText(targetEl.value).then(function(){
        var orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function(){ btn.textContent = orig; }, 1500);
      });
    });
  });

  if(clearBtn){
    clearBtn.addEventListener('click', function(){
      updateAllFromBigInt(null, 'all');
      if(decIn) decIn.focus();
    });
  }

  // Initial value: 42
  if(decIn){
    decIn.value = '42';
    handleInput(decIn, 10, 'dec');
  }
})();
