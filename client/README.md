# Sistema de Gestión - Frontend

Frontend desarrollado con React + TypeScript + Vite utilizando un stack ligero y moderno.

## 🚀 Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite** - Build tool ultrarrápido
- **Zustand** - Estado global ligero
- **React Hook Form** + **Zod** - Formularios y validaciones
- **Axios** - Cliente HTTP
- **React Router DOM** - Navegación
- **Tailwind CSS** - Estilos utility-first
- **Componentes UI personalizados** (estilo shadcn/ui)

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copia el archivo `.env.example` a `.env` (ya está creado)

2. Configura la URL de tu API en `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

## 🏃‍♂️ Ejecutar el proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── ui/              # Componentes UI reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Table.tsx
│   └── RequireAuth.tsx  # HOC para rutas protegidas
├── pages/
│   ├── LoginPage.tsx        # Página de inicio de sesión
│   ├── DashboardPage.tsx    # Dashboard principal
│   ├── UsuariosPage.tsx     # Lista de usuarios
│   └── UsuarioFormPage.tsx  # Crear/editar usuario
├── store/
│   └── authStore.ts     # Store de autenticación (Zustand)
├── lib/
│   ├── axios.ts         # Configuración de Axios
│   └── utils.ts         # Utilidades (cn helper)
├── App.tsx              # Configuración de rutas
└── main.tsx             # Punto de entrada
```

## 🔐 Autenticación

El sistema utiliza JWT para la autenticación. El token se almacena automáticamente en localStorage mediante Zustand persist.

### Flujo de autenticación:

1. Usuario ingresa credenciales en `/login`
2. El backend valida y retorna token + datos del usuario
3. Token se almacena en Zustand store (persistido)
4. Token se incluye automáticamente en todas las peticiones HTTP
5. Rutas protegidas verifican autenticación antes de renderizar

## 🛣️ Rutas

- `/login` - Página de inicio de sesión
- `/dashboard` - Dashboard principal (protegida)
- `/usuarios` - Lista de usuarios (protegida)
- `/usuarios/nuevo` - Crear nuevo usuario (protegida)
- `/usuarios/:id/editar` - Editar usuario (protegida)

## 📋 Funcionalidades implementadas

### ✅ Autenticación

- Login con validación de formulario (react-hook-form + zod)
- Persistencia de sesión
- Logout
- Redirección automática según estado de autenticación

### ✅ Gestión de Usuarios

- **Listar usuarios** con tabla interactiva
- **Buscar usuarios** por nombre o email
- **Crear nuevo usuario** con validación
- **Editar usuario** existente
- **Eliminar usuario** con confirmación

### ✅ Dashboard

- Resumen de la cuenta del usuario
- Navegación a diferentes módulos
- Tarjetas informativas

## 🎨 Componentes UI

Todos los componentes están diseñados con Tailwind CSS y son completamente personalizables:

- `Button` - Botón con variantes (default, outline, ghost, danger)
- `Input` - Campo de entrada con estilos consistentes
- `Card` - Contenedor con header y content
- `Table` - Tabla responsive con estilos

## 🔄 Próximos pasos

- [ ] Módulo de expedientes
- [ ] Formulario de registro de expedientes
- [ ] Subida de archivos (PDFs/fotos)
- [ ] Dashboard con estadísticas
- [ ] Paginación en tabla de usuarios
- [ ] Filtros avanzados

## 🛠️ Comandos disponibles

```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
npm run lint     # Ejecutar linter
```

## 📝 Notas

- La URL de la API se configura en `.env` con la variable `VITE_API_URL`
- Los componentes UI son ligeros y no requieren bibliotecas externas
- El proyecto está optimizado para aplicaciones pequeñas a medianas
