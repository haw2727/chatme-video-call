import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "stream-chat-react/dist/css/v2/index.css";
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { setupGlobalErrorHandlers } from './utils/errorHandler.js'

// Setup global error handlers
setupGlobalErrorHandlers();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on network errors
        if (error?.code === 'ERR_NETWORK_CHANGED' ||
          error?.message?.includes('ERR_NETWORK_CHANGED')) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)