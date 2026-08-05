#!/usr/bin/env python3
"""
Applies the Astro-Chart palette to LibreChat's .dark theme block only.
Leaves :root (light theme), .gizmo, and functional red/green colors untouched.

Usage (from the LibreChat repo root):
    python3 apply_astro_theme.py client/src/style.css
"""

import sys

OLD_BLOCK = """.dark {
  --brand-purple: #ab68ff;
  --presentation: var(--gray-800);
  --text-primary: var(--gray-100);
  --text-secondary: var(--gray-300);
  --text-secondary-alt: var(--gray-400);
  --text-tertiary: var(--gray-500);
  --text-warning: var(--amber-500);
  --text-destructive: var(--red-600);
  --header-primary: var(--gray-700);
  --header-hover: var(--gray-600);
  --header-button-hover: var(--gray-700);
  --surface-active: var(--gray-500);
  --surface-active-alt: var(--gray-700);
  --surface-hover: var(--gray-600);
  --surface-hover-alt: var(--gray-600);
  --surface-primary: var(--gray-900);
  --surface-primary-alt: var(--gray-850);
  --surface-primary-contrast: var(--gray-850);
  --surface-secondary: var(--gray-800);
  --surface-secondary-alt: var(--gray-800);
  --surface-tertiary: var(--gray-700);
  --surface-tertiary-alt: var(--gray-700);
  --surface-dialog: var(--gray-850);
  --surface-submit: var(--green-700);
  --surface-submit-hover: var(--green-800);
  --surface-destructive: var(--red-800);
  --surface-destructive-hover: var(--red-900);
  --surface-chat: var(--gray-700);
  --border-light: var(--gray-700);
  --border-medium-alt: var(--gray-600);
  --border-medium: var(--gray-600);
  --border-heavy: var(--gray-500);
  --border-xheavy: var(--gray-400);
  --border-destructive: var(--red-500);
  /* These are test styles */

  --background: 0 0% 7%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 40.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --switch-unchecked: 0 0% 40%;
}"""

NEW_BLOCK = """.dark {
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

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 apply_astro_theme.py <path to style.css>")
        sys.exit(1)

    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if OLD_BLOCK not in content:
        print("ERROR: exact .dark block not found. The file may already be modified,")
        print("or line endings/whitespace differ from what this script expects.")
        print("No changes made.")
        sys.exit(1)

    content = content.replace(OLD_BLOCK, NEW_BLOCK, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Applied Astro-Chart palette to {path}")
    print("Light theme (:root), Gizmo theme, and error/success colors were left untouched.")

if __name__ == "__main__":
    main()
