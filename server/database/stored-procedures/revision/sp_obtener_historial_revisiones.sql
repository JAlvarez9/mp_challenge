-- =============================================
-- SP: sp_obtener_historial_revisiones
-- Descripción: Obtiene el historial de revisiones de un expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_historial_revisiones
    @expedienteId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        h.id,
        h.expedienteId,
        h.usuarioRevisorId,
        h.accion,
        h.comentarios,
        h.fechaRevision,
        u.nombre as revisorNombre,
        u.correo as revisorCorreo,
        u.rol as revisorRol
    FROM HistorialRevisiones h
    INNER JOIN Usuarios u ON h.usuarioRevisorId = u.id
    WHERE h.expedienteId = @expedienteId
    ORDER BY h.fechaRevision DESC;
END
GO
