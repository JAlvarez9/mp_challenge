-- =============================================
-- SP: sp_eliminar_expediente
-- Descripción: Eliminación lógica de un expediente
-- =============================================
CREATE OR ALTER PROCEDURE sp_eliminar_expediente
    @id UNIQUEIDENTIFIER,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50107, 'Expediente no encontrado', 1;
        END
        
        -- Solo se pueden eliminar expedientes en BORRADOR
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @id AND estado = 'BORRADOR')
        BEGIN
            THROW 50108, 'Solo se pueden eliminar expedientes en estado BORRADOR', 1;
        END
        
        UPDATE Expedientes
        SET 
            isActive = 0,
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        SELECT 1 AS success;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
