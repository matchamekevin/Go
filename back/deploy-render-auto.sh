#!/usr/bin/env bash
set -euo pipefail

# Automated helper to create a Render service for this repo using the Render CLI.
# Supports interactive login or using RENDER_API_KEY env var. Does NOT store secrets.

here="$(cd "$(dirname "$0")" && pwd)"
repo_owner="matchamekevin"
repo_name="Go"
default_branch="dev2"

function check_render_cli() {
  if ! command -v render >/dev/null 2>&1; then
    echo "Render CLI not found. Install with: npm install -g @render/cli"
    exit 1
  fi
}

function ensure_logged_in() {
  if ! render whoami >/dev/null 2>&1; then
    if [ -n "${RENDER_API_KEY:-}" ]; then
      echo "Logging in with RENDER_API_KEY..."
      render login --api-key "$RENDER_API_KEY"
    else
      echo "Please authenticate the Render CLI now (interactive)."
      render login
    fi
  fi
  echo "Authenticated as: $(render whoami)"
}

function create_service() {
  local service_name
  read -r -p "Service name on Render (default: gosotral-api): " service_name
  service_name=${service_name:-gosotral-api}

  local branch
  read -r -p "Repository branch to deploy (default: $default_branch): " branch
  branch=${branch:-$default_branch}

  echo "Creating Render service '$service_name' from $repo_owner/$repo_name@$branch..."

  render services create \
    --name "$service_name" \
    --repo "$repo_owner/$repo_name" \
    --branch "$branch" \
    --type web \
    --env docker \
    --dockerfilePath back/Dockerfile || true

  echo "Service create command finished (check Render dashboard)."
  echo "Now you should add environment variables (DB, JWT, SMTP)."

  echo "You can set env vars now (optional). To skip, press Enter when prompted."
  while true; do
    read -r -p "Add env var (KEY=VALUE) or just Enter to finish: " pair
    if [ -z "$pair" ]; then
      break
    fi
    key=${pair%%=*}
    value=${pair#*=}
    echo "Setting $key on Render (encrypted)..."
    render services env set --service "$service_name" "$key" "$value"
  done

  echo "Deployment request sent. Monitor render.com dashboard for build logs."
}

# Main
check_render_cli
ensure_logged_in
create_service

exit 0
