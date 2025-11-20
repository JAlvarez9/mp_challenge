import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { expedienteService } from "../services/expedienteService";
import type { IExpediente } from "../types/expediente.types";
import { ExpedienteCard } from "../components/expedientes/ExpedienteCard";
import { Button } from "../components/ui/Button";

export default function ExpedientesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [expedientes, setExpedientes] = useState<IExpediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

  useEffect(() => {
    cargarExpedientes();
  }, []);

  const cargarExpedientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expedienteService.obtenerTodos();
      setExpedientes(response.data.expedientes);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar expedientes");
      console.error("Error al cargar expedientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await expedienteService.eliminar(id);
      setExpedientes(expedientes.filter((exp) => exp.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar expediente");
      console.error("Error al eliminar:", err);
    }
  };

  const expedientesFiltrados = expedientes.filter((exp) => {
    if (filtroEstado === "TODOS") return true;
    return exp.estado === filtroEstado;
  });

  const contadores = {
    total: expedientes.length,
    borrador: expedientes.filter((e) => e.estado === "BORRADOR").length,
    enRevision: expedientes.filter((e) => e.estado === "EN_REVISION").length,
    aprobado: expedientes.filter((e) => e.estado === "APROBADO").length,
    rechazado: expedientes.filter((e) => e.estado === "RECHAZADO").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando expedientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Volver al Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.rol === 'ADMIN' || user?.rol === 'MODERADOR' 
                  ? 'Todos los Expedientes' 
                  : 'Mis Expedientes'}
              </h1>
              <p className="mt-2 text-gray-600">
                {user?.rol === 'ADMIN' || user?.rol === 'MODERADOR'
                  ? 'Revisa y gestiona todos los expedientes del sistema'
                  : 'Gestiona tus expedientes DICRI'}
              </p>
            </div>
            <Button onClick={() => navigate("/expedientes/nuevo")}>
              ➕ Nuevo Expediente
            </Button>
          </div>

          {/* Contadores */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <button
              onClick={() => setFiltroEstado("TODOS")}
              className={`p-4 rounded-lg border-2 transition-all ${
                filtroEstado === "TODOS"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{contadores.total}</p>
              <p className="text-sm text-gray-600">Todos</p>
            </button>

            <button
              onClick={() => setFiltroEstado("BORRADOR")}
              className={`p-4 rounded-lg border-2 transition-all ${
                filtroEstado === "BORRADOR"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-2xl font-bold text-yellow-800">
                {contadores.borrador}
              </p>
              <p className="text-sm text-gray-600">📝 Borrador</p>
            </button>

            <button
              onClick={() => setFiltroEstado("EN_REVISION")}
              className={`p-4 rounded-lg border-2 transition-all ${
                filtroEstado === "EN_REVISION"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-2xl font-bold text-blue-800">
                {contadores.enRevision}
              </p>
              <p className="text-sm text-gray-600">🔍 En Revisión</p>
            </button>

            <button
              onClick={() => setFiltroEstado("APROBADO")}
              className={`p-4 rounded-lg border-2 transition-all ${
                filtroEstado === "APROBADO"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-2xl font-bold text-green-800">
                {contadores.aprobado}
              </p>
              <p className="text-sm text-gray-600">✅ Aprobado</p>
            </button>

            <button
              onClick={() => setFiltroEstado("RECHAZADO")}
              className={`p-4 rounded-lg border-2 transition-all ${
                filtroEstado === "RECHAZADO"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-2xl font-bold text-red-800">
                {contadores.rechazado}
              </p>
              <p className="text-sm text-gray-600">❌ Rechazado</p>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={cargarExpedientes}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de Expedientes */}
        {expedientesFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">
              {filtroEstado === "TODOS"
                ? "No tienes expedientes registrados"
                : `No hay expedientes en estado ${filtroEstado}`}
            </p>
            {filtroEstado === "TODOS" && (
              <Button
                className="mt-4"
                onClick={() => navigate("/expedientes/nuevo")}
              >
                Crear mi primer expediente
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {expedientesFiltrados.map((expediente) => (
              <ExpedienteCard
                key={expediente.id}
                expediente={expediente}
                onDelete={handleDelete}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
