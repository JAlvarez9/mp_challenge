-- =============================================
-- SP: sp_actualizar_expediente
-- Descripción: Actualiza los datos de un expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_actualizar_expediente
    @id UNIQUEIDENTIFIER,
    @descripcion NVARCHAR(500) = NULL,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50102, 'Expediente no encontrado', 1;
        END
        
        -- Verificar que el expediente esté en BORRADOR
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @id AND estado = 'BORRADOR')
        BEGIN
            THROW 50103, 'Solo se pueden editar expedientes en estado BORRADOR', 1;
        END
        
        UPDATE Expedientes
        SET 
            descripcion = COALESCE(@descripcion, descripcion),
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        -- Retornar el expediente actualizado
        EXEC sp_obtener_expediente_por_id @id = @id;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
