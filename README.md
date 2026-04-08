# Red Social - Backend

Backend de una red social implementado con **Clean Architecture**, **Node.js**, **TypeScript** y **Express**. Proyecto de práctica para dominar arquitectura escalable y separación de responsabilidades.

## 🎯 Objetivo del Proyecto

Este es un proyecto de aprendizaje enfocado en aplicar **Clean Architecture** en un backend real, desacoplando completamente la lógica de negocio de los frameworks y la infraestructura.

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con 4 capas bien definidas:

```
┌─────────────────────────────────────┐
│  INTERFACES (HTTP)                  │  ← Express, Controllers, Routes
│  - Controllers                      │
│  - Mappers (HTTP ↔ Application)     │
│  - DTOs Request/Response            │
│  - Validators (Zod)                 │
├─────────────────────────────────────┤
│  APPLICATION                        │  ← Lógica de negocio pura
│  - Use Cases                        │
│  - Contracts (Input/Output)         │
├─────────────────────────────────────┤
│  INFRASTRUCTURE                     │  ← Implementaciones concretas
│  - Repositories (Prisma)            │
│  - Database config                  │
├─────────────────────────────────────┤
│  DOMAIN                             │  ← Core del negocio
│  - Entities                         │
│  - Repository Interfaces            │
└─────────────────────────────────────┘
```

### Principios aplicados:
- **Dependency Rule**: Las capas internas no conocen las externas
- **Dependency Injection**: Inyección manual vía constructor
- **Mappers**: Transformación explícita entre capas
- **Single Responsibility**: Cada use case hace una sola cosa

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Architecture | Clean Architecture |

## ✅ Features Implementadas

### Autenticación
- ✅ Registro de usuarios (bcrypt para hashing)
- ✅ Login con JWT
- ✅ Middleware de autenticación

### Perfiles
- ✅ Perfil privado (datos completos, requiere auth)
- ✅ Perfil público (datos limitados)
- ✅ Actualización de perfil

### Posts
- ✅ Crear post (requiere auth)
- ✅ Editar post (solo el autor)
- ✅ Eliminar post (solo el autor)
- ✅ Listar posts con paginación (feed público)
- ✅ Listar mis posts (auth requerido)

### Validación
- ✅ Validación de contratos HTTP con Zod
- ✅ Validación de negocio en use cases
- ✅ Manejo de errores con códigos HTTP apropiados

## 📁 Estructura del Proyecto

```
src/
├── domain/                    # Core del negocio
│   ├── entities/              # User, Post
│   └── repositories/          # Interfaces (UserRepository, PostRepository)
│
├── application/               # Lógica de negocio
│   ├── contracts/             # DTOs de entrada/salida
│   │   ├── user/
│   │   │   ├── RegisterUserInput.ts
│   │   │   ├── UserOutput.ts
│   │   └── post/
│   │       ├── CreatePostInput.ts
│   │       ├── PostOutput.ts
│   │       └── UpdatePostInput.ts
│   └── use-cases/
│       ├── user/              # RegisterUserUseCase, LoginUserUseCase, etc.
│       └── post/              # CreatePostUseCase, UpdatePostUseCase, etc.
│
├── infrastructure/          # Implementaciones
│   ├── database/
│   │   └── prisma.ts
│   └── repositories/
│       ├── PrismaUserRepository.ts
│       └── PrismaPostRepository.ts
│
└── interfaces/http/           # Capa HTTP
    ├── controllers/           # UserController, PostController
    ├── routes/               # user.routes.ts, post.routes.ts
    ├── dtos/                 # Request/Response types
    ├── mappers/              # toUserInput, toUserResponse, etc.
    └── validators/           # Zod schemas

middlewares/                 # auth, validation, error handling
types/                       # Express extensions (req.user)
config/                      # Environment variables
```

## 🚀 Instalación y Uso

### Requisitos
- Node.js 18+
- PostgreSQL

### 1. Clonar y instalar
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/redsocial"
JWT_SECRET="tu-secret-key-aqui"
BCRYPT_SALT_ROUNDS=12
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### 3. Configurar base de datos
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Ejecutar
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📡 API Endpoints

### Autenticación
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/users/register` | Registro | ❌ |
| POST | `/users/login` | Login | ❌ |
| GET | `/users/me` | Mi perfil | ✅ |
| PUT | `/users/me` | Actualizar perfil | ✅ |
| GET | `/users/u/:username` | Perfil público | ❌ |

### Posts
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/posts/new` | Crear post | ✅ |
| GET | `/posts` | Feed paginado | ❌ |
| GET | `/posts/me` | Mis posts | ✅ |
| PUT | `/posts/:id` | Editar post | ✅ |
| DELETE | `/posts/:id` | Eliminar post | ✅ |

### Paginación (GET /posts)
```
GET /posts?page=1&limit=10

Response:
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🔐 Autenticación

Las rutas protegidas requieren header:
```
Authorization: Bearer <token>
```

El token se obtiene en el login:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🧪 Testing (Próximamente)

- [ ] Tests unitarios de use cases
- [ ] Tests de integración
- [ ] Tests de contratos HTTP

## 📋 Roadmap

### Inmediato
- [ ] Tests unitarios
- [ ] Rate limiting
- [ ] Documentación OpenAPI/Swagger

### Features sociales
- [ ] Likes en posts
- [ ] Comentarios
- [ ] Follows entre usuarios
- [ ] Timeline personalizado

### Mejoras
- [ ] Caching (Redis)
- [ ] Upload de imágenes
- [ ] WebSockets para notificaciones

## 📚 Aprendizajes Clave

Este proyecto me permitió practicar:
- **Clean Architecture**: Separar domain/application/infrastructure
- **Mappers**: Transformación de datos entre capas
- **Dependency Injection**: Inyección manual de repositorios
- **Contracts**: DTOs estrictos para entrada/salida
- **Validación en dos niveles**: Format (middleware) vs Negocio (use cases)

## 📝 Notas

- **Proyecto de práctica**: En desarrollo activo, estructura sujeta a mejoras
- **No listo para producción**: Faltan tests, hardening de seguridad, y optimizaciones
- **Frontend**: Repositorio separado disponible

## 👤 Autor

**Axel Quiroga**
- GitHub: [@AxelQuiroga](https://github.com/AxelQuiroga)

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.
