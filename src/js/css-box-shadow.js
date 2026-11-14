// CSS Box Shadow Generator
(function(){
  var xRange = document.getElementById('bsX');
  var xVal = document.getElementById('bsXVal');
  var yRange = document.getElementById('bsY');
  var yVal = document.getElementById('bsYVal');
  var blurRange = document.getElementById('bsBlur');
  var blurVal = document.getElementById('bsBlurVal');
  var spreadRange = document.getElementById('bsSpread');
  var spreadVal = document.getElementById('bsSpreadVal');
  var colIn = document.getElementById('bsColor');
  var opacityRange = document.getElementById('bsOpacity');
  var opacityVal = document.getElementById('bsOpacityVal');
  var insetCheck = document.getElementById('bsInset');

  var previewCard = document.getElementById('bsPreviewCard');
  var cssOut = document.getElementById('bsCssOut');
  var copyBtn = document.getElementById('bsCopy');

  function hexToRgba(hex, alpha){
    var c = hex.replace('#', '');
    if(c.length === 3) c = c[0]+c[0] + c[1]+c[1] + c[2]+c[2];
    var num = parseInt(c, 16);
    return 'rgba(' + ((num >> 16) & 255) + ', ' + ((num >> 8) & 255) + ', ' + (num & 255) + ', ' + alpha + ')';
  }

  function updateShadow(){
    if(!previewCard || !cssOut) return;
    var x = xRange ? xRange.value : '0';
    var y = yRange ? yRange.value : '10';
    var blur = blurRange ? blurRange.value : '25';
    var spread = spreadRange ? spreadRange.value : '-5';
    var color = colIn ? colIn.value : '#000000';
    var op = opacityRange ? (parseInt(opacityRange.value, 10) / 100).toFixed(2) : '0.15';
    var inset = insetCheck && insetCheck.checked ? 'inset ' : '';

    if(xVal) xVal.textContent = x + 'px';
    if(yVal) yVal.textContent = y + 'px';
    if(blurVal) blurVal.textContent = blur + 'px';
    if(spreadVal) spreadVal.textContent = spread + 'px';
    if(opacityVal) opacityVal.textContent = Math.round(op * 100) + '%';

    var rgba = hexToRgba(color, op);
    var shadowStr = inset + x + 'px ' + y + 'px ' + blur + 'px ' + spread + 'px ' + rgba;
    var cssRule = 'box-shadow: ' + shadowStr + ';';

    previewCard.style.boxShadow = shadowStr;
    cssOut.value = cssRule;
  }

  [xRange, yRange, blurRange, spreadRange, colIn, opacityRange, insetCheck].forEach(function(el){
    if(el) el.addEventListener('input', updateShadow);
    if(el) el.addEventListener('change', updateShadow);
  });

  if(copyBtn){
    copyBtn.addEventListener('click', function(){
      if(!cssOut || !cssOut.value) return;
      navigator.clipboard.writeText(cssOut.value).then(function(){
        copyBtn.textContent = 'Copied!';
        setTimeout(function(){ copyBtn.textContent = 'Copy CSS'; }, 1500);
      });
    });
  }

  updateShadow();
})();
