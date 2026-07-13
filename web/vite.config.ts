// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
          navigateFallback: "index.html",
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            }
          ]
        },
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon-180x180.png",
          "maskable-icon-512x512.png",
        ],
        manifest: {
          name: "HR Management System",
          short_name: "HRMS",
          description: "A comprehensive HR management system",
          theme_color: "#1976d2",
          background_color: "#ffffff",
          display: "standalone",
          scope: "./",
          start_url: "./",
          icons: [
            {
              src: "pwa-64x64.png",
              sizes: "64x64",
              type: "image/png",
            },
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: "module",
        },
      }),
    ],
    
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    
    build: {
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
          },
        },
      },
    },

    optimizeDeps: {
      exclude: ['pdfjs-dist'],
    },

    assetsInclude: ['**/*.worker.js'],
    
    server: isDev
      ? {
          https: (() => {
            try {
              return {
                key: fs.readFileSync("./.cert/key.pem"),
                cert: fs.readFileSync("./.cert/cert.pem"),
              };
            } catch (error) {
              console.warn("SSL certificates not found, running without HTTPS");
              return undefined;
            }
          })(),
          host: "localhost",
          port: 5173,
          proxy: {
            '/api': {
              target: process.env.VITE_BACKEND_URL || 'https://hr-managementsystem.runasp.net',
              changeOrigin: true,
              secure: false,
            },
            '/hubs': {
              target: 'https://hr-managementsystem.runasp.net',
              changeOrigin: true,
              secure: false,
              ws: true,
            },
          },
        }
      : undefined,
  };
});
