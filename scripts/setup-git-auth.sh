#!/usr/bin/env bash
# Configure git + gh to push codykayak/manydoorsai (bypasses cursor[bot] URL rewrite).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

is_valid_pat() {
  [[ "${1:-}" == ghp_* ]] && [[ ${#1} -ge 36 ]]
}

pick_first_valid_pat() {
  for candidate in "$@"; do
    if is_valid_pat "$candidate"; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

load_token() {
  local from_file_june="" from_file_gh=""

  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    from_file_june="${junerealestate:-}"
    from_file_gh="${GH_TOKEN:-}"
  fi

  pick_first_valid_pat \
    "${junerealestate:-}" \
    "${GH_TOKEN:-}" \
    "$from_file_june" \
    "$from_file_gh"
}

TOKEN="$(load_token)" || {
  cat >&2 <<'EOF'
No GitHub PAT found for manydoorsai pushes.

Set ONE of these:
  1. Cursor → Cloud Agents → Secrets → junerealestate = ghp_... (repo scope)
  2. File: .env.local with junerealestate=ghp_...

Start a NEW Cloud Agent after changing secrets (repo: codykayak/manydoorsai).
EOF
  exit 1
}

export GH_TOKEN="$TOKEN"
export GITHUB_TOKEN="$TOKEN"

cd "$ROOT"
git remote set-url origin "https://x-access-token:${TOKEN}@github.com/codykayak/manydoorsai.git"
echo "$TOKEN" | gh auth login --with-token 2>/dev/null || true

touch "$ROOT/scripts/.auth-configured"
echo "OK: git push configured for codykayak/manydoorsai as $(gh api user -q .login 2>/dev/null || echo 'github user')."
