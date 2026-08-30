import type { EffectValues } from './tokens';
import type { PaletteSeed } from './presets';
import type { LabState } from './apply';

import { buildPalette, defaultSeed } from './presets';
import { neutralEffects } from './tokens';

const STORAGE_KEY = 'librechat:theme-lab';

export const emptyState = (): LabState => ({
  seed: { ...defaultSeed },
  light: {},
  dark: {},
  effects: { ...neutralEffects },
});

/** Expands a seed into both palettes, leaving effects untouched. */
export const stateFromSeed = (seed: PaletteSeed, effects: EffectValues): LabState => ({
  seed,
  light: buildPalette(seed, 'light'),
  dark: buildPalette(seed, 'dark'),
  effects,
});

const isStringMap = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((entry) => typeof entry === 'string');

function parseState(raw: string): LabState | null {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const candidate = parsed as Partial<LabState>;
  if (!isStringMap(candidate.light) || !isStringMap(candidate.dark)) {
    return null;
  }

  return {
    seed: { ...defaultSeed, ...candidate.seed },
    light: candidate.light,
    dark: candidate.dark,
    effects: { ...neutralEffects, ...candidate.effects },
  };
}

export function loadState(): LabState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (parseState(raw) ?? emptyState()) : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state: LabState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage is unavailable or full; the lab still works for this session */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing persisted to clear */
  }
}
