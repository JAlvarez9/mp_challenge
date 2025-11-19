# Guía de Migraciones

## Estructura de Migraciones

Las migraciones son scripts SQL que se ejecutan manualmente en orden secuencial para crear y modificar la estructura de la base de datos.

## Convención de Nombres

```
[número]_[descripción].sql

Ejemplos:
- 001_initial_setup.sql
- 002_add_productos_table.sql
- 003_add_usuario_telefono_field.sql
```

## Cómo Ejecutar Migraciones

### Opción 1: SQL Server Management Studio (SSMS)

1. Abre SSMS y conecta a tu servidor
2. Abre el archivo `.sql` de migración
3. Cambia el nombre de la base de datos en la línea `USE [NombreDeTuBaseDeDatos]`
4. Ejecuta el script completo

### Opción 2: Azure Data Studio

1. Abre Azure Data Studio
2. Conecta a tu servidor
3. Abre el archivo de migración
4. Cambia el nombre de la base de datos
5. Ejecuta el script

### Opción 3: sqlcmd (Línea de comandos)

```bash
sqlcmd -S localhost -U tu_usuario -P tu_password -d tu_base_datos -i database/migrations/001_initial_setup.sql
```

## Orden de Ejecución

1. **001_initial_setup.sql** - Crea la tabla Usuarios y todos los Stored Procedures

## Registro de Migraciones Ejecutadas

Se recomienda mantener un registro manual de las migraciones ejecutadas:

| Versión | Archivo               | Fecha Ejecutada | Ejecutado Por |
| ------- | --------------------- | --------------- | ------------- |
| 1.0.0   | 001_initial_setup.sql | YYYY-MM-DD      | Nombre        |

## Rollback

Para revertir una migración, crea un script de rollback:

```
001_initial_setup_rollback.sql
```

Ejemplo de contenido:

```sql
-- Rollback de 001_initial_setup.sql
DROP PROCEDURE IF EXISTS sp_crear_usuario;
DROP PROCEDURE IF EXISTS sp_obtener_todos_usuarios;
-- ... etc
DROP TABLE IF EXISTS Usuarios;
```

## Mejores Prácticas

1. **Nunca modifiques** una migración que ya fue ejecutada en producción
2. **Siempre crea** una nueva migración para cambios adicionales
3. **Prueba** las migraciones en desarrollo antes de producción
4. **Documenta** cambios importantes en los comentarios del script
5. **Mantén backups** antes de ejecutar migraciones en producción

## Crear una Nueva Migración

1. Crea un nuevo archivo en `database/migrations/`
2. Usa el siguiente número secuencial (ej: 002, 003, etc.)
3. Incluye comentarios descriptivos
4. Prueba en desarrollo primero

## Usuario Administrador Inicial

Después de ejecutar la migración inicial, crea el usuario admin con:

```bash
POST http://localhost:3000/api/auth/register

{
  "nombre": "Administrador",
  "correo": "admin@example.com",
  "password": "admin123",
  "rol": "ADMIN"
}
```
