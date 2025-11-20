import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { expedienteService } from "../services/expedienteService";
import { indicioService } from "../services/indicioService";
import type {
  IExpediente,
  IIndicio,
  ActualizarExpedienteDTO,
  CrearIndicioDTO,
  ActualizarIndicioDTO,
} from "../types/expediente.types";
import { EstadoBadge } from "../components/expedientes/EstadoBadge";
import { ExpedienteForm } from "../components/expedientes/ExpedienteForm";
import { IndicioForm } from "../components/expedientes/IndicioForm";
import { IndiciosList } from "../components/expedientes/IndiciosList";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function DetalleExpedientePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [expediente, setExpediente] = useState<IExpediente | null>(null);
  const [indicios, setIndicios] = useState<IIndicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Control de formulario de indicios
  const [mostrarFormIndicio, setMostrarFormIndicio] = useState(false);
  const [indicioEditando, setIndicioEditando] = useState<IIndicio | null>(null);

  // Mensaje de éxito
  const [mensaje, setMensaje] = useState<string | null>(
    location.state?.mensaje || null
  );

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  useEffect(() => {
    // Limpiar mensaje después de 5 segundos
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [expResponse, indiciosResponse] = await Promise.all([
        expedienteService.obtenerPorId(id!),
        indicioService.obtenerPorExpediente(id!),
      ]);

      setExpediente(expResponse.data.expediente);
      setIndicios(indiciosResponse.data.indicios);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar datos");
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const puedeEditar =
    expediente?.estado === "BORRADOR" || expediente?.estado === "RECHAZADO";
  const puedeEnviarRevision = expediente?.estado === "BORRADOR" && indicios.length > 0;

  // Actualizar expediente
  const handleActualizarExpediente = async (data: ActualizarExpedienteDTO) => {
    try {
      setIsSubmitting(true);
      const response = await expedienteService.actualizar(id!, data);
      setExpediente(response.data.expediente);
      setMensaje("Expediente actualizado exitosamente");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al actualizar expediente");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crear indicio
  const handleCrearIndicio = async (data: CrearIndicioDTO) => {
    try {
      setIsSubmitting(true);
      const response = await indicioService.crear(data);
      setIndicios([...indicios, response.data.indicio]);
      setMostrarFormIndicio(false);
      setMensaje("Indicio agregado exitosamente");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al crear indicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar indicio
  const handleActualizarIndicio = async (data: ActualizarIndicioDTO) => {
    try {
      setIsSubmitting(true);
      const response = await indicioService.actualizar(indicioEditando!.id, data);
      setIndicios(
        indicios.map((ind) =>
          ind.id === indicioEditando!.id ? response.data.indicio : ind
        )
      );
      setIndicioEditando(null);
      setMensaje("Indicio actualizado exitosamente");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al actualizar indicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar indicio
  const handleEliminarIndicio = async (indicioId: string) => {
    try {
      await indicioService.eliminar(indicioId);
      setIndicios(indicios.filter((ind) => ind.id !== indicioId));
      setMensaje("Indicio eliminado exitosamente");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar indicio");
    }
  };

  // Enviar a revisión
  const handleEnviarRevision = async () => {
    if (!puedeEnviarRevision) return;

    if (
      !window.confirm(
        "¿Estás seguro de enviar este expediente a revisión? No podrás modificarlo hasta que sea revisado."
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await expedienteService.enviarARevision(id!);
      setExpediente(response.data.expediente);
      setMensaje("Expediente enviado a revisión exitosamente");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al enviar a revisión");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar expediente
  const handleEliminarExpediente = async () => {
    if (expediente?.estado !== "BORRADOR") return;

    if (
      !window.confirm(
        `¿Estás seguro de eliminar el expediente ${expediente.numeroExpediente}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await expedienteService.eliminar(id!);
      navigate("/expedientes", {
        state: { mensaje: "Expediente eliminado exitosamente" },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar expediente");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (error || !expediente) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800">Error</h2>
            <p className="mt-2 text-red-700">{error || "Expediente no encontrado"}</p>
            <Button className="mt-4" onClick={() => navigate("/expedientes")}>
              Volver a Mis Expedientes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Dashboard
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => navigate("/expedientes")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              📄 Mis expedientes
            </button>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {expediente.numeroExpediente}
              </h1>
              <p className="mt-1 text-gray-600">Detalle del expediente</p>
            </div>
            <EstadoBadge estado={expediente.estado} />
          </div>
        </div>

        {/* Mensaje de éxito */}
        {mensaje && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <p className="text-green-800">{mensaje}</p>
            </div>
          </div>
        )}

        {/* Comentarios de rechazo */}
        {expediente.estado === "RECHAZADO" && expediente.comentariosRevision && (
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Expediente Rechazado</h3>
                <p className="text-sm text-red-800 mt-2">
                  <strong>Comentarios del coordinador:</strong>
                </p>
                <p className="text-sm text-red-700 mt-1 bg-white rounded p-3">
                  {expediente.comentariosRevision}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Puedes realizar las correcciones necesarias y volver a enviar a revisión.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Sección: Datos del Expediente */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Datos del Expediente
          </h2>
          <ExpedienteForm
            expediente={expediente}
            onSubmit={handleActualizarExpediente}
            isSubmitting={isSubmitting}
            puedeEditar={puedeEditar}
          />
        </Card>

        {/* Sección: Indicios */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              🔍 Indicios ({indicios.length})
            </h2>
            {puedeEditar && !mostrarFormIndicio && !indicioEditando && (
              <Button onClick={() => setMostrarFormIndicio(true)}>
                ➕ Agregar Indicio
              </Button>
            )}
          </div>

          {/* Formulario de nuevo indicio */}
          {mostrarFormIndicio && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-4">Nuevo Indicio</h3>
              <IndicioForm
                expedienteId={id!}
                onSubmit={handleCrearIndicio}
                onCancel={() => setMostrarFormIndicio(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Formulario de editar indicio */}
          {indicioEditando && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-4">
                Editar Indicio: {indicioEditando.numeroIndicio}
              </h3>
              <IndicioForm
                expedienteId={id!}
                indicio={indicioEditando}
                onSubmit={handleActualizarIndicio}
                onCancel={() => setIndicioEditando(null)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Lista de indicios */}
          <IndiciosList
            indicios={indicios}
            puedeEditar={puedeEditar}
            onEdit={setIndicioEditando}
            onDelete={handleEliminarIndicio}
          />
        </Card>

        {/* Acciones */}
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              {puedeEnviarRevision ? (
                <p>✅ Listo para enviar a revisión</p>
              ) : expediente.estado === "BORRADOR" ? (
                <p>⚠️ Agrega al menos 1 indicio para enviar a revisión</p>
              ) : (
                <p>Estado: {expediente.estado}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {expediente.estado === "BORRADOR" && (
                <Button variant="danger" onClick={handleEliminarExpediente}>
                  🗑️ Eliminar Expediente
                </Button>
              )}

              {puedeEnviarRevision && (
                <Button onClick={handleEnviarRevision} disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "📤 Enviar a Revisión"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
