import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// 纯静态发行：base 用相对路径，build 后的 dist 目录可丢任意静态服务器（或本地 http server）。
// 不再代理 /api —— 所有数据来自浏览器内导入的 Excel + 本地 IndexedDB/localStorage。
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 5174 },
  build: { target: 'es2019' },
})
