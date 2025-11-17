import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://192.168.1.50:8000", // BACKEND en tu LAN
        changeOrigin: true,
      },
      "/storage": {
        target: "http://192.168.1.50:8000", // para imágenes de Storage
        changeOrigin: true,
      },
    },
  },

});
