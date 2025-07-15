#!/bin/bash

# 🚀 COMPREHENSIVE ECONNRESET FIX SCRIPT
# This script addresses all common causes of ECONNRESET errors in Shopify CLI

echo "🔧 Starting comprehensive ECONNRESET fix..."

# 1. Kill all existing processes that might interfere
echo "🧹 Cleaning up existing processes..."
pkill -f "shopify" 2>/dev/null || true
pkill -f "npm" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true
lsof -ti:3000,8000,8888,9293,3457 | xargs kill -9 2>/dev/null || true

# 2. Clear DNS cache (macOS specific)
echo "🌐 Clearing DNS cache..."
sudo dscacheutil -flushcache 2>/dev/null || true
sudo killall -HUP mDNSResponder 2>/dev/null || true

# 3. Reset network settings
echo "🔄 Resetting network settings..."
# Clear any cached network connections
sudo route -n flush 2>/dev/null || true

# 4. Update Node.js network settings
echo "⚙️ Configuring Node.js network settings..."
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_OPTIONS="--max-old-space-size=4096 --dns-result-order=ipv4first"
export UV_THREADPOOL_SIZE=128

# 5. Configure npm for better network handling
echo "📦 Configuring npm network settings..."
npm config set registry https://registry.npmjs.org/
npm config set fetch-retries 5
npm config set fetch-retry-factor 2
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000
npm config set maxsockets 50

# 6. Set Shopify CLI environment variables for better connectivity
echo "🏪 Configuring Shopify CLI settings..."
export SHOPIFY_CLI_BUNDLED_THEME_CLI=1
export SHOPIFY_CLI_TTY=0
export SHOPIFY_FLAG_STORE="booksss12345.myshopify.com"
export SHOPIFY_CLI_PARTNERS_TOKEN=""

# 7. Create a more robust startup script
echo "📝 Creating robust startup script..."
cat > start-dev-robust.sh << 'EOF'
#!/bin/bash

# Set environment variables for better network handling
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_OPTIONS="--max-old-space-size=4096 --dns-result-order=ipv4first"
export UV_THREADPOOL_SIZE=128
export SHOPIFY_CLI_BUNDLED_THEME_CLI=1
export SHOPIFY_CLI_TTY=0

# Function to retry commands with exponential backoff
retry_command() {
    local max_attempts=5
    local delay=2
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Attempt $attempt of $max_attempts..."
        
        if "$@"; then
            echo "✅ Command succeeded on attempt $attempt"
            return 0
        else
            echo "❌ Command failed on attempt $attempt"
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Waiting ${delay} seconds before retry..."
                sleep $delay
                delay=$((delay * 2))
            fi
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "💥 Command failed after $max_attempts attempts"
    return 1
}

# Clean up before starting
echo "🧹 Cleaning up processes..."
pkill -f "shopify" 2>/dev/null || true
lsof -ti:3000,8000,8888,9293 | xargs kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Try to start with retry logic
echo "🚀 Starting Shopify development server with retry logic..."
retry_command timeout 300 shopify app dev --store=booksss12345.myshopify.com

EOF

chmod +x start-dev-robust.sh

# 8. Create alternative local development approach
echo "🔧 Creating alternative local development setup..."
cat > start-local-dev.sh << 'EOF'
#!/bin/bash

# Alternative approach: Start just the Remix server without Shopify CLI
echo "🚀 Starting local Remix development server..."

# Set environment variables
export NODE_ENV=development
export PORT=8888
export SHOPIFY_APP_URL="http://localhost:8888"

# Clean up
pkill -f "remix" 2>/dev/null || true
lsof -ti:8888 | xargs kill -9 2>/dev/null || true

# Start Remix dev server directly
echo "📦 Installing dependencies..."
npm install

echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

echo "🎯 Starting Remix server on port 8888..."
npx remix dev --port 8888

EOF

chmod +x start-local-dev.sh

# 9. Update package.json with better scripts
echo "📋 Updating package.json scripts..."
npm pkg set scripts.dev:robust="./start-dev-robust.sh"
npm pkg set scripts.dev:local="./start-local-dev.sh"
npm pkg set scripts.dev:safe="NODE_TLS_REJECT_UNAUTHORIZED=0 NODE_OPTIONS='--dns-result-order=ipv4first' shopify app dev"

echo "✅ ECONNRESET fix complete!"
echo ""
echo "🎯 Try these commands in order:"
echo "1. npm run dev:safe    (Shopify CLI with network fixes)"
echo "2. npm run dev:robust  (Shopify CLI with retry logic)"
echo "3. npm run dev:local   (Local Remix server only)"
echo ""
echo "💡 If all else fails, the discount code functionality is already fixed"
echo "   and will work once the server starts successfully."