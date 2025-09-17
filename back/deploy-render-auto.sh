#!/usr/bin/env bash
set -euo pipefail

# Automated helper to create a Render service for this repo using the Render CLI.
# Supports interactive login or non-interactive mode via --api-key and --env-file.
# Does NOT store secrets in the repo.

here="$(cd "$(dirname "$0")" && pwd)"
repo_owner="matchamekevin"
repo_name="Go"
default_branch="dev2"

usage() {
  cat <<EOF
Usage: $(basename "$0") [--api-key KEY] [--service-name NAME] [--branch BR] [--env-file FILE] [--non-interactive]

Options:
  --api-key KEY         Use Render API key for non-interactive login (or set RENDER_API_KEY env var)
  --service-name NAME   Service name to create on Render (default: gosotral-api)
  --branch BR           Git branch to deploy (default: $default_branch)
  --env-file FILE       File with KEY=VALUE lines to set as env vars on Render
  --non-interactive     Don't prompt; fail on missing parameters
  -h, --help            Show this help
EOF
}

check_render_cli() {
  if ! command -v render >/dev/null 2>&1; then
    echo "Render CLI not found. Install with: npm install -g @render/cli"
    exit 1
  fi
}

ensure_logged_in() {
  if ! render whoami >/dev/null 2>&1; then
    if [ -n "${RENDER_API_KEY:-}" ]; then
      echo "Logging in with RENDER_API_KEY..."
      render login --api-key "$RENDER_API_KEY"
    else
      if [ "$NON_INTERACTIVE" = true ]; then
        echo "ERROR: not logged in and no RENDER_API_KEY provided in non-interactive mode"
        exit 1
      fi
      echo "Please authenticate the Render CLI now (interactive)."
      render login
    fi
  fi
  echo "Authenticated as: $(render whoami)"
}

create_service_noninteractive() {
  echo "Creating Render service '$SERVICE_NAME' from $repo_owner/$repo_name@$BRANCH..."
  render services create \
    --name "$SERVICE_NAME" \
    --repo "$repo_owner/$repo_name" \
    --branch "$BRANCH" \
    --type web \
    --env docker \
    --dockerfilePath back/Dockerfile || true

  echo "Service create command finished (check Render dashboard)."

  if [ -n "${ENV_FILE:-}" ] && [ -f "$ENV_FILE" ]; then
    echo "Applying env vars from $ENV_FILE..."
    while IFS= read -r line || [ -n "$line" ]; do
      # skip comments and empty lines
      [[ "$line" =~ ^# ]] && continue
      [[ -z "$line" ]] && continue
      key=${line%%=*}
      value=${line#*=}
      echo "Setting $key..."
      render services env set --service "$SERVICE_NAME" "$key" "$value" || true
    done < "$ENV_FILE"
  fi

  echo "Deployment request sent. Monitor render.com dashboard for build logs."
}

create_service_interactive() {
  local service_name branch
  read -r -p "Service name on Render (default: gosotral-api): " service_name
  SERVICE_NAME=${service_name:-gosotral-api}
  read -r -p "Repository branch to deploy (default: $default_branch): " branch
  BRANCH=${branch:-$default_branch}

  create_service_noninteractive

  echo "Now you can add env vars interactively. To finish, press Enter."
  while true; do
    read -r -p "Add env var (KEY=VALUE) or Enter to finish: " pair
    [ -z "$pair" ] && break
    key=${pair%%=*}
    value=${pair#*=}
    render services env set --service "$SERVICE_NAME" "$key" "$value" || true
  done
}

# Parse args
SERVICE_NAME="gosotral-api"
BRANCH="$default_branch"
ENV_FILE=""
NON_INTERACTIVE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-key)
      shift
      export RENDER_API_KEY="$1"
      ;;
    --service-name)
      shift
      SERVICE_NAME="$1"
      ;;
    --branch)
      shift
      BRANCH="$1"
      ;;
    --env-file)
      shift
      ENV_FILE="$1"
      ;;
    --non-interactive)
      NON_INTERACTIVE=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift || true
done

check_render_cli
ensure_logged_in

if [ "$NON_INTERACTIVE" = true ]; then
  if [ -z "${RENDER_API_KEY:-}" ]; then
    echo "ERROR: non-interactive mode requires RENDER_API_KEY (or use --api-key)"
    exit 1
  fi
  export ENV_FILE="$ENV_FILE"
  export SERVICE_NAME="$SERVICE_NAME"
  export BRANCH="$BRANCH"
  create_service_noninteractive
else
  if [ -n "$ENV_FILE" ]; then
    # run non-interactive with provided env file
    SERVICE_NAME="$SERVICE_NAME" BRANCH="$BRANCH" ENV_FILE="$ENV_FILE" create_service_noninteractive
  else
    create_service_interactive
  fi
fi

exit 0
