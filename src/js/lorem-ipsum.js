// Lorem Ipsum Generator
(function(){
  var WORDS = [
    'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do',
    'eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim',
    'ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi',
    'aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit',
    'voluptate','velit','esse','cillum','fugiat','nulla','pariatur','excepteur','sint',
    'occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt',
    'mollit','anim','id','est','laborum','perspiciatis','unde','omnis','iste','natus',
    'error','voluptatem','accusantium','doloremque','laudantium','totam','rem','aperiam',
    'eaque','ipsa','quae','ab','illo','inventore','veritatis','quasi','architecto','beatae',
    'vitae','dicta','explicabo','nemo','ipsam','quia','voluptas','aspernatur','aut','odit',
    'fugit','magnam','aliquam','quaerat','voluptatibus','maiores','alias','exercitationem',
    'ullam','corporis','suscipit','laboriosam','aliquid','commodi','consequatur','autem',
    'vel','eum','iure','reprehenderit','qui','in','ea','voluptate','velit','esse','quam'
  ];

  function rand(n){ return Math.floor(Math.random() * n); }

  function word(){ return WORDS[rand(WORDS.length)]; }

  function sentence(minW, maxW){
    var len = minW + rand(maxW - minW);
    var words = [];
    for(var i=0; i<len; i++) words.push(word());
    return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ') + '.';
  }

  function paragraph(){
    var sents = 4 + rand(4);
    var out = [];
    for(var i=0; i<sents; i++) out.push(sentence(8,18));
    return out.join(' ');
  }

  var genBtn = document.getElementById('liGenerate');
  var copyBtn = document.getElementById('liCopy');
  var out = document.getElementById('liOutput');

  if(!genBtn) return;

  genBtn.addEventListener('click', function(){
    var modeEl = document.querySelector('input[name="liMode"]:checked');
    var mode = modeEl ? modeEl.value : 'paragraphs';
    var amtEl = document.getElementById('liAmount');
    var amount = Math.min(50, Math.max(1, parseInt(amtEl ? amtEl.value : '3') || 3));
    var result = '';

    if(mode === 'paragraphs'){
      var paras = [];
      for(var i=0; i<amount; i++) paras.push(paragraph());
      result = paras.join('\n\n');
    } else if(mode === 'sentences'){
      var sents = [];
      for(var i=0; i<amount; i++) sents.push(sentence(8,18));
      result = sents.join(' ');
    } else { // words
      var ws = [];
      for(var i=0; i<amount; i++) ws.push(word());
      result = ws[0].charAt(0).toUpperCase() + ws[0].slice(1) + ' ' + ws.slice(1).join(' ') + '.';
    }
    out.value = result;
  });

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1500);
    });
  });
})();
