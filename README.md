# 🎓 LearnFlow AI - E-Learning Platform MVP

Una plataforma e-learning moderna construida con Next.js 14, TypeScript, Prisma y Tailwind CSS.

## ✨ Features Implementadas

### Core Features
- ✅ **Autenticación completa** con NextAuth.js
- ✅ **Gestión de cursos** (CRUD completo)
- ✅ **Estructura jerárquica** (Cursos → Módulos → Lecciones)
- ✅ **Sistema de progreso** para estudiantes
- ✅ **Roles de usuario** (Student, Instructor, Admin)
- ✅ **Base de datos** con Prisma + SQLite

### UI/UX
- ✅ **Design system moderno** con Tailwind CSS
- ✅ **Responsive design** (mobile-first)
- ✅ **Dark mode** automático
- ✅ **Animaciones smooth**

### Data
- ✅ **Seed data** con cursos y usuarios de demostración
- ✅ **Relaciones completas** entre entidades

## 🚀 Quick Start

### Prerequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente de Prisma
npx prisma generate

# 3. Crear base de datos
npx prisma db push

# 4. Poblar con datos de demostración
npx tsx prisma/seed.ts

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔑 Credenciales de Prueba

### Estudiante
- **Email:** student@learnflow.com
- **Password:** password123

### Instructor
- **Email:** instructor@learnflow.com
- **Password:** password123

## 📁 Estructura del Proyecto

```
learnflow-ai/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   └── auth/           # NextAuth endpoints
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (dashboard)/        # Protected student routes
│   └── (instructor)/       # Protected instructor routes
├── components/              # React components
│   ├── ui/                 # Base UI components
│   ├── course/             # Course-related components
│   └── layout/             # Layout components
├── lib/                     # Utilities
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Helper functions
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed script
│   └── dev.db              # SQLite database (generated)
├── types/                   # TypeScript types
└── public/                  # Static files
```

## 🗄️ Modelo de Datos

### Entidades Principales

- **User**: Usuarios del sistema (students, instructors, admins)
- **Course**: Cursos disponibles
- **Module**: Módulos dentro de un curso
- **Lesson**: Lecciones dentro de un módulo
- **Enrollment**: Inscripciones de estudiantes a cursos
- **LessonProgress**: Progreso de estudiantes en lecciones
- **Achievement**: Logros y badges de estudiantes

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - React framework con App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Iconos

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma** - ORM
- **SQLite** - Database (dev) → PostgreSQL (prod)
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing

### State Management
- **Zustand** - Global state (lightweight)

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Build
npm run build        # Build para producción
npm start            # Iniciar servidor de producción

# Database
npx prisma studio    # Abrir Prisma Studio (DB GUI)
npx prisma generate  # Generar cliente de Prisma
npx prisma db push   # Sincronizar schema con DB
npx tsx prisma/seed.ts  # Poblar DB con datos de demo

# Linting
npm run lint         # Ejecutar ESLint
```

## 🎨 Design System

### Colores

```css
Primary: #6366F1 (Indigo)
Secondary: #8B5CF6 (Purple)
Success: #10B981 (Green)
Warning: #F59E0B (Amber)
Error: #EF4444 (Red)
```

### Tipografía

- **Headings**: Geist Sans (Bold)
- **Body**: Geist Sans (Regular)
- **Code**: Geist Mono

## 🔜 Próximas Features (Roadmap)

### Fase 2
- [ ] AI Tutor con Claude API
- [ ] Sistema de gamificación (XP, badges, streaks)
- [ ] Integración de pagos con Stripe
- [ ] Video player avanzado con tracking

### Fase 3
- [ ] AI Course Generator
- [ ] Panel de analytics
- [ ] Mobile app (PWA)
- [ ] Certificados PDF

## 🤝 Contribuir

Este es un proyecto MVP de demostración. Para contribuir:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

## 🙏 Agradecimientos

- Diseño inspirado en Coursera, Udemy y Platzi
- Iconos por Lucide
- Fonts por Vercel (Geist)

---

**Desarrollado con ❤️ usando Next.js 14 y TypeScript**
