// Color Converter (HEX, RGB, HSL)
(function(){
  var picker = document.getElementById('colPicker');
  var hexIn = document.getElementById('colHex');
  var rgbIn = document.getElementById('colRgb');
  var hslIn = document.getElementById('colHsl');
  var swatch = document.getElementById('colSwatch');

  function hexToRgb(hex){
    var cleaned = hex.replace('#', '').trim();
    if(cleaned.length === 3){
      cleaned = cleaned[0]+cleaned[0] + cleaned[1]+cleaned[1] + cleaned[2]+cleaned[2];
    }
    if(cleaned.length !== 6) return null;
    var num = parseInt(cleaned, 16);
    if(isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b){
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function rgbToHsl(r, g, b){
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max === min){
      h = s = 0;
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l){
    h /= 360; s /= 100; l /= 100;
    var r, g, b;
    if(s === 0){
      r = g = b = l;
    } else {
      function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function updateAllFromRgb(r, g, b, source){
    var hex = rgbToHex(r, g, b);
    var hsl = rgbToHsl(r, g, b);

    if(source !== 'picker' && picker) picker.value = hex;
    if(source !== 'hex' && hexIn) hexIn.value = hex;
    if(source !== 'rgb' && rgbIn) rgbIn.value = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    if(source !== 'hsl' && hslIn) hslIn.value = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
    if(swatch) swatch.style.backgroundColor = hex;
  }

  if(picker){
    picker.addEventListener('input', function(){
      var rgb = hexToRgb(picker.value);
      if(rgb) updateAllFromRgb(rgb.r, rgb.g, rgb.b, 'picker');
    });
  }

  if(hexIn){
    hexIn.addEventListener('input', function(){
      var rgb = hexToRgb(hexIn.value);
      if(rgb) updateAllFromRgb(rgb.r, rgb.g, rgb.b, 'hex');
    });
  }

  if(rgbIn){
    rgbIn.addEventListener('input', function(){
      var m = rgbIn.value.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if(m){
        var r = Math.min(255, parseInt(m[1], 10));
        var g = Math.min(255, parseInt(m[2], 10));
        var b = Math.min(255, parseInt(m[3], 10));
        updateAllFromRgb(r, g, b, 'rgb');
      }
    });
  }

  if(hslIn){
    hslIn.addEventListener('input', function(){
      var m = hslIn.value.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
      if(m){
        var h = parseInt(m[1], 10) % 360;
        var s = Math.min(100, parseInt(m[2], 10));
        var l = Math.min(100, parseInt(m[3], 10));
        var rgb = hslToRgb(h, s, l);
        updateAllFromRgb(rgb.r, rgb.g, rgb.b, 'hsl');
      }
    });
  }

  // Copy buttons
  document.querySelectorAll('.copy-col-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var targetId = btn.dataset.target;
      var el = document.getElementById(targetId);
      if(!el || !el.value) return;
      navigator.clipboard.writeText(el.value).then(function(){
        var orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function(){ btn.textContent = orig; }, 1500);
      });
    });
  });

  // Init with default color #3b82f6
  updateAllFromRgb(59, 130, 246, 'init');
})();
