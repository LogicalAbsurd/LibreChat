import type { ThemeMode } from './tokens';

import { clamp, ensureContrast, hexToHsl, hslToHex } from './color';

export interface PaletteSeed {
  /** Accent colour as hex; drives brand, focus ring and submit surfaces. */
  accent: string;
  /** Hue used to tint neutral surfaces. Defaults to the accent hue. */
  hue?: number;
  /** 0 = pure grey neutrals, 1 = heavily tinted neutrals. */
  tint: number;
  /** 0 = flat, 1 = maximum separation between surface levels. */
  contrast: number;
}

export interface Preset {
  id: string;
  label: string;
  seed: PaletteSeed;
}

interface RampEntry {
  /** Target lightness in light mode. */
  light: number;
  /** Target lightness in dark mode. */
  dark: number;
  /** Share of the tint budget this token receives, 0..1. */
  sat: number;
}

const ramp: Record<string, RampEntry> = {
  'surface-primary': { light: 100, dark: 7, sat: 0.55 },
  'surface-primary-alt': { light: 97.5, dark: 10, sat: 0.55 },
  'surface-primary-contrast': { light: 94, dark: 10, sat: 0.6 },
  'surface-secondary': { light: 97.5, dark: 13, sat: 0.6 },
  'surface-secondary-alt': { light: 92, dark: 13, sat: 0.6 },
  'surface-tertiary': { light: 94, dark: 18, sat: 0.65 },
  'surface-tertiary-alt': { light: 100, dark: 18, sat: 0.65 },
  'surface-chat': { light: 100, dark: 18, sat: 0.6 },
  'surface-dialog': { light: 100, dark: 10, sat: 0.6 },
  'surface-active': { light: 94, dark: 34, sat: 0.7 },
  'surface-active-alt': { light: 90, dark: 18, sat: 0.7 },
  'surface-hover': { light: 90, dark: 26, sat: 0.7 },
  'surface-hover-alt': { light: 84, dark: 26, sat: 0.7 },
  'surface-composer-hover': { light: 90, dark: 26, sat: 0.7 },
  'surface-overlay': { light: 50, dark: 50, sat: 0.4 },
  'surface-code': { light: 97.5, dark: 10, sat: 0.55 },
  'surface-qr': { light: 100, dark: 7, sat: 0.55 },
  presentation: { light: 100, dark: 13, sat: 0.55 },
  'header-primary': { light: 100, dark: 18, sat: 0.6 },
  'header-hover': { light: 97.5, dark: 26, sat: 0.65 },
  'header-button-hover': { light: 97.5, dark: 18, sat: 0.65 },
  'border-light': { light: 91, dark: 18, sat: 0.5 },
  'border-medium': { light: 82, dark: 26, sat: 0.5 },
  'border-medium-alt': { light: 82, dark: 26, sat: 0.5 },
  'border-heavy': { light: 66, dark: 36, sat: 0.5 },
  'border-xheavy': { light: 48, dark: 48, sat: 0.5 },
  'text-primary': { light: 13, dark: 93, sat: 0.35 },
  'text-secondary': { light: 30, dark: 80, sat: 0.35 },
  'text-secondary-alt': { light: 38, dark: 64, sat: 0.35 },
  'text-tertiary': { light: 42, dark: 55, sat: 0.35 },
};

const semantic: Record<string, Record<ThemeMode, string>> = {
  'text-warning': { light: '#f59e0b', dark: '#f59e0b' },
  'text-destructive': { light: '#dc2626', dark: '#ef4444' },
  'border-destructive': { light: '#dc2626', dark: '#ef4444' },
  'surface-destructive': { light: '#b91c1c', dark: '#991b1b' },
  'surface-destructive-hover': { light: '#991b1b', dark: '#7f1d1d' },
  'status-success': { light: '#047857', dark: '#10b981' },
  'status-info': { light: '#2563eb', dark: '#60a5fa' },
  'status-warning': { light: '#b45309', dark: '#f59e0b' },
  'status-error': { light: '#b91c1c', dark: '#ef4444' },
  'status-neutral': { light: '#424242', dark: '#999696' },
};

const MAX_TINT: Record<ThemeMode, number> = { light: 24, dark: 30 };

/** WCAG AA for body text; accent tokens are used as text far more than as fills. */
const TEXT_CONTRAST = 4.5;

/** Builds a full semantic palette for one mode from a single seed. */
export function buildPalette(seed: PaletteSeed, mode: ThemeMode): Record<string, string> {
  const accentHsl = hexToHsl(seed.accent);
  const hue = seed.hue ?? accentHsl?.h ?? 0;
  const tintBudget = clamp(seed.tint, 0, 1) * MAX_TINT[mode];
  const spread = 0.75 + clamp(seed.contrast, 0, 1) * 0.5;
  const palette: Record<string, string> = {};

  for (const [name, entry] of Object.entries(ramp)) {
    const target = mode === 'dark' ? entry.dark : entry.light;
    palette[name] = hslToHex({
      h: hue,
      s: tintBudget * entry.sat,
      l: clamp(50 + (target - 50) * spread, 0, 100),
    });
  }

  for (const [name, values] of Object.entries(semantic)) {
    palette[name] = values[mode];
  }

  palette['brand-purple'] = seed.accent;
  palette['ring-primary'] = seed.accent;

  if (accentHsl) {
    const submitLightness = mode === 'dark' ? 34 : 38;
    palette['surface-submit'] = hslToHex({ ...accentHsl, l: submitLightness });
    palette['surface-submit-hover'] = hslToHex({ ...accentHsl, l: submitLightness - 8 });
    palette['accent-primary'] = hslToHex({ ...accentHsl, l: submitLightness });
    palette['accent-primary-hover'] = hslToHex({ ...accentHsl, l: submitLightness - 8 });

    const surface = palette['surface-primary'];
    const readable = (hex: string): string => ensureContrast(hex, surface, TEXT_CONTRAST);

    palette['accent-primary'] = readable(palette['accent-primary']);
    palette['accent-primary-hover'] = readable(palette['accent-primary-hover']);

    const linkLightness = mode === 'dark' ? 66 : 42;
    const linkShift = mode === 'dark' ? 10 : -8;
    palette['link'] = readable(hslToHex({ ...accentHsl, l: linkLightness }));
    palette['link-hover'] = readable(hslToHex({ ...accentHsl, l: linkLightness + linkShift }));
    palette['link-visited'] = readable(
      hslToHex({ ...accentHsl, h: accentHsl.h + 30, l: linkLightness }),
    );
  }

  return palette;
}

export const presets: Preset[] = [
  {
    id: 'midnight',
    label: 'Midnight',
    seed: { accent: '#7c5cff', hue: 250, tint: 0.4, contrast: 0.55 },
  },
  { id: 'ocean', label: 'Ocean', seed: { accent: '#0ea5e9', hue: 205, tint: 0.45, contrast: 0.5 } },
  {
    id: 'forest',
    label: 'Forest',
    seed: { accent: '#10b981', hue: 155, tint: 0.35, contrast: 0.5 },
  },
  { id: 'ember', label: 'Ember', seed: { accent: '#f97316', hue: 25, tint: 0.35, contrast: 0.55 } },
  { id: 'rose', label: 'Rose', seed: { accent: '#f43f5e', hue: 345, tint: 0.35, contrast: 0.5 } },
  { id: 'grape', label: 'Grape', seed: { accent: '#a855f7', hue: 285, tint: 0.4, contrast: 0.5 } },
  { id: 'solar', label: 'Solar', seed: { accent: '#eab308', hue: 45, tint: 0.3, contrast: 0.55 } },
  { id: 'slate', label: 'Slate', seed: { accent: '#64748b', hue: 215, tint: 0.25, contrast: 0.5 } },
  { id: 'mono', label: 'Mono', seed: { accent: '#737373', hue: 0, tint: 0, contrast: 0.55 } },
];

export const defaultSeed: PaletteSeed = presets[0].seed;

export function randomSeed(): PaletteSeed {
  const hue = Math.floor(Math.random() * 360);
  return {
    accent: hslToHex({ h: hue, s: 55 + Math.random() * 35, l: 50 + Math.random() * 15 }),
    hue: (hue + (Math.random() < 0.5 ? 0 : Math.random() * 60 - 30) + 360) % 360,
    tint: Math.random() * 0.6,
    contrast: 0.35 + Math.random() * 0.4,
  };
}
