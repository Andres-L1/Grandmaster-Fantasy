# 🏆 Grandmaster Fantasy - MVP

Fantasy Sports exclusivo para Ajedrez. Ficha a Grandes Maestros reales, compite en torneos y gana puntos según sus resultados.

## 🚀 Stack Tecnológico

- **Frontend**: SvelteKit 5 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: SvelteKit Server + Node.js
- **Database**: PostgreSQL + Prisma ORM
- **Data Source**: Lichess Broadcast API
- **Automation**: node-cron

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 14+
- npm o pnpm

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/grandmaster_fantasy?schema=public"
```

Reemplaza `user`, `password` con tus credenciales de PostgreSQL.

### 3. Ejecutar Migraciones

```bash
npm run db:push
```

### 4. Poblar Base de Datos con Datos de Prueba

```bash
npm run db:seed
```

Esto creará:
- 3 usuarios de ejemplo
- 15 Grandes Maestros (Carlsen, Caruana, Ding Liren, etc.)
- 1 torneo activo
- Liga global

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📊 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye para producción |
| `npm run preview` | Preview de build de producción |
| `npm run db:push` | Sincroniza schema de Prisma con DB |
| `npm run db:migrate` | Crea nueva migración |
| `npm run db:seed` | Pobla la DB con datos de prueba |
| `npm run db:studio` | Abre Prisma Studio (GUI para DB) |

## 🎮 Funcionalidades Implementadas

### ✅ Sistema de Mercado
- Vista de todos los GMs disponibles
- Búsqueda y filtrado
- Precios dinámicos
- Validación de presupuesto
- Límite de 5 jugadores por equipo

### ✅ Sistema de Puntuación
- Victoria: +10 puntos
- Tablas: +3 puntos
- Derrota: -2 puntos
- Bonus Negras: +2 (ganar con negras)
- Bonus Racha: +5 (3+ victorias consecutivas)
- Capitán: multiplicador x2

### ✅ Integración Lichess
- Sincronización automática cada 10 minutos
- Parser de PGN
- Match result tracking

### ✅ Sistema de Ligas
- Liga global por defecto
- Ranking de usuarios
- Paginación

### ✅ Gestión de Equipos
- Selección de 5 jugadores
- Designación de capitán
- Vender jugadores (80% del precio)
- Vista de puntos totales

## 🤖 Cron Jobs

Los siguientes trabajos automáticos se ejecutan en segundo plano:

- **Cada 10 minutos**: Sincroniza resultados de Lichess y actualiza puntuaciones
- **Diariamente (medianoche)**: Actualiza precios de jugadores según rendimiento

## 🗃️ Esquema de Base de Datos

Ver `prisma/schema.prisma` para el esquema completo.

Modelos principales:
- `User` - Usuarios del sistema
- `League` - Ligas (global y privadas)
- `RealPlayer` - Grandes Maestros
- `FantasyTeam` - Equipos de usuarios
- `Tournament` - Torneos activos
- `MatchResult` - Resultados de partidas

## 🎨 Rutas Principales

- `/` - Landing page
- `/market` - Mercado de jugadores
- `/my-team` - Gestión de equipo
- `/leagues` - Clasificación global

## 🔧 Próximos Pasos (Post-MVP)

- [ ] Sistema de autenticación (OAuth/JWT)
- [ ] Ligas privadas funcionales
- [ ] API endpoints para acciones (fichar, vender, etc.)
- [ ] Notificaciones en tiempo real
- [ ] Gráficos de rendimiento
- [ ] Sistema de transferencias entre usuarios
- [ ] Modo draft para inicios de torneo

## 📝 Notas Técnicas

### Datos de Prueba
El script de seed crea un usuario de prueba: `ChessMaster` (user-1) que puedes usar para probar la aplicación.

### Lichess API
La integración con Lichess usa la API pública sin autenticación. Los torneos se identifican por su `lichessId`.

### Precios Dinámicos
Los precios se actualizan usando la fórmula:
```
nuevoPrecio = precioBase + (puntosPromedio * 1,000,000)
```

## 🐛 Troubleshooting

**Error de conexión a DB**: Verifica que PostgreSQL esté corriendo y las credenciales en `.env` sean correctas.

**Módulos no encontrados**: Ejecuta `npm install` nuevamente.

**Errores de TypeScript**: Ejecuta `npm run check` para validar tipos.

## 📄 Licencia

MIT

---

Desarrollado con ♟️ por el equipo Grandmaster Fantasy
