// JSON to TypeScript Interface Generator
(function(){
  var jsonIn = document.getElementById('tsJsonInput');
  var rootNameIn = document.getElementById('tsRootName');
  var tsOut = document.getElementById('tsOutput');
  var genBtn = document.getElementById('tsGenerate');
  var copyBtn = document.getElementById('tsCopy');
  var clearBtn = document.getElementById('tsClear');
  var errEl = document.getElementById('tsErr');

  function capitalize(s){
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function generateInterfaces(jsonVal, rootName){
    var interfaces = {};

    function parseType(val, keyName){
      if(val === null) return 'any';
      if(Array.isArray(val)){
        if(val.length === 0) return 'any[]';
        var elemType = parseType(val[0], keyName + 'Item');
        return elemType + '[]';
      }
      if(typeof val === 'object'){
        var ifaceName = capitalize(keyName);
        if(!interfaces[ifaceName]){
          interfaces[ifaceName] = {};
        }
        Object.keys(val).forEach(function(k){
          interfaces[ifaceName][k] = parseType(val[k], k);
        });
        return ifaceName;
      }
      return typeof val;
    }

    var data;
    try {
      data = JSON.parse(jsonVal);
    } catch(e) {
      throw new Error('Invalid JSON: ' + e.message);
    }

    var rootIfaceName = rootName || 'RootObject';
    if(Array.isArray(data)){
      if(data.length > 0 && typeof data[0] === 'object' && data[0] !== null){
        parseType(data[0], rootIfaceName);
      }
    } else if(typeof data === 'object' && data !== null){
      parseType(data, rootIfaceName);
    } else {
      return 'export type ' + rootIfaceName + ' = ' + typeof data + ';';
    }

    var result = [];
    Object.keys(interfaces).forEach(function(name){
      var fields = interfaces[name];
      var lines = ['export interface ' + name + ' {'];
      Object.keys(fields).forEach(function(f){
        lines.push('  ' + f + ': ' + fields[f] + ';');
      });
      lines.push('}');
      result.push(lines.join('\n'));
    });

    return result.join('\n\n');
  }

  function run(){
    if(!jsonIn || !tsOut) return;
    if(errEl) errEl.textContent = '';
    var text = jsonIn.value.trim();
    if(!text){ tsOut.value = ''; return; }
    var root = (rootNameIn && rootNameIn.value.trim()) || 'RootObject';
    try {
      tsOut.value = generateInterfaces(text, root);
    } catch(e) {
      if(errEl) errEl.textContent = e.message;
      tsOut.value = '';
    }
  }

  if(genBtn) genBtn.addEventListener('click', run);
  if(jsonIn) jsonIn.addEventListener('input', run);
  if(rootNameIn) rootNameIn.addEventListener('input', run);

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!tsOut || !tsOut.value) return;
    navigator.clipboard.writeText(tsOut.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy TypeScript'; }, 1500);
    });
  });

  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(jsonIn) jsonIn.value = '';
    if(tsOut) tsOut.value = '';
    if(errEl) errEl.textContent = '';
    if(jsonIn) jsonIn.focus();
  });

  run();
})();
