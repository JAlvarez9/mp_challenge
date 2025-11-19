-- =============================================
-- MIGRACIÓN v2.0.0 - MÓDULO DE EXPEDIENTES
-- Fecha: 2025-11-19
-- Descripción: Creación de tablas y SPs para gestión de expedientes e indicios
-- =============================================

USE [NombreDeTuBaseDeDatos]; -- CAMBIAR POR EL NOMBRE DE TU BD
GO

-- =============================================
-- 1. CREAR TABLA EXPEDIENTES
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Expedientes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Expedientes](
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [numeroExpediente] NVARCHAR(50) NOT NULL UNIQUE,
        [fechaRegistro] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [descripcion] NVARCHAR(500) NULL,
        [estado] NVARCHAR(20) NOT NULL DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'EN_REVISION', 'APROBADO', 'RECHAZADO')),
        [usuarioRegistroId] UNIQUEIDENTIFIER NOT NULL,
        [coordinadorId] UNIQUEIDENTIFIER NULL,
        [fechaRevision] DATETIME2 NULL,
        [comentariosRevision] NVARCHAR(1000) NULL,
        [isActive] BIT NOT NULL DEFAULT 1,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [createdBy] NVARCHAR(255) NOT NULL,
        [updatedBy] NVARCHAR(255) NOT NULL,
        FOREIGN KEY ([usuarioRegistroId]) REFERENCES [Usuarios]([id]),
        FOREIGN KEY ([coordinadorId]) REFERENCES [Usuarios]([id])
    );

    PRINT '✅ Tabla Expedientes creada correctamente';
END
ELSE
BEGIN
    PRINT '⚠️ La tabla Expedientes ya existe';
END
GO

-- =============================================
-- 2. CREAR TABLA INDICIOS
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Indicios]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Indicios](
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [expedienteId] UNIQUEIDENTIFIER NOT NULL,
        [numeroIndicio] NVARCHAR(50) NOT NULL,
        [descripcion] NVARCHAR(500) NOT NULL,
        [color] NVARCHAR(50) NULL,
        [tamano] NVARCHAR(100) NULL,
        [peso] DECIMAL(10, 2) NULL,
        [ubicacion] NVARCHAR(200) NULL,
        [observaciones] NVARCHAR(1000) NULL,
        [usuarioRegistroId] UNIQUEIDENTIFIER NOT NULL,
        [isActive] BIT NOT NULL DEFAULT 1,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [createdBy] NVARCHAR(255) NOT NULL,
        [updatedBy] NVARCHAR(255) NOT NULL,
        FOREIGN KEY ([expedienteId]) REFERENCES [Expedientes]([id]) ON DELETE CASCADE,
        FOREIGN KEY ([usuarioRegistroId]) REFERENCES [Usuarios]([id])
    );

    PRINT '✅ Tabla Indicios creada correctamente';
END
ELSE
BEGIN
    PRINT '⚠️ La tabla Indicios ya existe';
END
GO

-- =============================================
-- 3. CREAR TABLA HISTORIAL_REVISIONES
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HistorialRevisiones]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[HistorialRevisiones](
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [expedienteId] UNIQUEIDENTIFIER NOT NULL,
        [usuarioRevisorId] UNIQUEIDENTIFIER NOT NULL,
        [accion] NVARCHAR(30) NOT NULL CHECK (accion IN ('APROBADO', 'RECHAZADO', 'SOLICITADO_CAMBIOS')),
        [comentarios] NVARCHAR(1000) NULL,
        [fechaRevision] DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY ([expedienteId]) REFERENCES [Expedientes]([id]) ON DELETE CASCADE,
        FOREIGN KEY ([usuarioRevisorId]) REFERENCES [Usuarios]([id])
    );

    PRINT '✅ Tabla HistorialRevisiones creada correctamente';
END
ELSE
BEGIN
    PRINT '⚠️ La tabla HistorialRevisiones ya existe';
END
GO

-- =============================================
-- 4. CREAR ÍNDICES
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Expedientes_NumeroExpediente' AND object_id = OBJECT_ID('Expedientes'))
BEGIN
    CREATE INDEX IX_Expedientes_NumeroExpediente ON Expedientes(numeroExpediente);
    PRINT '✅ Índice IX_Expedientes_NumeroExpediente creado';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Expedientes_Estado' AND object_id = OBJECT_ID('Expedientes'))
BEGIN
    CREATE INDEX IX_Expedientes_Estado ON Expedientes(estado);
    PRINT '✅ Índice IX_Expedientes_Estado creado';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Expedientes_UsuarioRegistroId' AND object_id = OBJECT_ID('Expedientes'))
BEGIN
    CREATE INDEX IX_Expedientes_UsuarioRegistroId ON Expedientes(usuarioRegistroId);
    PRINT '✅ Índice IX_Expedientes_UsuarioRegistroId creado';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Indicios_ExpedienteId' AND object_id = OBJECT_ID('Indicios'))
BEGIN
    CREATE INDEX IX_Indicios_ExpedienteId ON Indicios(expedienteId);
    PRINT '✅ Índice IX_Indicios_ExpedienteId creado';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HistorialRevisiones_ExpedienteId' AND object_id = OBJECT_ID('HistorialRevisiones'))
BEGIN
    CREATE INDEX IX_HistorialRevisiones_ExpedienteId ON HistorialRevisiones(expedienteId);
    PRINT '✅ Índice IX_HistorialRevisiones_ExpedienteId creado';
END
GO

PRINT '';
PRINT '========================================';
PRINT '✅ TABLAS E ÍNDICES CREADOS';
PRINT '========================================';
PRINT 'Ahora ejecuta los Stored Procedures...';
