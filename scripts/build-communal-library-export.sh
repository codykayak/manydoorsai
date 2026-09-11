#!/usr/bin/env bash
# Build communal-library.zip for drop-in AiBhive deploy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/AiBhive/communal-library"
OUT="${1:-$ROOT/downloads/communal-library.zip}"

mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"
(cd "$SRC" && zip -r "$OUT" . -x '*/.DS_Store')
echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
echo "Unzip into AiBhive repo root and follow AiBhive/communal-library/README.md"
