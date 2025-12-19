import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],

  server: {
    host: '0.0.0.0', // Esto permite que el servidor escuche en todas las IP disponibles
    port: 5173, // Puerto por defecto de Vite (puedes cambiarlo si lo deseas)
  },

})

