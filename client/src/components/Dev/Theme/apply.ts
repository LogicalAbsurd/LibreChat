import type { EffectId, EffectValues, ThemeMode } from './tokens';
import type { ChannelFormat } from './color';
import type { PaletteSeed } from './presets';

import { formatColor, isTriplet, parseColor } from './color';
import { motionTokens, neutralEffects } from './tokens';

export interface LabState {
  seed: PaletteSeed;
  light: Record<string, string>;
  dark: Record<string, string>;
  effects: EffectValues;
}

const STYLE_ID = 'librechat-theme-lab';
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

/**
 * Palette variables the lab never overrides, so their live value still reveals
 * how the host app stores colour channels.
 */
const FORMAT_PROBES = ['white', 'black', 'gray-800'];

export function detectChannelFormat(): ChannelFormat {
  for (const probe of FORMAT_PROBES) {
    const raw = readToken(probe);
    if (isTriplet(raw)) {
      return 'triplet';
    }
    if (raw && parseColor(raw)) {
      return 'hex';
    }
  }
  return 'hex';
}

/** Wraps a token reference so it reads as a colour in either channel format. */
const colorRef = (name: string, format: ChannelFormat): string =>
  format === 'triplet' ? `rgb(var(--${name}))` : `var(--${name})`;

const isNeutral = (id: EffectId, value: number): boolean =>
  Math.abs(value - neutralEffects[id]) < 1e-6;

function declarations(
  overrides: Record<string, string>,
  important: boolean,
  format: ChannelFormat,
): string[] {
  const suffix = important ? ' !important' : '';
  return Object.entries(overrides).flatMap(([name, value]) => {
    const rgb = parseColor(value);
    if (!rgb) {
      return [];
    }
    return [`  --${name}: ${formatColor(rgb, format)}${suffix};`];
  });
}

function paletteRules(state: LabState, important: boolean, format: ChannelFormat): string[] {
  const rules: string[] = [];
  const light = declarations(state.light, important, format);
  const dark = declarations(state.dark, important, format);

  if (light.length) {
    rules.push(`html:not(.dark) {\n${light.join('\n')}\n}`);
  }
  if (dark.length) {
    rules.push(`html.dark {\n${dark.join('\n')}\n}`);
  }
  return rules;
}

function effectRules(effects: EffectValues, important: boolean, format: ChannelFormat): string[] {
  const suffix = important ? ' !important' : '';
  const rules: string[] = [];
  const rootVars: string[] = [];

  if (!isNeutral('radius', effects.radius)) {
    rootVars.push(`  --radius: ${effects.radius}rem${suffix};`);
  }

  if (!isNeutral('motion', effects.motion)) {
    for (const [name, base] of motionTokens) {
      rootVars.push(`  --${name}: ${Math.round(base * effects.motion)}ms${suffix};`);
    }
  }

  if (!isNeutral('avatarLift', effects.avatarLift)) {
    rootVars.push(`  --avatar-lift: ${effects.avatarLift}px${suffix};`);
  }

  if (!isNeutral('iconBlur', effects.iconBlur)) {
    rootVars.push(`  --icon-swap-blur: ${effects.iconBlur}px${suffix};`);
  }

  if (rootVars.length) {
    rules.push(`html {\n${rootVars.join('\n')}\n}`);
  }

  const filters: string[] = [];
  if (!isNeutral('saturation', effects.saturation)) {
    filters.push(`saturate(${effects.saturation})`);
  }
  if (!isNeutral('contrast', effects.contrast)) {
    filters.push(`contrast(${effects.contrast})`);
  }
  if (!isNeutral('hue', effects.hue)) {
    filters.push(`hue-rotate(${effects.hue}deg)`);
  }
  if (filters.length) {
    rules.push(`#root {\n  filter: ${filters.join(' ')}${suffix};\n}`);
  }

  if (!isNeutral('glow', effects.glow)) {
    const spread = Math.round(4 + effects.glow * 20);
    const strength = Math.round(effects.glow * 70);
    rules.push(
      '#root :is(button, a, [role="button"], input, textarea, select):is(:hover, :focus-visible) {\n' +
        `  box-shadow: 0 0 ${spread}px color-mix(in srgb, ${colorRef('brand-purple', format)} ${strength}%, transparent)${suffix};\n` +
        '}',
    );
  }

  if (!isNeutral('glass', effects.glass)) {
    const opacity = Math.max(55, 92 - effects.glass * 1.6).toFixed(0);
    rules.push(
      '#root :is([role="dialog"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper] > *) {\n' +
        `  backdrop-filter: blur(${effects.glass}px)${suffix};\n` +
        `  background-color: color-mix(in srgb, ${colorRef('surface-dialog', format)} ${opacity}%, transparent)${suffix};\n` +
        '}',
    );
  }

  if (!isNeutral('wash', effects.wash)) {
    rules.push(
      'body::before {\n' +
        '  content: "";\n' +
        '  position: fixed;\n' +
        '  inset: 0;\n' +
        '  pointer-events: none;\n' +
        '  z-index: 9997;\n' +
        '  mix-blend-mode: soft-light;\n' +
        `  opacity: ${effects.wash};\n` +
        `  background: radial-gradient(120% 80% at 50% 0%, ${colorRef('brand-purple', format)} 0%, transparent 70%);\n` +
        '}',
    );
  }

  if (!isNeutral('grain', effects.grain)) {
    rules.push(
      'body::after {\n' +
        '  content: "";\n' +
        '  position: fixed;\n' +
        '  inset: 0;\n' +
        '  pointer-events: none;\n' +
        '  z-index: 9998;\n' +
        `  opacity: ${effects.grain};\n` +
        `  background-image: ${GRAIN};\n` +
        '}',
    );
  }

  return rules;
}

export function buildCss(
  state: LabState,
  important: boolean,
  format: ChannelFormat = 'hex',
): string {
  return [
    ...paletteRules(state, important, format),
    ...effectRules(state.effects, important, format),
  ].join('\n\n');
}

/** Writes the lab's overrides into a single managed <style> element. */
export function applyState(state: LabState): void {
  const existing = document.getElementById(STYLE_ID);
  const element = existing instanceof HTMLStyleElement ? existing : document.createElement('style');

  if (!existing) {
    element.id = STYLE_ID;
    document.head.appendChild(element);
  }

  element.textContent = buildCss(state, true, detectChannelFormat());
}

export function clearOverrides(): void {
  document.getElementById(STYLE_ID)?.remove();
}

/** Reads a token's rendered value, which reflects any override the lab has applied. */
export function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

export const activeMode = (): ThemeMode =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export function exportCss(state: LabState): string {
  return [
    '/* Generated by the LibreChat Theme Lab.',
    '   Paste into client/src/style.css, after the existing html / .dark blocks. */',
    '',
    buildCss(state, false, detectChannelFormat()),
    '',
  ].join('\n');
}
