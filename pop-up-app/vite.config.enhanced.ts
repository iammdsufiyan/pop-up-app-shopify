import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { exec } from "child_process";
import { promisify } from "util";

installGlobals({ nativeFetch: true });

const execAsync = promisify(exec);

// Function to check if a port is in use
async function isPortInUse(port: number): Promise<boolean> {
  try {
    await execAsync(`lsof -i:${port}`);
    return true;
  } catch {
    return false;
  }
}

// Function to find an available port
async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (!(await isPortInUse(port))) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Function to cleanup ports before starting
async function cleanupPorts() {
  const ports = [3000, 8080, 9292, 9293, 64999, 8002];
  console.log('🧹 Cleaning up ports before starting...');
  
  for (const port of ports) {
    try {
      if (await isPortInUse(port)) {
        console.log(`⚠️  Port ${port} is in use, attempting cleanup...`);
        await execAsync(`lsof -ti:${port} | xargs kill -9`).catch(() => {});
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the remix server. The CLI will eventually
// stop passing in HOST, so we can remove this workaround after the next major release.
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost")
  .hostname;

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT!) || 8002,
    clientPort: 443,
  };
}

export default defineConfig(async () => {
  // Cleanup ports before starting
  await cleanupPorts();
  
  // Find available port
  const defaultPort = Number(process.env.PORT || 3000);
  let serverPort = defaultPort;
  
  try {
    if (await isPortInUse(defaultPort)) {
      console.log(`⚠️  Port ${defaultPort} is in use, finding alternative...`);
      serverPort = await findAvailablePort(defaultPort);
      console.log(`✅ Using port ${serverPort} instead`);
    }
  } catch (error) {
    console.warn('Port detection failed, using default port');
  }

  return {
    server: {
      allowedHosts: [host],
      cors: {
        preflightContinue: true,
      },
      port: serverPort,
      hmr: hmrConfig,
      fs: {
        // See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
        allow: ["app", "node_modules"],
      },
    },
    plugins: [
      remix({
        ignoredRouteFiles: ["**/.*"],
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
          v3_singleFetch: false,
          v3_routeConfig: true,
        },
      }),
      tsconfigPaths(),
    ],
    build: {
      assetsInlineLimit: 0,
    },
    optimizeDeps: {
      include: ["@shopify/app-bridge-react", "@shopify/polaris"],
    },
  } satisfies UserConfig;
});