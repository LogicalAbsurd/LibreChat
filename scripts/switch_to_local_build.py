#!/usr/bin/env python3
"""
Switches the `api` service in docker-compose.yml from pulling the prebuilt
image to building from the local Dockerfile, so CSS/source edits actually
get baked into the running container.

Usage (from the LibreChat repo root):
    python3 switch_to_local_build.py docker-compose.yml
"""

import sys

OLD_LINE = "    image: registry.librechat.ai/danny-avila/librechat-dev:latest"
NEW_LINE = "    build: ."

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 switch_to_local_build.py <path to docker-compose.yml>")
        sys.exit(1)

    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if OLD_LINE not in content:
        print("ERROR: expected image line not found. File may already be modified.")
        print("No changes made.")
        sys.exit(1)

    content = content.replace(OLD_LINE, NEW_LINE, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Switched api service to local build in {path}")

if __name__ == "__main__":
    main()
