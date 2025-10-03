import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TopbarProvider } from "./Providers/TopbarProvider.tsx";
import { KernalProvider } from "./Providers/KernalProvider.tsx";
import { UserProvider } from "./Providers/UserProvider.tsx";
import { ScriptProvider } from "./Providers/ScriptProvider.tsx";
import App from './App.tsx'
import './index.css'
import { ApplicationProvider } from './Providers/ApplicationProvider.tsx';

/*
This is based off of linux rings

Kernal is highest level. Don't mess with it.
Users are next, and are able to download unique apps for themselves
Anything else gets shoved in there.
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KernalProvider>
      <UserProvider>
        <ApplicationProvider>
          <ScriptProvider>
            <TopbarProvider>
              <App />
            </TopbarProvider>
          </ScriptProvider>
        </ApplicationProvider>
      </UserProvider>
    </KernalProvider>
  </StrictMode>,
)
