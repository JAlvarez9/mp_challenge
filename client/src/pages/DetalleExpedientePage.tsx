import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { expedienteService } from "../services/expedienteService";
import { indicioService } from "../services/indicioService";
import { revisionService } from "../services/revisionService";
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
  const { user } = useAuthStore();

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

  // Modal de rechazo
  const [mostrarModalRechazo, setMostrarModalRechazo] = useState(false);
  const [comentariosRechazo, setComentariosRechazo] = useState("");

  // Modal de aprobación
  const [mostrarModalAprobacion, setMostrarModalAprobacion] = useState(false);
  const [comentariosAprobacion, setComentariosAprobacion] = useState("");

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

  // Solo el creador puede editar el expediente
  const esCreador = expediente?.usuarioRegistroId === user?.id;
  const esCoordinador = user?.rol === "ADMIN" || user?.rol === "MODERADOR";
  const puedeEditar =
    esCreador && (expediente?.estado === "BORRADOR" || expediente?.estado === "RECHAZADO");
  const puedeEnviarRevision = esCreador && (expediente?.estado === "BORRADOR" || expediente?.estado === "RECHAZADO") && indicios.length > 0;
  const puedeRevisar = esCoordinador && expediente?.estado === "EN_REVISION";

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

    const esReenvio = expediente?.estado === "RECHAZADO";
    const mensaje = esReenvio
      ? "¿Estás seguro de reenviar este expediente a revisión? Has realizado las correcciones solicitadas."
      : "¿Estás seguro de enviar este expediente a revisión? No podrás modificarlo hasta que sea revisado.";

    if (!window.confirm(mensaje)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await expedienteService.enviarARevision(id!);
      setExpediente(response.data.expediente);
      setMensaje(
        esReenvio
          ? "✅ Expediente reenviado a revisión exitosamente"
          : "📤 Expediente enviado a revisión exitosamente"
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al enviar a revisión");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aprobar expediente
  const handleAprobar = async () => {
    if (!puedeRevisar) return;
    setMostrarModalAprobacion(true);
  };

  const confirmarAprobacion = async () => {
    try {
      setIsSubmitting(true);
      const response = await revisionService.aprobar(id!, { 
        comentarios: comentariosAprobacion.trim() || undefined 
      });
      setExpediente(response.data.expediente);
      setMensaje("✅ Expediente aprobado exitosamente");
      setMostrarModalAprobacion(false);
      setComentariosAprobacion("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al aprobar expediente");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rechazar expediente
  const handleRechazar = async () => {
    if (!puedeRevisar) return;
    setMostrarModalRechazo(true);
  };

  const confirmarRechazo = async () => {
    if (!comentariosRechazo.trim()) {
      alert("Los comentarios son obligatorios al rechazar un expediente");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await revisionService.rechazar(id!, {
        comentarios: comentariosRechazo,
      });
      setExpediente(response.data.expediente);
      setMensaje("❌ Expediente rechazado. El creador puede realizar correcciones.");
      setMostrarModalRechazo(false);
      setComentariosRechazo("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al rechazar expediente");
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full space-y-6">
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

        {/* Mensaje informativo cuando no es el creador */}
        {!esCreador && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-xl">ℹ️</span>
              <div className="flex-1">
                <p className="text-blue-800">
                  <strong>Vista de solo lectura</strong>
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Este expediente fue creado por {expediente.usuarioRegistroNombre || 'otro usuario'}. 
                  Solo el creador puede editarlo o modificar sus indicios.
                  {user?.rol === 'ADMIN' || user?.rol === 'MODERADOR' 
                    ? ' Como coordinador, puedes aprobarlo o rechazarlo desde la sección de revisión.' 
                    : ''}
                </p>
              </div>
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
                <p>✅ Listo para {expediente.estado === "RECHAZADO" ? "reenviar" : "enviar"} a revisión</p>
              ) : (expediente.estado === "BORRADOR" || expediente.estado === "RECHAZADO") ? (
                <p>⚠️ Agrega al menos 1 indicio para enviar a revisión</p>
              ) : (
                <p>Estado: {expediente.estado}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {puedeEditar && expediente.estado === "BORRADOR" && (
                <Button variant="danger" onClick={handleEliminarExpediente}>
                  🗑️ Eliminar Expediente
                </Button>
              )}

              {puedeEnviarRevision && (
                <Button onClick={handleEnviarRevision} disabled={isSubmitting}>
                  {isSubmitting 
                    ? "Enviando..." 
                    : expediente.estado === "RECHAZADO" 
                      ? "📤 Reenviar a Revisión" 
                      : "📤 Enviar a Revisión"}
                </Button>
              )}

              {puedeRevisar && (
                <>
                  <Button
                    variant="danger"
                    onClick={handleRechazar}
                    disabled={isSubmitting}
                  >
                    ❌ Rechazar
                  </Button>
                  <Button onClick={handleAprobar} disabled={isSubmitting}>
                    {isSubmitting ? "Aprobando..." : "✅ Aprobar"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Modal de Rechazo */}
        {mostrarModalRechazo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ❌ Rechazar Expediente
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Por favor indica las razones del rechazo. El creador podrá ver estos
                comentarios y realizar las correcciones necesarias.
              </p>
              <textarea
                value={comentariosRechazo}
                onChange={(e) => setComentariosRechazo(e.target.value)}
                placeholder="Escribe los comentarios de rechazo..."
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarModalRechazo(false);
                    setComentariosRechazo("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmarRechazo}
                  disabled={isSubmitting || !comentariosRechazo.trim()}
                >
                  {isSubmitting ? "Rechazando..." : "Confirmar Rechazo"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Aprobación */}
        {mostrarModalAprobacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ✅ Aprobar Expediente
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Puedes agregar comentarios adicionales sobre la aprobación (opcional).
              </p>
              <textarea
                value={comentariosAprobacion}
                onChange={(e) => setComentariosAprobacion(e.target.value)}
                placeholder="Comentarios de aprobación (opcional)..."
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarModalAprobacion(false);
                    setComentariosAprobacion("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarAprobacion}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Aprobando..." : "Confirmar Aprobación"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
