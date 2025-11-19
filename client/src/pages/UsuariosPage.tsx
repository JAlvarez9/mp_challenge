import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol?: string;
  createdAt?: string;
}

export default function UsuariosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Verificar si el usuario es ADMIN
    if (user?.rol !== 'ADMIN') {
      navigate('/unauthorized');
      return;
    }
    fetchUsuarios();
  }, [user, navigate]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/usuarios');
      setUsuarios(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await axiosInstance.delete(`/usuarios/${id}`);
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Sistema de Gestión</h1>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.nombre || user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Gestión de Usuarios</CardTitle>
              <Button onClick={() => navigate('/usuarios/nuevo')}>
                + Nuevo Usuario
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-600">
                Cargando usuarios...
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {error}
              </div>
            ) : filteredUsuarios.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">
                          {usuario.nombre}
                        </TableCell>
                        <TableCell>{usuario.correo}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {usuario.rol || 'Usuario'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {usuario.createdAt
                            ? new Date(usuario.createdAt).toLocaleDateString('es-ES')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(usuario.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
