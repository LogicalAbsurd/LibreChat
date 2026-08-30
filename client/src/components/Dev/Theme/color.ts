export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

const HEX_SHORT = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX_LONG = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const FUNCTIONAL = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i;
const TRIPLET = /^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/;

/**
 * How the host app stores colour channels. LibreChat moved its semantic tokens
 * to bare `R G B` triplets so Tailwind can wrap them as
 * `rgb(var(--x) / <alpha-value>)`; older trees still hold plain colours.
 */
export type ChannelFormat = 'hex' | 'triplet';

/** True for a bare `R G B` channel triplet, e.g. `255 255 255`. */
export const isTriplet = (value: string): boolean => TRIPLET.test(value.trim());

/** Parses hex, bare `R G B`, `rgb(r g b)`, `rgb(r, g, b)` and `rgba(...)`. */
export function parseColor(value: string): RGB | null {
  const input = value.trim();
  if (!input) {
    return null;
  }

  const short = input.match(HEX_SHORT);
  if (short) {
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16),
    };
  }

  const long = input.match(HEX_LONG);
  if (long) {
    return {
      r: parseInt(long[1], 16),
      g: parseInt(long[2], 16),
      b: parseInt(long[3], 16),
    };
  }

  const triplet = input.match(TRIPLET);
  if (triplet) {
    const channels = [triplet[1], triplet[2], triplet[3]].map((value) => Number(value));
    if (channels.every((value) => value <= 255)) {
      return { r: channels[0], g: channels[1], b: channels[2] };
    }
    return null;
  }

  const functional = input.match(FUNCTIONAL);
  if (functional) {
    return {
      r: clamp(Math.round(Number(functional[1])), 0, 255),
      g: clamp(Math.round(Number(functional[2])), 0, 255),
      b: clamp(Math.round(Number(functional[3])), 0, 255),
    };
  }

  return null;
}

export function toHex({ r, g, b }: RGB): string {
  const channel = (value: number): string =>
    clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** Renders a colour in whichever channel format the host app expects. */
export function formatColor(rgb: RGB, format: ChannelFormat): string {
  if (format !== 'triplet') {
    return toHex(rgb);
  }
  const channel = (value: number): number => clamp(Math.round(value), 0, 255);
  return `${channel(rgb.r)} ${channel(rgb.g)} ${channel(rgb.b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  const h =
    max === rn
      ? ((gn - bn) / delta) % 6
      : max === gn
        ? (bn - rn) / delta + 2
        : (rn - gn) / delta + 4;

  return { h: (h * 60 + 360) % 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;
  const segment = Math.floor(hn / 60);
  const table: RGB[] = [
    { r: c, g: x, b: 0 },
    { r: x, g: c, b: 0 },
    { r: 0, g: c, b: x },
    { r: 0, g: x, b: c },
    { r: x, g: 0, b: c },
    { r: c, g: 0, b: x },
  ];
  const base = table[segment] ?? table[0];

  return {
    r: (base.r + m) * 255,
    g: (base.g + m) * 255,
    b: (base.b + m) * 255,
  };
}

export const hslToHex = (hsl: HSL): string => toHex(hslToRgb(hsl));

export const hexToHsl = (hex: string): HSL | null => {
  const rgb = parseColor(hex);
  return rgb ? rgbToHsl(rgb) : null;
};

export function mix(a: RGB, b: RGB, amount: number): RGB {
  const t = clamp(amount, 0, 1);
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** WCAG 2.1 contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrastRatio(foreground: string, background: string): number | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) {
    return null;
  }

  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

export const shiftLightness = (hex: string, delta: number): string => {
  const hsl = hexToHsl(hex);
  return hsl ? hslToHex({ ...hsl, l: clamp(hsl.l + delta, 0, 100) }) : hex;
};

export { clamp };
