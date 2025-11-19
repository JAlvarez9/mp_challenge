-- =============================================
-- SP: sp_obtener_expedientes
-- Descripción: Obtiene expedientes (todos o solo del usuario)
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_expedientes
    @usuarioId UNIQUEIDENTIFIER = NULL,
    @soloDelUsuario BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        e.id,
        e.numeroExpediente,
        e.fechaRegistro,
        e.descripcion,
        e.estado,
        e.usuarioRegistroId,
        e.coordinadorId,
        e.fechaRevision,
        e.comentariosRevision,
        e.isActive,
        e.createdAt,
        e.updatedAt,
        u.nombre as usuarioRegistroNombre,
        u.correo as usuarioRegistroCorreo,
        c.nombre as coordinadorNombre,
        c.correo as coordinadorCorreo,
        (SELECT COUNT(*) FROM Indicios WHERE expedienteId = e.id AND isActive = 1) as totalIndicios
    FROM Expedientes e
    INNER JOIN Usuarios u ON e.usuarioRegistroId = u.id
    LEFT JOIN Usuarios c ON e.coordinadorId = c.id
    WHERE e.isActive = 1
        AND (@soloDelUsuario = 0 OR e.usuarioRegistroId = @usuarioId)
    ORDER BY e.fechaRegistro DESC;
END
GO
