# API REST con Node.js, TypeScript y SQL Server

API REST profesional con autenticación JWT, TypeORM y SQL Server siguiendo las mejores prácticas de desarrollo.

## 🏗️ Arquitectura

```
src/
├── config/           # Configuración de la aplicación y base de datos
├── database/         # Migraciones y seeds
├── entities/         # Entidades de TypeORM (BaseEntity, Usuario)
├── middleware/       # Middlewares (auth, role, validator)
├── routes/           # Controladores y rutas
├── services/         # Lógica de negocio
├── types/            # Tipos e interfaces de TypeScript
├── utils/            # Utilidades y validaciones
└── index.ts          # Punto de entrada de la aplicación
```

## 📋 Características

- ✅ **Autenticación JWT** - Sistema completo de autenticación con tokens
- ✅ **TypeORM** - ORM para SQL Server con migraciones
- ✅ **Entidades Auditables** - BaseEntity con campos de auditoría automáticos
- ✅ **Roles y Permisos** - Sistema de control de acceso basado en roles
- ✅ **Validaciones** - Validación de datos con express-validator
- ✅ **TypeScript** - Tipado fuerte en todo el proyecto
- ✅ **Arquitectura en Capas** - Routes → Controllers → Services → Entities
- ✅ **Soft Delete** - Eliminación lógica de registros

## 🚀 Instalación

### 1. Instalar dependencias

```powershell
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```powershell
cp .env.example .env
```

Edita el archivo `.env` con tus datos:

```env
# SQL Server
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=TuPasswordSegura123
DB_DATABASE=mi_base_datos

# JWT
JWT_SECRET=clave_secreta_muy_segura_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=development
```

### 3. Crear la base de datos

Asegúrate de tener SQL Server corriendo y crea la base de datos:

```sql
CREATE DATABASE mi_base_datos;
```

### 4. Ejecutar el servidor

**Modo desarrollo** (con hot-reload):

```powershell
npm run dev
```

**Modo producción**:

```powershell
npm run build
npm start
```

## 📚 Documentación de la API

### Base URL

```
http://localhost:3000/api
```

### Endpoints de Autenticación

#### Registrar Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "password": "password123",
  "rol": "USER"
}
```

#### Iniciar Sesión

```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "juan@example.com",
  "password": "password123"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "usuario": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "rol": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obtener Usuario Actual

```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Endpoints de Usuarios

Todos los endpoints de usuarios requieren autenticación.

#### Listar Usuarios

```http
GET /api/usuarios
Authorization: Bearer {token}
```

_Requiere rol: ADMIN o MODERADOR_

#### Obtener Usuario por ID

```http
GET /api/usuarios/:id
Authorization: Bearer {token}
```

_Requiere rol: ADMIN o MODERADOR_

#### Crear Usuario

```http
POST /api/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "María López",
  "correo": "maria@example.com",
  "password": "password123",
  "rol": "USER"
}
```

_Requiere rol: ADMIN_

#### Actualizar Usuario

```http
PUT /api/usuarios/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "María López Actualizada",
  "correo": "maria.nueva@example.com",
  "rol": "MODERADOR"
}
```

_Requiere rol: ADMIN_

#### Cambiar Contraseña

```http
PUT /api/usuarios/:id/cambiar-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "passwordActual": "password123",
  "passwordNuevo": "newpassword456"
}
```

#### Desactivar Usuario

```http
DELETE /api/usuarios/:id
Authorization: Bearer {token}
```

_Requiere rol: ADMIN_

#### Activar Usuario

```http
PUT /api/usuarios/:id/activar
Authorization: Bearer {token}
```

_Requiere rol: ADMIN_

## 🗂️ Estructura de Entidades

### BaseEntity (Auditable)

Todas las entidades extienden de esta clase base que proporciona:

- `id`: UUID único
- `createdAt`: Fecha de creación automática
- `updatedAt`: Fecha de actualización automática
- `createdBy`: Usuario que creó el registro
- `updatedBy`: Usuario que actualizó el registro
- `isActive`: Estado activo/inactivo (soft delete)

### Usuario

```typescript
{
  // Campos heredados de BaseEntity
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;

  // Campos propios
  nombre: string;
  correo: string;
  password: string; // Encriptado con bcrypt
  rol: "ADMIN" | "USER" | "MODERADOR";
}
```

## 🔐 Sistema de Roles

- **ADMIN**: Acceso completo a todos los recursos
- **MODERADOR**: Puede listar y ver usuarios
- **USER**: Acceso básico a la API

## 🛠️ Agregar Nuevas Entidades

Para agregar una nueva entidad siguiendo las mejores prácticas:

### 1. Crear la Entidad

```typescript
// src/entities/MiEntidad.ts
import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("mi_entidad")
export class MiEntidad extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  campo1: string;

  @Column({ type: "int" })
  campo2: number;
}
```

### 2. Registrar en Database Config

```typescript
// src/config/database.ts
entities: [Usuario, MiEntidad], // Agregar aquí
```

### 3. Crear el Service

```typescript
// src/services/MiEntidadService.ts
import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { MiEntidad } from "../entities/MiEntidad";

export class MiEntidadService {
  private repository: Repository<MiEntidad>;

  constructor() {
    this.repository = AppDataSource.getRepository(MiEntidad);
  }

  async obtenerTodos(): Promise<MiEntidad[]> {
    return await this.repository.find({ where: { isActive: true } });
  }

  // ... más métodos
}
```

### 4. Crear el Controller

```typescript
// src/routes/MiEntidadController.ts
import { Response, NextFunction } from "express";
import { MiEntidadService } from "../services/MiEntidadService";
import { AuthRequest } from "../types";

export class MiEntidadController {
  private service: MiEntidadService;

  constructor() {
    this.service = new MiEntidadService();
  }

  obtenerTodos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await this.service.obtenerTodos();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error" });
    }
  };
}
```

### 5. Crear las Rutas

```typescript
// src/routes/mientidad.routes.ts
import { Router } from "express";
import { MiEntidadController } from "./MiEntidadController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new MiEntidadController();

router.use(authMiddleware); // Requiere autenticación

router.get("/", controller.obtenerTodos);
// ... más rutas

export default router;
```

### 6. Registrar en Routes Index

```typescript
// src/routes/index.ts
import miEntidadRoutes from "./mientidad.routes";

router.use("/mi-entidad", miEntidadRoutes);
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en modo producción
- `npm run typeorm` - Ejecuta comandos de TypeORM CLI

## 🔒 Seguridad

- Las contraseñas se encriptan con bcrypt (10 rounds)
- Los tokens JWT expiran según configuración (por defecto 24h)
- Validación de datos en todas las entradas
- Control de acceso basado en roles
- SQL Server con conexión segura

## 📦 Dependencias Principales

- **express**: Framework web
- **typeorm**: ORM para TypeScript
- **mssql**: Driver de SQL Server
- **jsonwebtoken**: Generación de tokens JWT
- **bcryptjs**: Encriptación de contraseñas
- **express-validator**: Validación de datos
- **dotenv**: Variables de entorno

## 🤝 Contribuir

Este proyecto sigue las mejores prácticas de desarrollo:

1. Código limpio y bien documentado
2. Separación de responsabilidades (capas)
3. Tipado fuerte con TypeScript
4. Manejo de errores consistente
5. Validaciones en todas las entradas

## 📄 Licencia

ISC
