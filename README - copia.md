#  RS Downloader Pro  
> *Gestor multimedia premium ultra-rápido, inteligente y multiplataforma.*

**RS Downloader Pro** es una aplicación de escritorio y web de alto rendimiento, inspirada en las mejores características de gestores de descarga premium. Permite descargar videos, audios y transmisiones de prácticamente cualquier red social (TikTok, Instagram, Facebook, Twitter/X, Twitch, etc.) de forma directa, en alta definición y sin necesidad de iniciar sesión o ingresar cuentas.

Desarrollado con un enfoque moderno empleando **React 19**, **Vite**, **Express**, **Tailwind CSS v4** y un contenedor nativo **Electron**, integra el motor líder de descargas **yt-dlp** junto a **ffmpeg** para lograr un procesamiento local de alta velocidad.

---

##  Índice
1. [ Características Principales](#-características-principales)
2. [ Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
3. [ Requisitos del Sistema](#-requisitos-del-sistema)
4. [ Guías de Instalación Paso a Paso](#-guías-de-instalación-paso-a-paso)
   - [Opción A: Ejecución en Modo Web (Desarrollo y Servidor local)](#opción-a-ejecución-en-modo-web-desarrollo-y-servidor-local)
   - [Opción B: Ejecución en Modo Escritorio (Nativo con Electron)](#opción-b-ejecución-en-modo-escritorio-nativo-con-electron)
5. [ Estructura de Binarios Cruciales (yt-dlp & ffmpeg)](#-estructura-de-binarios-cruciales-yt-dlp--ffmpeg)
6. [ Operación y Uso (Manual de Usuario)](#-operación-y-uso-manual-de-usuario)
7. [ Compilación y Empaquetado para Distribución (.EXE)](#-compilación-y-empaquetado-para-distribución-exe)
8. [ Soporte y Gestión de Archivos Grandes (Git LFS)](#-soporte-y-gestión-de-archivos-grandes-git-lfs)
9. [ Créditos y Licencia](#-créditos-y-licencia)

---

## ✨ Características Principales

*   **⚡ Interfaz de Usuario Ultra-Pulida:** Diseñada con una estética minimalista premium en **Tema Oscuro (Dark Mode)** y Claro, transiciones suaves, micro-animaciones fluidas con Framer Motion (Motion) y un selector responsive impecable.
*   **🎥 Selector de Formato Dinámico y Detallado:** Analiza cualquier enlace y extrae todos los formatos de video y audio disponibles. Selecciona resoluciones de hasta **4K / 8K**, estimando el tamaño del archivo en megabytes antes de iniciar la descarga.
*   **🤖 Modo Inteligente (Smart Mode):** Configura un formato predeterminado, una calidad objetivo y una carpeta de destino. Después de activarse, cualquier enlace que pegues comenzará a descargarse de inmediato de forma automatizada mediante un solo clic.
*   ** Selector de Carpetas Nativo (Windows):** Integración nativa exclusiva mediante PowerShell para abrir ventanas de selección de directorios locales desde la aplicación.
*   ** Bandwidth Control (Limitador de Velocidad):** Configura límites de velocidad de descarga (desde 50 KB/s hasta ilimitado) para no saturar tu conexión de red mientras realizas descargas de archivos pesados.
*   **🔄 Multiprocesamiento y Fusión Local (ffmpeg):** Descarga flujos de audio y video por separado en su máxima calidad original y los fusiona automáticamente en un único contenedor (.mp4 / .mkv) de manera local.
*   ** Actualizaciones Automáticas (Auto-Updater):** Ejecutándose en modo de escritorio integrado con `electron-updater` para notificar, descargar e instalar actualizaciones en segundo plano directamente desde GitHub Releases.
*   ** Barra de Estado y Cola de Descargas:** Panel dinámico interactivo con cálculo en tiempo real de porcentaje, velocidad (MB/s), tiempo estimado restante (ETA) y botones para abrir la carpeta directamente en el Explorador de Archivos de tu sistema operativo.

---

## 🛠️ Arquitectura y Tecnologías

La aplicación adopta una arquitectura híbrida de alto rendimiento:

*   **Capa Visual (Frontend):** **React 19** estructurado en TypeScript, estilizado visualmente con el motor de **Tailwind CSS v4** y potenciado con iconografía moderna de **Lucide React**.
*   **Capa de Gestión (Servidor Backend Express):** Un servidor local ligero desarrollado en TypeScript que interactúa con el sistema de archivos, gestiona los hilos de `child_process` y expone API REST seguras a la interfaz de usuario.
*   **Contenedor de Escritorio (Electron Shell):** Ejecuta la app localmente abstrayendo las APIs web, eliminando barras de menú no deseadas, integrando controles de barra de títulos nativos de Windows, y administrando el ciclo de vida del auto-actualizador de software.
*   **Motor Principal (Procesamiento Nativo):** Interfaz CLI de control construida en torno de **yt-dlp** y binarios compilados de **ffmpeg**.

---

## 💻 Requisitos del Sistema

Antes de comenzar la instalación de desarrollo o empaquetado, asegúrate de contar con:

1.  **Node.js LTS** (Versión 18 o superior recomendada, e.g. Node 20+).
2.  **npm** (Gestor de paquetes, incluido con Node).
3.  **Git** instalado en el sistema.
4.  **Git LFS (Large File Storage):** Extremadamente recomendado para clonar los archivos binarios incluidos (`bin/yt-dlp.exe`, etc.) sin que se rompan sus punteros.

---

## 🚀 Guías de Instalación Paso a Paso

### ⬇️ Paso Inicial: Clonar el Repositorio

Abra una terminal en su computadora y ejecute los siguientes comandos de forma ordenada:

```bash
# 1. Instalar y habilitar Git LFS en tu entorno global de Git
git lfs install

# 2. Clonar el repositorio
git clone https://github.com/ROSNLR5/rs-downloader-pro.git

# 3. Acceder al directorio del proyecto
cd rs-downloader-pro

# 4. Asegurar la descarga correcta de los binarios adjuntos por LFS
git lfs pull
```

---

### Opción A: Ejecución en Modo Web (Desarrollo y Servidor local)

Ideal si deseas probar rápidamente la aplicación, depurar código o si deseas ejecutarla dentro de tu red local:

1.  **Instalar dependencias del proyecto:**
    ```bash
    npm install
    ```
2.  **Iniciar el entorno unificado de desarrollo:**
    ```bash
    npm run dev
    ```
    *Este comando iniciará el backend de Express usando `tsx server.ts` en el puerto `3000` y montará el middleware del servidor de Vite de forma transparente.*
3.  **Acceder a la aplicación:**
    Abre tu navegador de preferencia e ingresa a: **`http://localhost:3000`**

---

### Opción B: Ejecución en Modo Escritorio (Nativo con Electron)

Ideal para desarrolladores que desean probar la ventana sin marcos de escritorio, probar el auto-actualizador o el comportamiento nativo físico de carpetas:

1.  **Instalar dependencias del proyecto:**
    ```bash
    npm install
    ```
2.  **Lanzar el contenedor nativo de Electron:**
    ```bash
    npm run electron:start
    ```
    *Se compilará el código de desarrollo y se abrirá una hermosa aplicación de escritorio sin bordes nativos sobre tu pantalla.*

---

## 📁 Estructura de Binarios Cruciales (yt-dlp & ffmpeg)

Para que el analizador térmico y las descargas se realicen adecuadamente de manera local, el servidor requiere de componentes ejecutables auxiliares en el directorio raíz. El instalador o el clone LFS debería configurarlos en:

```txt
rs-downloader-pro/
├── bin/
│   ├── yt-dlp.exe    <-- Motor de enlace (Windows)
│   ├── yt-dlp        <-- Motor de enlace (Mac/Linux)
│   ├── ffmpeg.exe    <-- Fusión y postprocesador (Windows)
│   └── ffmpeg        <-- Fusión y postprocesador (Mac/Linux)
```

> **Nota para usuarios de macOS / Linux:** Si ejecutas estos binarios en sistemas Unix-like por primera vez, asegúrate de otorgarles permisos de ejecución explícitos en tu sistema de archivos mediante:
> ```bash
> chmod +x bin/yt-dlp bin/ffmpeg
> ```

---

## 📖 Operación y Uso (Manual de Usuario)

Cualquiera puede empezar a descargar contenido siguiendo estos sencillos pasos desde la pantalla principal:

1.  **Copie la URL:** Diríjase a su red social (TikTok, Instagram, etc.) y copie el enlace del video, reel o audio en su portapapeles.
2.  **Pegue y Analice:** Abra **RS Downloader Pro**, pegue el enlace en el campo principal de entrada y presione el botón **Analizar URL**.
3.  **Seleccione la Opción Perfecta:** Se desplegará instantáneamente un modal con la previsualización del video (título, autor, miniatura, duración). Elija la calidad y formato que desee (e.g. `1080p (MP4)`, `4K (MKV)` o `Audio Premium (MP3)`).
4.  **Descargue:** Presione el botón **Iniciar Descarga**. Verá el progreso directo en la interfaz (porcentaje, KB/s restantes, barra de progreso interactivo y animaciones de control).
5.  **Abra la Navegación:**
    *   *Modo Web:* Al procesarse, el navegador web iniciará la descarga en tu carpeta por defecto como un adjunto de archivo.
    *   *Modo Local/Escritorio:* Podrás presionar el botón de icono de carpeta (**Abrir Carpeta**) para localizar físicamente el archivo descargado de inmediato en tu disco local.

---

## 📦 Compilación y Empaquetado para Distribución (.EXE)

Si deseas empaquetar de forma automatizada este gestor como una aplicación nativa instalable ejecutable de Windows con instalador rápido, puedes usar el script integrado basado en **electron-builder**:

```bash
# Compila los estáticos de React mediante Vite, empaqueta el servidor con esbuild y genera el ejecutable instalable
npm run electron:build
```

Al completarse el flujo de producción, la distribución se alojará de forma limpia en el directorio creado:
**📁 `dist-electron/`**
*(Dentro encontrarás el instalador `.exe` autónomo para Windows listo para compartir o subir a tus GitHub Releases).*

---

## 🗄️ Soporte y Gestión de Archivos Grandes (Git LFS)

Este repositorio hace uso de **Git Large File Storage (LFS)** para almacenar de forma correcta y transparente los binarios pesados de utilidades externas (como el instalador o compilados de ffmpeg y yt-dlp). De esta manera el repositorio se mantiene ágil de actualizar e indexar.

Nuestra configuración activa en `.gitattributes` incluye:
```gitattributes
bin/ffmpeg.exe filter=lfs diff=lfs merge=lfs -text
bin/ffmpeg filter=lfs diff=lfs merge=lfs -text
bin/yt-dlp.exe filter=lfs diff=lfs merge=lfs -text
bin/yt-dlp filter=lfs diff=lfs merge=lfs -text
*.exe filter=lfs diff=lfs merge=lfs -text
*.dll filter=lfs diff=lfs merge=lfs -text
```

Si tus binarios no cargan inicialmente o pesan pocos Bytes (archivos puntero de texto), significa que no ejecutaste Git LFS. Resuelve esto corriendo simplemente en tu terminal local:
```bash
git lfs install
git lfs pull
```

---

## 🤝 Contribuciones

¿Encontraste un bug, tienes ideas innovadoras o quieres optimizar los scripts? 
¡Eres bienvenido a colaborar! 

1. Realiza un **Fork** del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`).
3. Sube tus cambios (`git commit -m 'Añade una increíble característica'`).
4. Haz push a la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un **Pull Request**.

---

## 👨‍💻 Créditos y Autores

*   **Ing. Rosmer Santaella** (**ROSNLR5**) - *Creador y desarrollador principal* - [@ROSNLR5](https://github.com/ROSNLR5)

---

## 📄 Licencia

Este proyecto se distribuye bajo los términos de la **Licencia MIT**. Siéntete libre de utilizarlo, modificarlo y redistribuirlo de forma personal o comercial. Consulta el archivo de licencia correspondiente para más detalles.
