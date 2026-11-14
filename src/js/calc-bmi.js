(function () {
  var $ = TK.$;
  function units() { return TK.$('input[name="units"]:checked').value; }
  function sync() {
    var m = units() === "metric";
    $("#metricBox").hidden = !m; $("#imperialBox").hidden = m; calc();
  }
  function calc() {
    var m = units() === "metric", hM, kg;
    if (m) { hM = +$("#cm").value / 100; kg = +$("#kg").value; }
    else { hM = ((+$("#ft").value) * 12 + (+$("#inch").value)) * 0.0254; kg = (+$("#lb").value) * 0.45359237; }
    var out = $("#bmiOut");
    if (!(hM > 0.5 && hM < 2.8 && kg > 10 && kg < 600)) { out.innerHTML = '<p class="hint">Enter your height and weight to see your BMI.</p>'; return; }
    var bmi = kg / (hM * hM), cat, cls;
    if (bmi < 18.5) { cat = "Underweight"; cls = "warn"; } else if (bmi < 25) { cat = "Healthy weight"; cls = "good"; } else if (bmi < 30) { cat = "Overweight"; cls = "warn"; } else { cat = "Obesity range"; cls = "warn"; }
    var lo = 18.5 * hM * hM, hi = 24.9 * hM * hM;
    var range = m ? lo.toFixed(1) + " to " + hi.toFixed(1) + " kg" : (lo / 0.45359237).toFixed(1) + " to " + (hi / 0.45359237).toFixed(1) + " lb";
    var pos = Math.max(0, Math.min(100, (bmi - 15) / (40 - 15) * 100));
    out.innerHTML = '<p class="big">' + bmi.toFixed(1) + ' <span class="badge ' + cls + '">' + cat + '</span></p>' +
      '<div class="scale" role="img" aria-label="BMI scale from 15 to 40"><span class="mark" style="left:' + pos + '%"></span></div>' +
      '<div class="scale-labels"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>' +
      '<p class="hint">For your height, a BMI between 18.5 and 24.9 is a weight of about ' + range + ".</p>";
  }
  TK.$$("input").forEach(function (i) { i.addEventListener(i.type === "radio" ? "change" : "input", i.type === "radio" ? sync : calc); });
  sync();
})();
