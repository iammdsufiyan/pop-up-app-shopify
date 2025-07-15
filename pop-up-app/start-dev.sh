#!/bin/bash

echo "🔧 Starting Shopify Pop-up App Development Server..."
echo "🔍 Running comprehensive port cleanup..."

# Run the comprehensive port cleanup script
./cleanup-ports.sh

echo ""
echo "⚙️ Auto-configuring ports and database connection..."
node auto-port-config.js

echo ""
echo "🚀 Starting development server..."
npm run dev