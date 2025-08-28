#!/bin/bash

# Exit script immediately on a failed command
set -e

# Define directory paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="${SCRIPT_DIR}/react"
BACKEND_DIR="${SCRIPT_DIR}/flask"

# Start message
echo "Starting production deployment..."
echo "------------------------------"

# 1. Build the frontend
echo "Building frontend..."
cd "${FRONTEND_DIR}"
npm install
npm run build

# 2. Move the built files to the backend directory
echo "------------------------------"
echo "Moving built files to the backend directory..."
rm -rf "${BACKEND_DIR}/build"
mv "${FRONTEND_DIR}/build" "${BACKEND_DIR}/build"
echo "Build directory moved successfully."

# 3. Start the backend server
echo "------------------------------"
echo "Starting backend server..."
cd "${BACKEND_DIR}"

# Stop any existing Flask processes
echo "Stopping existing process..."
PROCESS_ID=$(ps aux | grep 'python app.py' | grep -v grep | awk '{print $2}')
if [ -n "$PROCESS_ID" ]; then
    kill "$PROCESS_ID"
    echo "Process ID: $PROCESS_ID has been stopped."
else
    echo "No running process found."
fi

# Start the backend server in the background
# Redirects standard output and error to a log file
nohup python app.py > output.log 2>&1 &

echo "New server started in the background."
echo "------------------------------"
echo "Deployment complete!"
echo "Access the app at: http://[your-server-ip-address]:5000"
