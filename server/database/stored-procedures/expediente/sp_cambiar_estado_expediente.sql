-- =============================================
-- SP: sp_cambiar_estado_expediente
-- Descripción: Cambia el estado de un expediente (enviar a revisión, etc.)
-- =============================================
CREATE OR ALTER PROCEDURE sp_cambiar_estado_expediente
    @id UNIQUEIDENTIFIER,
    @nuevoEstado NVARCHAR(20),
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @id AND isActive = 1)
        BEGIN
            THROW 50104, 'Expediente no encontrado', 1;
        END
        
        -- Validar estados permitidos
        IF @nuevoEstado NOT IN ('BORRADOR', 'EN_REVISION', 'APROBADO', 'RECHAZADO')
        BEGIN
            THROW 50105, 'Estado no válido', 1;
        END
        
        -- Validar que tenga al menos un indicio si va a revisión
        IF @nuevoEstado = 'EN_REVISION'
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM Indicios WHERE expedienteId = @id AND isActive = 1)
            BEGIN
                THROW 50106, 'El expediente debe tener al menos un indicio para enviarse a revisión', 1;
            END
        END
        
        UPDATE Expedientes
        SET 
            estado = @nuevoEstado,
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
