-- =============================================
-- SP: sp_obtener_indicios_expediente
-- Descripción: Obtiene todos los indicios de un expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_indicios_expediente
    @expedienteId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        i.id,
        i.expedienteId,
        i.numeroIndicio,
        i.descripcion,
        i.color,
        i.tamano,
        i.peso,
        i.ubicacion,
        i.observaciones,
        i.usuarioRegistroId,
        i.isActive,
        i.createdAt,
        i.updatedAt,
        u.nombre as usuarioRegistroNombre,
        u.correo as usuarioRegistroCorreo
    FROM Indicios i
    INNER JOIN Usuarios u ON i.usuarioRegistroId = u.id
    WHERE i.expedienteId = @expedienteId AND i.isActive = 1
    ORDER BY i.numeroIndicio;
END
GO
