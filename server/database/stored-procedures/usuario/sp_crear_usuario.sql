-- =============================================
-- Stored Procedure: sp_crear_usuario
-- Descripción: Crea un nuevo usuario en el sistema
-- =============================================
CREATE OR ALTER PROCEDURE sp_crear_usuario
    @nombre NVARCHAR(100),
    @correo NVARCHAR(255),
    @password NVARCHAR(255),
    @rol NVARCHAR(20) = 'USER',
    @createdBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id UNIQUEIDENTIFIER = NEWID();
    DECLARE @now DATETIME2 = GETDATE();
    
    BEGIN TRY
        -- Verificar si el correo ya existe
        IF EXISTS (SELECT 1 FROM Usuarios WHERE correo = @correo)
        BEGIN
            THROW 50001, 'El correo ya está registrado', 1;
        END
        
        -- Insertar el usuario
        INSERT INTO Usuarios (
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
        )
        VALUES (
            @id,
            @nombre,
            @correo,
            @password,
            @rol,
            1,
            @now,
            @now,
            @createdBy,
            @createdBy
        );
        
        -- Retornar el usuario creado
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
