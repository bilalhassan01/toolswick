// Frequency Unit Converter
(function(){
  'use strict';

  var valIn = document.getElementById('freqVal');
  var fromSel = document.getElementById('freqFrom');
  var toSel = document.getElementById('freqTo');
  var resultEl = document.getElementById('freqResult');
  var formulaEl = document.getElementById('freqFormula');
  var tableBody = document.getElementById('freqAllTable');
  var swapBtn = document.getElementById('freqSwap');
  var copyBtn = document.getElementById('freqCopyBtn');

  var UNITS = {
    'hz':   { name: 'Hertz (Hz)', factor: 1 },
    'khz':  { name: 'Kilohertz (kHz)', factor: 1000 },
    'mhz':  { name: 'Megahertz (MHz)', factor: 1000000 },
    'ghz':  { name: 'Gigahertz (GHz)', factor: 1000000000 },
    'thz':  { name: 'Terahertz (THz)', factor: 1000000000000 },
    'rpm':  { name: 'Revolutions/Min (RPM)', factor: 1/60 },
    'rads': { name: 'Radians/sec (rad/s)', factor: 1 / (2 * Math.PI) },
    'degs': { name: 'Degrees/sec (°/s)', factor: 1 / 360 }
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
    if(!UNITS[fromU] || !UNITS[toU]) return;

    var inHz = val * UNITS[fromU].factor;
    var res = inHz / UNITS[toU].factor;

    resultEl.textContent = formatNum(res) + ' ' + toU;
    if(formulaEl){
      formulaEl.textContent = 'Multiply ' + UNITS[fromU].name + ' by ' + formatNum(UNITS[fromU].factor / UNITS[toU].factor) + ' to get ' + UNITS[toU].name;
    }

    if(tableBody){
      var rows = Object.keys(UNITS).map(function(u){
        var converted = inHz / UNITS[u].factor;
        return '<tr>' +
          '<td style="padding:6px 10px; border-bottom:1px solid var(--line)">' + UNITS[u].name + '</td>' +
          '<td style="padding:6px 10px; border-bottom:1px solid var(--line); font-family:monospace; font-weight:600">' + formatNum(converted) + '</td>' +
          '</tr>';
      }).join('');
      tableBody.innerHTML = rows;
    }
  }

  function populateUnits(){
    if(!fromSel || !toSel) return;
    if(fromSel.options.length > 0) return; // already pre-rendered
    var keys = Object.keys(UNITS);
    fromSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'khz' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
    toSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'hz' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
  }

  function init(){
    populateUnits();
    if(swapBtn){
      swapBtn.addEventListener('click', function(){
        var tmp = fromSel.value;
        fromSel.value = toSel.value;
        toSel.value = tmp;
        convert();
      });
    }

    if(copyBtn && resultEl){
      copyBtn.addEventListener('click', function(){
        navigator.clipboard.writeText(resultEl.textContent).then(function(){
          copyBtn.textContent = 'Copied!';
          setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1500);
        });
      });
    }

    [valIn, fromSel, toSel].forEach(function(el){
      if(el){
        el.addEventListener('input', convert);
        el.addEventListener('change', convert);
      }
    });

    convert();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
