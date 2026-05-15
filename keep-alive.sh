#!/bin/bash
# HealthFlow Guinea - Auto-restart server script
cd /home/z/my-project
export DATABASE_URL="postgresql://healthflow:healthflow_dev_2024@localhost:5432/healthflow"
export NODE_OPTIONS="--max-old-space-size=768"
export HOSTNAME=0.0.0.0
export PORT=3000

echo "[$(date)] Starting HealthFlow server..."
while true; do
  node node_modules/.bin/next dev -p 3000 2>&1
  EXIT=$?
  echo "[$(date)] Server exited with code $EXIT. Restarting in 2s..." >&2
  sleep 2
done
