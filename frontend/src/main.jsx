import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store/index'
import { injectStore } from './api/axiosInstance'
import './index.css'

// Inject store into axios to break circular dependency
injectStore(store)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#131B2E',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(15,23,42,0.10)',
              border: '1px solid #E2E8F0',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#004AC6', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#BA1A1A', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
