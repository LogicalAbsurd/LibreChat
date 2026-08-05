#!/usr/bin/env python3
"""
Squares off corners: sets the global --radius variable to 0 (affects most
shadcn-style components), and patches ChatForm.tsx to remove its hardcoded
rounded-3xl classes on the composer specifically.

Usage (from the LibreChat repo root):
    python3 square_corners.py
"""

import re

STYLE_PATH = "client/src/style.css"
CHATFORM_PATH = "client/src/components/Chat/Input/ChatForm.tsx"

def patch_style():
    with open(STYLE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    old = "  --radius: 0.5rem;"
    new = "  --radius: 0rem;"

    if old not in content:
        print(f"WARNING: expected --radius line not found in {STYLE_PATH}. Skipped.")
        return

    content = content.replace(old, new, 1)
    with open(STYLE_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Set --radius: 0rem in {STYLE_PATH}")

def patch_chatform():
    with open(CHATFORM_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    old = "rounded-t-3xl border pb-4 text-text-primary transition-all duration-200 sm:rounded-3xl sm:pb-0"
    new = "rounded-none border pb-4 text-text-primary transition-all duration-200 sm:pb-0"

    if old not in content:
        print(f"WARNING: expected composer className not found in {CHATFORM_PATH}. Skipped.")
        return

    content = content.replace(old, new, 1)
    with open(CHATFORM_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Squared off composer corners in {CHATFORM_PATH}")

if __name__ == "__main__":
    patch_style()
    patch_chatform()
    print("Done. Rebuild + relaunch to see it.")
