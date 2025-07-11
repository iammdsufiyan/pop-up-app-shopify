#!/usr/bin/env node

/**
 * Graceful shutdown handler for Shopify Pop-up App
 * This script ensures proper cleanup when the development server is stopped
 */

const { spawn, exec } = require('child_process');
const path = require('path');

// Ports used by the application
const PORTS = [3000, 8080, 9292, 9293, 64999, 8002];

// Function to kill processes on specific ports
function killPort(port) {
    return new Promise((resolve) => {
        exec(`lsof -ti:${port}`, (error, stdout) => {
            if (error || !stdout.trim()) {
                console.log(`✅ Port ${port} is free`);
                resolve();
                return;
            }

            const pids = stdout.trim().split('\n');
            console.log(`⚠️  Killing processes on port ${port}: ${pids.join(', ')}`);
            
            pids.forEach(pid => {
                try {
                    process.kill(parseInt(pid), 'SIGTERM');
                } catch (e) {
                    // Process might already be dead
                }
            });

            // Give processes time to shut down gracefully
            setTimeout(() => {
                pids.forEach(pid => {
                    try {
                        process.kill(parseInt(pid), 'SIGKILL');
                    } catch (e) {
                        // Process might already be dead
                    }
                });
                resolve();
            }, 2000);
        });
    });
}

// Function to cleanup all ports
async function cleanup() {
    console.log('🧹 Starting graceful shutdown cleanup...');
    
    // Kill processes on all known ports
    for (const port of PORTS) {
        await killPort(port);
    }

    // Kill any remaining Shopify CLI processes
    exec('pkill -f "shopify app dev"', () => {});
    exec('pkill -f "remix vite:dev"', () => {});
    exec('pkill -f "vite"', () => {});

    console.log('✅ Cleanup completed');
}

// Handle different exit signals
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT (Ctrl+C)');
    await cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM');
    await cleanup();
    process.exit(0);
});

process.on('exit', () => {
    console.log('👋 Process exiting');
});

// If called directly, just run cleanup
if (require.main === module) {
    cleanup().then(() => {
        console.log('🎉 Manual cleanup completed');
        process.exit(0);
    });
}

module.exports = { cleanup, killPort };