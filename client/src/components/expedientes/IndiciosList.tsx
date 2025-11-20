import { useState } from "react";
import type { IIndicio } from "../../types/expediente.types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface IndiciosListProps {
  indicios: IIndicio[];
  puedeEditar: boolean;
  onEdit: (indicio: IIndicio) => void;
  onDelete: (id: string) => void;
}

export function IndiciosList({ indicios, puedeEditar, onEdit, onDelete }: IndiciosListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (indicios.length === 0) {
    return (
      <Card className="text-center py-12 bg-gray-50">
        <span className="text-4xl">📦</span>
        <p className="mt-4 text-gray-600 font-medium">No hay indicios registrados</p>
        <p className="mt-2 text-sm text-gray-500">
          {puedeEditar
            ? "Agrega al menos un indicio para poder enviar el expediente a revisión"
            : "Este expediente no tiene indicios registrados"}
        </p>
      </Card>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (id: string, numeroIndicio: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el indicio ${numeroIndicio}?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {indicios.map((indicio) => {
        const isExpanded = expandedId === indicio.id;

        return (
          <Card
            key={indicio.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => toggleExpand(indicio.id)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {indicio.numeroIndicio}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{indicio.descripcion}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(indicio.id);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? "▼" : "▶"}
                </button>
              </div>

              {/* Detalles expandidos */}
              {isExpanded && (
                <div
                  className="space-y-3 pt-3 border-t"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {indicio.color && (
                      <div>
                        <span className="text-gray-500 block">Color:</span>
                        <span className="font-medium text-gray-900">{indicio.color}</span>
                      </div>
                    )}
                    {indicio.tamano && (
                      <div>
                        <span className="text-gray-500 block">Tamaño:</span>
                        <span className="font-medium text-gray-900">{indicio.tamano}</span>
                      </div>
                    )}
                    {indicio.peso !== null && indicio.peso !== undefined && (
                      <div>
                        <span className="text-gray-500 block">Peso:</span>
                        <span className="font-medium text-gray-900">{indicio.peso} kg</span>
                      </div>
                    )}
                    {indicio.ubicacion && (
                      <div>
                        <span className="text-gray-500 block">Ubicación:</span>
                        <span className="font-medium text-gray-900">{indicio.ubicacion}</span>
                      </div>
                    )}
                  </div>

                  {indicio.observaciones && (
                    <div className="bg-gray-50 rounded-md p-3">
                      <span className="text-xs font-medium text-gray-500 block mb-1">
                        Observaciones:
                      </span>
                      <p className="text-sm text-gray-700">{indicio.observaciones}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <p>Registrado por: {indicio.usuarioRegistroNombre}</p>
                    <p>
                      Fecha:{" "}
                      {new Date(indicio.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Acciones */}
                  {puedeEditar && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(indicio);
                        }}
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(indicio.id, indicio.numeroIndicio);
                        }}
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
