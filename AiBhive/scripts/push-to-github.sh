#!/usr/bin/env bash
# Push social-post-factory to github.com/codykayak/AiBhive
#
# Prerequisite: create an empty repo at https://github.com/new
#   Name: AiBhive
#   Owner: codykayak (or your org)
#   Do NOT add README (this repo already has one)
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git remote get-url origin &>/dev/null; then
  git remote add origin "https://github.com/codykayak/AiBhive.git"
fi

git push -u origin main
echo ""
echo "Done: https://github.com/codykayak/AiBhive"
echo "Admin UI: social-post-factory/admin/"
echo "Backend:  social-post-factory/functions/"
