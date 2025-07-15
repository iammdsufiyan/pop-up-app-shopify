#!/usr/bin/env node

/**
 * AUTO PORT UPDATER - Permanent Solution for Port Changes
 * This script automatically updates the popup extension with the current development server port
 * Run this whenever the development server starts with a new port
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to kill processes on conflicting ports
function killPortConflicts() {
  const conflictPorts = [9293, 3457, 54936, 54470, 51681];
  
  console.log('🧹 Cleaning up port conflicts...');
  
  for (const port of conflictPorts) {
    try {
      const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', timeout: 2000 });
      if (result.trim()) {
        console.log(`🔧 Killing process on port ${port}...`);
        execSync(`lsof -ti:${port} | xargs kill -9`, { timeout: 2000 });
        console.log(`✅ Port ${port} cleared`);
      }
    } catch (error) {
      // Port not in use or already cleared, continue
    }
  }
}

// Path to the popup extension file
const POPUP_FILE = path.join(__dirname, 'extensions/discount-popup/blocks/popup.liquid');

// Function to find the current development server port
function findCurrentPort() {
  try {
    // Check for running node processes that might be our dev server
    const processes = execSync('lsof -i -P -n | grep LISTEN | grep node', { encoding: 'utf8' });
    const lines = processes.split('\n');
    
    // Look for ports in the 50000-60000 range (typical Shopify dev server range)
    for (const line of lines) {
      const match = line.match(/:(\d+) \(LISTEN\)/);
      if (match) {
        const port = parseInt(match[1]);
        if (port >= 50000 && port <= 60000) {
          console.log(`🔍 Found potential dev server on port: ${port}`);
          return port;
        }
      }
    }
    
    // Fallback: check common ports
    const commonPorts = [54936, 54470, 51681, 65069, 8888, 3000];
    for (const port of commonPorts) {
      try {
        execSync(`curl -s http://localhost:${port}/api/popup-settings?shopDomain=test > /dev/null`, { timeout: 1000 });
        console.log(`✅ Found working dev server on port: ${port}`);
        return port;
      } catch (error) {
        // Port not responding, continue
      }
    }
    
    return null;
  } catch (error) {
    console.log('⚠️ Could not detect port automatically');
    return null;
  }
}

// Function to update the popup extension with the new port
function updatePopupExtension(newPort) {
  if (!fs.existsSync(POPUP_FILE)) {
    console.error('❌ Popup extension file not found:', POPUP_FILE);
    return false;
  }
  
  let content = fs.readFileSync(POPUP_FILE, 'utf8');
  
  // Update all localhost port references
  const portRegex = /http:\/\/localhost:(\d+)\//g;
  const oldPorts = [];
  let match;
  
  while ((match = portRegex.exec(content)) !== null) {
    if (!oldPorts.includes(match[1])) {
      oldPorts.push(match[1]);
    }
  }
  
  // Replace all old ports with the new port
  content = content.replace(/http:\/\/localhost:\d+\//g, `http://localhost:${newPort}/`);
  
  // Write the updated content back
  fs.writeFileSync(POPUP_FILE, content, 'utf8');
  
  console.log(`✅ Updated popup extension:`);
  console.log(`   Old ports: ${oldPorts.join(', ')}`);
  console.log(`   New port: ${newPort}`);
  console.log(`   File: ${POPUP_FILE}`);
  
  return true;
}

// Main function
function main() {
  console.log('🚀 AUTO PORT UPDATER - Finding current development server...');
  
  // First, clean up any port conflicts
  killPortConflicts();
  
  const currentPort = findCurrentPort();
  
  if (!currentPort) {
    console.log('❌ Could not find active development server port');
    console.log('💡 Make sure your development server is running with: npm run dev');
    process.exit(1);
  }
  
  console.log(`🎯 Current development server port: ${currentPort}`);
  
  if (updatePopupExtension(currentPort)) {
    console.log('🎉 SUCCESS! Popup extension updated with current port');
    console.log('📝 The popup will now connect to the correct server automatically');
    console.log('');
    console.log('💡 TIP: Add this to your workflow:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Run this script: node auto-port-updater.js');
    console.log('   3. Your popup will always work!');
  } else {
    console.log('❌ Failed to update popup extension');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { findCurrentPort, updatePopupExtension };