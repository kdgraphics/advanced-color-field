export function initInput(root) {
  if (!root) return;

  const hiddenColor = root.querySelector('[data-color-hidden]');
  const hiddenAlpha = root.querySelector('[data-alpha-hidden]');
  const toggle = root.querySelector('[data-picker-toggle]');
  const swatch = root.querySelector('[data-color-swatch]');
  const inlineChannelGrid = root.querySelector('[data-inline-channel-grid]');
  const inlineWrap1 = root.querySelector('[data-inline-cwrap="1"]');
  const inlineWrap2 = root.querySelector('[data-inline-cwrap="2"]');
  const inlineWrap3 = root.querySelector('[data-inline-cwrap="3"]');
  const inlineWrap4 = root.querySelector('[data-inline-cwrap="4"]');
  const inlineInput1 = root.querySelector('[data-inline-cinput="1"]');
  const inlineInput2 = root.querySelector('[data-inline-cinput="2"]');
  const inlineInput3 = root.querySelector('[data-inline-cinput="3"]');
  const inlineInput4 = root.querySelector('[data-inline-cinput="4"]');
  const inlineLabel1 = root.querySelector('[data-inline-clabel="1"]');
  const inlineLabel2 = root.querySelector('[data-inline-clabel="2"]');
  const inlineLabel3 = root.querySelector('[data-inline-clabel="3"]');
  const inlineLabel4 = root.querySelector('[data-inline-clabel="4"]');
  const pop = root.querySelector('[data-picker-pop]');
  const svWrap = root.querySelector('[data-sv-wrap]');
  const svHandle = root.querySelector('[data-sv-handle]');
  const eyedropBtn = root.querySelector('[data-eyedropper]');
  const previewDot = root.querySelector('[data-preview-dot]');
  const hueInput = root.querySelector('[data-hue]');
  const alphaInput = root.querySelector('[data-alpha]');
  const cWrap1 = root.querySelector('[data-cwrap="1"]');
  const cWrap2 = root.querySelector('[data-cwrap="2"]');
  const cWrap3 = root.querySelector('[data-cwrap="3"]');
  const cWrap4 = root.querySelector('[data-cwrap="4"]');
  const cInput1 = root.querySelector('[data-cinput="1"]');
  const cInput2 = root.querySelector('[data-cinput="2"]');
  const cInput3 = root.querySelector('[data-cinput="3"]');
  const cInput4 = root.querySelector('[data-cinput="4"]');
  const cLabel1 = root.querySelector('[data-clabel="1"]');
  const cLabel2 = root.querySelector('[data-clabel="2"]');
  const cLabel3 = root.querySelector('[data-clabel="3"]');
  const cLabel4 = root.querySelector('[data-clabel="4"]');
  const modalChannelGrid = pop.querySelector('[data-channel-grid]');
  const modePrevButtons = root.querySelectorAll('[data-mode-prev]');
  const modeNextButtons = root.querySelectorAll('[data-mode-next]');
  const swatchButtons = root.querySelectorAll('[data-swatch]');

  if (!hiddenColor || !hiddenAlpha || !toggle || !swatch || !inlineChannelGrid || !inlineInput1 || !inlineInput2 || !inlineInput3 || !inlineInput4 || !inlineLabel1 || !inlineLabel2 || !inlineLabel3 || !inlineLabel4 || !pop || !svWrap || !svHandle || !hueInput || !alphaInput || !modePrevButtons.length || !modeNextButtons.length || !modalChannelGrid || !cInput1 || !cInput2 || !cInput3 || !cInput4) {
    return;
  }

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const round = (n, d = 2) => Math.round(n * (10 ** d)) / (10 ** d);
  const fmtA = (a) => round(a, 2).toString().replace(/\\.0$/, '');
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

  const parseHexWithAlpha = (value) => {
    const raw = String(value || '').trim().toLowerCase().replace(/^#/, '');
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(raw)) return null;
    const hex = `#${raw.slice(0, 6)}`;
    const alpha = raw.length === 8 ? clamp(Number.parseInt(raw.slice(6, 8), 16) / 255, 0, 1) : 1;
    return {hex, alpha};
  };

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
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
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

  const modes = ['hex', 'rgb', 'rgba', 'hsl', 'hsla'];
  let modeIndex = 0;

  let {h, s, v} = rgbToHsv(...Object.values(hexToRgb(hiddenColor.value || '#000000')));
  let a = clamp((Number(hiddenAlpha.value) || 100) / 100, 0, 1);
  let syncingValueInput = false;

  document.body.appendChild(pop);

  const placePopup = () => {
    const rect = toggle.getBoundingClientRect();
    pop.style.left = `${rect.left}px`;
    pop.style.top = `${rect.top - pop.offsetHeight - 8}px`;
  };

  const openPicker = () => {
    pop.hidden = false;
    placePopup();
  };

  const closePicker = () => {
    pop.hidden = true;
  };

  const currentMode = () => modes[modeIndex];

  const displayValue = (hex, alpha) => {
    const {r, g, b} = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    const mode = currentMode();
    if (mode === 'hex') return alpha < 1 ? `${hex}${alphaHex(alpha)}` : hex;
    if (mode === 'rgb') return `rgb(${r}, ${g}, ${b})`;
    if (mode === 'rgba') return `rgba(${r}, ${g}, ${b}, ${fmtA(alpha)})`;
    if (mode === 'hsl') return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${fmtA(alpha)})`;
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

  const setChannelEditor = (mode, rgb, hsl, alpha, refs) => {
    if (!refs || !refs.grid) return;
    refs.grid.dataset.mode = mode;
    refs.wrap1.style.display = '';
    refs.wrap2.style.display = mode === 'hex' ? 'none' : '';
    refs.wrap3.style.display = mode === 'hex' ? 'none' : '';
    refs.wrap4.style.display = (mode === 'rgba' || mode === 'hsla') ? '' : 'none';

    if (mode === 'hex') {
      refs.input1.value = alpha < 1 ? `${rgbToHex(rgb.r, rgb.g, rgb.b)}${alphaHex(alpha)}` : rgbToHex(rgb.r, rgb.g, rgb.b);
      refs.label1.textContent = 'HEX';
      return;
    }

    if (mode === 'rgb') {
      refs.input1.value = String(rgb.r);
      refs.input2.value = String(rgb.g);
      refs.input3.value = String(rgb.b);
      refs.label1.textContent = 'R';
      refs.label2.textContent = 'G';
      refs.label3.textContent = 'B';
      return;
    }

    if (mode === 'rgba') {
      refs.input1.value = String(rgb.r);
      refs.input2.value = String(rgb.g);
      refs.input3.value = String(rgb.b);
      refs.input4.value = fmtA(alpha);
      refs.label1.textContent = 'R';
      refs.label2.textContent = 'G';
      refs.label3.textContent = 'B';
      refs.label4.textContent = 'A';
      return;
    }

    if (mode === 'hsl') {
      refs.input1.value = String(hsl.h);
      refs.input2.value = String(hsl.s);
      refs.input3.value = String(hsl.l);
      refs.label1.textContent = 'H';
      refs.label2.textContent = 'S';
      refs.label3.textContent = 'L';
      return;
    }

    refs.input1.value = String(hsl.h);
    refs.input2.value = String(hsl.s);
    refs.input3.value = String(hsl.l);
    refs.input4.value = fmtA(alpha);
    refs.label1.textContent = 'H';
    refs.label2.textContent = 'S';
    refs.label3.textContent = 'L';
    refs.label4.textContent = 'A';
  };

  const render = () => {
    const rgb = hsvToRgb(h, s, v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    hiddenColor.value = hex;
    hiddenAlpha.value = String(Math.round(a * 100));
    syncingValueInput = true;
    const mode = currentMode();
    setChannelEditor(mode, rgb, hsl, a, {
      grid: modalChannelGrid,
      wrap1: cWrap1,
      wrap2: cWrap2,
      wrap3: cWrap3,
      wrap4: cWrap4,
      input1: cInput1,
      input2: cInput2,
      input3: cInput3,
      input4: cInput4,
      label1: cLabel1,
      label2: cLabel2,
      label3: cLabel3,
      label4: cLabel4,
    });
    setChannelEditor(mode, rgb, hsl, a, {
      grid: inlineChannelGrid,
      wrap1: inlineWrap1,
      wrap2: inlineWrap2,
      wrap3: inlineWrap3,
      wrap4: inlineWrap4,
      input1: inlineInput1,
      input2: inlineInput2,
      input3: inlineInput3,
      input4: inlineInput4,
      label1: inlineLabel1,
      label2: inlineLabel2,
      label3: inlineLabel3,
      label4: inlineLabel4,
    });
    syncingValueInput = false;

    hueInput.value = String(Math.round(h));
    alphaInput.value = String(Math.round(a * 100));
    updateThumbShift(hueInput);
    updateThumbShift(alphaInput);
    svWrap.style.backgroundColor = `hsl(${Math.round(h)} 100% 50%)`;
    svHandle.style.left = `${s * 100}%`;
    svHandle.style.top = `${(1 - v) * 100}%`;

    const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    swatch.style.backgroundColor = rgba;
    previewDot.style.backgroundColor = rgba;
    updateAlphaTrack(hex);
  };

  const tryParsePopupValue = () => {
    const mode = currentMode();

    if (mode === 'hex') {
      const raw = String(cInput1.value || '').trim().toLowerCase();
      const value = raw.replace(/^#/, '');
      if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(value)) return false;
      const hex = `#${value.slice(0, 6)}`;
      if (value.length === 8) a = clamp(Number.parseInt(value.slice(6, 8), 16) / 255, 0, 1);
      const hsv = rgbToHsv(...Object.values(hexToRgb(hex)));
      h = hsv.h; s = hsv.s; v = hsv.v;
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
      h = hsv.h; s = hsv.s; v = hsv.v;
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
      h = hsv.h; s = hsv.s; v = hsv.v;
      return true;
    }

    return false;
  };

  toggle.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (pop.hidden) openPicker();
    else closePicker();
  });

  document.addEventListener('mousedown', (ev) => {
    if (pop.hidden) return;
    if (toggle.contains(ev.target) || pop.contains(ev.target)) return;
    closePicker();
  });

  window.addEventListener('resize', () => {
    if (!pop.hidden) placePopup();
  });

  window.addEventListener('scroll', () => {
    if (!pop.hidden) placePopup();
  }, true);

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
      if (syncingValueInput) return;
      if (!tryParsePopupValue()) {
        render();
        return;
      }
      render();
    });
  });

  const tryParseInlineValue = () => {
    const mode = currentMode();

    if (mode === 'hex') {
      const parsed = parseHexWithAlpha(inlineInput1.value);
      if (!parsed) return false;
      const hsv = rgbToHsv(...Object.values(hexToRgb(parsed.hex)));
      h = hsv.h; s = hsv.s; v = hsv.v; a = parsed.alpha;
      return true;
    }

    if (mode === 'rgb' || mode === 'rgba') {
      const r = clamp(Number(inlineInput1.value), 0, 255);
      const g = clamp(Number(inlineInput2.value), 0, 255);
      const b = clamp(Number(inlineInput3.value), 0, 255);
      if ([r, g, b].some((x) => Number.isNaN(x))) return false;
      if (mode === 'rgba') {
        const aa = clamp(Number(inlineInput4.value), 0, 1);
        if (Number.isNaN(aa)) return false;
        a = aa;
      }
      const hsv = rgbToHsv(r, g, b);
      h = hsv.h; s = hsv.s; v = hsv.v;
      return true;
    }

    const hh = clamp(Number(inlineInput1.value), 0, 360);
    const ss = clamp(Number(inlineInput2.value), 0, 100);
    const ll = clamp(Number(inlineInput3.value), 0, 100);
    if ([hh, ss, ll].some((x) => Number.isNaN(x))) return false;
    if (mode === 'hsla') {
      const aa = clamp(Number(inlineInput4.value), 0, 1);
      if (Number.isNaN(aa)) return false;
      a = aa;
    }
    const rgb = hslToRgb(hh, ss, ll);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    h = hsv.h; s = hsv.s; v = hsv.v;
    return true;
  };

  [inlineInput1, inlineInput2, inlineInput3, inlineInput4].forEach((el) => {
    el.addEventListener('change', () => {
      if (syncingValueInput) return;
      if (!tryParseInlineValue()) {
        render();
        return;
      }
      render();
    });
  });

  const shiftMode = (dir) => {
    modeIndex = (modeIndex + dir + modes.length) % modes.length;
    render();
  };
  modePrevButtons.forEach((button) => button.addEventListener('click', () => shiftMode(-1)));
  modeNextButtons.forEach((button) => button.addEventListener('click', () => shiftMode(1)));

  swatchButtons.forEach((button) => {
    const parsed = parseHexWithAlpha(button.dataset.swatch || '');
    if (!parsed) return;
    const rgb = hexToRgb(parsed.hex);
    button.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${parsed.alpha})`;
    button.addEventListener('click', () => {
      a = parsed.alpha;
      const hsv = rgbToHsv(...Object.values(hexToRgb(parsed.hex)));
      h = hsv.h;
      s = hsv.s;
      v = hsv.v;
      render();
    });
  });

  eyedropBtn.addEventListener('click', async () => {
    if (typeof EyeDropper === 'undefined') return;
    try {
      const result = await new EyeDropper().open();
      const picked = String(result.sRGBHex || '#000000').toLowerCase();
      const hsv = rgbToHsv(...Object.values(hexToRgb(picked)));
      h = hsv.h; s = hsv.s; v = hsv.v;
      render();
    } catch (_e) {
      // user cancelled
    }
  });

  render();
}
