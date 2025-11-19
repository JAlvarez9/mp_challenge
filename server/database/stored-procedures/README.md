# Guía Completa de Stored Procedures

## 📚 Tabla de Contenidos

1. [Stored Procedures Disponibles](#stored-procedures-disponibles)
2. [Cómo Usar los SPs](#cómo-usar-los-sps)
3. [Ejemplos de Uso](#ejemplos-de-uso)
4. [Manejo de Errores](#manejo-de-errores)

---

## Stored Procedures Disponibles

### 1. `sp_crear_usuario`

Crea un nuevo usuario en el sistema.

**Parámetros:**

- `@nombre` (NVARCHAR(100)) - Nombre completo del usuario
- `@correo` (NVARCHAR(255)) - Email único del usuario
- `@password` (NVARCHAR(255)) - Password hasheado (bcrypt)
- `@rol` (NVARCHAR(20), opcional) - Rol del usuario (ADMIN, USER, MODERADOR). Default: 'USER'
- `@createdBy` (NVARCHAR(255)) - Email de quien crea el usuario

**Retorna:** Usuario creado (sin password)

**Errores:**

- 50001: El correo ya está registrado

---

### 2. `sp_obtener_todos_usuarios`

Obtiene todos los usuarios activos del sistema.

**Parámetros:** Ninguno

**Retorna:** Array de usuarios activos (sin password)

**Ejemplo SQL:**

```sql
EXEC sp_obtener_todos_usuarios;
```

---

### 3. `sp_obtener_usuario_por_id`

Obtiene un usuario específico por su ID.

**Parámetros:**

- `@id` (UNIQUEIDENTIFIER) - ID del usuario

**Retorna:** Usuario encontrado o NULL

**Ejemplo SQL:**

```sql
EXEC sp_obtener_usuario_por_id
    @id = '0EFA423E-F36B-1410-8696-00160A737F56';
```

---

### 4. `sp_obtener_usuario_por_correo`

Obtiene un usuario por su correo electrónico. **Incluye el password** (solo para autenticación).

**Parámetros:**

- `@correo` (NVARCHAR(255)) - Email del usuario

**Retorna:** Usuario encontrado con password o NULL

**⚠️ IMPORTANTE:** Este SP devuelve el password. Usar solo para autenticación.

**Ejemplo SQL:**

```sql
EXEC sp_obtener_usuario_por_correo
    @correo = 'admin@example.com';
```

---

### 5. `sp_actualizar_usuario`

Actualiza los datos de un usuario existente.

**Parámetros:**

- `@id` (UNIQUEIDENTIFIER) - ID del usuario
- `@nombre` (NVARCHAR(100), opcional) - Nuevo nombre
- `@correo` (NVARCHAR(255), opcional) - Nuevo correo
- `@password` (NVARCHAR(255), opcional) - Nuevo password hasheado
- `@rol` (NVARCHAR(20), opcional) - Nuevo rol
- `@updatedBy` (NVARCHAR(255)) - Email de quien actualiza

**Retorna:** Usuario actualizado

**Errores:**

- 50002: Usuario no encontrado
- 50003: El correo ya está en uso por otro usuario

**Nota:** Los parámetros opcionales que sean NULL no se actualizarán (mantienen su valor actual).

**Ejemplo SQL:**

```sql
EXEC sp_actualizar_usuario
    @id = '0EFA423E-F36B-1410-8696-00160A737F56',
    @nombre = 'Nuevo Nombre',
    @correo = NULL,  -- No se actualiza
    @password = NULL,  -- No se actualiza
    @rol = 'ADMIN',
    @updatedBy = 'admin@example.com';
```

---

### 6. `sp_eliminar_usuario`

Realiza una eliminación lógica (soft delete) de un usuario.

**Parámetros:**

- `@id` (UNIQUEIDENTIFIER) - ID del usuario
- `@updatedBy` (NVARCHAR(255)) - Email de quien elimina

**Retorna:** `{ success: 1 }`

**Errores:**

- 50004: Usuario no encontrado

**⚠️ NOTA:** Este SP NO elimina físicamente el registro, solo marca `isActive = 0`.

**Ejemplo SQL:**

```sql
EXEC sp_eliminar_usuario
    @id = '0EFA423E-F36B-1410-8696-00160A737F56',
    @updatedBy = 'admin@example.com';
```

---

## Cómo Usar los SPs

### Desde TypeScript (con UsuarioRepository)

```typescript
import { UsuarioRepository } from "./repositories/UsuarioRepository";

const repo = new UsuarioRepository();

// Crear usuario
const nuevoUsuario = await repo.crear({
  nombre: "Juan Pérez",
  correo: "juan@example.com",
  password: hashedPassword,
  rol: "USER",
  createdBy: "admin@example.com",
});

// Obtener todos
const usuarios = await repo.obtenerTodos();

// Obtener por ID
const usuario = await repo.obtenerPorId("id-del-usuario");

// Obtener por correo (con password)
const usuarioAuth = await repo.obtenerPorCorreo("juan@example.com");

// Actualizar
const actualizado = await repo.actualizar("id-del-usuario", {
  nombre: "Juan Carlos Pérez",
  rol: "ADMIN",
  updatedBy: "admin@example.com",
});

// Eliminar (soft delete)
await repo.eliminar("id-del-usuario", "admin@example.com");
```

---

### Desde SQL Server Management Studio

```sql
-- Crear usuario
EXEC sp_crear_usuario
    @nombre = 'María García',
    @correo = 'maria@example.com',
    @password = '$2a$10$hashedPasswordHere',
    @rol = 'USER',
    @createdBy = 'system';

-- Listar todos los usuarios
EXEC sp_obtener_todos_usuarios;

-- Buscar por ID
EXEC sp_obtener_usuario_por_id
    @id = '12345678-1234-1234-1234-123456789012';

-- Actualizar usuario
EXEC sp_actualizar_usuario
    @id = '12345678-1234-1234-1234-123456789012',
    @nombre = 'María Fernanda García',
    @updatedBy = 'admin@example.com';

-- Eliminar usuario
EXEC sp_eliminar_usuario
    @id = '12345678-1234-1234-1234-123456789012',
    @updatedBy = 'admin@example.com';
```

---

## Ejemplos de Uso

### Crear Usuario Administrador

```sql
DECLARE @hashedPassword NVARCHAR(255) = '$2a$10$abc123...';  -- Hash de bcrypt

EXEC sp_crear_usuario
    @nombre = 'Administrador Principal',
    @correo = 'admin@empresa.com',
    @password = @hashedPassword,
    @rol = 'ADMIN',
    @createdBy = 'system';
```

### Buscar Usuarios por Rol (Query manual)

```sql
SELECT * FROM Usuarios
WHERE rol = 'ADMIN' AND isActive = 1;
```

### Cambiar Rol de un Usuario

```sql
EXEC sp_actualizar_usuario
    @id = 'GUID-DEL-USUARIO',
    @rol = 'MODERADOR',
    @updatedBy = 'admin@empresa.com';
```

### Reactivar un Usuario Eliminado (Query manual)

```sql
UPDATE Usuarios
SET isActive = 1, updatedBy = 'admin@empresa.com', updatedAt = GETDATE()
WHERE id = 'GUID-DEL-USUARIO';
```

---

## Manejo de Errores

Los Stored Procedures usan códigos de error personalizados:

| Código | Descripción                               |
| ------ | ----------------------------------------- |
| 50001  | El correo ya está registrado              |
| 50002  | Usuario no encontrado                     |
| 50003  | El correo ya está en uso por otro usuario |
| 50004  | Usuario no encontrado (para eliminar)     |

### Capturar Errores en TypeScript

```typescript
try {
  await repo.crear({...});
} catch (error: any) {
  if (error.number === 50001) {
    console.log('El correo ya existe');
  } else {
    console.log('Error desconocido:', error.message);
  }
}
```

### Capturar Errores en SQL

```sql
BEGIN TRY
    EXEC sp_crear_usuario
        @nombre = 'Test',
        @correo = 'duplicate@example.com',
        @password = 'hash',
        @createdBy = 'system';
END TRY
BEGIN CATCH
    SELECT
        ERROR_NUMBER() as ErrorNumber,
        ERROR_MESSAGE() as ErrorMessage;
END CATCH
```

---

## 🔧 Modificar un Stored Procedure

1. Edita el archivo en `database/stored-procedures/usuario/`
2. Ejecuta el script actualizado (usa `CREATE OR ALTER`)
3. El SP se reemplazará automáticamente

**No necesitas crear una migración** para cambios en SPs existentes, pero es recomendable documentarlos.

---

## 📝 Agregar un Nuevo Stored Procedure

1. Crea el archivo `.sql` en la carpeta correspondiente
2. Sigue la convención: `sp_<operacion>_<entidad>.sql`
3. Agrega el método en el Repository
4. Agrega el método en el Service (si aplica)
5. Documenta en este archivo

---

## 🎯 Mejores Prácticas

✅ **Siempre usa parámetros**, nunca concatenes strings  
✅ **Valida entradas** en el SP (checks, constraints)  
✅ **Usa transacciones** para operaciones múltiples  
✅ **Maneja errores** con TRY/CATCH  
✅ **Documenta** cada SP con comentarios  
✅ **Usa indices** para mejorar performance  
✅ **No devuelvas passwords** en queries de consulta

---

## 📚 Recursos Adicionales

- [Documentación oficial de SQL Server SPs](https://learn.microsoft.com/en-us/sql/relational-databases/stored-procedures/stored-procedures-database-engine)
- [Mejores prácticas de Stored Procedures](https://learn.microsoft.com/en-us/sql/relational-databases/stored-procedures/best-practices)
