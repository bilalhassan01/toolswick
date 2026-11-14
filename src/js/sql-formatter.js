// SQL Formatter & Beautifier - Client-Side Formatting & Minification
(function(){
  'use strict';

  var inp = document.getElementById('sqlInput');
  var out = document.getElementById('sqlOutput');
  var fmtBtn = document.getElementById('sqlFormat');
  var minBtn = document.getElementById('sqlMinify');
  var copyBtn = document.getElementById('sqlCopy');
  var clearBtn = document.getElementById('sqlClear');

  var CLAUSES = [
    'SELECT', 'FROM', 'WHERE', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN',
    'FULL OUTER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
    'CROSS JOIN', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
    'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE FROM', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE'
  ];

  var KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE',
    'ILIKE', 'BETWEEN', 'EXISTS', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'CROSS', 'ON', 'AS', 'ASC', 'DESC', 'DISTINCT', 'ALL', 'ANY', 'SOME',
    'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT',
    'EXCEPT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
    'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN',
    'REFERENCES', 'CHECK', 'DEFAULT', 'UNIQUE', 'INDEX', 'VIEW', 'TRIGGER',
    'PROCEDURE', 'FUNCTION', 'DATABASE', 'SCHEMA', 'CASCADE', 'RESTRICT',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'COALESCE', 'ROUND', 'TRUNC', 'CAST', 'CONVERT', 'OVER', 'PARTITION'
  ];

  function formatSql(sql){
    if (!sql) return '';

    // Step 1: Normalize all whitespace
    var s = sql.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    s = s.replace(/[ \t]+/g, ' ').trim();

    // Step 2: Uppercase all SQL keywords with word boundaries
    KEYWORDS.forEach(function(kw){
      var rx = new RegExp('\\b' + kw + '\\b', 'gi');
      s = s.replace(rx, kw);
    });

    // Step 3: Insert line breaks before major clauses
    CLAUSES.forEach(function(clause){
      var rx = new RegExp('\\b' + clause.replace(/\s+/g, '\\s+') + '\\b', 'gi');
      s = s.replace(rx, '\n' + clause + ' ');
    });

    // Also break AND / OR in WHERE clauses
    s = s.replace(/\b(AND|OR)\b/g, '\n  $1');

    // Step 4: Split lines and clean up whitespace
    var lines = s.split('\n');
    var formatted = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      // Fix operator spacing (e.g. price>10 -> price > 10)
      line = line.replace(/\s*([><!=]=?|<>)\s*/g, ' $1 ');

      // Fix comma spacing: space after comma, no space before
      line = line.replace(/\s*,\s*/g, ', ');

      // Fix multiple spaces
      line = line.replace(/[ \t]{2,}/g, ' ').trim();

      var upper = line.toUpperCase();
      if (upper.startsWith('AND ') || upper.startsWith('OR ') || upper.startsWith('ON ')) {
        formatted.push('  ' + line);
      } else {
        formatted.push(line);
      }
    }

    return formatted.join('\n');
  }

  function minifySql(sql){
    if (!sql) return '';
    return sql
      .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '') // strip comments
      .replace(/\s+/g, ' ')
      .replace(/\s*([,()=><+\-*\/])\s*/g, '$1')
      .trim();
  }

  function run(isMinify){
    if (!inp || !out) return;
    var text = inp.value.trim();
    if (!text) { out.value = ''; return; }
    out.value = isMinify ? minifySql(text) : formatSql(text);
  }

  if (fmtBtn) fmtBtn.addEventListener('click', function(){ run(false); });
  if (minBtn) minBtn.addEventListener('click', function(){ run(true); });

  if (copyBtn) {
    copyBtn.addEventListener('click', function(){
      if (!out || !out.value) return;
      navigator.clipboard.writeText(out.value).then(function(){
        copyBtn.textContent = 'Copied!';
        setTimeout(function(){ copyBtn.textContent = 'Copy SQL'; }, 1500);
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function(){
      if (inp) inp.value = '';
      if (out) out.value = '';
    });
  }
})();
