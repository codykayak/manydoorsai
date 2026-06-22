#!/usr/bin/env bash
# Build social-post-factory.zip for download / Firebase Storage upload.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/downloads/social-post-factory.zip}"
COMMIT="${SOCIAL_EXPORT_COMMIT:-db506fd}"

OUT="$(cd "$(dirname "$OUT")" 2>/dev/null && pwd)/$(basename "$OUT")" || OUT="$ROOT/downloads/social-post-factory.zip"
mkdir -p "$(dirname "$OUT")"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cd "$ROOT"
git archive "$COMMIT" AiBhive/social-post-factory | tar -x -C "$TMP" --strip-components=2
(cd "$TMP" && zip -r "$OUT" . -x '*/node_modules/*')
echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
