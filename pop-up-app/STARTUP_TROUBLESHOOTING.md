# 🚀 Startup & Troubleshooting Guide

## Quick Start Commands

### Option 1: Use the Smart Startup Script (Recommended)
```bash
./start-dev.sh
```
*This script automatically handles port conflicts and starts the server*

### Option 2: Manual Commands
```bash
# Clear any port conflicts first
lsof -ti:9293 | xargs kill -9

# Wait 2 seconds
sleep 2

# Start development server
npm run dev
```

## Common Issues & Solutions

### ❌ Error: `EADDRINUSE: address already in use 127.0.0.1:9293`

**Problem**: Another process is using port 9293

**Solution 1 - Use the startup script**:
```bash
./start-dev.sh
```

**Solution 2 - Manual fix**:
```bash
# Kill processes on port 9293
lsof -ti:9293 | xargs kill -9

# Wait a moment
sleep 2

# Restart the server
npm run dev
```

**Solution 3 - Find and kill specific process**:
```bash
# See what's using the port
lsof -i :9293

# Kill specific process (replace PID with actual process ID)
kill -9 <PID>
```

### ❌ Database Connection Issues

**Problem**: Database not accessible or corrupted

**Solution**:
```bash
# Reset database
npm run setup

# Clear test data
npm run clear-test-data
```

### ❌ API Endpoints Not Working

**Problem**: Popup can't connect to API

**Check current server status**:
```bash
# Test API connection
node test-api-connection.js
```

**Expected working ports**:
- Primary: `http://localhost:55454/api/subscribe`
- Backup: `http://localhost:3457/api/subscribe`

## Development Workflow

### 1. Start Development
```bash
# Option A: Smart script (handles conflicts)
./start-dev.sh

# Option B: Manual start
npm run dev
```

### 2. Test Real User Input
```bash
# Clear any test data first
npm run clear-test-data

# Open test file in browser
open test-real-user-popup.html
```

### 3. Check Database
```bash
# View current subscribers
npm run check-db
```

### 4. Stop Development
```bash
# Press Ctrl+C in terminal, or:
lsof -ti:9293 | xargs kill -9
```

## Port Information

The Shopify development server uses multiple ports:

- **9293**: Theme extension preview
- **55454**: Main Remix app (API endpoints)
- **3457**: GraphiQL interface
- **55450**: Proxy server

## Helpful Scripts

```bash
# Clear test data and show current database
npm run clear-test-data

# Test API connection
node test-api-connection.js

# Check database health
npm run check-db

# Setup/reset database
npm run setup
```

## Success Indicators

When everything is working correctly, you should see:

### Terminal Output:
```
✅ Port 9293 is available
🚀 Starting development server...
Preview URL: https://your-store.myshopify.com/...
GraphiQL URL: http://localhost:3457/graphiql
➜  Local:   http://localhost:55454/
```

### API Test Success:
```
✅ SUCCESS on port 55454: {
  success: true,
  message: 'Successfully subscribed!',
  subscriber_id: 'xxx'
}
```

### Real User Input Logs:
```
🚀 API Subscribe endpoint called!
📧 Received data: { email: 'user@example.com', phone: '+1234567890' }
✅ Successfully saved subscriber: xxx
```

## Next Steps After Startup

1. **Test the popup**: Open `test-real-user-popup.html`
2. **Enter real data**: Use your actual email and phone
3. **Verify storage**: Check the app dashboard or run `npm run check-db`
4. **Configure popup**: Visit `/app/popup-settings` in your Shopify app

---

💡 **Pro Tip**: Always use `./start-dev.sh` as it handles port conflicts automatically!