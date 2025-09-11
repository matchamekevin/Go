#!/usr/bin/env bash
# Helper script to guide deployment to Render
set -e
here="$(cd "$(dirname "$0")" && pwd)"

echo "This script helps you prepare deployment to Render.com for the Go backend."
echo
echo "What this script does"
echo " - shows a sample render.yaml you can use for GitHub auto deploys"
echo " - prints step-by-step manual instructions (no credentials are stored or used)"
echo
echo "Prerequisites"
echo " - A Render account connected to your GitHub account"
echo " - Your repo pushed to GitHub (this repository)"
echo " - Environment variables added in the Render dashboard (see README)"
echo "Sample render.yaml is available at: $here/render.yaml"
echo
echo "Manual quick steps to deploy on Render (recommended)"
echo "1) On render.com -> New -> Web Service"
echo "2) Choose 'Connect a repository' and select this repo."
echo "3) Choose branch: dev2 (or main) and Environment: Docker"
echo "4) Dockerfile path: /back/Dockerfile (or root Dockerfile)"
echo "5) Set Start Command: npm start (or node dist/server.js)"
echo "6) Add Environment Variables (copy from .env or use Render Dashboard):"
echo "   - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, etc."
echo "7) (Optional) Create a Managed Postgres on Render and link it to the service."
echo "8) Deploy. Monitor logs on Render UI."
echo
echo "Tip: you can add the included render.yaml to the repo root/back and Render will create resources automatically when you create the service via the UI. Edit the file to add env var names (do not put secrets in the file)."
echo
echo "If you want, install the Render CLI and run:\n  npm install -g @render/cli\n  render login\n  render services create --name gosotral-api --type web --env docker --repo <owner/repo> --branch dev2 --dockerfile back/Dockerfile"

echo "Done. Open the README for detailed docs: back/README.md"

exit 0
