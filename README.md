# Tareas x Puntos 📅✨

Una **Progressive Web App (PWA)** moderna diseñada como un sistema de economía de fichas (gamificación) para gestionar tareas del hogar y motivar con un sistema de recompensas.

## 🚀 Características Principales

- **Gestión de Tareas (Economía de Fichas):** Tareas divididas en "Obligatorias" y "Bonus", con frecuencias diarias y semanales.
- **Tienda de Recompensas:** Los puntos ganados pueden canjearse por premios reales o virtuales configurables.
- **Progreso Semanal:** Seguimiento visual del progreso con una meta de puntos.
- **Historial Diario:** Calendario integrado que guarda lo realizado en los últimos 7 días.
- **Sincronización en la Nube:** Conectado en tiempo real a **Supabase** (PostgreSQL) para compartir el progreso entre múltiples dispositivos.
- **Animaciones y UX:** Celebraciones con confeti y feedback visual inmediato (Actualizaciones Optimistas).
- **Instalable (PWA):** Funciona como aplicación nativa en iOS, Android y Escritorio sin pasar por las tiendas de aplicaciones.

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite
- **Estilos:** Vanilla CSS moderno + Lucide React (Iconos)
- **Backend / Base de Datos:** Supabase (PostgreSQL)
- **PWA:** vite-plugin-pwa

## ⚙️ Instalación y Uso Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_public
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🗄️ Esquema de la Base de Datos

El proyecto utiliza 3 tablas simples en Supabase:
- `tasks`: Almacena la configuración de las tareas.
- `rewards`: Almacena la configuración y el coste de los premios.
- `app_state`: Tabla clave-valor (JSONB) utilizada para guardar los puntos totales y el historial de acciones de cada día de manera robusta.

## 🔒 Seguridad
Actualmente el proyecto utiliza Row Level Security (RLS) configurado para acceso público (`using (true)`), ideal para un uso en entornos familiares privados sin necesidad de gestión de usuarios/logins.
