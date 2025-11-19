# Especificaciones para el Backend - API REST

## 📋 Requisitos del Backend

El frontend espera un backend que implemente los siguientes endpoints:

## 🔐 Autenticación

### POST `/api/auth/login`

Autenticar usuario y retornar token JWT.

**Request Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "rol": "Admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401):**

```json
{
  "message": "Credenciales inválidas"
}
```

---

## 👥 Usuarios

### GET `/api/usuarios`

Obtener lista de todos los usuarios.

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
[
  {
    "id": "uuid-1",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "Admin",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "uuid-2",
    "nombre": "María García",
    "email": "maria@ejemplo.com",
    "rol": "Usuario",
    "createdAt": "2024-02-20T14:15:00Z"
  }
]
```

---

### GET `/api/usuarios/:id`

Obtener un usuario específico por ID.

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "id": "uuid-1",
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "rol": "Admin",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Response (404):**

```json
{
  "message": "Usuario no encontrado"
}
```

---

### POST `/api/usuarios`

Crear un nuevo usuario.

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "nombre": "Carlos López",
  "email": "carlos@ejemplo.com",
  "password": "contraseña123",
  "rol": "Usuario"
}
```

**Response (201):**

```json
{
  "id": "uuid-3",
  "nombre": "Carlos López",
  "email": "carlos@ejemplo.com",
  "rol": "Usuario",
  "createdAt": "2024-03-10T09:00:00Z"
}
```

**Response (400):**

```json
{
  "message": "El email ya está en uso"
}
```

---

### PUT `/api/usuarios/:id`

Actualizar un usuario existente.

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "nombre": "Carlos López Actualizado",
  "email": "carlos.nuevo@ejemplo.com",
  "password": "nuevaContraseña123", // Opcional
  "rol": "Admin"
}
```

**Nota:** Si no se envía `password`, no se debe actualizar la contraseña.

**Response (200):**

```json
{
  "id": "uuid-3",
  "nombre": "Carlos López Actualizado",
  "email": "carlos.nuevo@ejemplo.com",
  "rol": "Admin",
  "createdAt": "2024-03-10T09:00:00Z"
}
```

**Response (404):**

```json
{
  "message": "Usuario no encontrado"
}
```

---

### DELETE `/api/usuarios/:id`

Eliminar un usuario.

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "message": "Usuario eliminado exitosamente"
}
```

**Response (404):**

```json
{
  "message": "Usuario no encontrado"
}
```

---

## 🔒 Seguridad

### JWT Token

- El token debe ser válido por al menos 24 horas
- Debe incluir el `id` del usuario en el payload
- Formato esperado en header: `Authorization: Bearer {token}`

### Validaciones

1. **Email:** Debe ser un email válido y único
2. **Password:** Mínimo 6 caracteres
3. **Nombre:** Mínimo 3 caracteres

### CORS

Permitir requests desde `http://localhost:5173` (frontend en desarrollo)

---

## 📦 Modelo de Usuario Sugerido

```typescript
interface Usuario {
  id: string; // UUID
  nombre: string;
  email: string; // Único
  password: string; // Hasheado (bcrypt recomendado)
  rol?: string; // Opcional (Admin, Usuario, etc.)
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🛠️ Stack Recomendado para el Backend

- **Node.js** + **Express** o **Fastify**
- **TypeScript** (opcional pero recomendado)
- **Prisma** o **TypeORM** para ORM
- **bcrypt** para hashear passwords
- **jsonwebtoken** para JWT
- **PostgreSQL** o **MySQL** como base de datos

---

## 📝 Ejemplo de .env para el Backend

```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@localhost:5432/basededatos
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

---

## 🧪 Endpoints para Pruebas (Opcional)

### POST `/api/auth/seed`

Crear usuarios de prueba (solo en desarrollo).

**Response (200):**

```json
{
  "message": "Datos de prueba creados",
  "users": [
    {
      "email": "admin@test.com",
      "password": "admin123"
    },
    {
      "email": "usuario@test.com",
      "password": "usuario123"
    }
  ]
}
```

---

## 📌 Próximos Endpoints (Expedientes)

Estos endpoints serán necesarios en el futuro:

- `GET /api/expedientes` - Listar expedientes
- `POST /api/expedientes` - Crear expediente
- `GET /api/expedientes/:id` - Obtener expediente
- `PUT /api/expedientes/:id` - Actualizar expediente
- `DELETE /api/expedientes/:id` - Eliminar expediente
- `POST /api/expedientes/:id/documentos` - Subir archivo

---

## ✅ Testing

Se recomienda probar los endpoints con:

- **Postman** o **Insomnia**
- **Thunder Client** (extensión de VS Code)
- **curl** o **httpie** en terminal

---

## 📞 Contacto con Frontend

El frontend enviará:

- Token en header `Authorization: Bearer {token}`
- Content-Type: `application/json`
- Espera respuestas en formato JSON

Cualquier error debe retornar un objeto con la propiedad `message`:

```json
{
  "message": "Descripción del error"
}
```
