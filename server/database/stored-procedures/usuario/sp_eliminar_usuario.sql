-- =============================================
-- Stored Procedure: sp_eliminar_usuario
-- Descripción: Eliminación lógica de un usuario (soft delete)
-- =============================================
CREATE OR ALTER PROCEDURE sp_eliminar_usuario
    @id UNIQUEIDENTIFIER,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verificar si el usuario existe
        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50004, 'Usuario no encontrado', 1;
        END
        
        -- Soft delete: marcar como inactivo
        UPDATE Usuarios
        SET 
            isActive = 0,
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        -- Retornar éxito
        SELECT 1 AS success;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
