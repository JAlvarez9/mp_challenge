-- =============================================
-- MIGRACIÓN INICIAL - v1.0.0
-- Fecha: 2025-11-19
-- Descripción: Creación de tabla Usuarios y Stored Procedures
-- =============================================

USE [NombreDeTuBaseDeDatos]; -- CAMBIAR POR EL NOMBRE DE TU BD
GO

-- =============================================
-- 1. CREAR TABLA USUARIOS
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Usuarios](
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [nombre] NVARCHAR(100) NOT NULL,
        [correo] NVARCHAR(255) NOT NULL UNIQUE,
        [password] NVARCHAR(255) NOT NULL,
        [rol] NVARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (rol IN ('ADMIN', 'USER', 'MODERADOR')),
        [isActive] BIT NOT NULL DEFAULT 1,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [createdBy] NVARCHAR(255) NOT NULL,
        [updatedBy] NVARCHAR(255) NOT NULL
    );

    PRINT '✅ Tabla Usuarios creada correctamente';
END
ELSE
BEGIN
    PRINT '⚠️ La tabla Usuarios ya existe';
END
GO

-- =============================================
-- 2. CREAR ÍNDICES
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuarios_Correo' AND object_id = OBJECT_ID('Usuarios'))
BEGIN
    CREATE INDEX IX_Usuarios_Correo ON Usuarios(correo);
    PRINT '✅ Índice IX_Usuarios_Correo creado';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuarios_Rol' AND object_id = OBJECT_ID('Usuarios'))
BEGIN
    CREATE INDEX IX_Usuarios_Rol ON Usuarios(rol);
    PRINT '✅ Índice IX_Usuarios_Rol creado';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuarios_IsActive' AND object_id = OBJECT_ID('Usuarios'))
BEGIN
    CREATE INDEX IX_Usuarios_IsActive ON Usuarios(isActive);
    PRINT '✅ Índice IX_Usuarios_IsActive creado';
END
GO

-- =============================================
-- 3. STORED PROCEDURE: sp_crear_usuario
-- =============================================
CREATE OR ALTER PROCEDURE sp_crear_usuario
    @nombre NVARCHAR(100),
    @correo NVARCHAR(255),
    @password NVARCHAR(255),
    @rol NVARCHAR(20) = 'USER',
    @createdBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id UNIQUEIDENTIFIER = NEWID();
    DECLARE @now DATETIME2 = GETDATE();
    
    BEGIN TRY
        -- Verificar si el correo ya existe
        IF EXISTS (SELECT 1 FROM Usuarios WHERE correo = @correo)
        BEGIN
            THROW 50001, 'El correo ya está registrado', 1;
        END
        
        -- Insertar el usuario
        INSERT INTO Usuarios (
            id, nombre, correo, password, rol, isActive,
            createdAt, updatedAt, createdBy, updatedBy
        )
        VALUES (
            @id, @nombre, @correo, @password, @rol, 1,
            @now, @now, @createdBy, @createdBy
        );
        
        -- Retornar el usuario creado
        SELECT id, nombre, correo, rol, isActive, createdAt, updatedAt, createdBy, updatedBy
        FROM Usuarios WHERE id = @id;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_crear_usuario creado';
GO

-- =============================================
-- 4. STORED PROCEDURE: sp_obtener_todos_usuarios
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_todos_usuarios
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, nombre, correo, rol, isActive, createdAt, updatedAt, createdBy, updatedBy
    FROM Usuarios
    WHERE isActive = 1
    ORDER BY createdAt DESC;
END
GO
PRINT '✅ SP sp_obtener_todos_usuarios creado';
GO

-- =============================================
-- 5. STORED PROCEDURE: sp_obtener_usuario_por_id
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_usuario_por_id
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, nombre, correo, rol, isActive, createdAt, updatedAt, createdBy, updatedBy
    FROM Usuarios
    WHERE id = @id AND isActive = 1;
END
GO
PRINT '✅ SP sp_obtener_usuario_por_id creado';
GO

-- =============================================
-- 6. STORED PROCEDURE: sp_obtener_usuario_por_correo
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_usuario_por_correo
    @correo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, nombre, correo, password, rol, isActive, createdAt, updatedAt, createdBy, updatedBy
    FROM Usuarios
    WHERE correo = @correo AND isActive = 1;
END
GO
PRINT '✅ SP sp_obtener_usuario_por_correo creado';
GO

-- =============================================
-- 7. STORED PROCEDURE: sp_actualizar_usuario
-- =============================================
CREATE OR ALTER PROCEDURE sp_actualizar_usuario
    @id UNIQUEIDENTIFIER,
    @nombre NVARCHAR(100) = NULL,
    @correo NVARCHAR(255) = NULL,
    @password NVARCHAR(255) = NULL,
    @rol NVARCHAR(20) = NULL,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50002, 'Usuario no encontrado', 1;
        END
        
        IF @correo IS NOT NULL AND EXISTS (SELECT 1 FROM Usuarios WHERE correo = @correo AND id != @id)
        BEGIN
            THROW 50003, 'El correo ya está en uso por otro usuario', 1;
        END
        
        UPDATE Usuarios
        SET 
            nombre = COALESCE(@nombre, nombre),
            correo = COALESCE(@correo, correo),
            password = COALESCE(@password, password),
            rol = COALESCE(@rol, rol),
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        SELECT id, nombre, correo, rol, isActive, createdAt, updatedAt, createdBy, updatedBy
        FROM Usuarios WHERE id = @id;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_actualizar_usuario creado';
GO

-- =============================================
-- 8. STORED PROCEDURE: sp_eliminar_usuario
-- =============================================
CREATE OR ALTER PROCEDURE sp_eliminar_usuario
    @id UNIQUEIDENTIFIER,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50004, 'Usuario no encontrado', 1;
        END
        
        UPDATE Usuarios
        SET isActive = 0, updatedAt = GETDATE(), updatedBy = @updatedBy
        WHERE id = @id;
        
        SELECT 1 AS success;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT '✅ SP sp_eliminar_usuario creado';
GO

-- =============================================
-- 9. INSERTAR USUARIO ADMINISTRADOR INICIAL
-- =============================================
-- Nota: El password 'admin123' debe ser hasheado desde la aplicación
-- Este es solo un ejemplo, ejecuta el registro desde la API
PRINT '⚠️ Recuerda crear el usuario administrador inicial desde la API';
PRINT '   POST /api/auth/register con los datos del admin';
GO

PRINT '';
PRINT '========================================';
PRINT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
PRINT '========================================';
