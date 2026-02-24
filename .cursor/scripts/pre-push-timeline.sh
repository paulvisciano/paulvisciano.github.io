#!/bin/sh
# Regenerate memory timeline from git history; abort push if timeline.json changed
# so it can be committed. Run from repo root. Used by .git/hooks/pre-push.

set -e
repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

node "$repo_root/.cursor/scripts/build-memory-timeline.js" jarvis --output
node "$repo_root/.cursor/scripts/build-memory-timeline.js" paul --output

if ! git diff --quiet -- claw/memory/data/timeline.json memory/data/timeline.json 2>/dev/null; then
  echo ""
  echo "Memory timeline was updated. Commit the changes and push again:"
  echo "  git add claw/memory/data/timeline.json memory/data/timeline.json"
  echo "  git commit -m 'chore: update memory timeline'"
  echo "  git push"
  exit 1
fi
exit 0
