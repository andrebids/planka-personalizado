import { defineConfig } from "vite";
import commonjs from "vite-plugin-commonjs";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
// eslint-disable-next-line import/no-unresolved
import browserslistToEsbuild from "browserslist-to-esbuild";

// Função para obter o target do servidor de forma dinâmica
function getServerTarget() {
  // 1. Primeiro tenta usar variável de ambiente
  if (process.env.PLANKA_SERVER_HOST) {
    return process.env.PLANKA_SERVER_HOST;
  }

  // 2. Tenta detectar automaticamente o nome do container
  const containerName = process.env.HOSTNAME || 'localhost';
  // Melhor detecção do Docker: verificar se HOSTNAME é um hash (ID do container) ou se contém nomes específicos
  const isDocker = /^[a-f0-9]{12}$/.test(containerName) ||
                   containerName.includes('planka-client') ||
                   containerName.includes('boards-planka-client') ||
                   containerName !== 'localhost';

  if (isDocker) {
    // Se estamos no Docker, usa o nome padrão do container do servidor
    return "http://boards-planka-server-1:1337";
  }

  // 3. Fallback para desenvolvimento local
  return "http://localhost:1337";
}

const serverTarget = getServerTarget();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    commonjs(),
    nodePolyfills({
      include: ["fs", "path", "process", "url"]
    }),
    react(),
    svgr()
  ],
  resolve: {
    alias: {
      "source-map-js": "source-map"
    }
  },
  server: {
    port: 3000,
    open: true,
    host: "0.0.0.0",
    watch: {
      usePolling: true,
      interval: 1000
    },
    proxy: {
      "/attachments": {
        target: serverTarget,
        changeOrigin: true,
        secure: false
      },
      "/background-images": {
        target: serverTarget,
        changeOrigin: true,
        secure: false
      },
      "/user-avatars": {
        target: serverTarget,
        changeOrigin: true,
        secure: false
      },
      "/favicons": {
        target: serverTarget,
        changeOrigin: true,
        secure: false
      },
      "/preloaded-favicons": {
        target: serverTarget,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: browserslistToEsbuild([">0.2%", "not dead", "not op_mini all"])
  }
});
