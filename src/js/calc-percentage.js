(function () {
  var $ = TK.$;
  function fmt(n) {
    if (!isFinite(n)) return "Not defined";
    return String(+n.toPrecision(10)).replace(/\B(?=(\d{3})+(?!\d))/g, function (m, o, s) { return s.indexOf(".") > -1 && o > s.indexOf(".") ? "" : ","; });
  }
  function num(id) { var v = $(id).value.trim(); return v === "" ? NaN : +v; }
  function calc() {
    var a = num("#p1a"), b = num("#p1b");
    $("#p1r").textContent = isNaN(a) || isNaN(b) ? "—" : fmt(a / 100 * b);
    a = num("#p2a"); b = num("#p2b");
    $("#p2r").textContent = isNaN(a) || isNaN(b) ? "—" : b === 0 ? "Not defined" : fmt(a / b * 100) + "%";
    a = num("#p3a"); b = num("#p3b");
    if (isNaN(a) || isNaN(b)) $("#p3r").textContent = "—";
    else if (a === 0) $("#p3r").textContent = "Not defined";
    else { var c = (b - a) / Math.abs(a) * 100; $("#p3r").textContent = (c > 0 ? "+" : "") + fmt(c) + "%" + (c > 0 ? " increase" : c < 0 ? " decrease" : " (no change)"); }
  }
  TK.$$("input").forEach(function (i) { i.addEventListener("input", calc); });
  calc();
})();
