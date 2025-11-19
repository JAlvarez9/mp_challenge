-- =============================================
-- SP: sp_eliminar_indicio
-- Descripción: Eliminación lógica de un indicio
-- =============================================
CREATE OR ALTER PROCEDURE sp_eliminar_indicio
    @id UNIQUEIDENTIFIER,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @expedienteId UNIQUEIDENTIFIER;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Indicios WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50206, 'Indicio no encontrado', 1;
        END
        
        -- Obtener el expediente al que pertenece
        SELECT @expedienteId = expedienteId FROM Indicios WHERE id = @id;
        
        -- Verificar que el expediente esté en BORRADOR
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND estado = 'BORRADOR')
        BEGIN
            THROW 50207, 'Solo se pueden eliminar indicios de expedientes en estado BORRADOR', 1;
        END
        
        UPDATE Indicios
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
