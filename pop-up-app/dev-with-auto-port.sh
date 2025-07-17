#!/bin/bash

# Enhanced Development Script with Automatic Port Detection
# This script starts the development server and automatically updates the popup extension

echo "🚀 Starting Enhanced Development Server with Auto Port Detection..."
echo "📅 $(date)"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up processes..."
    # Kill any background jobs
    jobs -p | xargs -r kill 2>/dev/null
    exit 0
}

# Set up cleanup trap
trap cleanup SIGINT SIGTERM EXIT

# Step 1: Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
./cleanup-ports.sh 2>/dev/null || true

# Step 2: Start the development server in background
echo "🔄 Starting Shopify development server..."
npm run dev &
DEV_PID=$!

# Step 3: Wait a moment for server to initialize
echo "⏳ Waiting for server to initialize..."
sleep 5

# Step 4: Run the smart port updater in background
echo "🔧 Running automatic port detection and update..."
(
    sleep 10  # Give server more time to fully start
    node smart-port-updater.cjs
    if [ $? -eq 0 ]; then
        echo "✅ Port auto-update completed successfully!"
    else
        echo "⚠️ Port auto-update failed, but server is still running"
    fi
) &

# Step 5: Keep the main process running and monitor the dev server
echo "🎯 Development server is starting..."
echo "📱 Popup extension will be automatically updated with the correct port"
echo ""
echo "💡 Once you see 'SUCCESS! Popup extension automatically updated', your popup will work!"
echo ""
echo "Press Ctrl+C to stop the development server"
echo ""

# Wait for the development server process
wait $DEV_PID