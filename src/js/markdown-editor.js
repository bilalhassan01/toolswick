// Markdown Editor — minimal parser + live preview
(function(){
  var inp = document.getElementById('mdInput');
  var preview = document.getElementById('mdPreview');
  var copyMd = document.getElementById('mdCopyMd');
  var copyHtml = document.getElementById('mdCopyHtml');
  var debounce;

  function escHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function parseMarkdown(md){
    var lines = md.split('\n');
    var html = [];
    var i = 0;
    var inPre = false;
    var preLang = '';
    var preLines = [];
    var inUl = false;
    var inOl = false;

    function closeList(){
      if(inUl){ html.push('</ul>'); inUl=false; }
      if(inOl){ html.push('</ol>'); inOl=false; }
    }

    function inline(s){
      // code
      s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
      // bold+italic
      s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
      // bold
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
      // italic
      s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
      s = s.replace(/_(.+?)_/g, '<em>$1</em>');
      // link (safe protocols only, quote escaped)
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, url) {
        var cleanUrl = url.trim().replace(/[\"<>]/g, '');
        if (!/^(https?:|mailto:|#|\/)/i.test(cleanUrl)) return text;
        return '<a href="' + cleanUrl + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
      });
      // image (safe protocols only)
      s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, url) {
        var cleanUrl = url.trim().replace(/[\"<>]/g, '');
        if (!/^(https?:|data:image\/|blob:|\/)/i.test(cleanUrl)) return '';
        return '<img src="' + cleanUrl + '" alt="' + alt.replace(/[\"<>]/g, '') + '" style="max-width:100%">';
      });
      // strikethrough
      s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
      return s;
    }

    while(i < lines.length){
      var line = lines[i];

      // Fenced code block
      if(/^```/.test(line)){
        if(!inPre){
          closeList();
          inPre = true;
          preLang = line.slice(3).trim();
          preLines = [];
        } else {
          html.push('<pre><code' + (preLang ? ' class="language-' + escHtml(preLang) + '"' : '') + '>' + escHtml(preLines.join('\n')) + '</code></pre>');
          inPre = false;
          preLang = '';
          preLines = [];
        }
        i++; continue;
      }
      if(inPre){ preLines.push(line); i++; continue; }

      // Headings
      var hm = line.match(/^(#{1,6})\s+(.+)$/);
      if(hm){
        closeList();
        var level = hm[1].length;
        html.push('<h' + level + '>' + inline(escHtml(hm[2])) + '</h' + level + '>');
        i++; continue;
      }

      // Horizontal rule
      if(/^(---+|___+|\*\*\*+)\s*$/.test(line)){
        closeList();
        html.push('<hr>');
        i++; continue;
      }

      // Blockquote
      if(/^>\s?/.test(line)){
        closeList();
        var bqContent = line.replace(/^>\s?/, '');
        html.push('<blockquote>' + inline(escHtml(bqContent)) + '</blockquote>');
        i++; continue;
      }

      // Unordered list
      var ulm = line.match(/^[-*+]\s+(.+)$/);
      if(ulm){
        if(inOl){ html.push('</ol>'); inOl=false; }
        if(!inUl){ html.push('<ul>'); inUl=true; }
        html.push('<li>' + inline(escHtml(ulm[1])) + '</li>');
        i++; continue;
      }

      // Ordered list
      var olm = line.match(/^\d+\.\s+(.+)$/);
      if(olm){
        if(inUl){ html.push('</ul>'); inUl=false; }
        if(!inOl){ html.push('<ol>'); inOl=true; }
        html.push('<li>' + inline(escHtml(olm[1])) + '</li>');
        i++; continue;
      }

      // Empty line
      if(line.trim() === ''){
        closeList();
        html.push('');
        i++; continue;
      }

      // Paragraph
      closeList();
      html.push('<p>' + inline(escHtml(line)) + '</p>');
      i++;
    }

    if(inPre) html.push('<pre><code>' + escHtml(preLines.join('\n')) + '</code></pre>');
    closeList();
    return html.join('\n');
  }

  function getFullHtml(bodyHtml){
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
      'body{font-family:system-ui,sans-serif;line-height:1.7;padding:16px 24px;color:#1a1a1a;background:#fff;}' +
      'pre{background:#f4f4f4;border-radius:6px;padding:12px;overflow:auto;}' +
      'code{font-family:monospace;background:#f0f0f0;padding:2px 5px;border-radius:4px;}' +
      'pre code{background:none;padding:0;}' +
      'blockquote{border-left:4px solid #ccc;margin:0;padding-left:16px;color:#555;}' +
      'h1,h2,h3{margin-top:1.2em;}hr{border:none;border-top:1px solid #ddd;}' +
      'img{max-width:100%;}table{border-collapse:collapse;width:100%;}' +
      'th,td{border:1px solid #ddd;padding:8px 12px;}' +
      '</style></head><body>' + bodyHtml + '</body></html>';
  }

  var lastBodyHtml = '';

  function render(){
    if(!inp || !preview) return;
    var bodyHtml = parseMarkdown(inp.value);
    lastBodyHtml = bodyHtml;
    var fullHtml = getFullHtml(bodyHtml);
    var blob = new Blob([fullHtml], {type:'text/html'});
    var url = URL.createObjectURL(blob);
    var oldSrc = preview.src;
    preview.src = url;
    if(oldSrc && oldSrc.startsWith('blob:')) setTimeout(function(){ URL.revokeObjectURL(oldSrc); }, 1000);
  }

  if(inp){
    inp.addEventListener('input', function(){
      clearTimeout(debounce);
      debounce = setTimeout(render, 300);
    });
    // Initial render
    render();
  }

  if(copyMd) copyMd.addEventListener('click', function(){
    navigator.clipboard.writeText(inp ? inp.value : '').then(function(){
      copyMd.textContent = 'Copied!';
      setTimeout(function(){ copyMd.textContent = 'Copy Markdown'; }, 1500);
    });
  });

  if(copyHtml) copyHtml.addEventListener('click', function(){
    navigator.clipboard.writeText(lastBodyHtml).then(function(){
      copyHtml.textContent = 'Copied!';
      setTimeout(function(){ copyHtml.textContent = 'Copy HTML'; }, 1500);
    });
  });
})();
