# Rogue - Fitness & Tracking App

Rogue es una aplicación moderna de seguimiento de fitness y rutinas de entrenamiento construida con [Next.js](https://nextjs.org/). Está diseñada para ofrecer una experiencia gamificada y detallada del progreso físico.

## Funcionalidades Principales

### 🏠 Dashboard (Inicio)
- **Resumen Diario:** Visualización rápida del entrenamiento programado para el día (ejercicios y tiempo estimado).
- **Estadísticas Rápidas:** Seguimiento de entrenamientos totales, volumen semanal levantado y entrenos de la semana actual.
- **Acceso Rápido:** Accesos directos a tus rangos musculares y sugerencias de nuevos ejercicios para incorporar a tus rutinas.

### 📚 Biblioteca de Ejercicios
- Explorador completo de ejercicios con barra de búsqueda.
- Sistema de filtros avanzado para encontrar ejercicios por grupo muscular o tipo.
- Tarjetas detalladas para cada ejercicio.

### 🏃‍♂️ Cardio y Actividad
- **Monitor de Pasos y Metas:** Seguimiento diario de pasos con progreso hacia la meta (ej. 10,000 pasos).
- **Métricas:** Resumen de calorías quemadas, tiempo activo y distancia recorrida.
- **Rutas Libres:** Función para iniciar y registrar una ruta activa o seguimiento de cardio en tiempo real.

### 🏆 Sistema de Rangos (Gamificación)
- **Rangos por Músculo:** Gamificación avanzada basada en tu fuerza relativa (tu 1RM estimado dividido entre tu peso corporal) y volumen.
- **Mapa Muscular (Heatmap):** Visualización interactiva de tu cuerpo donde los colores de cada músculo reflejan tu rango actual.
- **Modos de Puntuación:**
  - **Fuerza:** Para ejercicios principales pesados.
  - **Volumen:** Basado en series efectivas para ejercicios secundarios/aislamiento.
- **Progresión:** Sube de divisiones y rangos al mejorar tus marcas.

### 📅 Rutinas
- **Gestor de Rutinas:** Visualiza los días de entrenamiento, su enfoque y los ejercicios planeados.
- **Editor de Rutinas:** Personaliza y edita tus días de entrenamiento (series, repeticiones, etc.).
- **Inicio Rápido:** Comienza la sesión de entrenamiento del día directamente con un botón.

### 👤 Perfil y Ajustes
- **Datos Físicos:** Gestión de peso corporal, altura, sexo y objetivos (utilizados para el cálculo de rangos).
- **Preferencias:** 
  - Cambio de Tema (Modo Claro / Oscuro).
  - Configuración de unidades (Métrico / Imperial).
- **Notificaciones:** Ajustes para recordatorios de entreno, temporizador de descansos y resúmenes semanales.

## Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Estado:** Zustand (Store management local)
- **Tipografías:** Vercel Geist Font

## Empezar a desarrollar

Instala las dependencias y corre el servidor de desarrollo:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.
