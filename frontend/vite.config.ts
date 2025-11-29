import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  base: mode === "production" ? "/frontend/" : "/",

  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://192.168.1.50:8000",
        changeOrigin: true,
      },
      "/storage": {
        target: "http://192.168.1.50:8000",
        changeOrigin: true,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
}));
