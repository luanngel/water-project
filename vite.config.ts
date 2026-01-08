import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "reyna-compressive-shaunna.ngrok-free.dev",
      "sistema.gestionrecursoshidricos.com"
    ],
    // proxy:{
    //   '/api':{
    //     target: 'http://localhost:4000/',
    //     changeOrigin : true,
    //     secure: false,
    //   }
    // }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
