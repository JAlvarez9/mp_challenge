-- =============================================
-- SCRIPT COMPLETO: Módulo de Expedientes
-- Ejecutar en orden para crear todo el módulo
-- =============================================

USE [TuBaseDeDatos]; -- Cambiar por el nombre de tu base de datos
GO

-- =============================================
-- PASO 1: CREAR TABLAS
-- =============================================

PRINT '========================================';
PRINT 'PASO 1: Creando tablas...';
PRINT '========================================';

-- Tabla Expedientes
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Expedientes')
BEGIN
    CREATE TABLE Expedientes (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        numeroExpediente NVARCHAR(50) NOT NULL UNIQUE,
        fechaRegistro DATETIME2 NOT NULL DEFAULT GETDATE(),
        descripcion NVARCHAR(MAX) NULL,
        estado NVARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
        usuarioRegistroId UNIQUEIDENTIFIER NOT NULL,
        coordinadorId UNIQUEIDENTIFIER NULL,
        fechaRevision DATETIME2 NULL,
        comentariosRevision NVARCHAR(MAX) NULL,
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        createdBy NVARCHAR(255) NOT NULL,
        updatedBy NVARCHAR(255) NOT NULL,
        CONSTRAINT FK_Expedientes_UsuarioRegistro FOREIGN KEY (usuarioRegistroId) REFERENCES Usuarios(id),
        CONSTRAINT FK_Expedientes_Coordinador FOREIGN KEY (coordinadorId) REFERENCES Usuarios(id),
        CONSTRAINT CK_Expedientes_Estado CHECK (estado IN ('BORRADOR', 'EN_REVISION', 'APROBADO', 'RECHAZADO'))
    );
    
    CREATE INDEX IX_Expedientes_UsuarioRegistro ON Expedientes(usuarioRegistroId);
    CREATE INDEX IX_Expedientes_Estado ON Expedientes(estado);
    CREATE INDEX IX_Expedientes_NumeroExpediente ON Expedientes(numeroExpediente);
    
    PRINT 'Tabla Expedientes creada exitosamente';
END
ELSE
    PRINT 'Tabla Expedientes ya existe';
GO

-- Tabla Indicios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Indicios')
BEGIN
    CREATE TABLE Indicios (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        expedienteId UNIQUEIDENTIFIER NOT NULL,
        numeroIndicio NVARCHAR(50) NOT NULL,
        descripcion NVARCHAR(MAX) NOT NULL,
        color NVARCHAR(50) NULL,
        tamano NVARCHAR(100) NULL,
        peso DECIMAL(10, 2) NULL,
        ubicacion NVARCHAR(255) NULL,
        observaciones NVARCHAR(MAX) NULL,
        usuarioRegistroId UNIQUEIDENTIFIER NOT NULL,
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        createdBy NVARCHAR(255) NOT NULL,
        updatedBy NVARCHAR(255) NOT NULL,
        CONSTRAINT FK_Indicios_Expediente FOREIGN KEY (expedienteId) REFERENCES Expedientes(id) ON DELETE CASCADE,
        CONSTRAINT FK_Indicios_Usuario FOREIGN KEY (usuarioRegistroId) REFERENCES Usuarios(id),
        CONSTRAINT UQ_Indicios_NumeroIndicio UNIQUE (expedienteId, numeroIndicio)
    );
    
    CREATE INDEX IX_Indicios_Expediente ON Indicios(expedienteId);
    
    PRINT 'Tabla Indicios creada exitosamente';
END
ELSE
    PRINT 'Tabla Indicios ya existe';
GO

-- Tabla HistorialRevisiones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HistorialRevisiones')
BEGIN
    CREATE TABLE HistorialRevisiones (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        expedienteId UNIQUEIDENTIFIER NOT NULL,
        usuarioRevisorId UNIQUEIDENTIFIER NOT NULL,
        accion NVARCHAR(30) NOT NULL,
        comentarios NVARCHAR(1000) NULL,
        fechaRevision DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_HistorialRevisiones_Expediente FOREIGN KEY (expedienteId) REFERENCES Expedientes(id) ON DELETE CASCADE,
        CONSTRAINT FK_HistorialRevisiones_Usuario FOREIGN KEY (usuarioRevisorId) REFERENCES Usuarios(id),
        CONSTRAINT CK_HistorialRevisiones_Accion CHECK (accion IN ('APROBADO', 'RECHAZADO', 'SOLICITADO_CAMBIOS'))
    );
    
    CREATE INDEX IX_HistorialRevisiones_Expediente ON HistorialRevisiones(expedienteId);
    CREATE INDEX IX_HistorialRevisiones_Usuario ON HistorialRevisiones(usuarioRevisorId);
    
    PRINT 'Tabla HistorialRevisiones creada exitosamente';
END
ELSE
    PRINT 'Tabla HistorialRevisiones ya existe';
GO

PRINT '';
PRINT '========================================';
PRINT 'PASO 2: Creando Stored Procedures de Expedientes...';
PRINT '========================================';

-- =============================================
-- SP: sp_crear_expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_crear_expediente
    @numeroExpediente NVARCHAR(50),
    @descripcion NVARCHAR(MAX) = NULL,
    @usuarioRegistroId UNIQUEIDENTIFIER,
    @createdBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el número de expediente sea único
        IF EXISTS (SELECT 1 FROM Expedientes WHERE numeroExpediente = @numeroExpediente AND isActive = 1)
        BEGIN
            THROW 50101, 'Ya existe un expediente con este número', 1;
        END

        DECLARE @expedienteId UNIQUEIDENTIFIER = NEWID();
        
        INSERT INTO Expedientes (
            id,
            numeroExpediente,
            fechaRegistro,
            descripcion,
            estado,
            usuarioRegistroId,
            isActive,
            createdAt,
            updatedAt,
            createdBy,
            updatedBy
        )
        VALUES (
            @expedienteId,
            @numeroExpediente,
            GETDATE(),
            @descripcion,
            'BORRADOR',
            @usuarioRegistroId,
            1,
            GETDATE(),
            GETDATE(),
            @createdBy,
            @createdBy
        );
        
        -- Devolver el expediente creado
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
            u.correo as usuarioRegistroCorreo
        FROM Expedientes e
        INNER JOIN Usuarios u ON e.usuarioRegistroId = u.id
        WHERE e.id = @expedienteId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_crear_expediente creado';

-- =============================================
-- SP: sp_obtener_expedientes
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
PRINT 'SP sp_obtener_expedientes creado';

-- =============================================
-- SP: sp_obtener_expediente_por_id
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
        u.nombre as usuarioRegistroNombre,
        u.correo as usuarioRegistroCorreo,
        c.nombre as coordinadorNombre,
        c.correo as coordinadorCorreo,
        (SELECT COUNT(*) FROM Indicios WHERE expedienteId = e.id AND isActive = 1) as totalIndicios
    FROM Expedientes e
    INNER JOIN Usuarios u ON e.usuarioRegistroId = u.id
    LEFT JOIN Usuarios c ON e.coordinadorId = c.id
    WHERE e.id = @id AND e.isActive = 1;
END
GO
PRINT 'SP sp_obtener_expediente_por_id creado';

-- =============================================
-- SP: sp_actualizar_expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_actualizar_expediente
    @id UNIQUEIDENTIFIER,
    @descripcion NVARCHAR(MAX) = NULL,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el expediente existe
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50102, 'El expediente no existe', 1;
        END

        -- Validar que el expediente está en estado BORRADOR
        DECLARE @estadoActual NVARCHAR(20);
        SELECT @estadoActual = estado FROM Expedientes WHERE id = @id;
        
        IF @estadoActual != 'BORRADOR'
        BEGIN
            THROW 50103, 'Solo se pueden actualizar expedientes en estado BORRADOR', 1;
        END

        UPDATE Expedientes
        SET descripcion = ISNULL(@descripcion, descripcion),
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        -- Devolver el expediente actualizado
        EXEC sp_obtener_expediente_por_id @id = @id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_actualizar_expediente creado';

-- =============================================
-- SP: sp_cambiar_estado_expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_cambiar_estado_expediente
    @id UNIQUEIDENTIFIER,
    @nuevoEstado NVARCHAR(20),
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el expediente existe
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50104, 'El expediente no existe', 1;
        END

        -- Si el nuevo estado es EN_REVISION, validar que tenga al menos 1 indicio
        IF @nuevoEstado = 'EN_REVISION'
        BEGIN
            DECLARE @totalIndicios INT;
            SELECT @totalIndicios = COUNT(*) FROM Indicios WHERE expedienteId = @id AND isActive = 1;
            
            IF @totalIndicios = 0
            BEGIN
                THROW 50105, 'El expediente debe tener al menos un indicio para enviarlo a revisión', 1;
            END
        END

        UPDATE Expedientes
        SET estado = @nuevoEstado,
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        -- Devolver el expediente actualizado
        EXEC sp_obtener_expediente_por_id @id = @id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_cambiar_estado_expediente creado';

-- =============================================
-- SP: sp_eliminar_expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_eliminar_expediente
    @id UNIQUEIDENTIFIER,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el expediente existe
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50106, 'El expediente no existe', 1;
        END

        -- Validar que el expediente está en estado BORRADOR
        DECLARE @estadoActual NVARCHAR(20);
        SELECT @estadoActual = estado FROM Expedientes WHERE id = @id;
        
        IF @estadoActual != 'BORRADOR'
        BEGIN
            THROW 50107, 'Solo se pueden eliminar expedientes en estado BORRADOR', 1;
        END

        -- Soft delete
        UPDATE Expedientes
        SET isActive = 0,
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        -- También marcar como inactivos los indicios
        UPDATE Indicios
        SET isActive = 0,
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE expedienteId = @id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_eliminar_expediente creado';

PRINT '';
PRINT '========================================';
PRINT 'PASO 3: Creando Stored Procedures de Indicios...';
PRINT '========================================';

-- =============================================
-- SP: sp_crear_indicio
-- =============================================
CREATE OR ALTER PROCEDURE sp_crear_indicio
    @expedienteId UNIQUEIDENTIFIER,
    @numeroIndicio NVARCHAR(50),
    @descripcion NVARCHAR(MAX),
    @color NVARCHAR(50) = NULL,
    @tamano NVARCHAR(100) = NULL,
    @peso DECIMAL(10, 2) = NULL,
    @ubicacion NVARCHAR(255) = NULL,
    @observaciones NVARCHAR(MAX) = NULL,
    @usuarioRegistroId UNIQUEIDENTIFIER,
    @createdBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el expediente existe
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND isActive = 1)
        BEGIN
            THROW 50201, 'El expediente no existe', 1;
        END

        -- Validar que el expediente está en estado BORRADOR
        DECLARE @estadoExpediente NVARCHAR(20);
        SELECT @estadoExpediente = estado FROM Expedientes WHERE id = @expedienteId;
        
        IF @estadoExpediente != 'BORRADOR'
        BEGIN
            THROW 50202, 'Solo se pueden agregar indicios a expedientes en estado BORRADOR', 1;
        END

        -- Validar que el número de indicio sea único para este expediente
        IF EXISTS (SELECT 1 FROM Indicios WHERE expedienteId = @expedienteId AND numeroIndicio = @numeroIndicio AND isActive = 1)
        BEGIN
            THROW 50203, 'Ya existe un indicio con este número en el expediente', 1;
        END

        DECLARE @indicioId UNIQUEIDENTIFIER = NEWID();
        
        INSERT INTO Indicios (
            id,
            expedienteId,
            numeroIndicio,
            descripcion,
            color,
            tamano,
            peso,
            ubicacion,
            observaciones,
            usuarioRegistroId,
            isActive,
            createdAt,
            updatedAt,
            createdBy,
            updatedBy
        )
        VALUES (
            @indicioId,
            @expedienteId,
            @numeroIndicio,
            @descripcion,
            @color,
            @tamano,
            @peso,
            @ubicacion,
            @observaciones,
            @usuarioRegistroId,
            1,
            GETDATE(),
            GETDATE(),
            @createdBy,
            @createdBy
        );
        
        -- Devolver el indicio creado
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
        WHERE i.id = @indicioId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_crear_indicio creado';

-- =============================================
-- SP: sp_obtener_indicios_expediente
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
PRINT 'SP sp_obtener_indicios_expediente creado';

-- =============================================
-- SP: sp_actualizar_indicio
-- =============================================
CREATE OR ALTER PROCEDURE sp_actualizar_indicio
    @id UNIQUEIDENTIFIER,
    @descripcion NVARCHAR(MAX) = NULL,
    @color NVARCHAR(50) = NULL,
    @tamano NVARCHAR(100) = NULL,
    @peso DECIMAL(10, 2) = NULL,
    @ubicacion NVARCHAR(255) = NULL,
    @observaciones NVARCHAR(MAX) = NULL,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el indicio existe
        IF NOT EXISTS (SELECT 1 FROM Indicios WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50204, 'El indicio no existe', 1;
        END

        -- Validar que el expediente está en estado BORRADOR
        DECLARE @estadoExpediente NVARCHAR(20);
        SELECT @estadoExpediente = e.estado 
        FROM Indicios i
        INNER JOIN Expedientes e ON i.expedienteId = e.id
        WHERE i.id = @id;
        
        IF @estadoExpediente != 'BORRADOR'
        BEGIN
            THROW 50205, 'Solo se pueden actualizar indicios de expedientes en estado BORRADOR', 1;
        END

        UPDATE Indicios
        SET descripcion = ISNULL(@descripcion, descripcion),
            color = ISNULL(@color, color),
            tamano = ISNULL(@tamano, tamano),
            peso = ISNULL(@peso, peso),
            ubicacion = ISNULL(@ubicacion, ubicacion),
            observaciones = ISNULL(@observaciones, observaciones),
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        -- Devolver el indicio actualizado
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
        WHERE i.id = @id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_actualizar_indicio creado';

-- =============================================
-- SP: sp_eliminar_indicio
-- =============================================
CREATE OR ALTER PROCEDURE sp_eliminar_indicio
    @id UNIQUEIDENTIFIER,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el indicio existe
        IF NOT EXISTS (SELECT 1 FROM Indicios WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50206, 'El indicio no existe', 1;
        END

        -- Validar que el expediente está en estado BORRADOR
        DECLARE @estadoExpediente NVARCHAR(20);
        SELECT @estadoExpediente = e.estado 
        FROM Indicios i
        INNER JOIN Expedientes e ON i.expedienteId = e.id
        WHERE i.id = @id;
        
        IF @estadoExpediente != 'BORRADOR'
        BEGIN
            THROW 50207, 'Solo se pueden eliminar indicios de expedientes en estado BORRADOR', 1;
        END

        -- Soft delete
        UPDATE Indicios
        SET isActive = 0,
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_eliminar_indicio creado';

PRINT '';
PRINT '========================================';
PRINT 'PASO 4: Creando Stored Procedures de Revisiones...';
PRINT '========================================';

-- =============================================
-- SP: sp_aprobar_expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_aprobar_expediente
    @expedienteId UNIQUEIDENTIFIER,
    @coordinadorId UNIQUEIDENTIFIER,
    @comentarios NVARCHAR(MAX) = NULL,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el expediente existe
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND isActive = 1)
        BEGIN
            THROW 50301, 'El expediente no existe', 1;
        END

        -- Validar que el expediente está en estado EN_REVISION
        DECLARE @estadoActual NVARCHAR(20);
        SELECT @estadoActual = estado FROM Expedientes WHERE id = @expedienteId;
        
        IF @estadoActual != 'EN_REVISION'
        BEGIN
            THROW 50302, 'Solo se pueden aprobar expedientes en estado EN_REVISION', 1;
        END

        -- Actualizar el expediente
        UPDATE Expedientes
        SET estado = 'APROBADO',
            coordinadorId = @coordinadorId,
            fechaRevision = GETDATE(),
            comentariosRevision = @comentarios,
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @expedienteId;
        
        -- Insertar en el historial
        INSERT INTO HistorialRevisiones (
            id,
            expedienteId,
            usuarioRevisorId,
            accion,
            comentarios,
            fechaRevision
        )
        VALUES (
            NEWID(),
            @expedienteId,
            @coordinadorId,
            'APROBADO',
            @comentarios,
            GETDATE()
        );
        
        -- Devolver el expediente actualizado
        EXEC sp_obtener_expediente_por_id @id = @expedienteId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_aprobar_expediente creado';

-- =============================================
-- SP: sp_rechazar_expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_rechazar_expediente
    @expedienteId UNIQUEIDENTIFIER,
    @coordinadorId UNIQUEIDENTIFIER,
    @comentarios NVARCHAR(MAX),
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el expediente existe
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND isActive = 1)
        BEGIN
            THROW 50303, 'El expediente no existe', 1;
        END

        -- Validar que el expediente está en estado EN_REVISION
        DECLARE @estadoActual NVARCHAR(20);
        SELECT @estadoActual = estado FROM Expedientes WHERE id = @expedienteId;
        
        IF @estadoActual != 'EN_REVISION'
        BEGIN
            THROW 50304, 'Solo se pueden rechazar expedientes en estado EN_REVISION', 1;
        END

        -- Validar que se proporcionaron comentarios
        IF @comentarios IS NULL OR LTRIM(RTRIM(@comentarios)) = ''
        BEGIN
            THROW 50305, 'Debe proporcionar comentarios al rechazar un expediente', 1;
        END

        -- Actualizar el expediente (regresa a BORRADOR)
        UPDATE Expedientes
        SET estado = 'BORRADOR',
            coordinadorId = @coordinadorId,
            fechaRevision = GETDATE(),
            comentariosRevision = @comentarios,
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @expedienteId;
        
        -- Insertar en el historial
        INSERT INTO HistorialRevisiones (
            id,
            expedienteId,
            usuarioRevisorId,
            accion,
            comentarios,
            fechaRevision
        )
        VALUES (
            NEWID(),
            @expedienteId,
            @coordinadorId,
            'RECHAZADO',
            @comentarios,
            GETDATE()
        );
        
        -- Devolver el expediente actualizado
        EXEC sp_obtener_expediente_por_id @id = @expedienteId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
PRINT 'SP sp_rechazar_expediente creado';

-- =============================================
-- SP: sp_obtener_historial_revisiones
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
        u.nombre as usuarioRevisorNombre,
        u.correo as usuarioRevisorCorreo
    FROM HistorialRevisiones h
    INNER JOIN Usuarios u ON h.usuarioRevisorId = u.id
    WHERE h.expedienteId = @expedienteId
    ORDER BY h.fechaRevision DESC;
END
GO
PRINT 'SP sp_obtener_historial_revisiones creado';

PRINT '';
PRINT '========================================';
PRINT 'INSTALACIÓN COMPLETADA EXITOSAMENTE';
PRINT '========================================';
PRINT '';
PRINT 'Resumen:';
PRINT '- 3 Tablas creadas (Expedientes, Indicios, HistorialRevisiones)';
PRINT '- 6 SPs de Expedientes creados';
PRINT '- 4 SPs de Indicios creados';
PRINT '- 3 SPs de Revisiones creados';
PRINT '';
PRINT 'Total: 13 Stored Procedures listos para usar';
PRINT '';
