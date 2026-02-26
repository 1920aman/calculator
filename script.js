/**
 * ============================================================
 *  EngiCalc — Engineering Calculator
 *  JavaScript Logic (Vanilla JS, no dependencies)
 *
 *  Modules:
 *   1. Basic Calculator
 *   2. Interest Calculator (SI + CI)
 *   3. Area & Perimeter (8 shapes)
 *   4. Trigonometry (6 functions)
 *   5. Modulus & Number Operations
 *   6. Engineering Utilities
 * ============================================================
 */

'use strict';

/* ==============================================================
   UTILITY HELPERS
   ============================================================== */

/**
 * Format a number for clean display — avoids floating point junk
 * e.g. 1.0000000000001 → 1
 */
function fmt(n, decimals = 8) {
  if (!isFinite(n)) return n;
  return parseFloat(n.toFixed(decimals)).toString();
}

/** Show an error in a result element */
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.add('error');
  el.classList.remove('success');
  el.innerHTML = `⚠ ${message}`;
}

/** Show a success result */
function showResult(elementId, html, isSuccess = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.remove('error');
  if (isSuccess) el.classList.add('success');
  el.innerHTML = html;
}

/** Parse a float, return NaN if invalid */
function parseNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? NaN : n;
}


/* ==============================================================
   TAB NAVIGATION
   ============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      // Deactivate all
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.calc-section').forEach(s => s.classList.remove('active'));
      // Activate target
      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Geometry: shape selector
  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderShapeForm(btn.dataset.shape);
    });
  });

  // Initialize default shape
  renderShapeForm('square');
});


/* ==============================================================
   THEME TOGGLE
   ============================================================== */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.querySelector('.theme-icon').textContent = isDark ? '🌙' : '☀';
}


/* ==============================================================
   MODULE 1: BASIC CALCULATOR
   ============================================================== */
let basicCurrent = '0';     // Current number being entered
let basicOperator = null;   // Pending operator
let basicPrev = null;       // Previous operand
let basicJustCalc = false;  // Did we just hit equals?

/** Append a digit or decimal point */
function basicNum(n) {
  if (basicJustCalc) {
    basicCurrent = n === '.' ? '0.' : n;
    basicJustCalc = false;
  } else {
    if (n === '.' && basicCurrent.includes('.')) return;
    if (basicCurrent === '0' && n !== '.') {
      basicCurrent = n;
    } else {
      basicCurrent = basicCurrent.length < 15 ? basicCurrent + n : basicCurrent;
    }
  }
  updateBasicDisplay();
}

/** Set pending operator */
function basicOp(op) {
  if (basicOperator && !basicJustCalc) {
    // Chain calculation
    basicCompute();
  }
  basicPrev = parseFloat(basicCurrent);
  basicOperator = op;
  basicJustCalc = false;
  // Show expression
  document.getElementById('basicExpr').textContent = `${fmt(basicPrev)} ${op}`;
  document.getElementById('basicDisplay').classList.remove('computed');
}

/** Calculate result */
function basicEquals() {
  if (basicOperator === null || basicPrev === null) return;
  basicCompute(true);
}

/** Perform the actual math */
function basicCompute(final = false) {
  const a = basicPrev;
  const b = parseFloat(basicCurrent);
  let result;

  const expr = document.getElementById('basicExpr');

  switch (basicOperator) {
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷':
      if (b === 0) {
        expr.textContent = 'Division by zero!';
        basicCurrent = '0';
        basicOperator = null; basicPrev = null;
        document.getElementById('basicDisplay').textContent = 'Error';
        document.getElementById('basicDisplay').classList.add('computed');
        return;
      }
      result = a / b;
      break;
    case '^': result = Math.pow(a, b); break;
    default: return;
  }

  expr.textContent = `${fmt(a)} ${basicOperator} ${fmt(b)} =`;
  basicCurrent = fmt(result);
  if (final) {
    basicOperator = null;
    basicPrev = null;
    basicJustCalc = true;
    document.getElementById('basicDisplay').classList.add('computed');
  } else {
    basicPrev = result;
  }
  updateBasicDisplay();
}

/** Special function buttons */
function basicFn(fn) {
  let val = parseFloat(basicCurrent);
  const expr = document.getElementById('basicExpr');

  switch (fn) {
    case 'clear':
      basicCurrent = '0';
      basicOperator = null;
      basicPrev = null;
      basicJustCalc = false;
      expr.innerHTML = '&nbsp;';
      document.getElementById('basicDisplay').classList.remove('computed');
      break;
    case 'sign':
      basicCurrent = fmt(val * -1);
      break;
    case 'percent':
      expr.textContent = `${basicCurrent} ÷ 100 =`;
      basicCurrent = fmt(val / 100);
      basicJustCalc = true;
      document.getElementById('basicDisplay').classList.add('computed');
      break;
    case 'sqrt':
      if (val < 0) {
        expr.textContent = '√ of negative!';
        basicCurrent = 'Error';
      } else {
        expr.textContent = `√(${basicCurrent}) =`;
        basicCurrent = fmt(Math.sqrt(val));
        basicJustCalc = true;
        document.getElementById('basicDisplay').classList.add('computed');
      }
      break;
    case 'square':
      expr.textContent = `(${basicCurrent})² =`;
      basicCurrent = fmt(val * val);
      basicJustCalc = true;
      document.getElementById('basicDisplay').classList.add('computed');
      break;
    case 'backspace':
      if (basicCurrent.length > 1) {
        basicCurrent = basicCurrent.slice(0, -1);
      } else {
        basicCurrent = '0';
      }
      break;
  }
  updateBasicDisplay();
}

function updateBasicDisplay() {
  document.getElementById('basicDisplay').textContent = basicCurrent;
}


/* ==============================================================
   MODULE 2: INTEREST CALCULATOR
   ============================================================== */

/** Switch between SI and CI panels */
function switchInterest(type) {
  const siPanel = document.getElementById('siPanel');
  const ciPanel = document.getElementById('ciPanel');
  const siBtn = document.getElementById('siBtn');
  const ciBtn = document.getElementById('ciBtn');

  if (type === 'si') {
    siPanel.style.display = 'block';
    ciPanel.style.display = 'none';
    siBtn.classList.add('active');
    ciBtn.classList.remove('active');
  } else {
    siPanel.style.display = 'none';
    ciPanel.style.display = 'block';
    siBtn.classList.remove('active');
    ciBtn.classList.add('active');
  }
}

/** Calculate Simple Interest */
function calcSI() {
  const P = parseNum(document.getElementById('siP').value);
  const R = parseNum(document.getElementById('siR').value);
  const T = parseNum(document.getElementById('siT').value);

  if (isNaN(P) || P < 0) return alert('Enter a valid Principal amount.');
  if (isNaN(R) || R < 0) return alert('Enter a valid Rate (≥ 0).');
  if (isNaN(T) || T < 0) return alert('Enter a valid Time period (≥ 0).');

  const SI = (P * R * T) / 100;
  const total = P + SI;

  const el = document.getElementById('siResult');
  el.style.display = 'block';
  el.innerHTML = `
    <div class="result-title">📊 Simple Interest Calculation</div>
    <div class="result-row">
      <span class="r-label">Principal (P)</span>
      <span class="r-value">₹ ${fmt(P, 2)}</span>
    </div>
    <div class="result-row">
      <span class="r-label">Rate (R)</span>
      <span class="r-value">${fmt(R, 4)}% per year</span>
    </div>
    <div class="result-row">
      <span class="r-label">Time (T)</span>
      <span class="r-value">${fmt(T, 4)} years</span>
    </div>
    <div class="result-row">
      <span class="r-label">Simple Interest</span>
      <span class="r-value">₹ ${fmt(SI, 2)}</span>
    </div>
    <div class="result-row">
      <span class="r-label">Total Amount (P + SI)</span>
      <span class="r-value big">₹ ${fmt(total, 2)}</span>
    </div>
    <div class="steps-section">
      <h4>Step-by-step solution</h4>
      <div class="step-line">SI = (P × R × T) / 100</div>
      <div class="step-line">SI = (<code>${fmt(P,2)}</code> × <code>${fmt(R,4)}</code> × <code>${fmt(T,4)}</code>) / 100</div>
      <div class="step-line">SI = <code>${fmt(P*R*T, 4)}</code> / 100</div>
      <div class="step-line">SI = <code>₹ ${fmt(SI, 2)}</code></div>
      <div class="step-line">Total = P + SI = <code>${fmt(P,2)}</code> + <code>${fmt(SI,2)}</code> = <code>₹ ${fmt(total, 2)}</code></div>
    </div>
  `;
}

function resetSI() {
  ['siP','siR','siT'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('siResult').style.display = 'none';
}

/** Calculate Compound Interest */
function calcCI() {
  const P = parseNum(document.getElementById('ciP').value);
  const R = parseNum(document.getElementById('ciR').value);
  const T = parseNum(document.getElementById('ciT').value);
  const n = parseInt(document.getElementById('ciN').value);
  const freqNames = { 1:'Annually', 2:'Semi-Annually', 4:'Quarterly', 12:'Monthly', 365:'Daily' };

  if (isNaN(P) || P < 0) return alert('Enter a valid Principal amount.');
  if (isNaN(R) || R < 0) return alert('Enter a valid Rate (≥ 0).');
  if (isNaN(T) || T < 0) return alert('Enter a valid Time period (≥ 0).');

  // A = P * (1 + R/(100*n))^(n*T)
  const rate = R / (100 * n);
  const exponent = n * T;
  const A = P * Math.pow(1 + rate, exponent);
  const CI = A - P;

  const el = document.getElementById('ciResult');
  el.style.display = 'block';
  el.innerHTML = `
    <div class="result-title">📊 Compound Interest Calculation</div>
    <div class="result-row">
      <span class="r-label">Principal (P)</span>
      <span class="r-value">₹ ${fmt(P, 2)}</span>
    </div>
    <div class="result-row">
      <span class="r-label">Annual Rate (R)</span>
      <span class="r-value">${fmt(R, 4)}%</span>
    </div>
    <div class="result-row">
      <span class="r-label">Time (T)</span>
      <span class="r-value">${fmt(T, 4)} years</span>
    </div>
    <div class="result-row">
      <span class="r-label">Compounding (n)</span>
      <span class="r-value">${freqNames[n]} (${n}×/year)</span>
    </div>
    <div class="result-row">
      <span class="r-label">Compound Interest</span>
      <span class="r-value">₹ ${fmt(CI, 2)}</span>
    </div>
    <div class="result-row">
      <span class="r-label">Final Amount (A)</span>
      <span class="r-value big">₹ ${fmt(A, 2)}</span>
    </div>
    <div class="steps-section">
      <h4>Step-by-step solution</h4>
      <div class="step-line">A = P × (1 + R/100n)^(nT)</div>
      <div class="step-line">A = <code>${fmt(P,2)}</code> × (1 + <code>${fmt(R,4)}</code>/(100 × <code>${n}</code>))^(<code>${n}</code> × <code>${fmt(T,4)}</code>)</div>
      <div class="step-line">A = <code>${fmt(P,2)}</code> × (1 + <code>${fmt(rate, 8)}</code>)^<code>${fmt(exponent, 4)}</code></div>
      <div class="step-line">A = <code>${fmt(P,2)}</code> × <code>${fmt(Math.pow(1+rate, exponent), 8)}</code></div>
      <div class="step-line">A = <code>₹ ${fmt(A, 2)}</code></div>
      <div class="step-line">CI = A − P = <code>${fmt(A,2)}</code> − <code>${fmt(P,2)}</code> = <code>₹ ${fmt(CI, 2)}</code></div>
    </div>
  `;
}

function resetCI() {
  ['ciP','ciR','ciT'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('ciResult').style.display = 'none';
}


/* ==============================================================
   MODULE 3: GEOMETRY CALCULATOR
   ============================================================== */

/** Shape definitions: inputs, area formula, perimeter formula */
const SHAPES = {
  square: {
    name: 'Square', emoji: '⬛',
    inputs: [{ id: 'side', label: 'Side (a)', placeholder: 'e.g. 5' }],
    area: (v) => ({ val: v.side ** 2, formula: `a² = ${fmt(v.side)}² = ${fmt(v.side**2)}` }),
    perimeter: (v) => ({ val: 4 * v.side, formula: `4a = 4 × ${fmt(v.side)} = ${fmt(4*v.side)}` }),
  },
  rectangle: {
    name: 'Rectangle', emoji: '▬',
    inputs: [
      { id: 'len', label: 'Length (l)', placeholder: 'e.g. 8' },
      { id: 'width', label: 'Width (w)', placeholder: 'e.g. 4' },
    ],
    area: (v) => ({ val: v.len * v.width, formula: `l × w = ${fmt(v.len)} × ${fmt(v.width)} = ${fmt(v.len*v.width)}` }),
    perimeter: (v) => ({ val: 2*(v.len+v.width), formula: `2(l+w) = 2(${fmt(v.len)}+${fmt(v.width)}) = ${fmt(2*(v.len+v.width))}` }),
  },
  circle: {
    name: 'Circle', emoji: '⭕',
    inputs: [{ id: 'radius', label: 'Radius (r)', placeholder: 'e.g. 7' }],
    area: (v) => ({ val: Math.PI*v.radius**2, formula: `π r² = π × ${fmt(v.radius)}² = ${fmt(Math.PI*v.radius**2)}` }),
    perimeter: (v) => ({ val: 2*Math.PI*v.radius, formula: `2πr = 2π × ${fmt(v.radius)} = ${fmt(2*Math.PI*v.radius)}`, label: 'Circumference' }),
  },
  triangle: {
    name: 'Triangle (scalene)', emoji: '🔺',
    inputs: [
      { id: 'ta', label: 'Side a', placeholder: 'e.g. 3' },
      { id: 'tb', label: 'Side b', placeholder: 'e.g. 4' },
      { id: 'tc', label: 'Side c', placeholder: 'e.g. 5' },
    ],
    area: (v) => {
      // Heron's formula
      const s = (v.ta + v.tb + v.tc) / 2;
      const inner = s*(s-v.ta)*(s-v.tb)*(s-v.tc);
      if (inner < 0) return { val: NaN, formula: 'Invalid triangle sides!' };
      const A = Math.sqrt(inner);
      return { val: A, formula: `Heron's: s=${fmt(s,4)}, √[s(s-a)(s-b)(s-c)] = ${fmt(A)}` };
    },
    perimeter: (v) => ({ val: v.ta+v.tb+v.tc, formula: `a+b+c = ${fmt(v.ta)}+${fmt(v.tb)}+${fmt(v.tc)} = ${fmt(v.ta+v.tb+v.tc)}` }),
  },
  parallelogram: {
    name: 'Parallelogram', emoji: '▱',
    inputs: [
      { id: 'pb', label: 'Base (b)', placeholder: 'e.g. 10' },
      { id: 'ph', label: 'Height (h)', placeholder: 'e.g. 6' },
      { id: 'ps', label: 'Slant Side (s)', placeholder: 'e.g. 7' },
    ],
    area: (v) => ({ val: v.pb*v.ph, formula: `b × h = ${fmt(v.pb)} × ${fmt(v.ph)} = ${fmt(v.pb*v.ph)}` }),
    perimeter: (v) => ({ val: 2*(v.pb+v.ps), formula: `2(b+s) = 2(${fmt(v.pb)}+${fmt(v.ps)}) = ${fmt(2*(v.pb+v.ps))}` }),
  },
  rhombus: {
    name: 'Rhombus', emoji: '◆',
    inputs: [
      { id: 'd1', label: 'Diagonal 1 (d₁)', placeholder: 'e.g. 12' },
      { id: 'd2', label: 'Diagonal 2 (d₂)', placeholder: 'e.g. 8' },
    ],
    area: (v) => ({ val: (v.d1*v.d2)/2, formula: `(d₁×d₂)/2 = (${fmt(v.d1)}×${fmt(v.d2)})/2 = ${fmt((v.d1*v.d2)/2)}` }),
    perimeter: (v) => {
      const side = Math.sqrt((v.d1/2)**2 + (v.d2/2)**2);
      return { val: 4*side, formula: `4×√((d₁/2)²+(d₂/2)²) = 4×${fmt(side)} = ${fmt(4*side)}` };
    },
  },
  trapezium: {
    name: 'Trapezium', emoji: '⏢',
    inputs: [
      { id: 'trpa', label: 'Parallel side a', placeholder: 'e.g. 8' },
      { id: 'trpb', label: 'Parallel side b', placeholder: 'e.g. 5' },
      { id: 'trph', label: 'Height (h)', placeholder: 'e.g. 4' },
      { id: 'trps1', label: 'Non-parallel side 1', placeholder: 'e.g. 4.5' },
      { id: 'trps2', label: 'Non-parallel side 2', placeholder: 'e.g. 4.5' },
    ],
    area: (v) => ({ val: 0.5*(v.trpa+v.trpb)*v.trph, formula: `½(a+b)h = ½(${fmt(v.trpa)}+${fmt(v.trpb)})×${fmt(v.trph)} = ${fmt(0.5*(v.trpa+v.trpb)*v.trph)}` }),
    perimeter: (v) => ({ val: v.trpa+v.trpb+v.trps1+v.trps2, formula: `a+b+s₁+s₂ = ${fmt(v.trpa+v.trpb+v.trps1+v.trps2)}` }),
  },
  ellipse: {
    name: 'Ellipse', emoji: '🔵',
    inputs: [
      { id: 'ea', label: 'Semi-major axis (a)', placeholder: 'e.g. 8' },
      { id: 'eb', label: 'Semi-minor axis (b)', placeholder: 'e.g. 5' },
    ],
    area: (v) => ({ val: Math.PI*v.ea*v.eb, formula: `πab = π×${fmt(v.ea)}×${fmt(v.eb)} = ${fmt(Math.PI*v.ea*v.eb)}` }),
    perimeter: (v) => {
      // Ramanujan's approximation
      const h = ((v.ea-v.eb)/(v.ea+v.eb))**2;
      const P = Math.PI*(v.ea+v.eb)*(1 + (3*h)/(10+Math.sqrt(4-3*h)));
      return { val: P, formula: `Ramanujan's approx ≈ ${fmt(P)}` };
    },
  },
};

/** Render the shape input form */
function renderShapeForm(shapeName) {
  const shape = SHAPES[shapeName];
  const panel = document.getElementById('shapePanel');

  const inputsHTML = shape.inputs.map(inp => `
    <div class="input-group">
      <label>${inp.label}</label>
      <input type="number" id="shp_${inp.id}" placeholder="${inp.placeholder}" min="0" step="any" />
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="shape-form">
      <span class="shape-emoji">${shape.emoji}</span>
      <h3>${shape.name}</h3>
      <div class="formula-box">
        <span class="formula-label">Shape</span>
        <span class="formula-text">${shape.name} — Area & Perimeter</span>
      </div>
      <div class="input-grid">${inputsHTML}</div>
      <div class="btn-row">
        <button class="calc-action-btn" onclick="calcGeometry('${shapeName}')">Calculate</button>
        <button class="reset-btn" onclick="renderShapeForm('${shapeName}')">Reset</button>
      </div>
      <div id="geoResult" style="display:none;" class="result-box"></div>
    </div>
  `;
}

/** Calculate area and perimeter for selected shape */
function calcGeometry(shapeName) {
  const shape = SHAPES[shapeName];

  // Gather input values
  const vals = {};
  for (const inp of shape.inputs) {
    const v = parseNum(document.getElementById(`shp_${inp.id}`)?.value);
    if (isNaN(v) || v < 0) {
      return alert(`Please enter a valid, positive value for "${inp.label}".`);
    }
    vals[inp.id] = v;
  }

  const areaResult = shape.area(vals);
  const periResult = shape.perimeter(vals);

  if (isNaN(areaResult.val)) {
    return alert('Invalid dimensions! Check your inputs (e.g. triangle inequality).');
  }

  const perimLabel = periResult.label || 'Perimeter';
  const el = document.getElementById('geoResult');
  el.style.display = 'block';
  el.innerHTML = `
    <div class="result-title">${shape.emoji} ${shape.name} Results</div>
    <div class="result-row">
      <span class="r-label">Area</span>
      <span class="r-value big">${fmt(areaResult.val, 6)} sq. units</span>
    </div>
    <div class="result-row">
      <span class="r-label">${perimLabel}</span>
      <span class="r-value big">${fmt(periResult.val, 6)} units</span>
    </div>
    <div class="steps-section">
      <h4>Formulas Used</h4>
      <div class="step-line">Area: <code>${areaResult.formula}</code></div>
      <div class="step-line">${perimLabel}: <code>${periResult.formula}</code></div>
    </div>
  `;
}


/* ==============================================================
   MODULE 4: TRIGONOMETRY
   ============================================================== */
let trigMode = 'deg'; // 'deg' or 'rad'

function setTrigMode(mode) {
  trigMode = mode;
  document.getElementById('degBtn').classList.toggle('active', mode === 'deg');
  document.getElementById('radBtn').classList.toggle('active', mode === 'rad');
}

/** Convert input angle to radians for Math functions */
function toRadians(angle) {
  return trigMode === 'deg' ? (angle * Math.PI / 180) : angle;
}

/** Calculate a single trig function and show result */
function calcTrig(func) {
  const angleStr = document.getElementById('trigAngle').value;
  const angle = parseNum(angleStr);
  if (isNaN(angle)) return alert('Enter a valid angle.');

  const rad = toRadians(angle);
  const result = getTrigValue(func, rad);
  const container = document.getElementById('trigResults');
  container.style.display = 'block';
  container.innerHTML = `
    <div class="result-box">
      <div class="result-row">
        <span class="r-label">${func}(${fmt(angle)} ${trigMode === 'deg' ? '°' : 'rad'})</span>
        <span class="r-value big">${result}</span>
      </div>
    </div>
  `;
}

/** Calculate all 6 trig functions at once */
function calcAllTrig() {
  const angle = parseNum(document.getElementById('trigAngle').value);
  if (isNaN(angle)) return alert('Enter a valid angle.');

  const rad = toRadians(angle);
  const funcs = ['sin', 'cos', 'tan', 'cosec', 'sec', 'cot'];

  const container = document.getElementById('trigResults');
  container.style.display = 'block';
  container.innerHTML = `
    <div class="result-box">
      <div class="result-title">All Trig Values for ${fmt(angle)} ${trigMode === 'deg' ? '°' : 'rad'}</div>
      <div class="trig-grid">
        ${funcs.map(f => {
          const val = getTrigValue(f, rad);
          const isUndef = val === 'Undefined';
          return `
            <div class="trig-card">
              <div class="func-name">${f}(θ)</div>
              <div class="func-val ${isUndef ? 'undefined-val' : ''}">${val}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="steps-section">
        <h4>Note</h4>
        <div class="step-line">cosec θ = 1/sin θ &nbsp;|&nbsp; sec θ = 1/cos θ &nbsp;|&nbsp; cot θ = 1/tan θ</div>
        ${trigMode === 'deg' ? `<div class="step-line">${fmt(angle)}° = ${fmt(rad, 6)} radians</div>` : `<div class="step-line">${fmt(angle)} rad = ${fmt(angle * 180 / Math.PI, 4)}°</div>`}
      </div>
    </div>
  `;
}

/** Get a trig value safely, return 'Undefined' for asymptotes */
function getTrigValue(func, rad) {
  const EPSILON = 1e-10;
  let val;

  switch (func) {
    case 'sin': val = Math.sin(rad); break;
    case 'cos': val = Math.cos(rad); break;
    case 'tan':
      val = Math.tan(rad);
      if (Math.abs(val) > 1e10) return 'Undefined';
      break;
    case 'cosec':
      const sinVal = Math.sin(rad);
      if (Math.abs(sinVal) < EPSILON) return 'Undefined';
      val = 1 / sinVal;
      break;
    case 'sec':
      const cosVal = Math.cos(rad);
      if (Math.abs(cosVal) < EPSILON) return 'Undefined';
      val = 1 / cosVal;
      break;
    case 'cot':
      const tanVal = Math.tan(rad);
      if (Math.abs(tanVal) < EPSILON) return 'Undefined';
      val = 1 / tanVal;
      break;
    default: return 'N/A';
  }

  return fmt(val, 8);
}

function resetTrig() {
  document.getElementById('trigAngle').value = '';
  document.getElementById('trigResults').style.display = 'none';
}


/* ==============================================================
   MODULE 5: MODULUS & NUMBER OPERATIONS
   ============================================================== */

/** a mod b */
function calcMod() {
  const a = parseNum(document.getElementById('modA').value);
  const b = parseNum(document.getElementById('modB').value);
  const el = document.getElementById('modResult');
  if (isNaN(a) || isNaN(b)) { showError('modResult', 'Enter valid numbers.'); return; }
  if (b === 0) { showError('modResult', 'Modulus by zero is undefined.'); return; }
  const result = ((a % b) + b) % b; // Always non-negative
  el.classList.remove('error');
  el.textContent = `${fmt(a)} mod ${fmt(b)} = ${fmt(result)}`;
}

/** |x| */
function calcAbs() {
  const x = parseNum(document.getElementById('absX').value);
  if (isNaN(x)) { showError('absResult', 'Enter a valid number.'); return; }
  showResult('absResult', `|${fmt(x)}| = ${fmt(Math.abs(x))}`);
}

/** Floor */
function calcFloor() {
  const x = parseNum(document.getElementById('floorInput').value);
  if (isNaN(x)) { showError('floorResult', 'Enter a valid decimal number.'); return; }
  showResult('floorResult', `⌊${fmt(x)}⌋ = ${Math.floor(x)}`);
}

/** Ceil */
function calcCeil() {
  const x = parseNum(document.getElementById('floorInput').value);
  if (isNaN(x)) { showError('floorResult', 'Enter a valid decimal number.'); return; }
  showResult('floorResult', `⌈${fmt(x)}⌉ = ${Math.ceil(x)}`);
}

/** Round */
function calcRound() {
  const x = parseNum(document.getElementById('floorInput').value);
  if (isNaN(x)) { showError('floorResult', 'Enter a valid decimal number.'); return; }
  showResult('floorResult', `round(${fmt(x)}) = ${Math.round(x)}`);
}

/** n! Factorial */
function calcFactorial() {
  const n = parseInt(document.getElementById('factN').value);
  if (isNaN(n) || n < 0) { showError('factResult', 'Enter a non-negative integer.'); return; }
  if (n > 170) { showError('factResult', 'Max supported: 170! (exceeds JS safe range).'); return; }

  let result = BigInt(1);
  let steps = '1';
  for (let i = 2; i <= n; i++) {
    result *= BigInt(i);
    if (n <= 12) steps += ` × ${i}`;
  }

  const el = document.getElementById('factResult');
  el.classList.remove('error');

  if (n <= 12) {
    el.innerHTML = `${n}! = ${steps} = <strong>${result.toString()}</strong>`;
  } else {
    el.innerHTML = `${n}! = ${result.toString()}`;
  }
}

/** Prime check */
function checkPrime() {
  const n = parseInt(document.getElementById('primeN').value);
  const el = document.getElementById('primeResult');
  if (isNaN(n) || n < 1) { showError('primeResult', 'Enter a positive integer.'); return; }
  if (n === 1) { el.classList.remove('error'); el.textContent = '1 is neither prime nor composite.'; return; }

  const isPrime = testPrime(n);
  el.classList.remove('error');
  if (isPrime) {
    el.classList.add('success');
    el.textContent = `✓ ${n} is a PRIME number.`;
  } else {
    el.classList.remove('success');
    const factors = getFactors(n);
    el.textContent = `✗ ${n} is NOT prime. Factors: ${factors.join(', ')}`;
  }
}

function testPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function getFactors(n) {
  const factors = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
}

/** Even / Odd check */
function checkEvenOdd() {
  const n = parseInt(document.getElementById('evenOddN').value);
  const el = document.getElementById('evenOddResult');
  if (isNaN(n)) { showError('evenOddResult', 'Enter a valid integer.'); return; }
  el.classList.remove('error', 'success');
  if (n % 2 === 0) {
    el.classList.add('success');
    el.textContent = `${n} is EVEN (divisible by 2)`;
  } else {
    el.textContent = `${n} is ODD (not divisible by 2)`;
  }
}


/* ==============================================================
   MODULE 6: ENGINEERING UTILITIES
   ============================================================== */

/** Log base 10, ln, log2 */
function calcLog(type) {
  const x = parseNum(document.getElementById('logX').value);
  if (isNaN(x) || x <= 0) { showError('logResult', 'Enter a positive number (x > 0).'); return; }

  let result, formula;
  switch (type) {
    case 'log':
      result = Math.log10(x);
      formula = `log₁₀(${fmt(x)}) = ${fmt(result, 10)}`;
      break;
    case 'ln':
      result = Math.log(x);
      formula = `ln(${fmt(x)}) = ${fmt(result, 10)}`;
      break;
    case 'log2':
      result = Math.log2(x);
      formula = `log₂(${fmt(x)}) = ${fmt(result, 10)}`;
      break;
  }
  showResult('logResult', formula);
}

/** Exponential: eˣ, 2ˣ, 10ˣ */
function calcExp(base) {
  const x = parseNum(document.getElementById('expX').value);
  if (isNaN(x)) { showError('expResult', 'Enter a valid exponent.'); return; }

  let result, formula;
  if (base === 'e') {
    result = Math.exp(x);
    formula = `e^${fmt(x)} = ${fmt(result, 10)}`;
  } else if (base === '2') {
    result = Math.pow(2, x);
    formula = `2^${fmt(x)} = ${fmt(result, 10)}`;
  } else {
    result = Math.pow(10, x);
    formula = `10^${fmt(x)} = ${fmt(result, 10)}`;
  }
  showResult('expResult', formula);
}

/** Convert to scientific notation */
function toSciNotation() {
  const input = document.getElementById('sciInput').value.trim();
  const n = parseFloat(input);
  if (isNaN(n)) { showError('sciResult', 'Enter a valid number.'); return; }
  showResult('sciResult', `${n} = ${n.toExponential()}`);
}

/** Convert from scientific to standard */
function fromSciNotation() {
  const input = document.getElementById('sciInput').value.trim();
  const n = parseFloat(input);
  if (isNaN(n)) { showError('sciResult', 'Enter a valid number (e.g. 1.23e5).'); return; }
  showResult('sciResult', `${input} = ${n.toLocaleString('fullwide', {maximumFractionDigits: 20})}`);
}

/** Binary ↔ Decimal */
function convertBin(direction) {
  const input = document.getElementById('binDecInput').value.trim();
  if (!input) { showError('binDecResult', 'Please enter a value.'); return; }

  if (direction === 'toDecimal') {
    // Validate binary string
    if (!/^[01]+$/.test(input)) {
      showError('binDecResult', 'Invalid binary! Use only 0s and 1s.');
      return;
    }
    const decimal = parseInt(input, 2);
    showResult('binDecResult', `Binary <code>${input}</code> = Decimal <strong>${decimal}</strong>`);
  } else {
    const n = parseInt(input);
    if (isNaN(n) || n < 0) {
      showError('binDecResult', 'Enter a non-negative integer for decimal.');
      return;
    }
    const binary = n.toString(2);
    showResult('binDecResult', `Decimal <code>${n}</code> = Binary <strong>${binary}</strong>`);
  }
}

/** Hex ↔ Decimal */
function convertHex(direction) {
  const input = document.getElementById('hexDecInput').value.trim();
  if (!input) { showError('hexDecResult', 'Please enter a value.'); return; }

  if (direction === 'toDecimal') {
    if (!/^[0-9a-fA-F]+$/.test(input)) {
      showError('hexDecResult', 'Invalid hexadecimal! Use 0-9 and A-F.');
      return;
    }
    const decimal = parseInt(input, 16);
    showResult('hexDecResult', `Hex <code>${input.toUpperCase()}</code> = Decimal <strong>${decimal}</strong>`);
  } else {
    const n = parseInt(input);
    if (isNaN(n) || n < 0) {
      showError('hexDecResult', 'Enter a non-negative integer for decimal.');
      return;
    }
    const hex = n.toString(16).toUpperCase();
    showResult('hexDecResult', `Decimal <code>${n}</code> = Hex <strong>${hex}</strong>`);
  }
}
/* ==============================================================
   KEYBOARD INPUT SUPPORT — Basic Calculator
   ============================================================== */

document.addEventListener('keydown', function(e) {
  // Sirf tab "basic" active ho tab kaam kare
  const basicSection = document.getElementById('basic');
  if (!basicSection.classList.contains('active')) return;

  const key = e.key;

  // ── Digits 0-9 ──
  if (key >= '0' && key <= '9') {
    basicNum(key);
  }

  // ── Decimal point ──
  else if (key === '.') {
    basicNum('.');
  }

  // ── Operators ──
  else if (key === '+') basicOp('+');
  else if (key === '-') basicOp('−');       // minus sign → our minus symbol
  else if (key === '*') basicOp('×');       // * → ×
  else if (key === '/') {
    e.preventDefault();                     // browser find bar rokne ke liye
    basicOp('÷');
  }
  else if (key === '^') basicOp('^');       // xʸ

  // ── Equals / Enter ──
  else if (key === '=' || key === 'Enter') {
    e.preventDefault();
    basicEquals();
  }

  // ── Backspace ──
  else if (key === 'Backspace') {
    basicFn('backspace');
  }

  // ── Clear — Escape or Delete ──
  else if (key === 'Escape' || key === 'Delete') {
    basicFn('clear');
  }

  // ── Percent ──
  else if (key === '%') {
    basicFn('percent');
  }

  // ── Square Root — 'r' key ──
  else if (key === 'r' || key === 'R') {
    basicFn('sqrt');
  }

  // ── Square (x²) — 'q' key ──
  else if (key === 'q' || key === 'Q') {
    basicFn('square');
  }

  // ── Sign toggle — 's' key ──
  else if (key === 's' || key === 'S') {
    basicFn('sign');
  }
});
