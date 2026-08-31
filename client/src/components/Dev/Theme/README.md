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

- **Copy CSS** gives you `html:not(.dark)` and `html.dark` blocks. Paste them at
  the very end of `client/src/style.css`, at the top level — they are complete
  rules, so dropping them inside an existing `html { }` or `.dark { }` block
  nests them and the stylesheet fails to build. Hit **Reset** afterwards so the
  theme comes from the file rather than from browser storage.
- **Copy JSON** gives you the raw state, handy for converting into an `IThemeRGB`
  object for `packages/client/src/theme/themes/` or into `REACT_APP_THEME_*`
  environment variables.
- **Reset** removes the override stylesheet and the stored state.

## Radius and accent coverage

**Radius.** `tailwind.config.cjs` maps every `rounded-*` utility — including
directional variants (`rounded-t-*`, `rounded-tl-*`) and responsive ones
(`sm:rounded-3xl`) — to a `--radius-<step>` variable. The slider rescales the
whole scale by publishing those variables on `html`:

| Variable         | Tailwind step | Default ratio |
| ---------------- | ------------- | ------------- |
| `--radius-sm`    | `rounded-sm`  | 0.25          |
| `--radius-base`  | `rounded`     | 0.5           |
| `--radius-md`    | `rounded-md`  | 0.75          |
| `--radius-lg`    | `rounded-lg`  | 1             |
| `--radius-xl`    | `rounded-xl`  | 1.5           |
| `--radius-2xl`   | `rounded-2xl` | 2             |
| `--radius-3xl`   | `rounded-3xl` | 3             |

`--radius` and `--theme-control-radius` / `--theme-surface-radius` /
`--theme-large-surface-radius` are still set too, for the upstream style layer
that reads them directly. `rounded-full` and `rounded-none` are deliberate
shapes (avatars, pills, flush edges) and are Tailwind literals, so they stay
put.

**Accent.** Picking an accent moves the surface hue with it, so the whole theme
retunes. The hue slider then decouples the two if you want neutrals tinted
differently from the accent.

That coupling matters because LibreChat is mostly neutral surfaces: on its own
the accent only reaches `text-accent-primary`, `bg-surface-submit`, links and
the focus ring. If your `style.css` also pins those elements — a hardcoded
`background-color: ... !important` on the send button, say — point them at
`rgb(var(--surface-submit))` or `rgb(var(--accent-primary))` so they follow the
theme too. Because those accent tokens are used as _text_ far more than as
fills, generated accents and links are walked away from `surface-primary` until
they clear 4.5:1 — a fixed lightness cannot guarantee that, since a green and a
blue at the same HSL lightness are nowhere near equally readable.

## Channel formats

LibreChat stores its semantic tokens as bare `R G B` channel triplets
(`--surface-primary: 255 255 255`) so Tailwind can wrap them as
`rgb(var(--x) / <alpha-value>)` and opacity modifiers keep working. Older trees
stored plain colours instead.

The lab detects which convention the running app uses by probing a palette
variable it never overrides (`--white`, `--black`, `--gray-800`) and emits
matching values, so writing hex into a triplet host — which produces invalid
`rgb(#aabbcc / 1)` and silently strips the colour from every element — cannot
happen. Effect CSS adapts too: token references become `rgb(var(--x))` where the
host uses triplets.

Colours are held internally as hex because that is what colour inputs speak; the
conversion happens when the stylesheet is written.

The token list is a superset across LibreChat versions. On mount the panel hides
any token the running app does not define, so you only ever see controls that do
something.

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
