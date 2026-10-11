import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },

    build: {
      // CSS: el bundle unico es de 114 KB, se extrae por debajo de este limite.
      cssCodeSplit: true,

      // Avisos de "chunk > 500 kB" ya no son utiles: los modulos pesados se
      // cargan bajo demanda y el chunk inicial quedo por debajo del limite.
      chunkSizeWarningLimit: 900,

      rolldownOptions: {
        output: {
          /*
           * Agrupacion manual de dependencias.
           *
           * Sin esto, Rolldown genera ~31 chunks diminutos (uno por icono de
           * lucide-react) que se comparten entre modulos: 8 KB repartidos en 31
           * peticiones extra, muy costoso en conexiones moviles.
           *
           * Ademas, separar el vendor del codigo propio permite que el navegador
           * reutilice la cache de Firebase/React entre despliegues, ya que el
           * bundle de aplicacion cambia en cada build.
           */
          advancedChunks: {
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                priority: 100,
              },
              {
                name: 'firebase',
                test: /node_modules[\\/](@firebase|firebase|idb)[\\/]/,
                priority: 90,
              },
              {
                name: 'maps',
                test: /node_modules[\\/](@vis\.gl|leaflet|@googlemaps)[\\/]/,
                priority: 80,
              },
              {
                name: 'lucide',
                test: /node_modules[\\/]lucide-react[\\/]/,
                priority: 70,
              },
              {
                name: 'vendor',
                test: /node_modules[\\/]/,
                priority: 10,
              },
            ],
          },
        },
      },
    },
  };
});
