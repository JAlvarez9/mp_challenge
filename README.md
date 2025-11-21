# Sistema de Gestión de Expedientes

Sistema web full-stack para la gestión de expedientes con workflow de aprobación, roles de usuario y módulo de reportes.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Documentación](#documentación)
- [Licencia](#licencia)

## 📝 Descripción

Sistema completo de gestión de expedientes que permite:

- Crear y administrar expedientes con estados (BORRADOR, EN_REVISION, APROBADO, RECHAZADO)
- Gestionar indicios asociados a cada expediente
- Workflow de aprobación/rechazo por coordinadores
- Sistema de roles (ADMIN, USER, MODERADOR)
- Reportes y estadísticas (solo ADMIN)
- Historial completo de auditoría

## ✨ Características

### Sistema de Usuarios

- ✅ Autenticación con JWT
- ✅ Roles: ADMIN, USER, MODERADOR
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Cambio de contraseña
- ✅ Activar/desactivar usuarios

### Gestión de Expedientes

- ✅ CRUD completo de expedientes
- ✅ Estados: BORRADOR, EN_REVISION, APROBADO, RECHAZADO
- ✅ Solo el creador puede editar sus expedientes
- ✅ Envío a revisión cuando tiene al menos 1 indicio
- ✅ Edición permitida en estados BORRADOR y RECHAZADO
- ✅ Reenvío a revisión después de correcciones

### Gestión de Indicios

- ✅ CRUD completo de indicios
- ✅ Asociados a expedientes
- ✅ Tipos personalizables
- ✅ Solo el creador del expediente puede gestionar indicios

### Sistema de Revisión

- ✅ Aprobación/rechazo por coordinadores (ADMIN/MODERADOR)
- ✅ Comentarios opcionales al aprobar
- ✅ Comentarios obligatorios al rechazar
- ✅ Modales personalizados (no window.prompt)
- ✅ Historial completo de revisiones

### Módulo de Reportes (ADMIN)

- ✅ Estadísticas generales (totales, porcentajes, promedios)
- ✅ Reporte detallado (tabla filtrable)
- ✅ Estadísticas por usuario
- ✅ Filtros por fechas y estado
- ✅ Manejo de casos sin datos

### Seguridad

- ✅ Autenticación JWT con expiración
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Middleware de autorización por roles
- ✅ Validación de ownership (solo creador edita)
- ✅ Stored procedures (prevención SQL injection)
- ✅ Soft delete (integridad referencial)

## 🛠️ Tecnologías

### Frontend

```
- React 18.3.1
- TypeScript 5.6.2
- Vite 6.0.1
- React Router v6.28.0
- Zustand 5.0.2 (State Management)
- React Hook Form 7.54.0
- Zod 3.23.8 (Validation)
- Tailwind CSS 3.4.15
- Axios 1.7.7
```

### Backend

```
- Node.js v20.x
- Express 4.18.2
- TypeScript 5.9.3
- mssql 10.0.1 (SQL Server)
- jsonwebtoken 9.0.2
- bcrypt 5.1.1
- express-validator 7.0.1
- cors 2.8.5
```

### Base de Datos

```
- SQL Server 2019+
- 100% Stored Procedures
- Sin ORM (acceso directo)
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│         CLIENTE (React + TS)            │
│  ┌────────────┐  ┌──────────────────┐   │
│  │  Zustand   │  │  React Router    │   │
│  │  (State)   │  │  (Navigation)    │   │
│  └────────────┘  └──────────────────┘   │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST (Axios)
                   │ JWT Auth
                   ▼
┌─────────────────────────────────────────┐
│      SERVIDOR (Node + Express + TS)     │
│                                          │
│  Routes → Middleware → Controller       │
│                           ↓              │
│                        Service           │
│                           ↓              │
│                      Repository          │
└──────────────────┬──────────────────────┘
                   │ SQL Queries
                   │ Stored Procedures
                   ▼
┌─────────────────────────────────────────┐
│         BASE DE DATOS (SQL Server)      │
│  ┌────────┐  ┌──────────┐  ┌────────┐  │
│  │Usuarios│  │Expedientes│  │Indicios│  │
│  └────────┘  └──────────┘  └────────┘  │
│  ┌───────────────────────────────────┐  │
│  │    HistorialRevisiones            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 📦 Instalación

### Prerrequisitos

- Node.js v20.x o superior
- SQL Server 2019 o superior
- npm o yarn
- Git

### 1. Clonar Repositorio

```bash
git clone https://github.com/JAlvarez9/mp_challenge.git
cd mp_challenge
```

### 2. Instalar Backend

```bash
cd server
npm install
```

### 3. Instalar Frontend

```bash
cd ../client
npm install
```

### 4. Configurar Base de Datos

#### Paso 1: Crear Base de Datos

Abrir SQL Server Management Studio (SSMS) y ejecutar:

```sql
CREATE DATABASE ExpedientesDB;
GO
```

#### Paso 2: Ejecutar Scripts

En orden:

1. **Crear Tablas**:

   ```bash
   # En SSMS, abrir y ejecutar:
   server/database/CREAR_TABLAS.sql
   ```

2. **Instalar Stored Procedures de Expedientes**:

   ```bash
   server/database/EJECUTAR_COMPLETO_EXPEDIENTES.sql
   ```

3. **Instalar Stored Procedures de Reportes**:
   ```bash
   server/database/INSTALAR_REPORTES.sql
   ```

#### Paso 3: Crear Usuario Administrador

```sql
USE ExpedientesDB;
GO

-- Hash de "123456"
DECLARE @hashedPassword NVARCHAR(255) = '$2b$10$rOvL0YCqU4K9VqVzDJ3jl.jF3qZ8xYzJ9QN7fH5aJGX8F6vWYj1yG';

EXEC sp_crear_usuario
    @nombre = 'Administrador',
    @email = 'admin@test.com',
    @password = @hashedPassword,
    @rol = 'ADMIN';

-- Usuario de prueba
EXEC sp_crear_usuario
    @nombre = 'Usuario Prueba',
    @email = 'user@test.com',
    @password = @hashedPassword,
    @rol = 'USER';
GO
```

## ⚙️ Configuración

### Backend (.env)

Crear archivo `server/.env`:

```env
# Puerto del servidor
PORT=3000

# Base de datos
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=tu_password_aqui
DB_DATABASE=ExpedientesDB

# JWT
JWT_SECRET=tu_secret_key_super_secreta_aqui

# Entorno
NODE_ENV=development
```

### Frontend (.env)

Crear archivo `client/.env`:

```env
# URL del backend
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Uso

### Iniciar Backend

```bash
cd server
npm run dev
```

Servidor corriendo en: `http://localhost:3000`

### Iniciar Frontend

```bash
cd client
npm run dev
```

Aplicación corriendo en: `http://localhost:5173`

### Credenciales de Acceso

#### Administrador

```
Email: admin@test.com
Password: 123456
```

#### Usuario

```
Email: user@test.com
Password: 123456
```

## 📖 Documentación

### Documentos Disponibles

- **[MANUAL_TECNICO.md](MANUAL_TECNICO.md)** - Manual técnico completo con capturas de código
- **[DIAGRAMA_ER.md](DIAGRAMA_ER.md)** - Diagrama de entidad-relación y explicación del modelo
- **[GUIA_ENTREVISTA.md](GUIA_ENTREVISTA.md)** - Guía de preparación para demostración

### API Endpoints

#### Autenticación

```
POST   /api/auth/register          - Registro de usuario
POST   /api/auth/login             - Login
GET    /api/auth/me                - Usuario actual
```

#### Usuarios (ADMIN/MODERADOR)

```
GET    /api/usuarios               - Listar usuarios
GET    /api/usuarios/:id           - Obtener usuario
POST   /api/usuarios               - Crear usuario
PUT    /api/usuarios/:id           - Actualizar usuario
DELETE /api/usuarios/:id           - Eliminar usuario
```

#### Expedientes

```
GET    /api/expedientes            - Listar expedientes
GET    /api/expedientes/:id        - Obtener expediente
POST   /api/expedientes            - Crear expediente
PUT    /api/expedientes/:id        - Actualizar expediente
DELETE /api/expedientes/:id        - Eliminar expediente
POST   /api/expedientes/:id/enviar-revision - Enviar a revisión
```

#### Indicios

```
GET    /api/indicios/:id           - Obtener indicio
POST   /api/indicios               - Crear indicio
PUT    /api/indicios/:id           - Actualizar indicio
DELETE /api/indicios/:id           - Eliminar indicio
```

#### Revisiones (ADMIN/MODERADOR)

```
POST   /api/revisiones/aprobar     - Aprobar expediente
POST   /api/revisiones/rechazar    - Rechazar expediente
```

#### Reportes (ADMIN)

```
GET    /api/reportes/estadisticas  - Estadísticas generales
GET    /api/reportes/detallado     - Reporte detallado
GET    /api/reportes/usuarios      - Estadísticas por usuario
```

## 🔄 Flujo de Trabajo

### Ciclo de Vida de un Expediente

```
1. USER crea expediente (BORRADOR)
   ↓
2. USER agrega indicios
   ↓
3. USER envía a revisión (EN_REVISION)
   ↓
4. ADMIN/MODERADOR revisa
   ↓
   ├─→ APROBAR → (APROBADO) [FIN]
   │
   └─→ RECHAZAR → (RECHAZADO)
       ↓
       USER edita y corrige
       ↓
       USER reenvía (EN_REVISION)
       ↓
       [vuelve al paso 4]
```

## 🧪 Testing

### Backend

```bash
cd server
npm test
```

### Frontend

```bash
cd client
npm test
```

## 📊 Estructura del Proyecto

```
.
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   ├── store/         # Estado global (Zustand)
│   │   └── lib/           # Utilidades
│   └── package.json
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── controllers/   # Controladores HTTP
│   │   ├── services/      # Lógica de negocio
│   │   ├── repositories/  # Acceso a datos
│   │   ├── middleware/    # Middleware Express
│   │   ├── routes/        # Definición de rutas
│   │   └── config/        # Configuración
│   ├── database/
│   │   └── stored-procedures/  # SPs SQL Server
│   └── package.json
│
├── MANUAL_TECNICO.md       # Manual técnico
├── DIAGRAMA_ER.md          # Diagrama ER
├── GUIA_ENTREVISTA.md      # Guía de demo
└── README.md               # Este archivo
```

## 🐛 Solución de Problemas

### Backend no conecta a base de datos

1. Verificar SQL Server está corriendo:

   ```powershell
   Get-Service MSSQLSERVER
   ```

2. Verificar credenciales en `.env`

3. Verificar que SQL Server acepta autenticación mixta

### Frontend muestra error de CORS

Verificar que en `server/src/index.ts` está configurado CORS:

```typescript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### No aparecen stored procedures

Ejecutar scripts en orden correcto:

1. CREAR_TABLAS.sql
2. EJECUTAR_COMPLETO_EXPEDIENTES.sql
3. INSTALAR_REPORTES.sql

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Autor

**José Álvarez**

- GitHub: [@JAlvarez9](https://github.com/JAlvarez9)
- Repositorio: [mp_challenge](https://github.com/JAlvarez9/mp_challenge)

## 🙏 Agradecimientos

- React Team por el excelente framework
- Express.js por la simplicidad
- Microsoft por SQL Server
- Comunidad de código abierto

---

## 📞 Soporte

Si tienes preguntas o problemas:

1. Revisa la [documentación](MANUAL_TECNICO.md)
2. Busca en [Issues](https://github.com/JAlvarez9/mp_challenge/issues)
3. Crea un nuevo Issue

---

**Desarrollado con ❤️ para la gestión eficiente de expedientes**

_Última actualización: Noviembre 2024_
