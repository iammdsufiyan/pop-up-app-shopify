#!/usr/bin/env node

/**
 * SMART PORT UPDATER - Automatic Port Detection & Update
 * This script automatically detects the current development server port
 * and updates the popup extension without disrupting the running server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the popup extension file
const POPUP_FILE = path.join(__dirname, 'extensions/discount-popup/blocks/popup.liquid');

// Function to find the current development server port from running processes
function findCurrentDevPort() {
  try {
    console.log('🔍 Scanning for active development server...');
    
    // Method 1: Check for Remix/Vite server (most reliable)
    try {
      const processes = execSync('ps aux | grep -E "(remix|vite|shopify)" | grep -v grep', { encoding: 'utf8' });
      console.log('📋 Found development processes:', processes.split('\n').filter(line => line.trim()).length);
    } catch (e) {
      // Continue to other methods
    }
    
    // Method 2: Check network connections for typical dev server ports
    try {
      const netstat = execSync('netstat -an | grep LISTEN | grep tcp4', { encoding: 'utf8' });
      const lines = netstat.split('\n');
      
      for (const line of lines) {
        // Look for localhost ports in typical dev server range
        const match = line.match(/127\.0\.0\.1[:\.](\d+)/);
        if (match) {
          const port = parseInt(match[1]);
          // Check if this port responds to our API
          if (port > 50000 && port < 70000) {
            if (testApiEndpoint(port)) {
              console.log(`✅ Found working dev server on port: ${port}`);
              return port;
            }
          }
        }
      }
    } catch (e) {
      console.log('⚠️ Netstat method failed, trying alternative...');
    }
    
    // Method 3: Check lsof for node processes
    try {
      const lsof = execSync('lsof -i -P -n | grep LISTEN | grep node', { encoding: 'utf8' });
      const lines = lsof.split('\n');
      
      for (const line of lines) {
        const match = line.match(/:(\d+) \(LISTEN\)/);
        if (match) {
          const port = parseInt(match[1]);
          if (port > 50000 && port < 70000) {
            if (testApiEndpoint(port)) {
              console.log(`✅ Found working dev server on port: ${port}`);
              return port;
            }
          }
        }
      }
    } catch (e) {
      console.log('⚠️ lsof method failed, trying port scanning...');
    }
    
    // Method 4: Try common port ranges
    const commonPorts = [63462, 63457, 62396, 54936, 54470, 51681, 65069];
    for (const port of commonPorts) {
      if (testApiEndpoint(port)) {
        console.log(`✅ Found working dev server on port: ${port}`);
        return port;
      }
    }
    
    return null;
  } catch (error) {
    console.log('⚠️ Error detecting port:', error.message);
    return null;
  }
}

// Function to test if a port has our API endpoint
function testApiEndpoint(port) {
  try {
    // Test with a quick curl to see if our API responds
    execSync(`curl -s --connect-timeout 1 --max-time 2 http://localhost:${port}/api/popup-settings?shopDomain=test > /dev/null 2>&1`);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to update the popup extension with the new port
function updatePopupExtension(newPort) {
  if (!fs.existsSync(POPUP_FILE)) {
    console.error('❌ Popup extension file not found:', POPUP_FILE);
    return false;
  }
  
  let content = fs.readFileSync(POPUP_FILE, 'utf8');
  
  // Find all current ports in the file
  const portMatches = content.match(/return \d+;/g) || [];
  const currentPorts = portMatches.map(match => match.match(/\d+/)[0]);
  
  // Update the getCurrentDevPort function
  content = content.replace(
    /function getCurrentDevPort\(\) \{[\s\S]*?return \d+;[\s\S]*?\}/,
    `function getCurrentDevPort() {
      // Auto-updated by smart-port-updater.js
      return ${newPort};
    }`
  );
  
  // Update hardcoded port references
  content = content.replace(/const currentDevPort = \d+;/, `const currentDevPort = ${newPort};`);
  
  // Update localhost URLs
  content = content.replace(/http:\/\/localhost:\d+\//g, `http://localhost:${newPort}/`);
  
  // Update fallback port arrays
  content = content.replace(
    /'http:\/\/localhost:\d+\/api\/popup-settings',/g,
    `'http://localhost:${newPort}/api/popup-settings',`
  );
  content = content.replace(
    /'http:\/\/localhost:\d+\/api\/analytics',/g,
    `'http://localhost:${newPort}/api/analytics',`
  );
  content = content.replace(
    /'http:\/\/localhost:\d+\/api\/subscribe',/g,
    `'http://localhost:${newPort}/api/subscribe',`
  );
  
  // Write the updated content back
  fs.writeFileSync(POPUP_FILE, content, 'utf8');
  
  console.log(`✅ Updated popup extension:`);
  console.log(`   Previous ports: ${currentPorts.join(', ')}`);
  console.log(`   New port: ${newPort}`);
  console.log(`   File: ${path.relative(process.cwd(), POPUP_FILE)}`);
  
  return true;
}

// Function to wait for server to be ready
async function waitForServer(maxAttempts = 30) {
  console.log('⏳ Waiting for development server to be ready...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const port = findCurrentDevPort();
    if (port) {
      return port;
    }
    
    console.log(`   Attempt ${attempt}/${maxAttempts} - Server not ready yet...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  }
  
  return null;
}

// Main function
async function main() {
  console.log('🚀 SMART PORT UPDATER - Auto-detecting development server...');
  console.log('📅 ' + new Date().toLocaleString());
  
  // Wait for server to be ready
  const currentPort = await waitForServer();
  
  if (!currentPort) {
    console.log('❌ Could not find active development server');
    console.log('💡 Make sure your development server is running and try again');
    process.exit(1);
  }
  
  console.log(`🎯 Detected development server on port: ${currentPort}`);
  
  if (updatePopupExtension(currentPort)) {
    console.log('🎉 SUCCESS! Popup extension automatically updated');
    console.log('📱 Your popup will now connect to the correct server');
    console.log('');
    console.log('✨ This update happened automatically - no manual intervention needed!');
  } else {
    console.log('❌ Failed to update popup extension');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { findCurrentDevPort, updatePopupExtension, waitForServer };