import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  const isInitBuild = process.env.BUILD_INIT === 'true'

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
