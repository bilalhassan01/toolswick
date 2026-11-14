// energy-converter.js - Energy & Power Unit Converter
(function(){
  'use strict';

  function init(){
    var typeSel = document.getElementById('enType');
    var valIn = document.getElementById('enVal');
    var fromSel = document.getElementById('enFrom');
    var toSel = document.getElementById('enTo');
    var resultEl = document.getElementById('enResult');
    var formulaEl = document.getElementById('enFormula');
    var tableBody = document.getElementById('enAllTable');
    var swapBtn = document.getElementById('enSwap');
    var copyBtn = document.getElementById('enCopy');

    var ENERGY_UNITS = {
      'J':    { name: 'Joules (J)', factor: 1 },
      'kJ':   { name: 'Kilojoules (kJ)', factor: 1000 },
      'cal':  { name: 'Calories (cal)', factor: 4.184 },
      'kcal': { name: 'Kilocalories (kcal)', factor: 4184 },
      'Wh':   { name: 'Watt-hours (Wh)', factor: 3600 },
      'kWh':  { name: 'Kilowatt-hours (kWh)', factor: 3600000 },
      'Btu':  { name: 'British Thermal Units (BTU)', factor: 1055.056 },
      'eV':   { name: 'Electronvolts (eV)', factor: 1.602176634e-19 }
    };

    var POWER_UNITS = {
      'W':  { name: 'Watts (W)', factor: 1 },
      'kW': { name: 'Kilowatts (kW)', factor: 1000 },
      'MW': { name: 'Megawatts (MW)', factor: 1000000 },
      'hp': { name: 'Horsepower (hp)', factor: 745.699872 },
      'ftlb': { name: 'Foot-pounds/sec (ft·lb/s)', factor: 1.355818 }
    };

    function getDict(){
      var mode = (typeSel && typeSel.value === 'power') ? 'power' : 'energy';
      return mode === 'power' ? POWER_UNITS : ENERGY_UNITS;
    }

    function populateDropdowns(){
      if(!fromSel || !toSel) return;
      var dict = getDict();
      var keys = Object.keys(dict);
      var curFrom = fromSel.value;
      var curTo = toSel.value;

      fromSel.innerHTML = keys.map(function(k){
        return '<option value="' + k + '">' + dict[k].name + '</option>';
      }).join('');
      toSel.innerHTML = keys.map(function(k){
        return '<option value="' + k + '">' + dict[k].name + '</option>';
      }).join('');

      if(dict[curFrom]) fromSel.value = curFrom;
      else fromSel.selectedIndex = 0;

      if(dict[curTo] && curTo !== fromSel.value) toSel.value = curTo;
      else toSel.selectedIndex = Math.min(1, keys.length - 1);
    }

    function formatNum(n){
      if(isNaN(n)) return '0';
      if(Math.abs(n) < 0.000001 && n !== 0) return n.toExponential(4);
      return parseFloat(n.toFixed(6)).toLocaleString(undefined, {maximumFractionDigits: 6});
    }

    function convert(){
      if(!valIn || !fromSel || !toSel || !resultEl) return;
      var val = parseFloat(valIn.value);
      var dict = getDict();

      if(isNaN(val)){
        resultEl.textContent = '0';
        if(formulaEl) formulaEl.textContent = '--';
        if(tableBody) tableBody.innerHTML = '';
        return;
      }

      var fromU = fromSel.value;
      var toU = toSel.value;
      if(!dict[fromU] || !dict[toU]) return;

      var inBase = val * dict[fromU].factor;
      var res = inBase / dict[toU].factor;

      resultEl.textContent = formatNum(res) + ' ' + toU;
      if(formulaEl){
        var ratio = dict[fromU].factor / dict[toU].factor;
        formulaEl.textContent = '1 ' + fromU + ' = ' + formatNum(ratio) + ' ' + toU;
      }

      if(tableBody){
        var rows = Object.keys(dict).map(function(u){
          var converted = inBase / dict[u].factor;
          return '<tr>' +
            '<td style="padding:7px 10px; border-bottom:1px solid var(--line); font-size:13px;">' + dict[u].name + '</td>' +
            '<td style="padding:7px 10px; border-bottom:1px solid var(--line); font-family:monospace; font-weight:600; text-align:right; font-size:13px; color:var(--primary);">' + formatNum(converted) + '</td>' +
            '</tr>';
        }).join('');
        tableBody.innerHTML = rows;
      }
    }

    if(typeSel){
      typeSel.addEventListener('change', function(){
        populateDropdowns();
        convert();
      });
    }

    if(swapBtn){
      swapBtn.addEventListener('click', function(){
        var tmp = fromSel.value;
        fromSel.value = toSel.value;
        toSel.value = tmp;
        convert();
      });
    }

    if(copyBtn){
      copyBtn.addEventListener('click', function(){
        var txt = resultEl ? resultEl.textContent.trim() : '';
        if(txt && txt !== '--'){
          navigator.clipboard.writeText(txt).then(function(){
            var old = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(function(){ copyBtn.textContent = old; }, 1500);
          });
        }
      });
    }

    [valIn, fromSel, toSel].forEach(function(el){
      if(el){
        el.addEventListener('input', convert);
        el.addEventListener('change', convert);
      }
    });

    populateDropdowns();
    convert();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
