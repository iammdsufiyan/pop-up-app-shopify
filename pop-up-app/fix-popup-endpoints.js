#!/usr/bin/env node

/**
 * Script to fix popup endpoint URLs to use the current development server port
 */

const fs = require('fs');
const path = require('path');

// Get current server port from terminal or environment
function getCurrentPort() {
    // Try to detect from common sources
    const possiblePorts = [
        process.env.PORT,
        process.env.FRONTEND_PORT,
        '54959', // Current port from terminal
        '3000'   // Default fallback
    ];
    
    return possiblePorts.find(port => port) || '3000';
}

// Files to update
const filesToUpdate = [
    'test-real-user-popup.html',
    'popup-test.html',
    'test-popup.html',
    'test-popup-connection.html',
    'test-real-popup.html'
];

const currentPort = getCurrentPort();
console.log(`🔧 Updating popup endpoints to use port ${currentPort}`);

filesToUpdate.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace hardcoded localhost ports with current port
        content = content.replace(
            /http:\/\/localhost:\d+\/(api\/)?subscribe/g,
            `http://localhost:${currentPort}/$1subscribe`
        );
        
        // Also add dynamic port detection
        const dynamicEndpointCode = `
            // Dynamic port detection
            const currentPort = window.location.port || '${currentPort}';
            const baseUrl = \`http://localhost:\${currentPort}\`;
            const apiEndpoints = [
                \`\${baseUrl}/api/subscribe\`,
                \`\${baseUrl}/subscribe\`,
                'http://localhost:${currentPort}/api/subscribe',
                'http://localhost:3000/api/subscribe'
            ];`;
        
        // Replace static endpoint arrays
        content = content.replace(
            /const apiEndpoints = \[[^\]]+\];/g,
            dynamicEndpointCode.trim()
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${filename}`);
    } else {
        console.log(`⚠️  File not found: ${filename}`);
    }
});

console.log('🎉 All popup endpoints updated!');