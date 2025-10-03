import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const isInitBuild = process.env.BUILD_INIT === 'true'
  const isDemoBuild = process.env.BUILD_DEMO === 'true'

  // Для демо-сборки используем конфигурацию как в dev-режиме
  if (isDemoBuild) {
    return {
      plugins: [react()],
      base: './',
      build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2019',
        minify: false, // Отключаем минификацию для dev-подобной сборки
        rollupOptions: {
          input: 'index.html', // Используем index.html как точку входа
        },
      },
      server: {
        port: 3000,
        open: true,
      },
    }
  }

  // Для библиотеки используем существующую конфигурацию
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: isInitBuild ? 'src/init.ts' : 'src/index.ts',
        name: 'DvizhenieChat',
        fileName: (format) => {
          const prefix = isInitBuild ? 'dvizhenie-chat-widget-init' : 'dvizhenie-chat-widget'
          return `${prefix}.${format}.js`
        },
        formats: ['es', 'umd', 'iife'],
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      sourcemap: true,
      target: 'es2019',
      minify: 'esbuild',
    },
  }
})
