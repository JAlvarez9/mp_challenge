-- =============================================
-- Stored Procedure: sp_obtener_usuario_por_id
-- Descripción: Obtiene un usuario por su ID
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_usuario_por_id
    @id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
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
    WHERE id = @id AND isActive = 1;
END
GO
