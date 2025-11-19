import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const RolUsuario = {
  ADMIN: "ADMIN",
  USER: "USER",
  MODERADOR: "MODERADOR",
} as const;

const usuarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  correo: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  rol: z.enum(['ADMIN', 'USER', 'MODERADOR']).refine(val => val, {
    message: 'Selecciona un rol válido'
  }),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

export default function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
  });

  useEffect(() => {
    // Verificar si el usuario es ADMIN
    if (user?.rol !== 'ADMIN') {
      navigate('/unauthorized');
      return;
    }
    if (id) {
      fetchUsuario();
    }
  }, [id, user, navigate]);

  const fetchUsuario = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(`/usuarios/${id}`);
      const usuario = response.data.data || response.data;
      setValue('nombre', usuario.nombre);
      setValue('correo', usuario.correo);
      setValue('rol', usuario.rol || 'USER');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuario');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      setLoading(true);
      setError('');

      // Si es edición y la contraseña está vacía, la eliminamos
      const payload = { ...data };
      if (id && !payload.password) {
        delete payload.password;
      }

      if (id) {
        await axiosInstance.put(`/usuarios/${id}`, payload);
      } else {
        await axiosInstance.post('/usuarios', payload);
      }

      navigate('/usuarios');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

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
              <Button variant="ghost" onClick={() => navigate('/usuarios')}>
                Usuarios
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{id ? 'Editar Usuario' : 'Nuevo Usuario'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <Input
                  type="text"
                  placeholder="Juan Pérez"
                  {...register('nombre')}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register('correo')}
                />
                {errors.correo && (
                  <p className="text-red-500 text-sm mt-1">{errors.correo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {id && '(dejar en blanco para no cambiar)'}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  {...register('rol')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un rol</option>
                  <option value={RolUsuario.ADMIN}>Administrador</option>
                  <option value={RolUsuario.USER}>Usuario</option>
                  <option value={RolUsuario.MODERADOR}>Moderador</option>
                </select>
                {errors.rol && (
                  <p className="text-red-500 text-sm mt-1">{errors.rol.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/usuarios')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
