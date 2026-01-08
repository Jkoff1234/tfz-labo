import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tailwind.css'

console.log('App starting...')
try {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('App rendered successfully')
} catch (error) {
  console.error('Error rendering app:', error)
  document.getElementById('root').innerHTML = '<div style="color:red; padding:20px;">Errore caricamento app: ' + error.message + '</div>'
}
