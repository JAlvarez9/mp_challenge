-- Script de inicialización de la base de datos
-- Se ejecuta automáticamente al levantar el contenedor de SQL Server

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ExpedientesDB')
BEGIN
    CREATE DATABASE ExpedientesDB;
END
GO

USE ExpedientesDB;
GO

-- Verificar que las tablas existan o crearlas
PRINT 'Base de datos inicializada correctamente';
GO
