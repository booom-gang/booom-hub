import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import MobileBottomNav from './components/MobileBottomNav.jsx';
import HomePage from './pages/HomePage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="pt-14 pb-20 md:pb-4">{children}</main>
      <MobileBottomNav />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <HashRouter>
            <ProtectedRoute>
              <SocketProvider>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </AppShell>
              </SocketProvider>
            </ProtectedRoute>
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
