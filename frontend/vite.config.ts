import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),  tailwindcss()],
  css: {
    postcss: './postcss.config.js',
  },
   server: {
    host: true, // 👈 обязательно для Docker
    port: 5173
  },
    build: {
      sourcemap: true,
      minify: false,
      target: 'esnext', // отключаем лишние преобразования
      rollupOptions: {
        output: {
          // Отключаем сокращение имён при бандлинге
          manualChunks: undefined
        }
      },
    }
})
