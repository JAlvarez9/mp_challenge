-- =============================================
-- SP: sp_obtener_reporte_detallado
-- Descripción: Obtiene reporte detallado de expedientes con filtros
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_reporte_detallado
    @fechaInicio DATETIME2 = NULL,
    @fechaFin DATETIME2 = NULL,
    @estado NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            e.id,
            e.numeroExpediente,
            e.fechaRegistro,
            e.descripcion,
            e.estado,
            e.fechaRevision,
            e.comentariosRevision,
            e.createdAt,
            e.updatedAt,
            
            -- Usuario que registró
            e.usuarioRegistroId,
            ur.nombre AS usuarioRegistroNombre,
            ur.email AS usuarioRegistroCorreo,
            
            -- Coordinador que revisó
            e.coordinadorId,
            c.nombre AS coordinadorNombre,
            c.email AS coordinadorCorreo,
            
            -- Total de indicios
            (SELECT COUNT(*) FROM Indicios WHERE expedienteId = e.id AND isActive = 1) AS totalIndicios,
            
            -- Fecha de última revisión
            (SELECT MAX(fechaRevision) FROM HistorialRevisiones WHERE expedienteId = e.id) AS ultimaRevision,
            
            -- Total de revisiones
            (SELECT COUNT(*) FROM HistorialRevisiones WHERE expedienteId = e.id) AS totalRevisiones
            
        FROM Expedientes e
        LEFT JOIN Usuarios ur ON e.usuarioRegistroId = ur.id
        LEFT JOIN Usuarios c ON e.coordinadorId = c.id
        WHERE e.isActive = 1
            AND (@fechaInicio IS NULL OR e.fechaRegistro >= @fechaInicio)
            AND (@fechaFin IS NULL OR e.fechaRegistro <= @fechaFin)
            AND (@estado IS NULL OR e.estado = @estado)
        ORDER BY e.fechaRegistro DESC;
            
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
