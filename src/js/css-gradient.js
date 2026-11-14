// CSS Gradient Generator
(function(){
  var typeLinear = document.getElementById('gradTypeLinear');
  var typeRadial = document.getElementById('gradTypeRadial');
  var angleRange = document.getElementById('gradAngle');
  var angleVal = document.getElementById('gradAngleVal');
  var angleGroup = document.getElementById('gradAngleGroup');

  var col1 = document.getElementById('gradCol1');
  var col2 = document.getElementById('gradCol2');
  var col3 = document.getElementById('gradCol3');
  var col3Check = document.getElementById('gradCol3Enable');

  var previewBox = document.getElementById('gradPreview');
  var cssOut = document.getElementById('gradCssOut');
  var copyBtn = document.getElementById('gradCopy');

  function updateGradient(){
    if(!previewBox || !cssOut) return;
    var isRadial = typeRadial && typeRadial.checked;
    var angle = angleRange ? angleRange.value : '90';
    if(angleVal) angleVal.textContent = angle + '°';
    if(angleGroup) angleGroup.style.display = isRadial ? 'none' : 'flex';

    var c1 = col1 ? col1.value : '#3b82f6';
    var c2 = col2 ? col2.value : '#9333ea';
    var has3 = col3Check && col3Check.checked;
    var c3 = col3 ? col3.value : '#ec4899';

    var stops = c1 + ', ' + c2;
    if(has3) stops += ', ' + c3;

    var cssRule = '';
    var gradient = '';
    if(isRadial){
      gradient = 'radial-gradient(circle, ' + stops + ')';
    } else {
      gradient = 'linear-gradient(' + angle + 'deg, ' + stops + ')';
    }
    cssRule = 'background: ' + gradient + ';';

    // Set only the background — assigning style.cssText would wipe the
    // preview box's inline min-height/flex and collapse it to zero height.
    previewBox.style.background = gradient;
    cssOut.value = cssRule;
  }

  [typeLinear, typeRadial, angleRange, col1, col2, col3, col3Check].forEach(function(el){
    if(el) el.addEventListener('input', updateGradient);
    if(el) el.addEventListener('change', updateGradient);
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

  updateGradient();
})();
