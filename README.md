# Red Social - Backend

Backend de una red social implementado con **Clean Architecture**, **Node.js**, **TypeScript** y **Express**. Proyecto de práctica para dominar arquitectura escalable, separación de responsabilidades y testing de integración.

## 🎯 Objetivo del Proyecto

Aplicar **Clean Architecture** en un backend real, desacoplando completamente la lógica de negocio de los frameworks y la infraestructura. Incluye tests de integración contra PostgreSQL real y manejo de eventos asíncronos.

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
│  - Services (Notification, AI)      │
├─────────────────────────────────────┤
│  INFRASTRUCTURE                     │  ← Implementaciones concretas
│  - Repositories (Prisma)            │
│  - Event Bus (RabbitMQ / InMemory)  │
│  - Storage (S3)                     │
│  - Image Processing (Sharp)         │
│  - DI Container                     │
├─────────────────────────────────────┤
│  DOMAIN                             │  ← Core del negocio
│  - Entities                         │
│  - Repository Interfaces            │
│  - Domain Errors                    │
│  - Domain Events                    │
└─────────────────────────────────────┘
```

### Principios aplicados:
- **Dependency Rule**: Las capas internas no conocen las externas
- **Dependency Injection**: Inyección manual vía constructor
- **Mappers**: Transformación explícita entre capas
- **Single Responsibility**: Cada use case hace una sola cosa
- **Repository Pattern**: Abstracción de persistencia vía interfaces
- **Event-Driven**: Comunicación desacoplada entre dominios vía Event Bus

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| ORM | Prisma 7 (Driver Adapter) |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Events | RabbitMQ (prod) / InMemory (tests) |
| Storage | S3 (images) |
| Image Processing | Sharp |
| Architecture | Clean Architecture |
| Testing | Vitest 4.x |

## ✅ Features Implementadas

### Autenticación
- ✅ Registro de usuarios (bcrypt para hashing)
- ✅ Login con JWT + refresh
- ✅ Middleware de autenticación

### Perfiles
- ✅ Perfil privado (datos completos, requiere auth)
- ✅ Perfil público (datos limitados)
- ✅ Actualización de perfil (displayName, bio, avatar, cover, ubicación, web)

### Posts
- ✅ CRUD completo de posts
- ✅ Feed paginado con datos del autor
- ✅ Posts por usuario con paginación

### Likes
- ✅ Dar / quitar like a posts
- ✅ Control de like duplicado
- ✅ Notificación al autor del post
- ✅ Auto-limpieza de notificaciones al quitar like

### Comentarios
- ✅ CRUD completo de comentarios
- ✅ Respuestas anidadas (1 nivel)
- ✅ Validación de pertenencia al post
- ✅ Notificación al autor del post
- ✅ Control de autoría para edición/eliminación

### Notificaciones
- ✅ Notificaciones por like en post
- ✅ Notificaciones por comentario en post
- ✅ Marcado individual y masivo como leídas
- ✅ Conteo de no leídas

### Post Images
- ✅ Upload presignado (S3)
- ✅ Confirmación de upload
- ✅ Reordenamiento de imágenes
- ✅ Hard delete con limpieza de storage
- ✅ Soft delete (deletedAt)

### Validación y Errores
- ✅ Validación de contratos HTTP con Zod
- ✅ Validación de negocio en use cases
- ✅ Manejo de errores con códigos HTTP apropiados
- ✅ 6 tipos de Domain Errors: NotFound, Conflict, Unauthorized, Validation, Business, Unexpected

### Testing
- ✅ Tests unitarios (con mocks) — use cases de todas las features
- ✅ Tests de integración contra PostgreSQL real — **54 tests**
- ✅ Configuración Vitest 4.x con aislamiento de datos

### Infraestructura
- ✅ Event Bus intercambiable (RabbitMQ / InMemory)
- ✅ Reconexión automática de RabbitMQ
- ✅ Image Processing con Sharp
- ✅ Almacenamiento S3 para imágenes

## 📁 Estructura del Proyecto

```
src/
├── domain/                        # Core del negocio
│   ├── entities/                  # User, Post, Like, Comment, Notification, PostImage
│   ├── repositories/              # Interfaces (UserRepository, PostRepository, etc.)
│   ├── errors/                    # DomainError, NotFoundError, ConflictError, etc.
│   ├── events/                    # EventBus interface, event schemas
│   └── services/                  # Domain services (Storage, ImageProcessing, AI)
│
├── application/                   # Lógica de negocio
│   ├── contracts/                 # DTOs de entrada/salida por feature
│   │   ├── user/
│   │   ├── post/
│   │   ├── like/
│   │   ├── comment/
│   │   └── notification/
│   ├── use-cases/                 # Casos de uso por feature
│   │   ├── user/                  # Register, Login, UpdateProfile, GetProfile, etc.
│   │   ├── post/                  # Create, Update, Delete, GetPosts, etc.
│   │   ├── like/                  # LikePost, UnlikePost, GetPostLikesCount
│   │   ├── comment/               # Create, Update, Delete, GetComments, GetReplies
│   │   └── notification/          # GetNotifications, MarkAsRead, MarkAllAsRead, etc.
│   └── services/                  # NotificationService
│
├── infrastructure/                # Implementaciones concretas
│   ├── database/
│   │   └── prisma.ts              # PrismaClient (Prisma 7 + driver adapter)
│   ├── repositories/
│   │   ├── PrismaUserRepository.ts
│   │   ├── PrismaPostRepository.ts
│   │   ├── PrismaLikeRepository.ts
│   │   ├── PrismaCommentRepository.ts
│   │   ├── PrismaNotificationRepository.ts
│   │   └── PrismaPostImageRepository.ts
│   ├── events/
│   │   ├── NodeEventBus.ts
│   │   ├── RabbitMQEventBus.ts
│   │   ├── NotificationListeners.ts
│   │   └── ReconnectionManager.ts
│   ├── services/
│   │   ├── GeminiAIService.ts
│   │   └── SharpImageProcessingService.ts
│   ├── storage/
│   │   └── S3StorageService.ts
│   └── di/
│       └── factory.ts             # Dependency Injection container
│
├── interfaces/http/               # Capa HTTP
│   ├── controllers/               # User, Post, PostImages, Like, Comment, Notification
│   ├── routes/                    # user, post, post-comment, postImages, like, comment, notification
│   ├── dtos/                      # Request/Response types
│   ├── mappers/                   # Transformación entre capas
│   └── validators/                # Zod schemas

├── middlewares/                   # auth, validation, error handling
├── types/                         # Express extensions (req.user)
└── config/                        # Environment variables, EventBus config
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

### Likes
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/posts/:postId/like` | Dar like | ✅ |
| DELETE | `/posts/:postId/like` | Quitar like | ✅ |
| GET | `/posts/:postId/likes/count` | Contar likes | ❌ |

### Comentarios
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/posts/:postId/comments` | Crear comentario | ✅ |
| GET | `/posts/:postId/comments` | Comentarios del post | ❌ |
| PUT | `/comments/:id` | Editar comentario | ✅ |
| DELETE | `/comments/:id` | Eliminar comentario | ✅ |
| GET | `/comments/:parentId/replies` | Respuestas de un comentario | ❌ |

### Notificaciones
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Listar notificaciones | ✅ |
| GET | `/notifications/unread-count` | Contar no leídas | ✅ |
| PATCH | `/notifications/:id/read` | Marcar como leída | ✅ |
| PATCH | `/notifications/read-all` | Marcar todas como leídas | ✅ |

### Post Images
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/posts/:postId/images/upload-url` | Generar upload URL presignada | ✅ |
| POST | `/posts/:postId/images/confirm` | Confirmar upload | ✅ |
| PUT | `/posts/:postId/images/reorder` | Reordenar imágenes | ✅ |
| DELETE | `/posts/:postId/images/:imageId` | Eliminar imagen | ✅ |

### Paginación
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

## 🧪 Testing

### Tests de Integración (54 tests)
Ejecución secuencial contra PostgreSQL real con aislamiento de datos:

```bash
npm run test:integration
```

**Estructura:**
```
tests/
├── db.ts                    # PrismaClient singleton + infraPool + sql() helper
├── setup.ts                 # cleanupDb entre tests
├── global-setup.ts          # Reset de DB al arrancar
├── factories.ts             # Fábricas de test (createTestUser, createTestPost, etc.)
├── mocks/                   # Mocks para tests unitarios
├── integration/
│   ├── index.test.ts        # Entry point que orquesta los tests
│   ├── user.integration.ts
│   ├── post.integration.ts
│   ├── like.integration.ts
│   ├── comment.integration.ts
│   ├── notification.integration.ts
│   └── auth.integration.ts
└── unit/
    └── use-cases/
```

**Características:**
- ✅ 54 tests de integración que cubren todas las features
- ✅ Ejecución secuencial (`fileParallelism: false`) contra una sola DB
- ✅ `cleanupDb()` via SQL truncate entre tests
- ✅ PrismaClient singleton con `globalThis` caching
- ✅ Pool de conexiones raw para limpieza directa (evita Prisma middlewares)
- ✅ Vitest 4.x con configuración explícita de aislamiento

## 📋 Roadmap

### Inmediato
- [ ] Rate limiting
- [ ] Documentación OpenAPI/Swagger

### Features sociales
- [ ] Follows entre usuarios
- [ ] Timeline personalizado
- [ ] Reposts / Quotes
- [ ] Hashtags y menciones

### Mejoras
- [ ] Caching (Redis)
- [ ] WebSockets para notificaciones en tiempo real
- [ ] CI/CD con GitHub Actions

## 📚 Aprendizajes Clave

Este proyecto me permitió practicar:
- **Clean Architecture**: Separar domain/application/infrastructure
- **Mappers**: Transformación de datos entre capas
- **Dependency Injection**: Inyección manual de repositorios
- **Contracts**: DTOs estrictos para entrada/salida
- **Validación en dos niveles**: Format (middleware) vs Negocio (use cases)
- **Repository Pattern**: Abstracciones que permiten cambiar ORM sin tocar dominio
- **Event-Driven Design**: EventBus intercambiable (InMemory ↔ RabbitMQ)
- **Testing de integración**: Tests secuenciales contra DB real con aislamiento de datos
- **Vitest 4.x**: Configuración de paralelismo, secuencia y hooks
- **Prisma 7 DataLoader**: Entendimiento profundo de batch deferral (process.nextTick)

## 📝 Notas

- **Proyecto de práctica**: En desarrollo activo, estructura sujeta a mejoras
- **No listo para producción**: Falta hardening de seguridad, rate limiting, y optimizaciones
- **Frontend**: Repositorio separado disponible

## 👤 Autor

**Axel Quiroga**
- GitHub: [@AxelQuiroga](https://github.com/AxelQuiroga)

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.
