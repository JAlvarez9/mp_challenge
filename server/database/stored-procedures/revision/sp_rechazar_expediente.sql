-- =============================================
-- SP: sp_rechazar_expediente
-- Descripción: Rechaza un expediente en revisión
-- =============================================
CREATE OR ALTER PROCEDURE sp_rechazar_expediente
    @expedienteId UNIQUEIDENTIFIER,
    @coordinadorId UNIQUEIDENTIFIER,
    @comentarios NVARCHAR(1000),
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @historialId UNIQUEIDENTIFIER = NEWID();
    DECLARE @now DATETIME2 = GETDATE();
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND isActive = 1)
        BEGIN
            THROW 50303, 'Expediente no encontrado', 1;
        END
        
        -- Verificar que esté en revisión
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND estado = 'EN_REVISION')
        BEGIN
            THROW 50304, 'Solo se pueden rechazar expedientes en estado EN_REVISION', 1;
        END
        
        -- Validar que se proporcionen comentarios
        IF @comentarios IS NULL OR LTRIM(RTRIM(@comentarios)) = ''
        BEGIN
            THROW 50305, 'Debe proporcionar comentarios al rechazar un expediente', 1;
        END
        
        -- Actualizar el expediente a RECHAZADO
        UPDATE Expedientes
        SET 
            estado = 'RECHAZADO',
            coordinadorId = @coordinadorId,
            fechaRevision = @now,
            comentariosRevision = @comentarios,
            updatedAt = @now,
            updatedBy = @updatedBy
        WHERE id = @expedienteId;
        
        -- Registrar en el historial
        INSERT INTO HistorialRevisiones (
            id, expedienteId, usuarioRevisorId, accion, comentarios, fechaRevision
        )
        VALUES (
            @historialId, @expedienteId, @coordinadorId, 'RECHAZADO', @comentarios, @now
        );
        
        -- Retornar el expediente actualizado
        EXEC sp_obtener_expediente_por_id @id = @expedienteId;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
