#!/usr/bin/env python3
"""
Replaces the astro-chart .dark theme (already applied) with the
leather/charcoal palette. Same scope as before: .dark block only.

Usage (from the LibreChat repo root):
    python3 apply_leather_theme.py client/src/style.css
"""

import sys

OLD_BLOCK = """.dark {
  --brand-purple: #e8aa58;
  --presentation: #030305;
  --text-primary: #f2e4d0;
  --text-secondary: #b17441;
  --text-secondary-alt: #8b5e3c;
  --text-tertiary: #6e4a32;
  --text-warning: #e8aa58;
  --text-destructive: var(--red-600);
  --header-primary: #2f3e46;
  --header-hover: #3a4b54;
  --header-button-hover: #3a4b54;
  --surface-active: #4a3220;
  --surface-active-alt: #5c3f28;
  --surface-hover: #23233a;
  --surface-hover-alt: #2a2a42;
  --surface-primary: #030305;
  --surface-primary-alt: #0a0a10;
  --surface-primary-contrast: #050507;
  --surface-secondary: #2f3e46;
  --surface-secondary-alt: #263139;
  --surface-tertiary: #1a1a2e;
  --surface-tertiary-alt: #22223a;
  --surface-dialog: #1a1a2e;
  --surface-submit: var(--green-700);
  --surface-submit-hover: var(--green-800);
  --surface-destructive: var(--red-800);
  --surface-destructive-hover: var(--red-900);
  --surface-chat: #2f3e46;
  --border-light: #23233a;
  --border-medium-alt: #3a3a52;
  --border-medium: #3a3a52;
  --border-heavy: #8b5e3c;
  --border-xheavy: #b17441;
  --border-destructive: var(--red-500);
  /* Astro-Chart Palette applied */

  --background: 240 25% 2%;
  --foreground: 35 57% 88%;
  --card: 240 28% 14%;
  --card-foreground: 35 57% 88%;
  --primary: 34 76% 63%;
  --primary-foreground: 240 25% 2%;
  --secondary: 201 20% 23%;
  --secondary-foreground: 35 57% 88%;
  --muted: 201 20% 18%;
  --muted-foreground: 27 46% 48%;
  --accent: 26 40% 39%;
  --accent-foreground: 35 57% 88%;
  --destructive: 0 62.8% 40.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 20% 18%;
  --input: 240 20% 18%;
  --ring: 34 76% 63%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --switch-unchecked: 0 0% 40%;
}"""

NEW_BLOCK = """.dark {
  --brand-purple: #ae7f62;
  --presentation: #211b18;
  --text-primary: #fccdac;
  --text-secondary: #746c64;
  --text-secondary-alt: #574e47;
  --text-tertiary: #3d342f;
  --text-warning: #ae7f62;
  --text-destructive: var(--red-600);
  --header-primary: #3d342f;
  --header-hover: #4a4038;
  --header-button-hover: #4a4038;
  --surface-active: #5c4636;
  --surface-active-alt: #6b5342;
  --surface-hover: #2b241f;
  --surface-hover-alt: #332b25;
  --surface-primary: #211b18;
  --surface-primary-alt: #29221e;
  --surface-primary-contrast: #1a1512;
  --surface-secondary: #3d342f;
  --surface-secondary-alt: #332b26;
  --surface-tertiary: #574e47;
  --surface-tertiary-alt: #4a423c;
  --surface-dialog: #3d342f;
  --surface-submit: var(--green-700);
  --surface-submit-hover: var(--green-800);
  --surface-destructive: var(--red-800);
  --surface-destructive-hover: var(--red-900);
  --surface-chat: #3d342f;
  --border-light: #574e47;
  --border-medium-alt: #6b5f56;
  --border-medium: #6b5f56;
  --border-heavy: #746c64;
  --border-xheavy: #ae7f62;
  --border-destructive: var(--red-500);
  /* Leather / charcoal palette applied */

  --background: 20 16% 11%;
  --foreground: 25 93% 83%;
  --card: 21 13% 21%;
  --card-foreground: 25 93% 83%;
  --primary: 23 32% 53%;
  --primary-foreground: 20 16% 11%;
  --secondary: 21 13% 21%;
  --secondary-foreground: 25 93% 83%;
  --muted: 26 10% 31%;
  --muted-foreground: 30 7% 42%;
  --accent: 23 32% 53%;
  --accent-foreground: 20 16% 11%;
  --destructive: 0 62.8% 40.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 26 10% 31%;
  --input: 26 10% 31%;
  --ring: 23 32% 53%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --switch-unchecked: 0 0% 40%;
}"""

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 apply_leather_theme.py <path to style.css>")
        sys.exit(1)

    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if OLD_BLOCK not in content:
        print("ERROR: expected astro-theme .dark block not found.")
        print("The file may differ from what this script expects. No changes made.")
        sys.exit(1)

    content = content.replace(OLD_BLOCK, NEW_BLOCK, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Applied leather/charcoal palette to {path}")

if __name__ == "__main__":
    main()
