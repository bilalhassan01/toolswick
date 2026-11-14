// Power Unit Converter
(function(){
  'use strict';

  var valIn = document.getElementById('pwrVal');
  var fromSel = document.getElementById('pwrFrom');
  var toSel = document.getElementById('pwrTo');
  var resultEl = document.getElementById('pwrResult');
  var formulaEl = document.getElementById('pwrFormula');
  var tableBody = document.getElementById('pwrAllTable');
  var swapBtn = document.getElementById('pwrSwap');
  var copyBtn = document.getElementById('pwrCopyBtn');

  var UNITS = {
    'w':    { name: 'Watts (W)', factor: 1 },
    'kw':   { name: 'Kilowatts (kW)', factor: 1000 },
    'mw':   { name: 'Megawatts (MW)', factor: 1000000 },
    'hp':   { name: 'Mechanical Horsepower (hp)', factor: 745.699872 },
    'ps':   { name: 'Metric Horsepower (PS)', factor: 735.49875 },
    'btuh': { name: 'BTU/hour (Btu/h)', factor: 0.29307107 },
    'ftlbs':{ name: 'Foot-Pounds/sec (ft-lb/s)', factor: 1.355817942 },
    'cals': { name: 'Calories/sec (cal/s)', factor: 4.184 }
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

    var inWatts = val * UNITS[fromU].factor;
    var res = inWatts / UNITS[toU].factor;

    resultEl.textContent = formatNum(res) + ' ' + toU;
    if(formulaEl){
      formulaEl.textContent = 'Multiply ' + UNITS[fromU].name + ' by ' + formatNum(UNITS[fromU].factor / UNITS[toU].factor) + ' to get ' + UNITS[toU].name;
    }

    if(tableBody){
      var rows = Object.keys(UNITS).map(function(u){
        var converted = inWatts / UNITS[u].factor;
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
      return '<option value="' + k + '"' + (k === 'kw' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
    toSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'hp' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
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
