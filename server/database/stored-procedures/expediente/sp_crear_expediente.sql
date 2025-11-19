-- =============================================
-- SP: sp_crear_expediente
-- Descripción: Crea un nuevo expediente DICRI
-- =============================================
CREATE OR ALTER PROCEDURE sp_crear_expediente
    @numeroExpediente NVARCHAR(50),
    @descripcion NVARCHAR(500) = NULL,
    @usuarioRegistroId UNIQUEIDENTIFIER,
    @createdBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id UNIQUEIDENTIFIER = NEWID();
    DECLARE @now DATETIME2 = GETDATE();
    
    BEGIN TRY
        -- Verificar si el número de expediente ya existe
        IF EXISTS (SELECT 1 FROM Expedientes WHERE numeroExpediente = @numeroExpediente)
        BEGIN
            THROW 50101, 'El número de expediente ya existe', 1;
        END
        
        -- Insertar el expediente
        INSERT INTO Expedientes (
            id, numeroExpediente, fechaRegistro, descripcion, estado,
            usuarioRegistroId, isActive, createdAt, updatedAt, createdBy, updatedBy
        )
        VALUES (
            @id, @numeroExpediente, @now, @descripcion, 'BORRADOR',
            @usuarioRegistroId, 1, @now, @now, @createdBy, @createdBy
        );
        
        -- Retornar el expediente creado con datos del usuario
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
            u.correo as usuarioRegistroCorreo
        FROM Expedientes e
        INNER JOIN Usuarios u ON e.usuarioRegistroId = u.id
        WHERE e.id = @id;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
