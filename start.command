#!/bin/bash
cd "$(dirname "$0")"
echo "Starting DISTRICT 88 LTD Payment Tracker..."
npm run dev &
sleep 2
open http://localhost:5173
wait
