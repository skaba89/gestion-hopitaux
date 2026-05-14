#!/bin/bash
cd /home/z/my-project
while true; do
  PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js 2>&1
  sleep 2
done
