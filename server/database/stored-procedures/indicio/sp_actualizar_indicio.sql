-- =============================================
-- SP: sp_actualizar_indicio
-- Descripción: Actualiza un indicio existente
-- =============================================
CREATE OR ALTER PROCEDURE sp_actualizar_indicio
    @id UNIQUEIDENTIFIER,
    @descripcion NVARCHAR(500) = NULL,
    @color NVARCHAR(50) = NULL,
    @tamano NVARCHAR(100) = NULL,
    @peso DECIMAL(10, 2) = NULL,
    @ubicacion NVARCHAR(200) = NULL,
    @observaciones NVARCHAR(1000) = NULL,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @expedienteId UNIQUEIDENTIFIER;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Indicios WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50204, 'Indicio no encontrado', 1;
        END
        
        -- Obtener el expediente al que pertenece
        SELECT @expedienteId = expedienteId FROM Indicios WHERE id = @id;
        
        -- Verificar que el expediente esté en BORRADOR o RECHAZADO
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND estado IN ('BORRADOR', 'RECHAZADO'))
        BEGIN
            THROW 50205, 'Solo se pueden editar indicios de expedientes en estado BORRADOR o RECHAZADO', 1;
        END
        
        UPDATE Indicios
        SET 
            descripcion = COALESCE(@descripcion, descripcion),
            color = COALESCE(@color, color),
            tamano = COALESCE(@tamano, tamano),
            peso = COALESCE(@peso, peso),
            ubicacion = COALESCE(@ubicacion, ubicacion),
            observaciones = COALESCE(@observaciones, observaciones),
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        -- Retornar el indicio actualizado
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
