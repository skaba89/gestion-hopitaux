#!/bin/bash
cd /home/z/my-project/.next/standalone
export DATABASE_URL="postgresql://healthflow:healthflow_dev_2024@localhost:5432/healthflow"
export NODE_OPTIONS="--max-old-space-size=768"
export HOSTNAME=0.0.0.0
export PORT=3000

while true; do
  node server.js 2>&1
  echo "[$(date)] Server crashed, restarting in 3s..." >&2
  sleep 3
done
