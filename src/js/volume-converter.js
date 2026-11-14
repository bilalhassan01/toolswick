// Volume & Capacity Unit Converter
(function(){
  function init(){
  var valIn = document.getElementById('volVal');
  var fromSel = document.getElementById('volFrom');
  var toSel = document.getElementById('volTo');
  var resultEl = document.getElementById('volResult');
  var formulaEl = document.getElementById('volFormula');
  var tableBody = document.getElementById('volAllTable');
  var swapBtn = document.getElementById('volSwap');

  var UNITS = {
    'ml':   { name: 'Milliliters (ml)', factor: 0.001 },
    'l':    { name: 'Liters (L)', factor: 1 },
    'm³':   { name: 'Cubic Meters (m³)', factor: 1000 },
    'fl oz':{ name: 'Fluid Ounces (fl oz)', factor: 0.0295735295625 },
    'cup':  { name: 'US Cups (cup)', factor: 0.2365882365 },
    'pt':   { name: 'US Pints (pt)', factor: 0.473176473 },
    'qt':   { name: 'US Quarts (qt)', factor: 0.946352946 },
    'gal':  { name: 'US Gallons (gal)', factor: 3.785411784 }
  };

  function formatNum(n){
    if(isNaN(n)) return '0';
    if(Math.abs(n) < 0.000001 && n !== 0) return n.toExponential(4);
    return parseFloat(n.toFixed(6)).toLocaleString(undefined, {maximumFractionDigits: 6});
  }

  function convert(){
    if(!valIn || !fromSel || !toSel || !resultEl) return;
    var val = parseFloat(valIn.value);
    if(isNaN(val)){
      resultEl.textContent = '0';
      if(formulaEl) formulaEl.textContent = '';
      if(tableBody) tableBody.innerHTML = '';
      return;
    }
    var fromU = fromSel.value;
    var toU = toSel.value;
    var inLiters = val * UNITS[fromU].factor;
    var res = inLiters / UNITS[toU].factor;

    resultEl.textContent = formatNum(res) + ' ' + toU;
    if(formulaEl){
      formulaEl.textContent = 'Multiply ' + UNITS[fromU].name + ' by ' + formatNum(UNITS[fromU].factor / UNITS[toU].factor) + ' to get ' + UNITS[toU].name;
    }

    if(tableBody){
      var rows = Object.keys(UNITS).map(function(u){
        var converted = inLiters / UNITS[u].factor;
        return '<tr>' +
          '<td style="padding:6px 10px; border-bottom:1px solid var(--line)">' + UNITS[u].name + '</td>' +
          '<td style="padding:6px 10px; border-bottom:1px solid var(--line); font-family:monospace; font-weight:600">' + formatNum(converted) + '</td>' +
          '</tr>';
      }).join('');
      tableBody.innerHTML = rows;
    }
  }

  if(swapBtn){
    swapBtn.addEventListener('click', function(){
      var tmp = fromSel.value;
      fromSel.value = toSel.value;
      toSel.value = tmp;
      convert();
    });
  }

  [valIn, fromSel, toSel].forEach(function(el){
    if(el) el.addEventListener('input', convert);
    if(el) el.addEventListener('change', convert);
  });

  
  function populateUnits(){
    if(!fromSel || !toSel) return;
    var keys = Object.keys(UNITS);
    fromSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'l' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
    toSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'gal' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
  }
  populateUnits();


  var copyBtn = document.getElementById('volCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var resEl = document.getElementById('volResult');
      var txt = resEl ? resEl.textContent.trim() : '';
      if (txt && txt !== '--') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt);
        }
        if (window.TK && TK.toast) TK.toast('Copied result to clipboard!', 'success');
      }
    });
  }

  convert();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
