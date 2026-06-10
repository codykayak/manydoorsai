#!/usr/bin/env bash
# Quick smoke test that production serves the current pitch video + bundle.
set -euo pipefail

SITE="${1:-https://www.manydoorsai.com}"
fail=0

echo "Checking $SITE ..."
lm="$(curl -fsI "$SITE/" 2>/dev/null | awk -F': ' 'tolower($1)=="last-modified" {print $2}' | tr -d '\r')"
if [ -n "$lm" ]; then
  echo "index.html Last-Modified: $lm"
fi

if curl -fsI "$SITE/manydoors-ai-property-managment-automation.mp4" | head -1 | grep -q "200"; then
  echo "OK  pitch mp4"
else
  echo "FAIL pitch mp4 (expected HTTP 200)"
  fail=1
fi

html="$(curl -fsSL "$SITE/")"
bundle="$(echo "$html" | grep -oE 'assets/index-[^"]+\.js' | head -1)"
if [ -z "$bundle" ]; then
  echo "FAIL could not find index bundle in HTML"
  exit 1
fi

echo "Bundle: $bundle"
js="$(curl -fsSL "$SITE/$bundle")"
if echo "$js" | grep -q "Multifamily community"; then
  echo "FAIL bundle still has old illustrative image markup"
  fail=1
else
  echo "OK  bundle has no old pitch image alt text"
fi

if echo "$js" | grep -q "managment-automation"; then
  echo "OK  bundle references pitch automation video"
else
  echo "WARN bundle does not mention managment-automation (check manually)"
fi

exit "$fail"
