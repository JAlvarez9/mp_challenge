-- =============================================
-- Stored Procedure: sp_obtener_usuario_por_correo
-- Descripción: Obtiene un usuario por su correo (incluye password para auth)
-- =============================================
CREATE OR ALTER PROCEDURE sp_obtener_usuario_por_correo
    @correo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        id,
        nombre,
        correo,
        password,
        rol,
        isActive,
        createdAt,
        updatedAt,
        createdBy,
        updatedBy
    FROM Usuarios
    WHERE correo = @correo AND isActive = 1;
END
GO
