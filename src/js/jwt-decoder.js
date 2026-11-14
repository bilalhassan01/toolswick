// JWT Decoder — 100% Client-Side
(function(){
  var inp = document.getElementById('jwtInput');
  var headerOut = document.getElementById('jwtHeader');
  var payloadOut = document.getElementById('jwtPayload');
  var statusBadge = document.getElementById('jwtStatus');
  var algBadge = document.getElementById('jwtAlg');
  var expBadge = document.getElementById('jwtExp');
  var clearBtn = document.getElementById('jwtClear');
  var copyHeaderBtn = document.getElementById('jwtCopyHeader');
  var copyPayloadBtn = document.getElementById('jwtCopyPayload');

  function b64UrlDecode(str){
    var base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while(base64.length % 4) base64 += '=';
    var decoded = atob(base64);
    var bytes = new Uint8Array(decoded.length);
    for(var i=0; i<decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function decodeJWT(){
    if(!inp || !headerOut || !payloadOut) return;
    var token = inp.value.trim();
    if(!token){
      headerOut.value = '';
      payloadOut.value = '';
      if(statusBadge) statusBadge.textContent = '';
      if(algBadge) algBadge.textContent = '';
      if(expBadge) expBadge.textContent = '';
      return;
    }

    var parts = token.split('.');
    if(parts.length < 2){
      if(statusBadge){
        statusBadge.className = 'bad';
        statusBadge.textContent = 'Invalid JWT structure (requires at least Header and Payload parts)';
      }
      return;
    }

    try {
      var headerJson = JSON.parse(b64UrlDecode(parts[0]));
      var payloadJson = JSON.parse(b64UrlDecode(parts[1]));

      headerOut.value = JSON.stringify(headerJson, null, 2);
      payloadOut.value = JSON.stringify(payloadJson, null, 2);

      if(algBadge) algBadge.textContent = 'Algorithm: ' + (headerJson.alg || 'none');

      if(payloadJson.exp){
        var expDate = new Date(payloadJson.exp * 1000);
        var isExpired = Date.now() > expDate.getTime();
        if(expBadge) expBadge.textContent = 'Expires: ' + expDate.toLocaleString();
        if(statusBadge){
          statusBadge.className = isExpired ? 'bad' : 'ok';
          statusBadge.textContent = isExpired ? '✗ Token Expired' : '✓ Token Active / Valid Time';
        }
      } else {
        if(expBadge) expBadge.textContent = 'No Expiration (exp)';
        if(statusBadge){
          statusBadge.className = 'hint';
          statusBadge.textContent = 'Decoded successfully (No exp timestamp)';
        }
      }
    } catch(e) {
      if(statusBadge){
        statusBadge.className = 'bad';
        statusBadge.textContent = 'Decode Error: ' + e.message;
      }
    }
  }

  if(inp) inp.addEventListener('input', decodeJWT);

  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(inp) inp.value = '';
    decodeJWT();
    if(inp) inp.focus();
  });

  function setupCopy(btn, el, label) {
    if(!btn || !el) return;
    btn.addEventListener('click', function(){
      if(!el.value) {
        if(window.TK && TK.toast) TK.toast('Nothing to copy.', 'error');
        return;
      }
      navigator.clipboard.writeText(el.value).then(function(){
        var old = btn.textContent;
        btn.textContent = 'Copied!';
        if(window.TK && TK.toast) TK.toast(label + ' copied to clipboard!', 'success');
        setTimeout(function(){ btn.textContent = old; }, 1500);
      });
    });
  }

  setupCopy(copyHeaderBtn, headerOut, 'Header');
  setupCopy(copyPayloadBtn, payloadOut, 'Payload');

  decodeJWT();
})();
