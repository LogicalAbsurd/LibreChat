# Theme Lab

An in-app playground for LibreChat's colours and visual effects. It edits the same
CSS custom properties that `client/src/style.css` defines, so whatever you see in
the panel is the real UI, not a mockup.

## Running it against your own backend

The lab lives in the frontend, so you view it through the Vite dev server rather
than through the port your backend serves. Start the dev server with
`BACKEND_PORT` pointing at your running LibreChat:

```bash
BACKEND_PORT=3081 npm run frontend:dev
```

Then open <http://localhost:3090>. That page is your real LibreChat — same
backend, same login, same conversations — with the lab available on top.

`BACKEND_PORT` defaults to `3080` (`client/vite.config.ts`). If it points at a
port with nothing behind it, `/api/config` fails and the login page renders with
no fields at all, because `Login.tsx` gates every field on `startupConfig`. An
empty login page almost always means the proxy is aimed at the wrong port.

## Opening it

The lab is mounted in `App.jsx` and renders only in development builds.

- Press <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>, or click the 🎨 button
  in the bottom-right corner.
- To use it against a production build, run this in the console and reload:

  ```js
  localStorage.setItem('librechat:theme-lab:enabled', 'true');
  ```

## What you can change

**Presets** — nine seeded palettes plus a Shuffle button. Each one rebuilds the
full light _and_ dark palettes at once.

**Generate from accent** — pick one accent colour and the lab derives every
surface, border and text token from it:

| Control     | Effect                                              |
| ----------- | --------------------------------------------------- |
| Accent      | Brand colour, focus ring and submit surfaces        |
| Surface hue | Hue the neutral greys are tinted toward             |
| Tint        | How strongly neutrals take that hue (0 = pure grey) |
| Contrast    | Separation between surface levels and text          |

**Contrast readout** — live WCAG ratios for primary, secondary and tertiary text
against `surface-primary`. AA body text needs 4.5:1.

**Effects** — corner radius, motion speed, saturation, contrast, hue rotate,
accent glow, glass blur, film grain and accent wash, plus the existing
`--avatar-lift` and `--icon-swap-blur` transition tokens.

Note that saturation, contrast and hue rotate apply a CSS `filter` to `#root`,
which makes it a containing block for fixed-position descendants. Overlays
usually look identical, but check them before shipping those effects.

**Tokens** — every semantic token, grouped, with a swatch and a hex field. Edits
apply to the mode you are currently in; toggle the app between light and dark to
edit the other palette.

## Keeping a theme

Changes are written to a single `<style id="librechat-theme-lab">` element and
persisted in `localStorage`, so they survive a reload. Nothing is sent anywhere.

- **Copy CSS** gives you `html:not(.dark)` and `html.dark` blocks ready to paste
  into `client/src/style.css` after the existing theme blocks.
- **Copy JSON** gives you the raw state, handy for converting into an `IThemeRGB`
  object for `packages/client/src/theme/themes/` or into `REACT_APP_THEME_*`
  environment variables.
- **Reset** removes the override stylesheet and the stored state.

## Layout

| File         | Role                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `index.tsx`  | Dev gate, keyboard shortcut, launcher button                         |
| `Panel.tsx`  | The panel UI, portalled outside `#root` so effects do not distort it |
| `apply.ts`   | Builds the override stylesheet and the exported CSS                  |
| `presets.ts` | Seeded palette generation and the preset list                        |
| `tokens.ts`  | Registry of editable tokens and effect controls                      |
| `color.ts`   | Colour conversion and WCAG contrast maths                            |
| `store.ts`   | `localStorage` persistence                                           |

The lab is a developer tool, so its strings are intentionally not routed through
`useLocalize()` — adding them would push dev-only copy into the translation
pipeline that feeds `client/src/locales`.
