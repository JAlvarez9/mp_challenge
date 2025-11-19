-- =============================================
-- Stored Procedure: sp_obtener_todos_usuarios
-- Descripción: Obtiene todos los usuarios activos
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_todos_usuarios
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
    WHERE isActive = 1
    ORDER BY createdAt DESC;
END
GO
