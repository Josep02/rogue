# Rogue — Fitness & Tracking App

Rogue es una PWA de seguimiento de fitness y rutinas de entrenamiento construida con [Next.js](https://nextjs.org/). Diseñada mobile-first, con una experiencia gamificada del progreso físico mediante un sistema de rangos por grupo muscular.

## Funcionalidades principales

### 🏠 Dashboard (Inicio)
- **Entreno del día:** tarjeta con el foco, nº de ejercicios y tiempo estimado, con inicio directo de la sesión.
- **Calendario deslizable:** desliza la tarjeta de "hoy" a la izquierda para ver un calendario de actividad — últimos 7 días o, desplegado, el mes completo. Distingue días entrenados, hoy pendiente, días pasados sin entrenar y días futuros, y al tocar un día entrenado muestra el detalle de esa sesión (grupo muscular, series, volumen).
- **Estadísticas rápidas:** entrenos totales, volumen semanal levantado y entrenos de la semana.
- **Accesos rápidos:** rangos musculares y sugerencias de nuevos ejercicios.

### 🏋️ Sesión de entreno
- Registro de series (peso/reps) por ejercicio, con temporizador de descanso automático entre series.
- Añadir o eliminar series sobre la marcha, y sustituir un ejercicio en mitad del entreno reutilizando el selector de la biblioteca.
- **Minimizable:** la sesión activa se puede minimizar a un mini-player global y seguir navegando por la app sin perder el progreso.
- Resumen final con subidas de rango y marcas personales (PRs) al terminar.

### 📚 Biblioteca de ejercicios
- Explorador completo con búsqueda y filtros por grupo muscular, equipo y dificultad.
- Ficha de ejercicio con instrucciones paso a paso, imágenes de ejecución y estadísticas.

### 🏃 Cardio y actividad
- Registro de rutas en tiempo real sobre mapa (Leaflet) con distancia, ritmo y duración.
- Igual que el entreno de fuerza, la sesión de cardio es **minimizable** a un mini-player.
- Historial de actividades con detalle por sesión.

### 🏆 Sistema de rangos (gamificación)
- Rangos por músculo (Principiante → Intermedio → Avanzado → Experto → Maestro) basados en fuerza relativa (1RM estimado / peso corporal) y volumen efectivo.
- Mapa muscular interactivo (heatmap) con el rango de cada zona, y vista alternable entre media global y detalle por músculo.
- Modal explicativo de cómo se calcula la puntuación (fuerza vs. volumen).

### 📅 Rutinas
- Gestor de rutinas con los días de entrenamiento, su enfoque y ejercicios planeados.
- Editor con reordenación de ejercicios por arrastre (drag & drop, con soporte táctil completo).
- Inicio rápido del entreno del día desde la propia rutina.

### 👤 Perfil y ajustes
- Datos físicos (peso, altura, sexo, objetivo) usados en el cálculo de rangos.
- Preferencias: tema claro/oscuro, unidades métrico/imperial, notificaciones (recordatorios de entreno, descansos, resúmenes semanales).

## Stack técnico

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + React 19 + TypeScript
- **Estilos:** Tailwind CSS v4, con theming por variables CSS (light/dark)
- **Iconos:** Lucide React
- **Estado:** React Context propio (sin librerías externas de estado) — stores separados para perfil/rutinas, sesión de entreno activa y tracking de cardio
- **Drag & drop:** `@dnd-kit` (core, sortable, modifiers, utilities)
- **Mapas:** Leaflet / React Leaflet para el tracking de rutas de cardio
- **PWA:** manifest + service worker registrado para instalación e uso offline básico

## Estructura del proyecto

```
src/app/          rutas (App Router): inicio, onboarding, rutinas, biblioteca, cardio, rangos, perfil
src/components/    cardio/, exercise/, layout/, profile/, routines/, ui/, workout/
src/lib/           store/ (contexts), exercises/, workout/, rank-engine.ts, ranks.ts, mock-data.ts, utils.ts
```

Ver [CONTEXT.md](./CONTEXT.md) para el contexto técnico completo y convenciones de diseño del proyecto.

## Empezar a desarrollar

Instala las dependencias y corre el servidor de desarrollo:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.
