import { buildCss } from '../apply';
import { colorTokenNames } from '../tokens';
import { buildPalette, presets } from '../presets';
import { emptyState, stateFromSeed } from '../store';
import {
  contrastRatio,
  formatColor,
  hexToHsl,
  isTriplet,
  parseColor,
  rgbToHsl,
  toHex,
} from '../color';

describe('color parsing', () => {
  it('parses short hex, long hex and functional notation', () => {
    expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(parseColor('#212121')).toEqual({ r: 33, g: 33, b: 33 });
    expect(parseColor('rgb(33 33 33)')).toEqual({ r: 33, g: 33, b: 33 });
    expect(parseColor('rgb(33, 33, 33)')).toEqual({ r: 33, g: 33, b: 33 });
    expect(parseColor('rgba(33, 33, 33, 0.5)')).toEqual({ r: 33, g: 33, b: 33 });
  });

  it('parses the bare R G B triplets LibreChat stores tokens as', () => {
    expect(parseColor('255 255 255')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('33 33 33')).toEqual({ r: 33, g: 33, b: 33 });
    expect(isTriplet('126 34 206')).toBe(true);
    expect(isTriplet('#7e22ce')).toBe(false);
    expect(isTriplet('var(--gray-800)')).toBe(false);
  });

  it('rejects out-of-range triplets', () => {
    expect(parseColor('300 0 0')).toBeNull();
  });

  it('returns null for values it cannot read', () => {
    expect(parseColor('')).toBeNull();
    expect(parseColor('var(--gray-800)')).toBeNull();
  });

  it('renders channels in either host format', () => {
    const rgb = parseColor('#7e22ce')!;
    expect(formatColor(rgb, 'hex')).toBe('#7e22ce');
    expect(formatColor(rgb, 'triplet')).toBe('126 34 206');
  });

  it('round-trips through HSL', () => {
    for (const hex of ['#7c5cff', '#0ea5e9', '#10b981', '#ffffff', '#000000']) {
      const rgb = parseColor(hex);
      expect(rgb).not.toBeNull();
      expect(toHex(rgb!)).toBe(hex);
      expect(hexToHsl(hex)).toEqual(rgbToHsl(rgb!));
    }
  });
});

describe('contrast', () => {
  it('reports the WCAG extremes', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#212121', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#212121')!,
      10,
    );
  });
});

describe('buildPalette', () => {
  it('produces a value for every token the panel exposes', () => {
    for (const preset of presets) {
      for (const mode of ['light', 'dark'] as const) {
        const palette = buildPalette(preset.seed, mode);
        const missing = colorTokenNames.filter((name) => !palette[name]);
        expect({ preset: preset.id, mode, missing }).toEqual({
          preset: preset.id,
          mode,
          missing: [],
        });
      }
    }
  });

  it('emits valid hex for every token', () => {
    const palette = buildPalette(presets[0].seed, 'dark');
    for (const value of Object.values(palette)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('keeps dark surfaces darker than light surfaces', () => {
    const seed = presets[1].seed;
    const light = hexToHsl(buildPalette(seed, 'light')['surface-primary']);
    const dark = hexToHsl(buildPalette(seed, 'dark')['surface-primary']);
    expect(light!.l).toBeGreaterThan(dark!.l);
  });

  it('ties link colours to the accent hue', () => {
    const seed = { accent: '#e11d48', tint: 0.3, contrast: 0.5 };
    const accentHue = hexToHsl(seed.accent)!.h;
    for (const mode of ['light', 'dark'] as const) {
      const link = hexToHsl(buildPalette(seed, mode)['link'])!;
      expect(Math.abs(link.h - accentHue)).toBeLessThan(2);
    }
  });

  it('keeps accent text readable against the primary surface', () => {
    for (const preset of presets) {
      for (const mode of ['light', 'dark'] as const) {
        const palette = buildPalette(preset.seed, mode);
        const ratio = contrastRatio(palette['accent-primary'], palette['surface-primary'])!;
        expect({ preset: preset.id, mode, ok: ratio >= 4.5 }).toEqual({
          preset: preset.id,
          mode,
          ok: true,
        });
      }
    }
  });

  it('keeps link text readable against the primary surface', () => {
    for (const preset of presets) {
      for (const mode of ['light', 'dark'] as const) {
        const palette = buildPalette(preset.seed, mode);
        const ratio = contrastRatio(palette['link'], palette['surface-primary'])!;
        expect({ preset: preset.id, mode, ok: ratio >= 4.5 }).toEqual({
          preset: preset.id,
          mode,
          ok: true,
        });
      }
    }
  });

  it('produces achromatic neutrals when tint is zero', () => {
    const palette = buildPalette({ accent: '#737373', hue: 0, tint: 0, contrast: 0.5 }, 'dark');
    expect(hexToHsl(palette['surface-primary'])!.s).toBeCloseTo(0, 5);
    expect(hexToHsl(palette['text-primary'])!.s).toBeCloseTo(0, 5);
  });

  it('separates surface levels more as contrast rises', () => {
    const flat = buildPalette({ accent: '#0ea5e9', tint: 0.3, contrast: 0 }, 'dark');
    const sharp = buildPalette({ accent: '#0ea5e9', tint: 0.3, contrast: 1 }, 'dark');
    const spread = (palette: Record<string, string>) =>
      hexToHsl(palette['text-primary'])!.l - hexToHsl(palette['surface-primary'])!.l;
    expect(spread(sharp)).toBeGreaterThan(spread(flat));
  });
});

describe('buildCss', () => {
  const state = stateFromSeed(presets[0].seed, emptyState().effects);

  it('scopes each palette to its mode', () => {
    const css = buildCss(state, false);
    expect(css).toContain('html:not(.dark) {');
    expect(css).toContain('html.dark {');
    expect(css).toContain('--surface-primary:');
  });

  it('adds !important only for the live stylesheet', () => {
    expect(buildCss(state, true)).toContain('!important');
    expect(buildCss(state, false)).not.toContain('!important');
  });

  it('emits nothing for an untouched state', () => {
    expect(buildCss(emptyState(), false)).toBe('');
  });

  it('emits triplets, not hex, for a channel-triplet host', () => {
    const css = buildCss(state, false, 'triplet');
    expect(css).toMatch(/--surface-primary: \d{1,3} \d{1,3} \d{1,3};/);
    expect(css).not.toContain('#');
  });

  it('wraps token references so effects stay valid in triplet hosts', () => {
    const glow = { ...emptyState(), effects: { ...emptyState().effects, glow: 0.5 } };
    expect(buildCss(glow, false, 'triplet')).toContain('rgb(var(--brand-purple))');
    expect(buildCss(glow, false, 'hex')).toContain('var(--brand-purple)');
    expect(buildCss(glow, false, 'hex')).not.toContain('rgb(var(--brand-purple))');
  });

  it('drops values it cannot parse rather than emitting broken CSS', () => {
    const broken = { ...emptyState(), light: { 'surface-primary': '#ab' } };
    expect(buildCss(broken, false, 'triplet')).toBe('');
  });

  it('rescales every radius step, not just the ones wired to --radius', () => {
    const base = emptyState();
    const css = buildCss({ ...base, effects: { ...base.effects, radius: 1 } }, false);

    expect(css).toContain('--radius: 1rem;');
    expect(css).toContain('--theme-control-radius: 1.5rem;');
    expect(css).toContain('--theme-surface-radius: 2rem;');
    expect(css).toContain('.rounded-xl {');
    expect(css).toContain('.rounded-2xl {');
    expect(css).toContain('border-radius: 1.5rem;');
  });

  it('leaves deliberate shapes alone', () => {
    const base = emptyState();
    const css = buildCss({ ...base, effects: { ...base.effects, radius: 1 } }, false);
    expect(css).not.toContain('.rounded-full');
    expect(css).not.toContain('.rounded-none');
  });

  it('emits effect rules only when a control leaves its neutral value', () => {
    const base = emptyState();
    expect(buildCss(base, false)).not.toContain('--radius');

    const withRadius = { ...base, effects: { ...base.effects, radius: 1.25 } };
    expect(buildCss(withRadius, false)).toContain('--radius: 1.25rem;');

    const withMotion = { ...base, effects: { ...base.effects, motion: 2 } };
    expect(buildCss(withMotion, false)).toContain('--resize-dur: 600ms;');

    const withFilter = { ...base, effects: { ...base.effects, saturation: 0 } };
    expect(buildCss(withFilter, false)).toContain('filter: saturate(0)');
  });
});
