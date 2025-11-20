import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { reportesService } from '../services/reportesService';
import type {
  IEstadisticas,
  IExpedienteReporte,
  IEstadisticasUsuario,
  FiltrosReporte,
} from '../services/reportesService';

export const ReportesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vistaActual, setVistaActual] = useState<'estadisticas' | 'detallado' | 'usuarios'>('estadisticas');

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState<IEstadisticas | null>(null);

  // Estados para reporte detallado
  const [expedientes, setExpedientes] = useState<IExpedienteReporte[]>([]);

  // Estados para estadísticas por usuario
  const [usuarios, setUsuarios] = useState<IEstadisticasUsuario[]>([]);

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [vistaActual, filtros]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (vistaActual === 'estadisticas') {
        const data = await reportesService.obtenerEstadisticas(filtros);
        setEstadisticas(data);
      } else if (vistaActual === 'detallado') {
        const data = await reportesService.obtenerReporteDetallado(filtros);
        setExpedientes(data);
      } else if (vistaActual === 'usuarios') {
        const data = await reportesService.obtenerEstadisticasPorUsuario({
          fechaInicio: filtros.fechaInicio,
          fechaFin: filtros.fechaFin,
        });
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarDatos();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      estado: '',
    });
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return 'bg-gray-100 text-gray-800';
      case 'EN_REVISION':
        return 'bg-blue-100 text-blue-800';
      case 'APROBADO':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 overflow-x-hidden w-full">
      {/* Navegación */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Volver al Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Informes y Estadísticas</h1>
        <p className="text-gray-600 mt-2">
          Análisis detallado de expedientes, aprobaciones y rechazos
        </p>
      </div>

      {/* Pestañas */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <Button
          onClick={() => setVistaActual('estadisticas')}
          variant={vistaActual === 'estadisticas' ? 'default' : 'outline'}
        >
          Estadísticas Generales
        </Button>
        <Button
          onClick={() => setVistaActual('detallado')}
          variant={vistaActual === 'detallado' ? 'default' : 'outline'}
        >
          Reporte Detallado
        </Button>
        <Button
          onClick={() => setVistaActual('usuarios')}
          variant={vistaActual === 'usuarios' ? 'default' : 'outline'}
        >
          Estadísticas por Usuario
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <Input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <Input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
            />
          </div>
          {vistaActual !== 'usuarios' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="BORRADOR">Borrador</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="APROBADO">Aprobado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>
          )}
          <div className="flex items-end gap-2">
            <Button onClick={aplicarFiltros} className="flex-1">
              Aplicar
            </Button>
            <Button onClick={limpiarFiltros} variant="outline">
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      {/* Contenido según vista */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Estadísticas Generales */}
          {vistaActual === 'estadisticas' && estadisticas && (
            <>
              {estadisticas.totalExpedientes === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-2">No se encontraron datos</p>
                    <p className="text-gray-500 text-sm">
                      No hay expedientes que coincidan con los filtros seleccionados
                    </p>
                  </div>
                </Card>
              ) : (
            <div className="space-y-6">
              {/* Cards de resumen */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="text-center">
                  <p className="text-sm text-gray-600">Total Expedientes</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.totalExpedientes}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-sm text-gray-600">Borrador</p>
                  <p className="text-3xl font-bold text-gray-600">{estadisticas.totalBorrador}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-sm text-gray-600">En Revisión</p>
                  <p className="text-3xl font-bold text-blue-600">{estadisticas.totalEnRevision}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-sm text-gray-600">Aprobados</p>
                  <p className="text-3xl font-bold text-green-600">{estadisticas.totalAprobados}</p>
                </Card>
                <Card className="text-center">
                  <p className="text-sm text-gray-600">Rechazados</p>
                  <p className="text-3xl font-bold text-red-600">{estadisticas.totalRechazados}</p>
                </Card>
              </div>

              {/* Porcentajes y promedios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <h3 className="text-lg font-semibold mb-2">Tasa de Aprobación</h3>
                  <p className="text-4xl font-bold text-green-600">
                    {(estadisticas.porcentajeAprobacion ?? 0).toFixed(1)}%
                  </p>
                </Card>
                <Card>
                  <h3 className="text-lg font-semibold mb-2">Tasa de Rechazo</h3>
                  <p className="text-4xl font-bold text-red-600">
                    {(estadisticas.porcentajeRechazo ?? 0).toFixed(1)}%
                  </p>
                </Card>
                <Card>
                  <h3 className="text-lg font-semibold mb-2">Promedio Indicios</h3>
                  <p className="text-4xl font-bold text-blue-600">
                    {(estadisticas.promedioIndiciosPorExpediente ?? 0).toFixed(1)}
                  </p>
                </Card>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <h3 className="text-lg font-semibold mb-2">Total de Indicios</h3>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.totalIndicios}</p>
                </Card>
                <Card>
                  <h3 className="text-lg font-semibold mb-2">Total de Revisiones</h3>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.totalRevisiones}</p>
                </Card>
              </div>
            </div>
              )}
            </>
          )}

          {/* Reporte Detallado */}
          {vistaActual === 'detallado' && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">
                Expedientes ({expedientes.length})
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr>
                      <th>N° Expediente</th>
                      <th>Título</th>
                      <th>Estado</th>
                      <th>Usuario</th>
                      <th>Coordinador</th>
                      <th>Indicios</th>
                      <th>Revisiones</th>
                      <th>Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expedientes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500">
                          No se encontraron expedientes
                        </td>
                      </tr>
                    ) : (
                      expedientes.map((exp) => (
                        <tr key={exp.expedienteId}>
                          <td className="font-medium">{exp.numeroExpediente}</td>
                          <td>{exp.titulo}</td>
                          <td>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor(
                                exp.estado
                              )}`}
                            >
                              {exp.estado.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{exp.usuarioRegistroNombre}</td>
                          <td>{exp.coordinadorNombre || '-'}</td>
                          <td className="text-center">{exp.totalIndicios}</td>
                          <td className="text-center">{exp.totalRevisiones}</td>
                          <td>{formatearFecha(exp.fechaRegistro)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          )}

          {/* Estadísticas por Usuario */}
          {vistaActual === 'usuarios' && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">
                Desempeño por Usuario ({usuarios.length})
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Total</th>
                      <th>Borrador</th>
                      <th>En Revisión</th>
                      <th>Aprobados</th>
                      <th>Rechazados</th>
                      <th>Indicios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    ) : (
                      usuarios.map((usr) => (
                        <tr key={usr.usuarioId}>
                          <td className="font-medium">{usr.usuarioNombre}</td>
                          <td>{usr.usuarioEmail}</td>
                          <td>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              {usr.usuarioRol}
                            </span>
                          </td>
                          <td className="text-center font-semibold">{usr.totalExpedientes}</td>
                          <td className="text-center text-gray-600">{usr.totalBorrador}</td>
                          <td className="text-center text-blue-600">{usr.totalEnRevision}</td>
                          <td className="text-center text-green-600">{usr.totalAprobados}</td>
                          <td className="text-center text-red-600">{usr.totalRechazados}</td>
                          <td className="text-center">{usr.totalIndiciosCreados}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
