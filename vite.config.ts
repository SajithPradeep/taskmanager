import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log('Loading Vite config...')
console.log('Environment variables:', {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Found' : 'Not found',
  SUPABASE_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Not found'
})

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
  }
}) 