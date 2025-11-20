-- =============================================
-- SP: sp_obtener_estadisticas_por_usuario
-- Descripción: Obtiene estadísticas agrupadas por usuario
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_estadisticas_por_usuario
    @fechaInicio DATETIME2 = NULL,
    @fechaFin DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            u.id AS usuarioId,
            u.nombre AS usuarioNombre,
            u.email AS usuarioEmail,
            u.rol AS usuarioRol,
            
            COUNT(e.id) AS totalExpedientes,
            SUM(CASE WHEN e.estado = 'BORRADOR' THEN 1 ELSE 0 END) AS totalBorrador,
            SUM(CASE WHEN e.estado = 'EN_REVISION' THEN 1 ELSE 0 END) AS totalEnRevision,
            SUM(CASE WHEN e.estado = 'APROBADO' THEN 1 ELSE 0 END) AS totalAprobados,
            SUM(CASE WHEN e.estado = 'RECHAZADO' THEN 1 ELSE 0 END) AS totalRechazados,
            
            -- Total de indicios creados
            (SELECT COUNT(*) FROM Indicios i 
             WHERE i.usuarioRegistroId = u.id AND i.isActive = 1) AS totalIndiciosCreados
            
        FROM Usuarios u
        LEFT JOIN Expedientes e ON u.id = e.usuarioRegistroId 
            AND e.isActive = 1
            AND (@fechaInicio IS NULL OR e.fechaRegistro >= @fechaInicio)
            AND (@fechaFin IS NULL OR e.fechaRegistro <= @fechaFin)
        WHERE u.isActive = 1
        GROUP BY u.id, u.nombre, u.email, u.rol
        ORDER BY totalExpedientes DESC;
            
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
