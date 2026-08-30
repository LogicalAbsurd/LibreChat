import { lazy, Suspense, useCallback, useEffect, useState } from 'react';

import { applyState } from './apply';
import { loadState } from './store';

const LazyPanel = lazy(() => import('./Panel'));

const ENABLE_KEY = 'librechat:theme-lab:enabled';

interface ThemeLabProps {
  isDevelopment?: boolean;
}

function isOptedIn(): boolean {
  try {
    return localStorage.getItem(ENABLE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * The lab ships in development builds. To use it against a production build,
 * run `localStorage.setItem('librechat:theme-lab:enabled', 'true')` and reload.
 */
export const shouldEnableThemeLab = ({
  isDevelopment = import.meta.env.DEV,
}: ThemeLabProps = {}): boolean => isDevelopment || isOptedIn();

export default function ThemeLab({ isDevelopment }: ThemeLabProps = {}) {
  const [enabled] = useState(() => shouldEnableThemeLab({ isDevelopment }));
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (enabled) {
      applyState(loadState());
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) {
        return;
      }
      if (event.code !== 'KeyL') {
        return;
      }
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Theme Lab (Ctrl/Cmd + Shift + L)"
        aria-label="Open Theme Lab"
        style={{
          position: 'fixed',
          right: '16px',
          bottom: '16px',
          zIndex: 2147483000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '999px',
          border: '1px solid #34343c',
          background: '#17171a',
          color: '#e6e6e9',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: 1,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        }}
      >
        <span aria-hidden="true">🎨</span>
        Theme Lab
      </button>
    );
  }

  return (
    <Suspense fallback={null}>
      <LazyPanel onClose={close} />
    </Suspense>
  );
}
