import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import type { EffectId, ThemeMode } from './tokens';
import type { PaletteSeed } from './presets';
import type { LabState } from './apply';

import {
  activeMode,
  applyState,
  clearOverrides,
  exportCss,
  radiusOverridden,
  readToken,
} from './apply';
import { clearState, emptyState, loadState, saveState, stateFromSeed } from './store';
import { colorGroups, effectControls, neutralEffects } from './tokens';
import { contrastRatio, parseColor, toHex } from './color';
import { presets, randomSeed } from './presets';

const chrome = `
.tl-root {
  position: fixed;
  top: 12px;
  bottom: 12px;
  width: 332px;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid #333338;
  background: #17171a;
  color: #e6e6e9;
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}
.tl-root.tl-left { left: 12px; }
.tl-root.tl-right { right: 12px; }
.tl-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #2a2a2f;
  background: #1e1e22;
}
.tl-title { font-weight: 600; font-size: 12px; letter-spacing: 0.02em; }
.tl-mode {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 999px;
  background: #2f2f36;
  color: #b9b9c2;
}
.tl-body { overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 14px; }
.tl-body::-webkit-scrollbar { width: 8px; }
.tl-body::-webkit-scrollbar-thumb { background: #35353c; border-radius: 8px; }
.tl-section { display: flex; flex-direction: column; gap: 8px; }
.tl-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #8f8f9a;
}
.tl-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.tl-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #34343c;
  background: #212126;
  color: #d8d8de;
  cursor: pointer;
  font-size: 11px;
}
.tl-chip:hover { background: #2b2b32; }
.tl-dot { width: 10px; height: 10px; border-radius: 50%; }
.tl-btn {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #34343c;
  background: #212126;
  color: #d8d8de;
  cursor: pointer;
  font-size: 11px;
  flex: 1;
}
.tl-btn:hover { background: #2b2b32; }
.tl-btn.tl-danger { border-color: #5a2b2b; color: #f0a5a5; }
.tl-row { display: flex; align-items: center; gap: 8px; }
.tl-row-label { flex: 1; color: #c2c2ca; }
.tl-value { color: #8f8f9a; font-variant-numeric: tabular-nums; min-width: 52px; text-align: right; }
.tl-range { width: 100%; accent-color: #7c5cff; }
.tl-swatch {
  width: 26px;
  height: 22px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid #3a3a42;
  background: none;
  cursor: pointer;
}
.tl-hex {
  width: 74px;
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid #34343c;
  background: #121215;
  color: #d8d8de;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
}
.tl-group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #2a2a2f;
  background: #1c1c20;
  color: #d8d8de;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
}
.tl-group-body { display: flex; flex-direction: column; gap: 6px; padding: 8px 2px 2px; }
.tl-foot {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid #2a2a2f;
  background: #1e1e22;
}
.tl-note { color: #7c7c87; line-height: 1.5; }
.tl-contrast { display: flex; justify-content: space-between; gap: 8px; }
.tl-pass { color: #4ade80; }
.tl-warn { color: #fbbf24; }
.tl-fail { color: #f87171; }
`;

const hexOf = (value: string): string => {
  const rgb = parseColor(value);
  return rgb ? toHex(rgb) : '#000000';
};

function contrastClass(ratio: number): string {
  if (ratio >= 4.5) {
    return 'tl-pass';
  }
  return ratio >= 3 ? 'tl-warn' : 'tl-fail';
}

interface PanelProps {
  onClose: () => void;
}

export default function Panel({ onClose }: PanelProps) {
  const [state, setState] = useState<LabState>(loadState);
  const [mode, setMode] = useState<ThemeMode>(activeMode);
  const [dock, setDock] = useState<'left' | 'right'>('right');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ brand: true });
  const [status, setStatus] = useState('');
  const [radiusBlocked, setRadiusBlocked] = useState(false);

  useEffect(() => {
    applyState(state);
    saveState(state);
    setRadiusBlocked(
      state.effects.radius !== neutralEffects.radius && radiusOverridden(state.effects.radius),
    );
  }, [state]);

  useEffect(() => {
    const observer = new MutationObserver(() => setMode(activeMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!status) {
      return;
    }
    const timer = window.setTimeout(() => setStatus(''), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const tokenValue = useCallback(
    (name: string): string => state[mode][name] ?? hexOf(readToken(name)),
    [state, mode],
  );

  const groups = useMemo(() => {
    const defined = (name: string): boolean => readToken(name) !== '';
    return colorGroups
      .map((group) => ({ ...group, tokens: group.tokens.filter((token) => defined(token.name)) }))
      .filter((group) => group.tokens.length > 0);
  }, []);

  const contrast = useMemo(() => {
    const surface = tokenValue('surface-primary');
    return [
      { label: 'Primary text', ratio: contrastRatio(tokenValue('text-primary'), surface) },
      { label: 'Secondary text', ratio: contrastRatio(tokenValue('text-secondary'), surface) },
      { label: 'Tertiary text', ratio: contrastRatio(tokenValue('text-tertiary'), surface) },
    ];
  }, [tokenValue]);

  const applySeed = useCallback((seed: PaletteSeed) => {
    setState((current) => stateFromSeed(seed, current.effects));
  }, []);

  const updateSeed = useCallback((patch: Partial<PaletteSeed>) => {
    setState((current) => stateFromSeed({ ...current.seed, ...patch }, current.effects));
  }, []);

  const setToken = useCallback(
    (name: string, value: string) => {
      setState((current) => ({
        ...current,
        [mode]: { ...current[mode], [name]: value },
      }));
    },
    [mode],
  );

  const setEffect = useCallback((id: EffectId, value: number) => {
    setState((current) => ({ ...current, effects: { ...current.effects, [id]: value } }));
  }, []);

  const resetGroup = useCallback(
    (names: string[]) => {
      setState((current) => {
        const next = { ...current[mode] };
        for (const name of names) {
          delete next[name];
        }
        return { ...current, [mode]: next };
      });
    },
    [mode],
  );

  const resetAll = useCallback(() => {
    clearOverrides();
    clearState();
    setState(emptyState());
    setStatus('Reset to shipped theme');
  }, []);

  const copy = useCallback((text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => setStatus(message),
      () => setStatus('Clipboard blocked — see console'),
    );
  }, []);

  const hasOverrides =
    Object.keys(state.light).length > 0 ||
    Object.keys(state.dark).length > 0 ||
    effectControls.some((control) => state.effects[control.id] !== neutralEffects[control.id]);

  return createPortal(
    <>
      <style>{chrome}</style>
      <div className={`tl-root tl-${dock}`} role="dialog" aria-label="Theme Lab">
        <div className="tl-head">
          <span className="tl-title">Theme Lab</span>
          <span className="tl-mode">{mode}</span>
          <span style={{ flex: 1 }} />
          <button
            className="tl-btn"
            style={{ flex: 'none' }}
            onClick={() => setDock(dock === 'right' ? 'left' : 'right')}
            aria-label="Move panel to the other side"
          >
            {dock === 'right' ? '←' : '→'}
          </button>
          <button
            className="tl-btn"
            style={{ flex: 'none' }}
            onClick={onClose}
            aria-label="Close Theme Lab"
          >
            ✕
          </button>
        </div>

        <div className="tl-body">
          <div className="tl-section">
            <span className="tl-label">Presets</span>
            <div className="tl-chips">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  className="tl-chip"
                  onClick={() => applySeed({ ...preset.seed })}
                >
                  <span className="tl-dot" style={{ background: preset.seed.accent }} />
                  {preset.label}
                </button>
              ))}
              <button className="tl-chip" onClick={() => applySeed(randomSeed())}>
                🎲 Shuffle
              </button>
            </div>
          </div>

          <div className="tl-section">
            <span className="tl-label">Generate from accent</span>
            <div className="tl-row">
              <span className="tl-row-label">Accent</span>
              <input
                className="tl-swatch"
                type="color"
                value={hexOf(state.seed.accent)}
                onChange={(event) => updateSeed({ accent: event.target.value })}
                aria-label="Accent colour"
              />
              <input
                className="tl-hex"
                value={state.seed.accent}
                onChange={(event) => updateSeed({ accent: event.target.value })}
                aria-label="Accent hex value"
              />
            </div>
            <div className="tl-row">
              <span className="tl-row-label">Surface hue</span>
              <span className="tl-value">{Math.round(state.seed.hue ?? 0)}°</span>
            </div>
            <input
              className="tl-range"
              type="range"
              min={0}
              max={359}
              step={1}
              value={Math.round(state.seed.hue ?? 0)}
              onChange={(event) => updateSeed({ hue: Number(event.target.value) })}
              aria-label="Surface hue"
            />
            <div className="tl-row">
              <span className="tl-row-label">Tint</span>
              <span className="tl-value">{state.seed.tint.toFixed(2)}</span>
            </div>
            <input
              className="tl-range"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.seed.tint}
              onChange={(event) => updateSeed({ tint: Number(event.target.value) })}
              aria-label="Neutral tint strength"
            />
            <div className="tl-row">
              <span className="tl-row-label">Contrast</span>
              <span className="tl-value">{state.seed.contrast.toFixed(2)}</span>
            </div>
            <input
              className="tl-range"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.seed.contrast}
              onChange={(event) => updateSeed({ contrast: Number(event.target.value) })}
              aria-label="Surface contrast spread"
            />
            <p className="tl-note">
              Regenerating from the accent rebuilds both the light and dark palettes and replaces
              per-token edits.
            </p>
          </div>

          <div className="tl-section">
            <span className="tl-label">Contrast on surface-primary</span>
            {contrast.map((entry) => (
              <div key={entry.label} className="tl-contrast">
                <span className="tl-row-label">{entry.label}</span>
                <span className={entry.ratio ? contrastClass(entry.ratio) : 'tl-warn'}>
                  {entry.ratio ? `${entry.ratio.toFixed(2)}:1` : 'n/a'}
                </span>
              </div>
            ))}
            <p className="tl-note">WCAG AA body text needs 4.5:1, large text 3:1.</p>
          </div>

          <div className="tl-section">
            <span className="tl-label">Effects</span>
            {effectControls.map((control) => (
              <div key={control.id}>
                <div className="tl-row">
                  <span className="tl-row-label" title={control.hint}>
                    {control.label}
                  </span>
                  <span className="tl-value">
                    {state.effects[control.id]}
                    {control.unit}
                  </span>
                </div>
                <input
                  className="tl-range"
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={state.effects[control.id]}
                  onChange={(event) => setEffect(control.id, Number(event.target.value))}
                  aria-label={control.label}
                />
              </div>
            ))}
            {radiusBlocked && (
              <p className="tl-note tl-fail" role="status">
                Corner radius is applying but something outranks it — usually a more specific
                `!important` rule in style.css, such as `.dark [class*=&apos;rounded&apos;]`. Remove
                or loosen that rule to preview radius changes.
              </p>
            )}
            <p className="tl-note">
              Saturation, contrast and hue rotate filter the whole app, which makes #root a
              containing block for fixed-position children — check overlays before shipping them.
            </p>
            <button
              className="tl-btn"
              onClick={() =>
                setState((current) => ({ ...current, effects: { ...neutralEffects } }))
              }
            >
              Reset effects
            </button>
          </div>

          <div className="tl-section">
            <span className="tl-label">Tokens — {mode} mode</span>
            {groups.map((group) => {
              const isOpen = openGroups[group.id] === true;
              return (
                <div key={group.id}>
                  <button
                    className="tl-group-head"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenGroups((current) => ({ ...current, [group.id]: !isOpen }))
                    }
                  >
                    <span>{isOpen ? '▾' : '▸'}</span>
                    <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
                    <span className="tl-value">{group.tokens.length}</span>
                  </button>
                  {isOpen && (
                    <div className="tl-group-body">
                      {group.tokens.map((token) => (
                        <div key={token.name} className="tl-row">
                          <span className="tl-row-label" title={`--${token.name}`}>
                            {token.label}
                          </span>
                          <input
                            className="tl-swatch"
                            type="color"
                            value={hexOf(tokenValue(token.name))}
                            onChange={(event) => setToken(token.name, event.target.value)}
                            aria-label={`${group.label} ${token.label}`}
                          />
                          <input
                            className="tl-hex"
                            value={tokenValue(token.name)}
                            onChange={(event) => setToken(token.name, event.target.value)}
                            aria-label={`${group.label} ${token.label} value`}
                          />
                        </div>
                      ))}
                      <button
                        className="tl-btn"
                        onClick={() => resetGroup(group.tokens.map((token) => token.name))}
                      >
                        Reset {group.label.toLowerCase()}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="tl-note">
            Toggle the app between light and dark to edit the other palette. Overrides persist in
            localStorage and never leave your browser.
          </p>
        </div>

        <div className="tl-foot">
          <button
            className="tl-btn"
            disabled={!hasOverrides}
            onClick={() => copy(exportCss(state), 'CSS copied')}
          >
            Copy CSS
          </button>
          <button
            className="tl-btn"
            onClick={() => copy(JSON.stringify(state, null, 2), 'JSON copied')}
          >
            Copy JSON
          </button>
          <button className="tl-btn tl-danger" onClick={resetAll}>
            Reset
          </button>
        </div>
        {status && (
          <div className="tl-foot" style={{ paddingTop: 0, borderTop: 'none' }}>
            <span className="tl-note" role="status">
              {status}
            </span>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
