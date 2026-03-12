export function initSettings(root) {
  if (!root) return;

  const hidden = root.querySelector('[data-swatches-hidden]');
  const list = root.querySelector('[data-swatch-list]');
  const addBtn = root.querySelector('[data-add-swatch]');
  if (!hidden || !list || !addBtn) return;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const alphaHex = (a) => Math.round(clamp(a, 0, 1) * 255).toString(16).padStart(2, '0');

  const hexToRgb = (hex) => {
    const v = String(hex || '#000000').replace('#', '').toLowerCase();
    return {
      r: Number.parseInt(v.slice(0, 2), 16) || 0,
      g: Number.parseInt(v.slice(2, 4), 16) || 0,
      b: Number.parseInt(v.slice(4, 6), 16) || 0,
    };
  };

  const rgbToHex = (r, g, b) =>
    `#${[r, g, b].map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')).join('')}`;

  const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0; let g = 0; let b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return {r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255)};
  };

  const rgbToHsv = (r, g, b) => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === rn) h = 60 * (((gn - bn) / d) % 6);
      else if (max === gn) h = 60 * (((bn - rn) / d) + 2);
      else h = 60 * (((rn - gn) / d) + 4);
    }
    if (h < 0) h += 360;
    return {h, s: max === 0 ? 0 : d / max, v: max};
  };

  const rgbToHsl = (r, g, b) => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      if (max === rn) h = 60 * (((gn - bn) / d) % 6);
      else if (max === gn) h = 60 * (((bn - rn) / d) + 2);
      else h = 60 * (((rn - gn) / d) + 4);
      if (h < 0) h += 360;
    }
    return {h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100)};
  };

  const hslToRgb = (h, s, l) => {
    const sat = clamp(s, 0, 100) / 100;
    const lig = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lig - c / 2;
    let rr = 0; let gg = 0; let bb = 0;
    if (h < 60) [rr, gg, bb] = [c, x, 0];
    else if (h < 120) [rr, gg, bb] = [x, c, 0];
    else if (h < 180) [rr, gg, bb] = [0, c, x];
    else if (h < 240) [rr, gg, bb] = [0, x, c];
    else if (h < 300) [rr, gg, bb] = [x, 0, c];
    else [rr, gg, bb] = [c, 0, x];
    return {
      r: Math.round((rr + m) * 255),
      g: Math.round((gg + m) * 255),
      b: Math.round((bb + m) * 255),
    };
  };

  const parseHexA = (value) => {
    const clean = String(value || '').trim().toLowerCase().replace(/^#/, '');
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(clean)) return null;
    const hex = `#${clean.slice(0, 6)}`;
    const alpha = clean.length === 8 ? clamp(Number.parseInt(clean.slice(6, 8), 16) / 255, 0, 1) : 1;
    return {hex, alpha};
  };

  const parseValue = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    const hexParsed = parseHexA(raw);
    if (hexParsed) return hexParsed;

    let match = raw.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/);
    if (match) {
      const r = clamp(Number(match[1]), 0, 255);
      const g = clamp(Number(match[2]), 0, 255);
      const b = clamp(Number(match[3]), 0, 255);
      const a = typeof match[4] !== 'undefined' ? clamp(Number(match[4]), 0, 1) : 1;
      return {hex: rgbToHex(r, g, b), alpha: a};
    }

    match = raw.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/);
    if (match) {
      const h = clamp(Number(match[1]), 0, 360);
      const s = clamp(Number(match[2]), 0, 100);
      const l = clamp(Number(match[3]), 0, 100);
      const a = typeof match[4] !== 'undefined' ? clamp(Number(match[4]), 0, 1) : 1;
      const rgb = hslToRgb(h, s, l);
      return {hex: rgbToHex(rgb.r, rgb.g, rgb.b), alpha: a};
    }

    return null;
  };

  const normalizeValue = (value) => {
    const parsed = parseValue(value);
    if (!parsed) return '';
    return parsed.alpha < 1 ? `${parsed.hex}${alphaHex(parsed.alpha)}` : parsed.hex;
  };

  const modes = ['hex', 'rgb', 'rgba', 'hsl', 'hsla'];
  let modeIndex = 0;
  let activeInput = null;
  let activeCircle = null;
  let h = 0;
  let s = 0;
  let v = 0;
  let a = 1;
  let syncing = false;

  const pop = document.createElement('div');
  pop.className = 'acf-picker acf-settings-picker';
  pop.hidden = true;
  pop.innerHTML = `
    <div class="acf-sv" data-sv-wrap>
      <div class="acf-sv-white"></div>
      <div class="acf-sv-black"></div>
      <span class="acf-handle" data-sv-handle></span>
    </div>
    <div class="acf-row acf-row1">
      <button type="button" class="acf-eye-btn" data-eyedropper aria-label="Pick color from screen">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <path d="M15.23 2.99L12.24 0L8.98 3.26L7.25 1.53L6.28 2.5L7.49 3.71L0 11.21V15.23H4.02L11.52 7.73L12.73 8.94L13.7 7.97L11.97 6.24L15.23 2.98V2.99ZM3.2 13.52L1.71 12.03L8.51 5.23L10 6.72L3.2 13.52Z" fill="black"/>
        </svg>
      </button>
      <span class="acf-preview-dot" data-preview-dot></span>
      <div class="acf-slider-stack">
        <input type="range" min="0" max="360" step="1" data-hue class="acf-hue-slider">
        <input type="range" min="0" max="100" step="1" data-alpha class="acf-alpha-slider">
      </div>
    </div>
    <div class="acf-row acf-row2">
      <div class="acf-value-stack">
        <div class="acf-channel-grid" data-channel-grid>
          <div class="acf-channel" data-cwrap="1">
            <input type="text" class="text ltr fullwidth color-input" data-cinput="1">
            <span data-clabel="1">HEX</span>
          </div>
          <div class="acf-channel" data-cwrap="2">
            <input type="text" class="text ltr fullwidth color-input" data-cinput="2">
            <span data-clabel="2"></span>
          </div>
          <div class="acf-channel" data-cwrap="3">
            <input type="text" class="text ltr fullwidth color-input" data-cinput="3">
            <span data-clabel="3"></span>
          </div>
          <div class="acf-channel" data-cwrap="4">
            <input type="text" class="text ltr fullwidth color-input" data-cinput="4">
            <span data-clabel="4"></span>
          </div>
        </div>
      </div>
      <div class="acf-mode-switch">
        <button type="button" data-mode-prev aria-label="Previous color mode">
          <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 8l4-4 4 4"/></svg>
        </button>
        <button type="button" data-mode-next aria-label="Next color mode">
          <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 4l4 4 4-4"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(pop);

  const svWrap = pop.querySelector('[data-sv-wrap]');
  const svHandle = pop.querySelector('[data-sv-handle]');
  const eyedropBtn = pop.querySelector('[data-eyedropper]');
  const previewDot = pop.querySelector('[data-preview-dot]');
  const hueInput = pop.querySelector('[data-hue]');
  const alphaInput = pop.querySelector('[data-alpha]');
  const cWrap1 = pop.querySelector('[data-cwrap="1"]');
  const cWrap2 = pop.querySelector('[data-cwrap="2"]');
  const cWrap3 = pop.querySelector('[data-cwrap="3"]');
  const cWrap4 = pop.querySelector('[data-cwrap="4"]');
  const cInput1 = pop.querySelector('[data-cinput="1"]');
  const cInput2 = pop.querySelector('[data-cinput="2"]');
  const cInput3 = pop.querySelector('[data-cinput="3"]');
  const cInput4 = pop.querySelector('[data-cinput="4"]');
  const cLabel1 = pop.querySelector('[data-clabel="1"]');
  const cLabel2 = pop.querySelector('[data-clabel="2"]');
  const cLabel3 = pop.querySelector('[data-clabel="3"]');
  const cLabel4 = pop.querySelector('[data-clabel="4"]');
  const modePrev = pop.querySelector('[data-mode-prev]');
  const modeNext = pop.querySelector('[data-mode-next]');

  if (!svWrap || !svHandle || !previewDot || !hueInput || !alphaInput || !cInput1 || !cInput2 || !cInput3 || !cInput4 || !modePrev || !modeNext) {
    return;
  }

  const currentMode = () => modes[modeIndex];

  const displayValue = (hex, alpha) => {
    const {r, g, b} = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    const mode = currentMode();
    if (mode === 'hex') return alpha < 1 ? `${hex}${alphaHex(alpha)}` : hex;
    if (mode === 'rgb') return `rgb(${r}, ${g}, ${b})`;
    if (mode === 'rgba') return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2).replace(/\.00$/, '')})`;
    if (mode === 'hsl') return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha.toFixed(2).replace(/\.00$/, '')})`;
  };

  const updateAlphaTrack = (hex) => {
    const {r, g, b} = hexToRgb(hex);
    alphaInput.style.setProperty('--slider-track', `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgba(${r}, ${g}, ${b}, 1))`);
  };

  const updateThumbShift = (slider) => {
    const min = Number(slider.min);
    const max = Number(slider.max);
    const value = Number(slider.value);
    const safeMin = Number.isFinite(min) ? min : 0;
    const safeMax = Number.isFinite(max) && max > safeMin ? max : safeMin + 1;
    const safeValue = Number.isFinite(value) ? clamp(value, safeMin, safeMax) : safeMin;
    const ratio = (safeValue - safeMin) / (safeMax - safeMin);
    const shift = (ratio - 0.5) * 13;
    slider.style.setProperty('--thumb-shift', `${shift}px`);
  };

  const applyToActive = (hex, alpha) => {
    if (!activeInput || !activeCircle) return;
    activeInput.value = displayValue(hex, alpha);
    activeCircle.style.backgroundColor = `rgba(${hexToRgb(hex).r}, ${hexToRgb(hex).g}, ${hexToRgb(hex).b}, ${alpha})`;
    syncHidden();
    refreshRowEditors();
  };

  const render = () => {
    const rgb = hsvToRgb(h, s, v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    syncing = true;
    const mode = currentMode();
    const channelGrid = pop.querySelector('[data-channel-grid]');
    if (channelGrid) channelGrid.dataset.mode = mode;

    cWrap1.style.display = '';
    cWrap2.style.display = mode === 'hex' ? 'none' : '';
    cWrap3.style.display = mode === 'hex' ? 'none' : '';
    cWrap4.style.display = (mode === 'rgba' || mode === 'hsla') ? '' : 'none';

    if (mode === 'hex') {
      cInput1.value = a < 1 ? `${hex}${alphaHex(a)}` : hex;
      cLabel1.textContent = 'HEX';
    } else if (mode === 'rgb') {
      cInput1.value = String(rgb.r);
      cInput2.value = String(rgb.g);
      cInput3.value = String(rgb.b);
      cLabel1.textContent = 'R';
      cLabel2.textContent = 'G';
      cLabel3.textContent = 'B';
    } else if (mode === 'rgba') {
      cInput1.value = String(rgb.r);
      cInput2.value = String(rgb.g);
      cInput3.value = String(rgb.b);
      cInput4.value = a.toFixed(2).replace(/\.00$/, '');
      cLabel1.textContent = 'R';
      cLabel2.textContent = 'G';
      cLabel3.textContent = 'B';
      cLabel4.textContent = 'A';
    } else if (mode === 'hsl') {
      cInput1.value = String(hsl.h);
      cInput2.value = String(hsl.s);
      cInput3.value = String(hsl.l);
      cLabel1.textContent = 'H';
      cLabel2.textContent = 'S';
      cLabel3.textContent = 'L';
    } else {
      cInput1.value = String(hsl.h);
      cInput2.value = String(hsl.s);
      cInput3.value = String(hsl.l);
      cInput4.value = a.toFixed(2).replace(/\.00$/, '');
      cLabel1.textContent = 'H';
      cLabel2.textContent = 'S';
      cLabel3.textContent = 'L';
      cLabel4.textContent = 'A';
    }
    syncing = false;

    hueInput.value = String(Math.round(h));
    alphaInput.value = String(Math.round(a * 100));
    updateThumbShift(hueInput);
    updateThumbShift(alphaInput);
    svWrap.style.backgroundColor = `hsl(${Math.round(h)} 100% 50%)`;
    svHandle.style.left = `${s * 100}%`;
    svHandle.style.top = `${(1 - v) * 100}%`;

    previewDot.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    updateAlphaTrack(hex);
    applyToActive(hex, a);
  };

  const parsePopup = () => {
    const mode = currentMode();

    if (mode === 'hex') {
      const parsed = parseHexA(cInput1.value);
      if (!parsed) return false;
      const hsv = rgbToHsv(...Object.values(hexToRgb(parsed.hex)));
      h = hsv.h;
      s = hsv.s;
      v = hsv.v;
      a = parsed.alpha;
      return true;
    }

    if (mode === 'rgb' || mode === 'rgba') {
      const r = clamp(Number(cInput1.value), 0, 255);
      const g = clamp(Number(cInput2.value), 0, 255);
      const b = clamp(Number(cInput3.value), 0, 255);
      if ([r, g, b].some((x) => Number.isNaN(x))) return false;
      if (mode === 'rgba') {
        const aa = clamp(Number(cInput4.value), 0, 1);
        if (Number.isNaN(aa)) return false;
        a = aa;
      }
      const hsv = rgbToHsv(r, g, b);
      h = hsv.h;
      s = hsv.s;
      v = hsv.v;
      return true;
    }

    if (mode === 'hsl' || mode === 'hsla') {
      const hh = clamp(Number(cInput1.value), 0, 360);
      const ss = clamp(Number(cInput2.value), 0, 100);
      const ll = clamp(Number(cInput3.value), 0, 100);
      if ([hh, ss, ll].some((x) => Number.isNaN(x))) return false;
      if (mode === 'hsla') {
        const aa = clamp(Number(cInput4.value), 0, 1);
        if (Number.isNaN(aa)) return false;
        a = aa;
      }
      const rgb = hslToRgb(hh, ss, ll);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      h = hsv.h;
      s = hsv.s;
      v = hsv.v;
      return true;
    }

    return false;
  };

  const openPicker = (circle, input) => {
    const parsed = parseValue(input.value) || {hex: '#000000', alpha: 1};
    const hsv = rgbToHsv(...Object.values(hexToRgb(parsed.hex)));
    h = hsv.h;
    s = hsv.s;
    v = hsv.v;
    a = parsed.alpha;
    activeInput = input;
    activeCircle = circle;

    pop.hidden = false;
    const rect = circle.getBoundingClientRect();
    pop.style.left = `${rect.left}px`;
    pop.style.top = `${rect.top - pop.offsetHeight - 8}px`;
    render();
  };

  const closePicker = () => {
    pop.hidden = true;
  };

  const syncHidden = () => {
    const values = [];
    list.querySelectorAll('[data-swatch-value]').forEach((input) => {
      const value = normalizeValue(input.value);
      if (!value) return;
      values.push(value);
    });
    hidden.value = values.join('\n');
  };

  const refreshRowEditors = () => {
    list.querySelectorAll('.acf-settings-swatch-row').forEach((row) => {
      if (typeof row._renderEditor === 'function') {
        row._renderEditor();
      }
    });
  };

  const rowTemplate = (value = '#000000') => {
    const row = document.createElement('div');
    row.className = 'acf-settings-swatch-row';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'acf-swatch-btn';
    trigger.setAttribute('aria-label', 'Pick swatch color');

    const dot = document.createElement('span');
    dot.className = 'acf-swatch';
    trigger.appendChild(dot);

    const input = document.createElement('input');
    input.type = 'hidden';
    input.setAttribute('data-swatch-value', '1');

    const editor = document.createElement('div');
    editor.className = 'acf-settings-row-editor';

    const grid = document.createElement('div');
    grid.className = 'acf-settings-row-grid';

    const createChannel = (idx, label = '') => {
      const wrap = document.createElement('div');
      wrap.className = 'acf-settings-row-channel';
      wrap.setAttribute('data-row-cwrap', String(idx));
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'text ltr color-input';
      inp.setAttribute('data-row-cinput', String(idx));
      const lbl = document.createElement('span');
      lbl.setAttribute('data-row-clabel', String(idx));
      lbl.textContent = label;
      wrap.appendChild(inp);
      wrap.appendChild(lbl);
      return {wrap, inp, lbl};
    };

    const ch1 = createChannel(1, 'HEX');
    const ch2 = createChannel(2, '');
    const ch3 = createChannel(3, '');
    const ch4 = createChannel(4, '');
    [ch1.wrap, ch2.wrap, ch3.wrap, ch4.wrap].forEach((ch) => grid.appendChild(ch));

    const modeSwitch = document.createElement('div');
    modeSwitch.className = 'acf-mode-switch acf-settings-row-mode-switch';
    modeSwitch.innerHTML = `
      <button type="button" data-row-mode-prev aria-label="Previous color mode">
        <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 8l4-4 4 4"/></svg>
      </button>
      <button type="button" data-row-mode-next aria-label="Next color mode">
        <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 4l4 4 4-4"/></svg>
      </button>
    `;
    const modePrevBtn = modeSwitch.querySelector('[data-row-mode-prev]');
    const modeNextBtn = modeSwitch.querySelector('[data-row-mode-next]');
    editor.appendChild(grid);
    editor.appendChild(modeSwitch);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete icon';
    remove.setAttribute('aria-label', 'Remove swatch');
    remove.title = 'Remove swatch';

    row.appendChild(trigger);
    row.appendChild(input);
    row.appendChild(editor);
    row.appendChild(remove);

    const setVisual = () => {
      const parsed = parseValue(input.value);
      if (!parsed) {
        dot.style.backgroundColor = 'transparent';
        return;
      }
      const rgb = hexToRgb(parsed.hex);
      dot.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${parsed.alpha})`;
    };

    input.value = normalizeValue(value) || '#000000';
    let rowModeIndex = modeIndex;
    const rowMode = () => modes[rowModeIndex];

    const renderEditor = () => {
      const parsed = parseValue(input.value) || {hex: '#000000', alpha: 1};
      const rgb = hexToRgb(parsed.hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const mode = rowMode();

      grid.dataset.mode = mode;
      ch1.wrap.style.display = '';
      ch2.wrap.style.display = mode === 'hex' ? 'none' : '';
      ch3.wrap.style.display = mode === 'hex' ? 'none' : '';
      ch4.wrap.style.display = (mode === 'rgba' || mode === 'hsla') ? '' : 'none';

      if (mode === 'hex') {
        ch1.inp.value = parsed.alpha < 1 ? `${parsed.hex}${alphaHex(parsed.alpha)}` : parsed.hex;
        ch1.lbl.textContent = 'HEX';
      } else if (mode === 'rgb') {
        ch1.inp.value = String(rgb.r);
        ch2.inp.value = String(rgb.g);
        ch3.inp.value = String(rgb.b);
        ch1.lbl.textContent = 'R';
        ch2.lbl.textContent = 'G';
        ch3.lbl.textContent = 'B';
      } else if (mode === 'rgba') {
        ch1.inp.value = String(rgb.r);
        ch2.inp.value = String(rgb.g);
        ch3.inp.value = String(rgb.b);
        ch4.inp.value = parsed.alpha.toFixed(2).replace(/\.00$/, '');
        ch1.lbl.textContent = 'R';
        ch2.lbl.textContent = 'G';
        ch3.lbl.textContent = 'B';
        ch4.lbl.textContent = 'A';
      } else if (mode === 'hsl') {
        ch1.inp.value = String(hsl.h);
        ch2.inp.value = String(hsl.s);
        ch3.inp.value = String(hsl.l);
        ch1.lbl.textContent = 'H';
        ch2.lbl.textContent = 'S';
        ch3.lbl.textContent = 'L';
      } else {
        ch1.inp.value = String(hsl.h);
        ch2.inp.value = String(hsl.s);
        ch3.inp.value = String(hsl.l);
        ch4.inp.value = parsed.alpha.toFixed(2).replace(/\.00$/, '');
        ch1.lbl.textContent = 'H';
        ch2.lbl.textContent = 'S';
        ch3.lbl.textContent = 'L';
        ch4.lbl.textContent = 'A';
      }
    };

    const commitEditor = () => {
      const mode = rowMode();
      let parsed = null;

      if (mode === 'hex') {
        parsed = parseHexA(ch1.inp.value);
      } else if (mode === 'rgb' || mode === 'rgba') {
        const r = clamp(Number(ch1.inp.value), 0, 255);
        const g = clamp(Number(ch2.inp.value), 0, 255);
        const b = clamp(Number(ch3.inp.value), 0, 255);
        if (![r, g, b].some((x) => Number.isNaN(x))) {
          const aa = mode === 'rgba' ? clamp(Number(ch4.inp.value), 0, 1) : 1;
          if (!Number.isNaN(aa)) parsed = {hex: rgbToHex(r, g, b), alpha: aa};
        }
      } else {
        const hh = clamp(Number(ch1.inp.value), 0, 360);
        const ss = clamp(Number(ch2.inp.value), 0, 100);
        const ll = clamp(Number(ch3.inp.value), 0, 100);
        if (![hh, ss, ll].some((x) => Number.isNaN(x))) {
          const aa = mode === 'hsla' ? clamp(Number(ch4.inp.value), 0, 1) : 1;
          if (!Number.isNaN(aa)) {
            const rgb = hslToRgb(hh, ss, ll);
            parsed = {hex: rgbToHex(rgb.r, rgb.g, rgb.b), alpha: aa};
          }
        }
      }

      if (!parsed) {
        renderEditor();
        return;
      }

      input.value = displayValue(parsed.hex, parsed.alpha);
      setVisual();
      syncHidden();
      renderEditor();
    };

    row._renderEditor = renderEditor;
    setVisual();
    renderEditor();

    trigger.addEventListener('click', (ev) => {
      ev.preventDefault();
      openPicker(dot, input);
    });

    [ch1.inp, ch2.inp, ch3.inp, ch4.inp].forEach((el) => {
      el.addEventListener('change', () => {
        commitEditor();
      });
    });

    if (modePrevBtn) {
      modePrevBtn.addEventListener('click', () => {
        rowModeIndex = (rowModeIndex - 1 + modes.length) % modes.length;
        renderEditor();
      });
    }

    if (modeNextBtn) {
      modeNextBtn.addEventListener('click', () => {
        rowModeIndex = (rowModeIndex + 1) % modes.length;
        renderEditor();
      });
    }

    remove.addEventListener('click', (ev) => {
      ev.preventDefault();
      row.remove();
      syncHidden();
    });

    return row;
  };

  const initRows = () => {
    const initial = String(hidden.value || '')
      .split(/\r?\n|,/) 
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (initial.length > 0) {
      initial.forEach((value) => list.appendChild(rowTemplate(value)));
    }

    syncHidden();
  };

  addBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    list.appendChild(rowTemplate('#000000'));
    syncHidden();
  });

  hueInput.addEventListener('input', () => {
    h = clamp(Number(hueInput.value) || 0, 0, 360);
    render();
  });

  alphaInput.addEventListener('input', () => {
    a = clamp((Number(alphaInput.value) || 0) / 100, 0, 1);
    render();
  });

  let draggingSv = false;
  const updateFromSvEvent = (ev) => {
    const rect = svWrap.getBoundingClientRect();
    const x = clamp((ev.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((ev.clientY - rect.top) / rect.height, 0, 1);
    s = x;
    v = 1 - y;
    render();
  };

  svWrap.addEventListener('mousedown', (ev) => {
    draggingSv = true;
    updateFromSvEvent(ev);
  });

  document.addEventListener('mousemove', (ev) => {
    if (!draggingSv) return;
    updateFromSvEvent(ev);
  });

  document.addEventListener('mouseup', () => {
    draggingSv = false;
  });

  [cInput1, cInput2, cInput3, cInput4].forEach((el) => {
    el.addEventListener('change', () => {
      if (syncing) return;
      if (!parsePopup()) {
        render();
        return;
      }
      render();
    });
  });

  modePrev.addEventListener('click', () => {
    modeIndex = (modeIndex - 1 + modes.length) % modes.length;
    render();
  });

  modeNext.addEventListener('click', () => {
    modeIndex = (modeIndex + 1) % modes.length;
    render();
  });

  if (eyedropBtn) {
    eyedropBtn.addEventListener('click', async () => {
      if (typeof EyeDropper === 'undefined') return;
      try {
        const result = await new EyeDropper().open();
        const parsed = parseHexA(result.sRGBHex || '#000000');
        if (!parsed) return;
        const hsv = rgbToHsv(...Object.values(hexToRgb(parsed.hex)));
        h = hsv.h;
        s = hsv.s;
        v = hsv.v;
        a = parsed.alpha;
        render();
      } catch (_e) {
        // user canceled
      }
    });
  }

  document.addEventListener('mousedown', (ev) => {
    if (pop.hidden) return;
    if (pop.contains(ev.target)) return;
    if (ev.target.closest('.acf-settings-swatch-row .acf-swatch-btn')) return;
    closePicker();
  });

  window.addEventListener('resize', () => {
    if (!pop.hidden) closePicker();
  });

  initRows();
}
