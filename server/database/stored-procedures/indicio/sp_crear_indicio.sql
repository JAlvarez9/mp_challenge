-- =============================================
-- SP: sp_crear_indicio
-- Descripción: Crea un nuevo indicio dentro de un expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_crear_indicio
    @expedienteId UNIQUEIDENTIFIER,
    @numeroIndicio NVARCHAR(50),
    @descripcion NVARCHAR(500),
    @color NVARCHAR(50) = NULL,
    @tamano NVARCHAR(100) = NULL,
    @peso DECIMAL(10, 2) = NULL,
    @ubicacion NVARCHAR(200) = NULL,
    @observaciones NVARCHAR(1000) = NULL,
    @usuarioRegistroId UNIQUEIDENTIFIER,
    @createdBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id UNIQUEIDENTIFIER = NEWID();
    DECLARE @now DATETIME2 = GETDATE();
    
    BEGIN TRY
        -- Verificar que el expediente existe y está activo
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND isActive = 1)
        BEGIN
            THROW 50201, 'Expediente no encontrado', 1;
        END
        
        -- Verificar que el expediente esté en BORRADOR o RECHAZADO
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND estado IN ('BORRADOR', 'RECHAZADO'))
        BEGIN
            THROW 50202, 'Solo se pueden agregar indicios a expedientes en estado BORRADOR o RECHAZADO', 1;
        END
        
        -- Verificar que el número de indicio no se repita en el mismo expediente
        IF EXISTS (SELECT 1 FROM Indicios WHERE expedienteId = @expedienteId AND numeroIndicio = @numeroIndicio AND isActive = 1)
        BEGIN
            THROW 50203, 'El número de indicio ya existe en este expediente', 1;
        END
        
        INSERT INTO Indicios (
            id, expedienteId, numeroIndicio, descripcion, color, tamano, peso,
            ubicacion, observaciones, usuarioRegistroId, isActive,
            createdAt, updatedAt, createdBy, updatedBy
        )
        VALUES (
            @id, @expedienteId, @numeroIndicio, @descripcion, @color, @tamano, @peso,
            @ubicacion, @observaciones, @usuarioRegistroId, 1,
            @now, @now, @createdBy, @createdBy
        );
        
        -- Retornar el indicio creado con datos del usuario
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
            i.createdBy,
            i.updatedBy,
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
