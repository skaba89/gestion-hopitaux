#!/bin/bash
while true; do
  if ! curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null | grep -q "200"; then
    # Server is down, restart it
    pkill -f "node server.js" 2>/dev/null
    sleep 2
    cd /home/z/my-project/.next/standalone
    export DATABASE_URL="postgresql://healthflow:healthflow_dev_2024@localhost:5432/healthflow"
    export NODE_OPTIONS="--max-old-space-size=1024"
    export HOSTNAME=0.0.0.0
    export PORT=3000
    node server.js >> /home/z/my-project/server.log 2>&1 &
    sleep 3
  fi
  sleep 5
done
