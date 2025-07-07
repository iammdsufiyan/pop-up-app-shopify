import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals({ nativeFetch: true });

// 🚀 OPTIMIZATION: Environment variable handling
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

// 🚀 OPTIMIZATION: Enhanced HMR configuration
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

export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: {
      preflightContinue: true,
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
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
        v3_singleFetch: true, // 🚀 OPTIMIZATION: Enable single fetch
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    // 🚀 OPTIMIZATION: Build optimizations
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // 🚀 OPTIMIZATION: Code splitting for better caching
          vendor: ['react', 'react-dom'],
          shopify: ['@shopify/polaris', '@shopify/app-bridge-react'],
          remix: ['@remix-run/react', '@remix-run/node'],
        },
      },
    },
  },
  optimizeDeps: {
    // 🚀 OPTIMIZATION: Pre-bundle dependencies
    include: [
      "@shopify/app-bridge-react",
      "@shopify/polaris",
      "react",
      "react-dom",
      "@remix-run/react",
    ],
    exclude: ["@shopify/shopify-app-remix"], // Exclude server-only packages
  },
  define: {
    // 🚀 OPTIMIZATION: Environment variables for client
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
  },
  esbuild: {
    // 🚀 OPTIMIZATION: Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  css: {
    // 🚀 OPTIMIZATION: CSS optimizations
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
}) satisfies UserConfig;