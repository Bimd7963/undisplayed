import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Si vous souhaitez héberger dans un sous-dossier, ex: /simulateur/
  // décommentez la ligne ci-dessous et adaptez le chemin :
  base: '/undisplayed/',
})
