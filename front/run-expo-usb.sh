#!/usr/bin/env bash
set -euo pipefail

# run-expo-usb.sh
# Usage: ./run-expo-usb.sh
# Installe adb si nécessaire (via apt), attend qu'un appareil Android soit connecté en USB,
# configure adb reverse pour exposer le serveur Expo, puis lance `npm run android`.

FRONT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$FRONT_DIR"

echo "[run-expo-usb] Working dir: $FRONT_DIR"

# Function to print error and exit
err() { echo "[run-expo-usb] ERROR: $*" >&2; exit 1; }

# Check for node/npm
if ! command -v npm >/dev/null 2>&1; then
  err "npm not found. Install Node.js / npm first."
fi

# Check for adb and try to install via apt if missing
if ! command -v adb >/dev/null 2>&1; then
  echo "[run-expo-usb] adb not found on PATH. Attempting to install via apt (requires sudo)..."
  if command -v apt-get >/dev/null 2>&1; then
    echo "[run-expo-usb] Running: sudo apt-get update && sudo apt-get install -y adb"
    sudo apt-get update && sudo apt-get install -y adb
  else
    err "Package manager apt-get not found. Please install adb manually (platform-tools)."
  fi
fi

# Start adb server
echo "[run-expo-usb] Starting adb server..."
adb start-server || true

# Wait for device to appear
echo "[run-expo-usb] Waiting for an Android device (enable USB debugging on the phone)..."
DEVICE_ID=""
for i in {1..60}; do
  # List devices, pick first device with status 'device'
  DEVICE_ID=$(adb devices | awk 'NR>1 && $2=="device" {print $1; exit}') || true
  if [ -n "$DEVICE_ID" ]; then
    echo "\n[run-expo-usb] Device detected: $DEVICE_ID"
    break
  fi
  echo -n "."
  sleep 1
done

if [ -z "$DEVICE_ID" ]; then
  echo "\n[run-expo-usb] No device detected. Current adb devices output:"
  adb devices || true
  err "No Android device detected. Plug the device, enable USB debugging and accept the RSA fingerprint, then run this script again."
fi

# Try reverse ports (failures are non-fatal)
echo "[run-expo-usb] Reversing ports to device..."
adb reverse tcp:8082 tcp:8082 || echo "[run-expo-usb] adb reverse tcp:8082 failed (non-fatal)"
adb reverse tcp:19000 tcp:19000 || echo "[run-expo-usb] adb reverse tcp:19000 failed (non-fatal)"
adb reverse tcp:19001 tcp:19001 || echo "[run-expo-usb] adb reverse tcp:19001 failed (non-fatal)"

# Ensure environment port is set for Expo
export EXPO_DEVTOOLS_LISTEN_ADDRESS="localhost"

# Start Expo and ask it to open on the device
echo "[run-expo-usb] Launching Expo (this will block). If the Expo devtools ask, choose 'Run on Android device/emulator' or allow it to open via adb."

# Use npm script defined in package.json
npm run android

# end
