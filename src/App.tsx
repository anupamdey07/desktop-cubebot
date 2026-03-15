import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChatPage } from './pages/ChatPage'
import { LoginPage } from './pages/LoginPage'
import { useAuthStore } from './store/useAuthStore'

function App() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    return (
        <BrowserRouter>
            <Routes>
                {/* Protected Route */}
                <Route 
                    path="/" 
                    element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" replace />} 
                />
                
                {/* Public Route */}
                <Route 
                    path="/login" 
                    element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
