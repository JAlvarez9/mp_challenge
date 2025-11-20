-- =============================================
-- Script: Instalación de Stored Procedures de Reportes
-- Descripción: Crea los 3 stored procedures para el módulo de reportes
-- Fecha: 2024
-- =============================================

USE ExpedientesDB;
GO

PRINT '========================================';
PRINT 'INSTALANDO STORED PROCEDURES DE REPORTES';
PRINT '========================================';
PRINT '';

-- =============================================
-- 1. sp_obtener_estadisticas_expedientes
-- =============================================
PRINT 'Creando sp_obtener_estadisticas_expedientes...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_obtener_estadisticas_expedientes')
    DROP PROCEDURE sp_obtener_estadisticas_expedientes;
GO

CREATE PROCEDURE sp_obtener_estadisticas_expedientes
    @fechaInicio DATETIME = NULL,
    @fechaFin DATETIME = NULL,
    @estado VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS totalExpedientes,
        SUM(CASE WHEN estado = 'BORRADOR' THEN 1 ELSE 0 END) AS totalBorrador,
        SUM(CASE WHEN estado = 'EN_REVISION' THEN 1 ELSE 0 END) AS totalEnRevision,
        SUM(CASE WHEN estado = 'APROBADO' THEN 1 ELSE 0 END) AS totalAprobados,
        SUM(CASE WHEN estado = 'RECHAZADO' THEN 1 ELSE 0 END) AS totalRechazados,
        CAST(
            CASE 
                WHEN COUNT(*) > 0 
                THEN (SUM(CASE WHEN estado = 'APROBADO' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
                ELSE 0 
            END AS DECIMAL(5,2)
        ) AS porcentajeAprobacion,
        CAST(
            CASE 
                WHEN COUNT(*) > 0 
                THEN (SUM(CASE WHEN estado = 'RECHAZADO' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
                ELSE 0 
            END AS DECIMAL(5,2)
        ) AS porcentajeRechazo,
        (
            SELECT COUNT(*) 
            FROM Indicios i 
            INNER JOIN Expedientes e2 ON i.expedienteId = e2.id
            WHERE i.activo = 1 
            AND e2.activo = 1
            AND (@fechaInicio IS NULL OR e2.fechaRegistro >= @fechaInicio)
            AND (@fechaFin IS NULL OR e2.fechaRegistro <= @fechaFin)
            AND (@estado IS NULL OR e2.estado = @estado)
        ) AS totalIndicios,
        CAST(
            CASE 
                WHEN COUNT(*) > 0 
                THEN (
                    SELECT COUNT(*) 
                    FROM Indicios i 
                    INNER JOIN Expedientes e2 ON i.expedienteId = e2.id
                    WHERE i.activo = 1 
                    AND e2.activo = 1
                    AND (@fechaInicio IS NULL OR e2.fechaRegistro >= @fechaInicio)
                    AND (@fechaFin IS NULL OR e2.fechaRegistro <= @fechaFin)
                    AND (@estado IS NULL OR e2.estado = @estado)
                ) * 1.0 / COUNT(*)
                ELSE 0 
            END AS DECIMAL(5,2)
        ) AS promedioIndiciosPorExpediente,
        (
            SELECT COUNT(*) 
            FROM HistorialRevisiones hr
            INNER JOIN Expedientes e2 ON hr.expedienteId = e2.id
            WHERE e2.activo = 1
            AND (@fechaInicio IS NULL OR e2.fechaRegistro >= @fechaInicio)
            AND (@fechaFin IS NULL OR e2.fechaRegistro <= @fechaFin)
            AND (@estado IS NULL OR e2.estado = @estado)
        ) AS totalRevisiones
    FROM Expedientes e
    WHERE e.activo = 1
    AND (@fechaInicio IS NULL OR e.fechaRegistro >= @fechaInicio)
    AND (@fechaFin IS NULL OR e.fechaRegistro <= @fechaFin)
    AND (@estado IS NULL OR e.estado = @estado);
END;
GO

PRINT 'sp_obtener_estadisticas_expedientes creado correctamente.';
PRINT '';

-- =============================================
-- 2. sp_obtener_reporte_detallado
-- =============================================
PRINT 'Creando sp_obtener_reporte_detallado...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_obtener_reporte_detallado')
    DROP PROCEDURE sp_obtener_reporte_detallado;
GO

CREATE PROCEDURE sp_obtener_reporte_detallado
    @fechaInicio DATETIME = NULL,
    @fechaFin DATETIME = NULL,
    @estado VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.id AS expedienteId,
        e.numeroExpediente,
        e.titulo,
        e.descripcion,
        e.estado,
        e.fechaRegistro,
        e.fechaActualizacion,
        e.usuarioRegistroId,
        u1.nombre AS usuarioRegistroNombre,
        u1.email AS usuarioRegistroEmail,
        e.coordinadorId,
        u2.nombre AS coordinadorNombre,
        u2.email AS coordinadorEmail,
        (
            SELECT COUNT(*) 
            FROM Indicios i 
            WHERE i.expedienteId = e.id AND i.activo = 1
        ) AS totalIndicios,
        (
            SELECT TOP 1 hr.comentarios
            FROM HistorialRevisiones hr
            WHERE hr.expedienteId = e.id
            ORDER BY hr.fechaRevision DESC
        ) AS ultimaRevision,
        (
            SELECT COUNT(*)
            FROM HistorialRevisiones hr
            WHERE hr.expedienteId = e.id
        ) AS totalRevisiones,
        e.fechaEnvioRevision,
        e.fechaAprobacion,
        e.fechaRechazo,
        e.comentariosAprobacion,
        e.comentariosRechazo,
        e.activo
    FROM Expedientes e
    LEFT JOIN Usuarios u1 ON e.usuarioRegistroId = u1.id
    LEFT JOIN Usuarios u2 ON e.coordinadorId = u2.id
    WHERE e.activo = 1
    AND (@fechaInicio IS NULL OR e.fechaRegistro >= @fechaInicio)
    AND (@fechaFin IS NULL OR e.fechaRegistro <= @fechaFin)
    AND (@estado IS NULL OR e.estado = @estado)
    ORDER BY e.fechaRegistro DESC;
END;
GO

PRINT 'sp_obtener_reporte_detallado creado correctamente.';
PRINT '';

-- =============================================
-- 3. sp_obtener_estadisticas_por_usuario
-- =============================================
PRINT 'Creando sp_obtener_estadisticas_por_usuario...';
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_obtener_estadisticas_por_usuario')
    DROP PROCEDURE sp_obtener_estadisticas_por_usuario;
GO

CREATE PROCEDURE sp_obtener_estadisticas_por_usuario
    @fechaInicio DATETIME = NULL,
    @fechaFin DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

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
        (
            SELECT COUNT(*)
            FROM Indicios i
            INNER JOIN Expedientes e2 ON i.expedienteId = e2.id
            WHERE e2.usuarioRegistroId = u.id
            AND i.activo = 1
            AND e2.activo = 1
            AND (@fechaInicio IS NULL OR e2.fechaRegistro >= @fechaInicio)
            AND (@fechaFin IS NULL OR e2.fechaRegistro <= @fechaFin)
        ) AS totalIndiciosCreados
    FROM Usuarios u
    LEFT JOIN Expedientes e ON e.usuarioRegistroId = u.id 
        AND e.activo = 1
        AND (@fechaInicio IS NULL OR e.fechaRegistro >= @fechaInicio)
        AND (@fechaFin IS NULL OR e.fechaRegistro <= @fechaFin)
    WHERE u.activo = 1
    GROUP BY u.id, u.nombre, u.email, u.rol
    ORDER BY totalExpedientes DESC;
END;
GO

PRINT 'sp_obtener_estadisticas_por_usuario creado correctamente.';
PRINT '';

PRINT '========================================';
PRINT 'INSTALACIÓN COMPLETADA EXITOSAMENTE';
PRINT '========================================';
PRINT '';
PRINT 'Se crearon 3 stored procedures:';
PRINT '1. sp_obtener_estadisticas_expedientes';
PRINT '2. sp_obtener_reporte_detallado';
PRINT '3. sp_obtener_estadisticas_por_usuario';
PRINT '';
