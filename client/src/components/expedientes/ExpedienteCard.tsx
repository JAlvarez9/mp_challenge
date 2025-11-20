import { useNavigate } from "react-router-dom";
import type { IExpediente } from "../../types/expediente.types";
import { EstadoBadge } from "./EstadoBadge";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface ExpedienteCardProps {
  expediente: IExpediente;
  onDelete?: (id: string) => void;
}

export function ExpedienteCard({ expediente, onDelete }: ExpedienteCardProps) {
  const navigate = useNavigate();

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const puedeEliminar = expediente.estado === "BORRADOR";
  const puedeEditar = expediente.estado === "BORRADOR" || expediente.estado === "RECHAZADO";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de eliminar el expediente ${expediente.numeroExpediente}?`)) {
      onDelete?.(expediente.id);
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/expedientes/${expediente.id}`)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {expediente.numeroExpediente}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Registrado: {formatFecha(expediente.fechaRegistro)}
            </p>
          </div>
          <EstadoBadge estado={expediente.estado} />
        </div>

        {/* Descripción */}
        {expediente.descripcion && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {expediente.descripcion}
          </p>
        )}

        {/* Info adicional */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              📋 <strong>{expediente.totalIndicios || 0}</strong> indicios
            </span>
            {expediente.fechaRevision && (
              <span className="flex items-center gap-1">
                🗓️ Revisado: {formatFecha(expediente.fechaRevision)}
              </span>
            )}
          </div>
        </div>

        {/* Comentarios de rechazo */}
        {expediente.estado === "RECHAZADO" && expediente.comentariosRevision && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-xs font-medium text-red-800 mb-1">
              Comentarios del coordinador:
            </p>
            <p className="text-sm text-red-700">{expediente.comentariosRevision}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/expedientes/${expediente.id}`);
            }}
          >
            {puedeEditar ? "✏️ Editar" : "👁️ Ver"}
          </Button>

          {puedeEliminar && onDelete && (
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              🗑️ Eliminar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
