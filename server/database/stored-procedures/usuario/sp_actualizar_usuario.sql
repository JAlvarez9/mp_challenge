-- =============================================
-- Stored Procedure: sp_actualizar_usuario
-- Descripción: Actualiza un usuario existente
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
        -- Verificar si el usuario existe
        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50002, 'Usuario no encontrado', 1;
        END
        
        -- Verificar si el correo ya está en uso por otro usuario
        IF @correo IS NOT NULL AND EXISTS (
            SELECT 1 FROM Usuarios 
            WHERE correo = @correo AND id != @id
        )
        BEGIN
            THROW 50003, 'El correo ya está en uso por otro usuario', 1;
        END
        
        -- Actualizar solo los campos proporcionados
        UPDATE Usuarios
        SET 
            nombre = COALESCE(@nombre, nombre),
            correo = COALESCE(@correo, correo),
            password = COALESCE(@password, password),
            rol = COALESCE(@rol, rol),
            updatedAt = GETDATE(),
            updatedBy = @updatedBy
        WHERE id = @id;
        
        -- Retornar el usuario actualizado
        SELECT 
            id,
            nombre,
            correo,
            rol,
            isActive,
            createdAt,
            updatedAt,
            createdBy,
            updatedBy
        FROM Usuarios
        WHERE id = @id;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
