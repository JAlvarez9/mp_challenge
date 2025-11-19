import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/UsuariosPage';
import UsuarioFormPage from './pages/UsuarioFormPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import RequireAuth from './components/RequireAuth';
import { useAuthStore } from './store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RequireAuth>
              <UsuariosPage />
            </RequireAuth>
          }
        />
        <Route
          path="/usuarios/nuevo"
          element={
            <RequireAuth>
              <UsuarioFormPage />
            </RequireAuth>
          }
        />
        <Route
          path="/usuarios/:id/editar"
          element={
            <RequireAuth>
              <UsuarioFormPage />
            </RequireAuth>
          }
        />
        <Route
          path="/unauthorized"
          element={
            <RequireAuth>
              <UnauthorizedPage />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
