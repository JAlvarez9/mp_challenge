-- =============================================
-- SP: sp_obtener_expediente_por_id
-- Descripción: Obtiene un expediente por su ID con todos sus detalles
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_expediente_por_id
    @id UNIQUEIDENTIFIER
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
        e.createdBy,
        e.updatedBy,
        u.nombre as usuarioRegistroNombre,
        u.correo as usuarioRegistroCorreo,
        u.rol as usuarioRegistroRol,
        c.nombre as coordinadorNombre,
        c.correo as coordinadorCorreo,
        (SELECT COUNT(*) FROM Indicios WHERE expedienteId = e.id AND isActive = 1) as totalIndicios
    FROM Expedientes e
    INNER JOIN Usuarios u ON e.usuarioRegistroId = u.id
    LEFT JOIN Usuarios c ON e.coordinadorId = c.id
    WHERE e.id = @id AND e.isActive = 1;
END
GO
