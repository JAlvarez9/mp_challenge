import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Sistema de Gestión</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.nombre || user?.email}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Opciones para ADMIN */}
          {user?.rol === 'ADMIN' && (
            <>
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    👥 Usuarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Gestiona todos los usuarios del sistema
                  </p>
                  <Button onClick={() => navigate('/usuarios')} className="w-full">
                    Ver Usuarios
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📁 Expedientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Administra todos los expedientes del sistema
                  </p>
                  <Button onClick={() => navigate('/expedientes')} className="w-full">
                    Ver Expedientes
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Opciones para USER */}
          {user?.rol === 'USER' && (
            <>
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    ➕ Nuevo Expediente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Crear y registrar un nuevo expediente
                  </p>
                  <Button onClick={() => navigate('/expedientes/nuevo')} className="w-full">
                    Crear Expediente
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📄 Mis Expedientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Ver solo los expedientes que has creado
                  </p>
                  <Button onClick={() => navigate('/expedientes')} className="w-full">
                    Ver Expedientes
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Opciones para MODERADOR */}
          {user?.rol === 'MODERADOR' && (
            <>
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📁 Expedientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Revisar y moderar expedientes
                  </p>
                  <Button onClick={() => navigate('/expedientes')} className="w-full">
                    Ver Expedientes
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    ➕ Nuevo Expediente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Crear un nuevo expediente
                  </p>
                  <Button onClick={() => navigate('/expedientes/nuevo')} className="w-full">
                    Crear Expediente
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de tu cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{user?.nombre || 'No definido'}</span>
              </div>
              {user?.rol && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rol:</span>
                  <span className="font-medium">{user.rol}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
