import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      strategies: 'injectManifest',
      srcDir: 'scripts',
      filename: 'sw.js',
      manifest: {
        lang: 'id-ID',
        orientation: 'any',
        name: 'Infoinyuk App',
        short_name: 'Infoinyuk',
        description:
          'InfoinYuk adalah platform untuk berbagi informasi dengan mudah. Dibuat sebagai bagian dari proyek Dicoding Belajar Pengembangan Web Intermediate oleh Muhammad Syarifudin. Yang dapat diakses secara offline dan memiliki fitur notifikasi push.',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#88aaee',
        icons: [
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: 'infoinyuk_512.png',
            type: 'image/png',
          },
          {
            purpose: 'any',
            sizes: '752x752',
            src: 'infoinyuk_512_rounded.png',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: 'manifest/iPhone-14-Pro-430x932.png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: 'manifest/Pixel-7-Pro-480x1040.png',
            sizes: '480x1040',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: 'manifest/iPad-Air-5-820x1180.png',
            sizes: '820x1180',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'manifest/Macbook-Air-1559x975.png',
            sizes: '1559x975',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
        shortcuts: [
          {
            name: 'Tambah Informasi',
            short_name: 'Informasi',
            description: 'Menambah informasi baru.',
            url: '/?source=pwa#/add-info',
            icons: [
              {
                src: 'images/plus.png',
                type: 'image/png',
                sizes: '512x512',
              },
            ],
          },
          {
            name: 'Simpan Informasi',
            short_name: 'Simpan',
            description: 'Daftar informasi yang sudah di simpan.',
            url: '/?source=pwa#/save-info',
            icons: [
              {
                src: 'images/save.png',
                type: 'image/png',
                sizes: '512x512',
              },
            ],
          },
        ],
      },
    }),
  ],
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
