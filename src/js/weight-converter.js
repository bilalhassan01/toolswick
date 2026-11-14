// Weight & Mass Unit Converter
(function(){
  function init(){
  var valIn = document.getElementById('wtVal');
  var fromSel = document.getElementById('wtFrom');
  var toSel = document.getElementById('wtTo');
  var resultEl = document.getElementById('wtResult');
  var formulaEl = document.getElementById('wtFormula');
  var tableBody = document.getElementById('wtAllTable');
  var swapBtn = document.getElementById('wtSwap');

  var UNITS = {
    'mg': { name: 'Milligrams (mg)', factor: 0.001 },
    'g':  { name: 'Grams (g)', factor: 1 },
    'kg': { name: 'Kilograms (kg)', factor: 1000 },
    't':  { name: 'Metric Tons (t)', factor: 1000000 },
    'oz': { name: 'Ounces (oz)', factor: 28.349523125 },
    'lb': { name: 'Pounds (lb)', factor: 453.59237 },
    'st': { name: 'Stones (st)', factor: 6350.29318 }
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
    var inGrams = val * UNITS[fromU].factor;
    var res = inGrams / UNITS[toU].factor;

    resultEl.textContent = formatNum(res) + ' ' + toU;
    if(formulaEl){
      formulaEl.textContent = 'Multiply ' + UNITS[fromU].name + ' by ' + formatNum(UNITS[fromU].factor / UNITS[toU].factor) + ' to get ' + UNITS[toU].name;
    }

    if(tableBody){
      var rows = Object.keys(UNITS).map(function(u){
        var converted = inGrams / UNITS[u].factor;
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
      return '<option value="' + k + '"' + (k === 'kg' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
    toSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'lb' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
  }
  populateUnits();


  var copyBtn = document.getElementById('wtCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var resEl = document.getElementById('wtResult');
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
