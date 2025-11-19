-- =============================================
-- SP: sp_aprobar_expediente
-- Descripción: Aprueba un expediente en revisión
-- =============================================
CREATE OR ALTER PROCEDURE sp_aprobar_expediente
    @expedienteId UNIQUEIDENTIFIER,
    @coordinadorId UNIQUEIDENTIFIER,
    @comentarios NVARCHAR(1000) = NULL,
    @updatedBy NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @historialId UNIQUEIDENTIFIER = NEWID();
    DECLARE @now DATETIME2 = GETDATE();
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND isActive = 1)
        BEGIN
            THROW 50301, 'Expediente no encontrado', 1;
        END
        
        -- Verificar que esté en revisión
        IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE id = @expedienteId AND estado = 'EN_REVISION')
        BEGIN
            THROW 50302, 'Solo se pueden aprobar expedientes en estado EN_REVISION', 1;
        END
        
        -- Actualizar el expediente
        UPDATE Expedientes
        SET 
            estado = 'APROBADO',
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
            @historialId, @expedienteId, @coordinadorId, 'APROBADO', @comentarios, @now
        );
        
        -- Retornar el expediente actualizado
        EXEC sp_obtener_expediente_por_id @id = @expedienteId;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
