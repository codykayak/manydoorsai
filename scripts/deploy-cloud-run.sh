#!/usr/bin/env bash
# Manual deploy: manydoorsai.com → Cloud Run (same as cloudbuild.yaml).
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-property-managment-a5ed3}"
REGION="${CLOUD_RUN_REGION:-us-west1}"
SERVICE="manydoorsai"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "Install Google Cloud SDK and run: gcloud auth login" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Submitting Cloud Build for ${SERVICE} (project=${PROJECT_ID})..."
gcloud builds submit --config cloudbuild.yaml --project "${PROJECT_ID}"

echo ""
echo "Waiting for rollout, then verifying..."
sleep 30
"${ROOT}/scripts/verify-live-deploy.sh" || {
  echo ""
  echo "If deploy succeeded but verify failed:"
  echo "  Cloud Run → ${SERVICE} → Revisions → confirm latest revision has 100% traffic"
  exit 1
}
