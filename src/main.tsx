import 'antd/dist/reset.css'
import '@/styles/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers/AppProviders'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js').catch(() => {

  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
)
