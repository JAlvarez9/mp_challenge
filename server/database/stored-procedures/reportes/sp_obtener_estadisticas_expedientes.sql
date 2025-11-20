-- =============================================
-- SP: sp_obtener_estadisticas_expedientes
-- Descripción: Obtiene estadísticas generales de expedientes
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_estadisticas_expedientes
    @fechaInicio DATETIME2 = NULL,
    @fechaFin DATETIME2 = NULL,
    @estado NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Estadísticas generales
        SELECT 
            -- Total de expedientes
            COUNT(*) AS totalExpedientes,
            
            -- Por estado
            SUM(CASE WHEN estado = 'BORRADOR' THEN 1 ELSE 0 END) AS totalBorrador,
            SUM(CASE WHEN estado = 'EN_REVISION' THEN 1 ELSE 0 END) AS totalEnRevision,
            SUM(CASE WHEN estado = 'APROBADO' THEN 1 ELSE 0 END) AS totalAprobados,
            SUM(CASE WHEN estado = 'RECHAZADO' THEN 1 ELSE 0 END) AS totalRechazados,
            
            -- Porcentajes
            CAST(SUM(CASE WHEN estado = 'APROBADO' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS porcentajeAprobacion,
            CAST(SUM(CASE WHEN estado = 'RECHAZADO' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS porcentajeRechazo,
            
            -- Total de indicios
            (SELECT COUNT(*) FROM Indicios WHERE isActive = 1) AS totalIndicios,
            
            -- Promedio de indicios por expediente
            CAST((SELECT COUNT(*) FROM Indicios WHERE isActive = 1) * 1.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS promedioIndiciosPorExpediente,
            
            -- Total de revisiones
            (SELECT COUNT(*) FROM HistorialRevisiones) AS totalRevisiones
            
        FROM Expedientes
        WHERE isActive = 1
            AND (@fechaInicio IS NULL OR fechaRegistro >= @fechaInicio)
            AND (@fechaFin IS NULL OR fechaRegistro <= @fechaFin)
            AND (@estado IS NULL OR estado = @estado);
            
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
