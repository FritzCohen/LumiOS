import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { KernelProvider } from './context/kernal/kernal.tsx'
import { UserProvider } from './context/user/user.tsx'
import WindowProvider from './context/window/WindowProvider.tsx'
import ErrorBoundary from './system/gui/components/ErrorBoundary/ErrorBoundary.tsx'
import { ScriptProvider } from './context/scripts/ScriptProvider.tsx'
import { TopbarProvider } from './context/topbar/topbar.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <KernelProvider>
        <UserProvider>
          <ScriptProvider>
            <WindowProvider>
              <TopbarProvider>
                <App />
              </TopbarProvider>
            </WindowProvider>
          </ScriptProvider>
        </UserProvider>
      </KernelProvider>
    </ErrorBoundary>
  </StrictMode>,
)