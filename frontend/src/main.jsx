import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply saved theme before first paint — prevents flash
;(function () {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
})()

// Pre-create sweep overlay so first toggle has no delay
;(function () {
  const el = document.createElement('div')
  el.id = 'theme-sweep'
  document.body.appendChild(el)
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)