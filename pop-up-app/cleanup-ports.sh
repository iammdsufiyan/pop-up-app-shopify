#!/bin/bash

echo "🔧 Comprehensive Port Cleanup for Shopify Pop-up App"
echo "=================================================="

# Define all ports used by Shopify apps
PORTS=(
    3000    # Default Vite dev server
    8080    # Alternative dev server
    9292    # Shopify CLI backend
    9293    # Shopify CLI frontend
    64999   # HMR port from vite config
    8002    # Frontend port fallback
)

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "⚠️  Port $port is in use. Killing processes..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        # Double check if port is still in use
        if lsof -ti:$port > /dev/null 2>&1; then
            echo "🔴 Failed to free port $port, trying SIGTERM..."
            lsof -ti:$port | xargs kill -15 2>/dev/null || true
            sleep 2
        fi
        echo "✅ Port $port cleared"
    else
        echo "✅ Port $port is available"
    fi
}

# Kill processes on all known ports
for port in "${PORTS[@]}"; do
    kill_port $port
done

# Kill any remaining Shopify CLI processes
echo ""
echo "🔍 Cleaning up Shopify CLI processes..."
pkill -f "shopify app dev" 2>/dev/null || true
pkill -f "remix vite:dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait for processes to fully terminate
echo "⏳ Waiting for processes to terminate..."
sleep 3

# Final verification
echo ""
echo "🔍 Final port status check:"
for port in "${PORTS[@]}"; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "🔴 Port $port still in use!"
    else
        echo "✅ Port $port is free"
    fi
done

echo ""
echo "🎉 Port cleanup completed!"
echo "You can now start your development server safely."