import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600">
            🚫 Acceso Denegado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-700 mb-2">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-gray-600">
              Tu rol actual: <span className="font-semibold">{user?.rol || 'Usuario'}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Volver al Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
