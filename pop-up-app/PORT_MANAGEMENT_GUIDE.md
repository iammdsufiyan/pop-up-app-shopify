# Port Management & Conflict Resolution Guide

This guide provides a comprehensive solution to resolve the recurring `EADDRINUSE` port conflict errors in your Shopify Pop-up App.

## 🚨 Problem

The error `Error: listen EADDRINUSE: address already in use 127.0.0.1:9293` occurs when:
- Processes don't properly release ports when stopped
- Multiple instances of the same service try to start
- Previous development sessions leave zombie processes running

## ✅ Solution Overview

We've implemented a multi-layered approach to permanently solve this issue:

1. **Comprehensive Port Cleanup Script** - Cleans all Shopify app ports
2. **Graceful Shutdown Handler** - Ensures proper cleanup on exit
3. **Enhanced Vite Configuration** - Auto-detects and resolves port conflicts
4. **New NPM Scripts** - Easy-to-use commands for different scenarios

## 🛠️ New Tools & Scripts

### 1. Cleanup Scripts

#### `cleanup-ports.sh`
Comprehensive script that cleans all ports used by Shopify apps:
- Ports: 3000, 8080, 9292, 9293, 64999, 8002
- Kills zombie processes
- Provides detailed feedback

#### `graceful-shutdown.js`
Node.js script for graceful shutdown handling:
- Handles SIGINT (Ctrl+C) and SIGTERM signals
- Ensures proper cleanup before exit
- Can be run manually for cleanup

### 2. Enhanced Configuration

#### `vite.config.enhanced.ts`
Enhanced Vite configuration with:
- Automatic port conflict detection
- Dynamic port allocation
- Pre-startup cleanup
- Better error handling

### 3. New NPM Scripts

```json
{
  "dev:safe": "./start-dev.sh",           // Safe development start with cleanup
  "dev:clean": "./cleanup-ports.sh && npm run dev",  // Clean then start
  "cleanup": "node graceful-shutdown.js", // Manual cleanup
  "cleanup:ports": "./cleanup-ports.sh"   // Port-specific cleanup
}
```

## 🚀 How to Use

### Option 1: Safe Development Start (Recommended)
```bash
npm run dev:safe
```
This runs the enhanced `start-dev.sh` script that:
1. Runs comprehensive port cleanup
2. Starts the development server
3. Provides detailed feedback

### Option 2: Clean Start
```bash
npm run dev:clean
```
This cleans ports and immediately starts development.

### Option 3: Manual Cleanup
If you encounter issues, run manual cleanup:
```bash
npm run cleanup
# or
npm run cleanup:ports
```

### Option 4: Enhanced Vite Config (Optional)
To use the enhanced Vite configuration with automatic port detection:
```bash
# Backup current config
mv vite.config.ts vite.config.backup.ts

# Use enhanced config
mv vite.config.enhanced.ts vite.config.ts

# Start development
npm run dev:safe
```

## 🔧 Troubleshooting

### If ports are still in use:
1. Run manual cleanup: `npm run cleanup`
2. Check for running processes: `lsof -i :9293`
3. Force kill if needed: `sudo lsof -ti:9293 | xargs kill -9`

### If cleanup scripts don't work:
1. Make sure scripts are executable: `chmod +x *.sh`
2. Run with explicit bash: `bash cleanup-ports.sh`

### For persistent issues:
1. Restart your terminal
2. Restart VS Code
3. Reboot your system (last resort)

## 📋 Best Practices

### Starting Development
1. Always use `npm run dev:safe` instead of `npm run dev`
2. Wait for cleanup to complete before starting
3. Check the output for any warnings

### Stopping Development
1. Use Ctrl+C to stop (triggers graceful shutdown)
2. Wait for cleanup messages
3. If hanging, use `npm run cleanup`

### Regular Maintenance
1. Run `npm run cleanup` if you notice slowdowns
2. Restart development server daily for best performance
3. Keep terminal output visible to catch issues early

## 🎯 Expected Behavior

### Successful Start
```
🔧 Comprehensive Port Cleanup for Shopify Pop-up App
==================================================
✅ Port 3000 is available
✅ Port 8080 is available
✅ Port 9292 is available
✅ Port 9293 is available
✅ Port 64999 is available
✅ Port 8002 is available

🔍 Cleaning up Shopify CLI processes...
⏳ Waiting for processes to terminate...

🔍 Final port status check:
✅ Port 3000 is free
✅ Port 8080 is free
✅ Port 9292 is free
✅ Port 9293 is free
✅ Port 64999 is free
✅ Port 8002 is free

🎉 Port cleanup completed!
You can now start your development server safely.

🚀 Starting development server...
```

### When Ports Are Cleaned
```
⚠️  Port 9293 is in use. Killing processes...
✅ Port 9293 cleared
```

## 🔄 Migration from Old Setup

If you were using the old `start-dev.sh`:
1. The new version is already updated
2. It now uses the comprehensive cleanup script
3. No changes needed to your workflow
4. Just use `npm run dev:safe` as usual

## 📞 Support

If you continue to experience port conflicts after implementing this solution:
1. Check that all scripts are executable
2. Verify no other applications are using these ports
3. Consider using the enhanced Vite configuration
4. Restart your development environment

This solution should permanently resolve the `EADDRINUSE` error and provide a smooth development experience.