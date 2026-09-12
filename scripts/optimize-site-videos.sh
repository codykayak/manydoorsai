#!/usr/bin/env bash
# Compress site videos for faster Cloud Run delivery.
# Drop your raw file at public/manydoors-ai-property-managment-automation.source.mp4
# then run: ./scripts/optimize-site-videos.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/public"

PITCH_SRC="manydoors-ai-property-managment-automation.source.mp4"
if [[ ! -f "$PITCH_SRC" ]]; then
  PITCH_SRC="manydoors-ai_property-management-realestate.mp4"
  echo "Note: using $PITCH_SRC as pitch video source (add .source.mp4 to override)"
fi

echo "Optimizing pitch video → manydoors-ai-property-managment-automation.mp4"
ffmpeg -y -hide_banner -loglevel error -i "$PITCH_SRC" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=960:-2:flags=lanczos" \
  -movflags +faststart \
  -an \
  manydoors-ai-property-managment-automation.mp4

if [[ -f manydoors-ai_property-management-realestate.mp4 ]]; then
  echo "Optimizing hero video → manydoors-ai_property-management-realestate.mp4"
  ffmpeg -y -hide_banner -loglevel error -i manydoors-ai_property-management-realestate.mp4 \
    -c:v libx264 -crf 27 -preset medium \
    -vf "scale=1280:-2:flags=lanczos" \
    -movflags +faststart \
    -c:a aac -b:a 64k \
    manydoors-ai_property-management-realestate.opt.mp4
  mv manydoors-ai_property-management-realestate.opt.mp4 manydoors-ai_property-management-realestate.mp4
fi

ls -lh manydoors-ai-property-managment-automation.mp4 manydoors-ai_property-management-realestate.mp4 2>/dev/null || true
echo "Done."
