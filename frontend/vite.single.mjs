import base from './vite.config.js'
import { mergeConfig } from 'vite'
const b = typeof base === 'function' ? base({ mode: 'demo', command: 'build' }) : base
export default mergeConfig(b, { base: './', build: { assetsInlineLimit: 1e9, cssCodeSplit: false, modulePreload: false,
  rollupOptions: { output: { inlineDynamicImports: true } } } })
