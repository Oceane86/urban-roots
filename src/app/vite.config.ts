import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'leaflet-fullscreen/Control.FullScreen.css',
      ],
    },
  },
});
