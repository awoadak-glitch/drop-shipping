import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/drop-shipping/', // هذا هو اسم مستودعك ليعمل الرابط بشكل صحيح
})
