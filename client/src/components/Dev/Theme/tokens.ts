export type ThemeMode = 'light' | 'dark';

export interface ColorToken {
  /** CSS custom property name, without the leading `--`. */
  name: string;
  label: string;
}

export interface ColorGroup {
  id: string;
  label: string;
  tokens: ColorToken[];
}

export const colorGroups: ColorGroup[] = [
  {
    id: 'brand',
    label: 'Brand & accent',
    tokens: [
      { name: 'brand-purple', label: 'Brand' },
      { name: 'accent-primary', label: 'Accent' },
      { name: 'accent-primary-hover', label: 'Accent hover' },
      { name: 'ring-primary', label: 'Focus ring' },
      { name: 'surface-submit', label: 'Submit' },
      { name: 'surface-submit-hover', label: 'Submit hover' },
      { name: 'surface-destructive', label: 'Destructive' },
      { name: 'surface-destructive-hover', label: 'Destructive hover' },
    ],
  },
  {
    id: 'text',
    label: 'Text',
    tokens: [
      { name: 'text-primary', label: 'Primary' },
      { name: 'text-secondary', label: 'Secondary' },
      { name: 'text-secondary-alt', label: 'Secondary alt' },
      { name: 'text-tertiary', label: 'Tertiary' },
      { name: 'text-warning', label: 'Warning' },
      { name: 'text-destructive', label: 'Destructive' },
      { name: 'link', label: 'Link' },
      { name: 'link-hover', label: 'Link hover' },
      { name: 'link-visited', label: 'Link visited' },
    ],
  },
  {
    id: 'surface',
    label: 'Surfaces',
    tokens: [
      { name: 'surface-primary', label: 'Primary' },
      { name: 'surface-primary-alt', label: 'Primary alt' },
      { name: 'surface-primary-contrast', label: 'Primary contrast' },
      { name: 'surface-secondary', label: 'Secondary' },
      { name: 'surface-secondary-alt', label: 'Secondary alt' },
      { name: 'surface-tertiary', label: 'Tertiary' },
      { name: 'surface-tertiary-alt', label: 'Tertiary alt' },
      { name: 'surface-chat', label: 'Chat' },
      { name: 'surface-dialog', label: 'Dialog' },
      { name: 'surface-active', label: 'Active' },
      { name: 'surface-active-alt', label: 'Active alt' },
      { name: 'surface-hover', label: 'Hover' },
      { name: 'surface-hover-alt', label: 'Hover alt' },
      { name: 'surface-composer-hover', label: 'Composer hover' },
      { name: 'surface-overlay', label: 'Overlay' },
      { name: 'surface-code', label: 'Code' },
      { name: 'surface-qr', label: 'QR' },
      { name: 'presentation', label: 'Presentation' },
    ],
  },
  {
    id: 'header',
    label: 'Header',
    tokens: [
      { name: 'header-primary', label: 'Primary' },
      { name: 'header-hover', label: 'Hover' },
      { name: 'header-button-hover', label: 'Button hover' },
    ],
  },
  {
    id: 'border',
    label: 'Borders',
    tokens: [
      { name: 'border-light', label: 'Light' },
      { name: 'border-medium', label: 'Medium' },
      { name: 'border-medium-alt', label: 'Medium alt' },
      { name: 'border-heavy', label: 'Heavy' },
      { name: 'border-xheavy', label: 'Extra heavy' },
      { name: 'border-destructive', label: 'Destructive' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    tokens: [
      { name: 'status-success', label: 'Success' },
      { name: 'status-info', label: 'Info' },
      { name: 'status-warning', label: 'Warning' },
      { name: 'status-error', label: 'Error' },
      { name: 'status-neutral', label: 'Neutral' },
    ],
  },
];

export const colorTokenNames: string[] = colorGroups.flatMap((group) =>
  group.tokens.map((token) => token.name),
);

export type EffectId =
  | 'radius'
  | 'motion'
  | 'saturation'
  | 'contrast'
  | 'hue'
  | 'glow'
  | 'glass'
  | 'grain'
  | 'wash'
  | 'iconBlur';

export interface EffectControl {
  id: EffectId;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  /** Value at which the effect is inert and emits no CSS. */
  neutral: number;
  unit: string;
}

export const effectControls: EffectControl[] = [
  {
    id: 'radius',
    label: 'Corner radius',
    hint: 'Rescales the whole radius scale. Pills and avatars keep their shape.',
    min: 0,
    max: 1.5,
    step: 0.05,
    neutral: 0.5,
    unit: 'rem',
  },
  {
    id: 'motion',
    label: 'Motion speed',
    hint: 'Multiplies every transition duration token. Lower is snappier.',
    min: 0,
    max: 3,
    step: 0.1,
    neutral: 1,
    unit: '×',
  },
  {
    id: 'saturation',
    label: 'Saturation',
    hint: 'Filters the whole app. 0 is greyscale.',
    min: 0,
    max: 2,
    step: 0.05,
    neutral: 1,
    unit: '×',
  },
  {
    id: 'contrast',
    label: 'Contrast',
    hint: 'Filters the whole app.',
    min: 0.6,
    max: 1.6,
    step: 0.02,
    neutral: 1,
    unit: '×',
  },
  {
    id: 'hue',
    label: 'Hue rotate',
    hint: 'Spins every colour in the app around the wheel.',
    min: -180,
    max: 180,
    step: 1,
    neutral: 0,
    unit: 'deg',
  },
  {
    id: 'glow',
    label: 'Accent glow',
    hint: 'Adds a brand-coloured halo to hovered and focused controls.',
    min: 0,
    max: 1,
    step: 0.05,
    neutral: 0,
    unit: '',
  },
  {
    id: 'glass',
    label: 'Glass blur',
    hint: 'Frosts dialogs, popovers and menus.',
    min: 0,
    max: 24,
    step: 1,
    neutral: 0,
    unit: 'px',
  },
  {
    id: 'grain',
    label: 'Film grain',
    hint: 'Overlays fine static noise across the app.',
    min: 0,
    max: 0.4,
    step: 0.01,
    neutral: 0,
    unit: '',
  },
  {
    id: 'wash',
    label: 'Accent wash',
    hint: 'Bleeds a brand-coloured gradient into the chat background.',
    min: 0,
    max: 0.5,
    step: 0.01,
    neutral: 0,
    unit: '',
  },
  {
    id: 'iconBlur',
    label: 'Icon swap blur',
    hint: 'Blur applied to the outgoing icon during a swap.',
    min: 0,
    max: 8,
    step: 0.5,
    neutral: 2,
    unit: 'px',
  },
];

export type EffectValues = Record<EffectId, number>;

export const neutralEffects: EffectValues = effectControls.reduce((acc, control) => {
  acc[control.id] = control.neutral;
  return acc;
}, {} as EffectValues);

/**
 * Duration tokens scaled by the motion multiplier, with their shipped defaults
 * in ms. `--theme-motion-*` are consumed by Tailwind's `duration-*` utilities
 * (see `tailwind.config.cjs`); the rest drive hand-written transitions in
 * `style.css`.
 */
export const motionTokens: ReadonlyArray<readonly [string, number]> = [
  ['theme-motion-fast', 150],
  ['theme-motion-normal', 200],
  ['theme-motion-slow', 300],
  ['resize-dur', 300],
  ['icon-swap-dur', 200],
  ['avatar-dur', 280],
];
