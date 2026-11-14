/* Toolswick Loan & Mortgage Calculator - 100% Client-Side. */
(function () {
  "use strict";

  var $ = TK.$;

  function money(n, cur) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: cur || $("#cur").value || "USD",
        maximumFractionDigits: 2
      }).format(n);
    } catch (e) {
      return (cur || "USD") + " " + (n || 0).toFixed(2);
    }
  }

  function calc() {
    var cur = $("#cur") ? $("#cur").value : "USD";
    var P = parseFloat($("#amount") ? $("#amount").value : 0);
    var rateVal = parseFloat($("#rate") ? $("#rate").value : 0);
    var r = rateVal / 100 / 12;
    var termVal = parseFloat($("#term") ? $("#term").value : 0);
    var termUnit = $("#termUnit") ? $("#termUnit").value : "years";
    var n = Math.round(termVal * (termUnit === "years" ? 12 : 1));

    var out = $("#loanOut");
    if (!out) return;

    if (!(P > 0) || !(n > 0) || !(rateVal >= 0) || n > 1200) {
      out.innerHTML = '<p class="hint">Enter a loan amount, interest rate, and term to see monthly payment and amortization.</p>';
      return;
    }

    var pay = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
    var total = pay * n;
    var interest = total - P;

    var bal = P;
    var rows = [];
    var yi = 0;
    var yp = 0;

    for (var k = 1; k <= n; k++) {
      var i = bal * r;
      var p = pay - i;
      bal = Math.max(0, bal - p);
      yi += i;
      yp += p;
      if (k % 12 === 0 || k === n) {
        rows.push({
          y: Math.ceil(k / 12),
          p: yp,
          i: yi,
          b: bal
        });
        yi = 0;
        yp = 0;
      }
    }

    var share = Math.round((P / total) * 100);

    out.innerHTML =
      '<p class="big">' + money(pay, cur) + ' <span class="unit">per month</span></p>' +
      '<dl class="stats">' +
        '<div><dt>Total Interest</dt><dd>' + money(interest, cur) + '</dd></div>' +
        '<div><dt>Total Cost (Principal + Interest)</dt><dd>' + money(total, cur) + '</dd></div>' +
        '<div><dt>Total Payments</dt><dd>' + n + ' months</dd></div>' +
      '</dl>' +
      '<div class="split" role="img" aria-label="' + share + '% principal, ' + (100 - share) + '% interest">' +
        '<span style="width:' + share + '%"></span>' +
      '</div>' +
      '<p class="hint">' + share + '% of payments goes to principal, ' + (100 - share) + '% goes to interest.</p>' +
      '<div class="tablewrap">' +
        '<table>' +
          '<thead>' +
            '<tr><th>Year</th><th>Principal Paid</th><th>Interest Paid</th><th>Remaining Balance</th></tr>' +
          '</thead>' +
          '<tbody>' +
            rows.map(function (x) {
              return "<tr><td>Year " + x.y + "</td><td>" + money(x.p, cur) + "</td><td>" + money(x.i, cur) + "</td><td>" + money(x.b, cur) + "</td></tr>";
            }).join("") +
          '</tbody>' +
        '</table>' +
      '</div>';
  }

  TK.$$("input,select").forEach(function (i) {
    i.addEventListener("input", calc);
    i.addEventListener("change", calc);
  });

  calc();
})();
