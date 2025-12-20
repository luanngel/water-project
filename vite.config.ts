import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "reyna-compressive-shaunna.ngrok-free.dev",
    ],
    port: 5173,
  },
});
