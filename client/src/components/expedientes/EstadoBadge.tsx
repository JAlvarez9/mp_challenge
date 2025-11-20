import type { EstadoExpediente } from "../../types/expediente.types";

interface EstadoBadgeProps {
  estado: EstadoExpediente;
  className?: string;
}

export function EstadoBadge({ estado, className = "" }: EstadoBadgeProps) {
  const getEstadoStyles = () => {
    switch (estado) {
      case "BORRADOR":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "EN_REVISION":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "APROBADO":
        return "bg-green-100 text-green-800 border-green-300";
      case "RECHAZADO":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getEstadoIcon = () => {
    switch (estado) {
      case "BORRADOR":
        return "📝";
      case "EN_REVISION":
        return "🔍";
      case "APROBADO":
        return "✅";
      case "RECHAZADO":
        return "❌";
      default:
        return "📄";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getEstadoStyles()} ${className}`}
    >
      <span>{getEstadoIcon()}</span>
      <span>{estado.replace("_", " ")}</span>
    </span>
  );
}
