// equation-solver.js - 100% Client-Side Math Equation Solver with Step-by-Step Solutions
(function () {
  'use strict';

  function init() {
    const tabQuad = document.getElementById('eqTabQuad');
    const tabLin = document.getElementById('eqTabLin');
    const tabSys = document.getElementById('eqTabSys');

    const secQuad = document.getElementById('eqSecQuad');
    const secLin = document.getElementById('eqSecLin');
    const secSys = document.getElementById('eqSecSys');

    const resultBox = document.getElementById('eqResultBox');
    const solutionSummary = document.getElementById('eqSolutionSummary');
    const stepList = document.getElementById('eqStepList');

    if (!tabQuad || !resultBox) return;

    let mode = 'quad';

    function setMode(newMode) {
      mode = newMode;
      [tabQuad, tabLin, tabSys].forEach(t => {
        if (t) {
          const isActive = t.getAttribute('data-mode') === mode;
          t.className = isActive ? 'btn active' : 'btn ghost';
          t.setAttribute('aria-selected', isActive);
        }
      });

      if (secQuad) secQuad.style.display = mode === 'quad' ? 'block' : 'none';
      if (secLin) secLin.style.display = mode === 'lin' ? 'block' : 'none';
      if (secSys) secSys.style.display = mode === 'sys' ? 'block' : 'none';

      solve();
    }

    if (tabQuad) tabQuad.addEventListener('click', () => setMode('quad'));
    if (tabLin) tabLin.addEventListener('click', () => setMode('lin'));
    if (tabSys) tabSys.addEventListener('click', () => setMode('sys'));

    function solveQuad() {
      const a = parseFloat(document.getElementById('quadA').value) || 0;
      const b = parseFloat(document.getElementById('quadB').value) || 0;
      const c = parseFloat(document.getElementById('quadC').value) || 0;

      if (a === 0) {
        if (b === 0) {
          return {
            summary: c === 0 ? "Infinite solutions (0 = 0)" : "No solution (contradiction)",
            steps: ["Since a = 0 and b = 0, the equation reduces to a constant comparison."]
          };
        }
        const x = -c / b;
        return {
          summary: `Linear degenerate root: x = ${Number(x.toFixed(6))}`,
          steps: [
            `Since a = 0, this is a linear equation: ${b}x + ${c} = 0`,
            `Subtract ${c} from both sides: ${b}x = ${-c}`,
            `Divide by ${b}: x = ${-c} / ${b} = ${Number(x.toFixed(6))}`
          ]
        };
      }

      const disc = (b * b) - (4 * a * c);
      const vertexX = -b / (2 * a);
      const vertexY = -disc / (4 * a);

      const steps = [
        `Standard Form: (${a})x² + (${b})x + (${c}) = 0`,
        `Compute Discriminant: Δ = b² - 4ac = (${b})² - 4(${a})(${c}) = ${b*b} - ${4*a*c} = ${disc}`,
        `Parabola Vertex: (h, k) = (-b / 2a, -Δ / 4a) = (${Number(vertexX.toFixed(4))}, ${Number(vertexY.toFixed(4))})`
      ];

      let summary = "";

      if (disc > 0) {
        const sqrtDisc = Math.sqrt(disc);
        const x1 = (-b + sqrtDisc) / (2 * a);
        const x2 = (-b - sqrtDisc) / (2 * a);
        summary = `Two Real Roots: x₁ = ${Number(x1.toFixed(6))}, x₂ = ${Number(x2.toFixed(6))}`;
        steps.push(`Since Δ > 0, there are two distinct real roots.`);
        steps.push(`Formula: x = (-b ± √Δ) / 2a`);
        steps.push(`x₁ = (-(${b}) + √${disc}) / (2 × ${a}) = (${-b} + ${Number(sqrtDisc.toFixed(4))}) / ${2*a} = ${Number(x1.toFixed(6))}`);
        steps.push(`x₂ = (-(${b}) - √${disc}) / (2 × ${a}) = (${-b} - ${Number(sqrtDisc.toFixed(4))}) / ${2*a} = ${Number(x2.toFixed(6))}`);
      } else if (disc === 0) {
        const x = -b / (2 * a);
        summary = `One Repeated Real Root: x = ${Number(x.toFixed(6))}`;
        steps.push(`Since Δ = 0, there is exactly one repeated real root.`);
        steps.push(`x = -b / 2a = -(${b}) / (2 × ${a}) = ${Number(x.toFixed(6))}`);
      } else {
        const realPart = -b / (2 * a);
        const imagPart = Math.sqrt(Math.abs(disc)) / (2 * a);
        const absImag = Math.abs(imagPart);
        summary = `Two Complex Roots: x = ${Number(realPart.toFixed(4))} ± ${Number(absImag.toFixed(4))}i`;
        steps.push(`Since Δ < 0, there are no real roots, but two complex conjugate roots.`);
        steps.push(`Real part = -b / 2a = ${Number(realPart.toFixed(4))}`);
        steps.push(`Imaginary part = √(4ac - b²) / 2a = ${Number(absImag.toFixed(4))}i`);
      }

      return { summary, steps };
    }

    function solveLin() {
      const a = parseFloat(document.getElementById('linA').value) || 0;
      const b = parseFloat(document.getElementById('linB').value) || 0;
      const c = parseFloat(document.getElementById('linC').value) || 0;

      const steps = [`Equation: (${a})x + (${b}) = ${c}`];

      if (a === 0) {
        return {
          summary: b === c ? "Infinite solutions (Identity)" : "No solution (Contradiction)",
          steps: [`a = 0: ${b} = ${c} is ${b === c ? "always true" : "impossible"}.`]
        };
      }

      const diff = c - b;
      steps.push(`Subtract ${b} from both sides: ${a}x = ${c} - (${b}) = ${diff}`);
      const x = diff / a;
      steps.push(`Divide both sides by ${a}: x = ${diff} / ${a} = ${Number(x.toFixed(6))}`);

      return {
        summary: `Solution: x = ${Number(x.toFixed(6))}`,
        steps
      };
    }

    function solveSys() {
      const a1 = parseFloat(document.getElementById('sysA1').value) || 0;
      const b1 = parseFloat(document.getElementById('sysB1').value) || 0;
      const c1 = parseFloat(document.getElementById('sysC1').value) || 0;

      const a2 = parseFloat(document.getElementById('sysA2').value) || 0;
      const b2 = parseFloat(document.getElementById('sysB2').value) || 0;
      const c2 = parseFloat(document.getElementById('sysC2').value) || 0;

      const det = (a1 * b2) - (a2 * b1);
      const detX = (c1 * b2) - (c2 * b1);
      const detY = (a1 * c2) - (a2 * c1);

      const steps = [
        `Equation (1): (${a1})x + (${b1})y = ${c1}`,
        `Equation (2): (${a2})x + (${b2})y = ${c2}`,
        `Main Determinant: D = (${a1})(${b2}) - (${a2})(${b1}) = ${det}`,
        `X Determinant: Dx = (${c1})(${b2}) - (${c2})(${b1}) = ${detX}`,
        `Y Determinant: Dy = (${a1})(${c2}) - (${a2})(${c1}) = ${detY}`
      ];

      if (det === 0) {
        if (detX === 0 && detY === 0) {
          return {
            summary: "Infinite solutions (Dependent parallel lines coincide)",
            steps: [...steps, "Since D = 0, Dx = 0, and Dy = 0, the two lines are identical."]
          };
        } else {
          return {
            summary: "No solution (Inconsistent distinct parallel lines)",
            steps: [...steps, "Since D = 0 but Dx ≠ 0 or Dy ≠ 0, the lines are parallel and never intersect."]
          };
        }
      }

      const x = detX / det;
      const y = detY / det;
      steps.push(`Cramer's Rule: x = Dx / D = ${detX} / ${det} = ${Number(x.toFixed(6))}`);
      steps.push(`Cramer's Rule: y = Dy / D = ${detY} / ${det} = ${Number(y.toFixed(6))}`);

      return {
        summary: `Intersection Point: x = ${Number(x.toFixed(6))}, y = ${Number(y.toFixed(6))}`,
        steps
      };
    }

    function solve() {
      let res;
      if (mode === 'quad') res = solveQuad();
      else if (mode === 'lin') res = solveLin();
      else res = solveSys();

      if (solutionSummary) solutionSummary.textContent = res.summary;
      if (stepList) {
        stepList.innerHTML = res.steps.map(s => `<li style="margin-bottom:6px;">${s}</li>`).join('');
      }
    }

    // Attach real-time input listeners to all input boxes
    document.querySelectorAll('.eq-input').forEach(inp => {
      inp.addEventListener('input', solve);
    });

    solve();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
