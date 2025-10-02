#!/usr/bin/env bash
set -euo pipefail

# Script helper to deploy the backend to Railway
# Usage:
#   1) Install railway CLI: https://docs.railway.app/develop/cli
#   2) Log in: railway login
#   3) From repository root: ./back/deploy-railway.sh

# This script assumes you have already connected this GitHub repo to Railway
# or you will create a new Railway project interactively.

echo "Railway deploy helper"
# Ensure we run from repo/back
cd "$(dirname "$0")"

# Optionally build locally first
echo "Building project locally..."
npm ci
npm run build

# Railway: create or use existing project
# If you haven't initialized a railway project, run 'railway init' first interactively.
if ! command -v railway >/dev/null 2>&1; then
  echo "railway CLI not found. Install it first: https://docs.railway.app/develop/cli"
  exit 1
fi

# Try to run railway up which will detect Dockerfile or environment
echo "Running 'railway up' (this will build and deploy)"
railway up || {
  echo "railway up failed. Try 'railway init' then 'railway up' manually."
  exit 1
}

echo "Deployment finished. Use 'railway status' and 'railway logs' to inspect the deployment."
