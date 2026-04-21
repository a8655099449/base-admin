import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: 'src/pages',
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: Number(env.VITE_SERVER_PORT) || 5173,
      proxy: {
        '^/api': {
          target: env.VITE_SERVER_TARGET,
          changeOrigin: true,
        },
        '^/map-api': {
          target: 'https://apis.map.qq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/map-api\//, ''),
          secure: false,
        },
        '^/download': {
          target: 'https://lpark-cos-uat.ljzpark.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/download/, ''),
          secure: false,
        },
      },
    },
  }
})
