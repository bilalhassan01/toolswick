// Extract Emails & Links
(function(){
  var inp = document.getElementById('extractInput');
  var extractBtn = document.getElementById('extractBtn');
  var clearBtn = document.getElementById('extractClear');

  var emailCount = document.getElementById('emailCount');
  var emailOut = document.getElementById('emailOut');
  var copyEmailsBtn = document.getElementById('copyEmails');

  var urlCount = document.getElementById('urlCount');
  var urlOut = document.getElementById('urlOut');
  var copyUrlsBtn = document.getElementById('copyUrls');

  // Regex patterns
  // Standard email regex
  var EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // URLs regex (http/https and www.)
  var URL_REGEX = /\b(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`\[\]]+/gi;

  function extract(){
    if(!inp) return;
    var text = inp.value;

    // Emails
    var emailsFound = text.match(EMAIL_REGEX) || [];
    var uniqueEmails = Array.from(new Set(emailsFound.map(function(e){ return e.toLowerCase(); })));
    if(emailCount) emailCount.textContent = '(' + uniqueEmails.length + ')';
    if(emailOut) emailOut.value = uniqueEmails.join('\n');

    // URLs
    var urlsFound = text.match(URL_REGEX) || [];
    // Clean trailing punctuation that might get attached (like ., ;, !)
    var cleanedUrls = urlsFound.map(function(u){
      return u.replace(/[.,;!?]+$/, '');
    });
    var uniqueUrls = Array.from(new Set(cleanedUrls));
    if(urlCount) urlCount.textContent = '(' + uniqueUrls.length + ')';
    if(urlOut) urlOut.value = uniqueUrls.join('\n');
  }

  if(extractBtn) extractBtn.addEventListener('click', extract);

  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(inp) inp.value = '';
    if(emailOut) emailOut.value = '';
    if(urlOut) urlOut.value = '';
    if(emailCount) emailCount.textContent = '(0)';
    if(urlCount) urlCount.textContent = '(0)';
    if(inp) inp.focus();
  });

  if(copyEmailsBtn) copyEmailsBtn.addEventListener('click', function(){
    if(!emailOut || !emailOut.value) return;
    navigator.clipboard.writeText(emailOut.value).then(function(){
      copyEmailsBtn.textContent = 'Copied!';
      setTimeout(function(){ copyEmailsBtn.textContent = 'Copy Emails'; }, 1500);
    });
  });

  if(copyUrlsBtn) copyUrlsBtn.addEventListener('click', function(){
    if(!urlOut || !urlOut.value) return;
    navigator.clipboard.writeText(urlOut.value).then(function(){
      copyUrlsBtn.textContent = 'Copied!';
      setTimeout(function(){ copyUrlsBtn.textContent = 'Copy URLs'; }, 1500);
    });
  });
})();
