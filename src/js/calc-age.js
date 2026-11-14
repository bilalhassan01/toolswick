(function () {
  var $ = TK.$;
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parse(v) { var p = v.split("-"); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
  var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  $("#asof").value = iso(today);
  $("#dob").max = iso(today);
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function calc() {
    var b = parse($("#dob").value), t = parse($("#asof").value), out = $("#ageOut");
    if (!b || !t) { out.innerHTML = '<p class="hint">Enter a date of birth to see the result.</p>'; return; }
    if (b > t) { out.innerHTML = '<p class="hint">The date of birth is after the "age at" date.</p>'; return; }
    var y = t.getFullYear() - b.getFullYear(), m = t.getMonth() - b.getMonth(), d = t.getDate() - b.getDate();
    if (d < 0) { m--; d += new Date(t.getFullYear(), t.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    var days = Math.round((t - b) / 86400000);
    var next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
    if (next < t) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
    var until = Math.round((next - t) / 86400000);
    var wd = next.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    out.innerHTML = '<p class="big">' + plural(y, "year") + ", " + plural(m, "month") + ", " + plural(d, "day") + "</p>" +
      '<dl class="stats"><div><dt>Total days</dt><dd>' + days.toLocaleString() + '</dd></div><div><dt>Total weeks</dt><dd>' + Math.floor(days / 7).toLocaleString() +
      '</dd></div><div><dt>Total months</dt><dd>' + (y * 12 + m).toLocaleString() + '</dd></div><div><dt>Next birthday</dt><dd>' +
      (until === 0 ? "Today" : plural(until, "day")) + '</dd></div></dl><p class="hint">Next birthday falls on ' + TK.esc(wd) + ".</p>";
  }
  $("#dob").addEventListener("input", calc); $("#asof").addEventListener("input", calc);
  calc();
})();
