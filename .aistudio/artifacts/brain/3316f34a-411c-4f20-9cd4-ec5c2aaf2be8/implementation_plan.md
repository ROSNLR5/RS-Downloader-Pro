# Plan de Actualización: Limpieza de Textos, Ajuste de Diagnóstico y Mejoras Avanzadas de Resiliencia

Plan detallado para eliminar cualquier mención de marcas externas, corregir los textos de diagnóstico solicitados y fortalecer la arquitectura de extracción y descarga con protecciones avanzadas contra bloqueos, fallos de red y compatibilidad multiformato.

---

### Decisiones Críticas y Confirmadas por el Usuario

> [!IMPORTANT]
> 1. **Eliminación Total de Nombres y Marcas**: Queda terminantemente prohibido mostrar "4K Downloader" o cualquier referencia a aplicaciones externas en toda la interfaz, banners, modales, componentes y textos. Tampoco se nombrará en ningún lugar a las aplicaciones de referencia analizadas.
> 2. **Texto de Diagnóstico Exacto**: Al presionar "Probar ahora", la respuesta de validación debe ser estrictamente:
>    `Diagnóstico exitoso: Motor de extracción y FFmpeg listos para descargas`
> 3. **Eliminación del Bloque Informativo**: Se suprime el banner *"Estándar 4K Downloader Implementado..."* de la pestaña de Diagnóstico en Ajustes.
> 4. **Ajuste en Acerca de**: Se sustituye *"Estándar 4K Downloader sin límites de velocidad"* por una descripción propia y profesional del motor de extracción multihilo.
> 5. **Mejoras Extraídas de los Repositorios de Referencia**:
>    - **Bypass de Bloqueos Anti-Bot**: Incorporación de argumentos de extracción para clientes alternativos (`--extractor-args "youtube:player_client=android,web"`), evasión de errores 403 y simulación de User-Agent moderno.
>    - **Tolerancia a Cortes de Red**: Configuración de reintentos automáticos para fragmentos DASH (`--retries 10 --fragment-retries 10 --socket-timeout 30`).
>    - **Sanitización de Nombres de Archivo**: Activación de `--windows-filenames` y normalización de caracteres para evitar fallos por símbolos prohibidos (`: \ / * ? " < > |`) en Windows y otros sistemas.
>    - **Metadatos y Capítulos Integrados**: Incorporación automática de `--embed-metadata` y `--embed-chapters` para que los videos y audios descargados conserven títulos limpios, portadas y marcas de tiempo nativas.

---

## 1. Visión General del Producto

**RS Downloader Pro** consolida una estación de trabajo de descargas multimedia independiente, rápida y confiable. Esta fase elimina cualquier vestigio de denominaciones externas, afina los mensajes del sistema a la especificación exacta dada por el usuario y eleva la robustez técnica del backend frente a cambios y bloqueos frecuentes en plataformas de video como YouTube, Instagram, Vimeo y TikTok.

---

## 2. Experiencia de Usuario y Diseño Visual

### Modificaciones en la Interfaz (UI/UX)
1. **Modal de Ajustes / Diagnóstico**:
   - Eliminación del banner verde de metodología externa.
   - Conservación del panel limpio de verificación de binarios con estado en tiempo real.
   - Al pulsar "Probar ahora", el badge de confirmación mostrará con precisión quirúrgica:
     `Diagnóstico exitoso: Motor de extracción y FFmpeg listos para descargas`.
2. **Modal Acerca de (`AboutModal.tsx`)**:
   - Reemplazo de la mención de marca en el punto 2 por: *"Motor de extracción multihilo de alto rendimiento"*.
3. **Selector de Formatos (`FormatSelectorModal.tsx`)**:
   - Mantener las indicaciones claras de *"Audio y Video combinados"* y *"Audio estéreo AAC"* sin alusión a nomenclaturas externas.
4. **Respuesta a Errores de Plataforma**:
   - Si un video tiene restricciones geográficas o requiere verificación, la aplicación informará de manera clara y asistida en lugar de arrojar un error crudo de consola.

---

## 3. Decisiones de Producto y Arquitectura Técnica

### Decisión 1: Estrategia Anti-Bloqueo y Robustez de Extracción
- **Implementación**:
  - En `server.ts`, tanto en el análisis (`/api/analyze-link`) como en la descarga (`/api/download`), se configuran los argumentos recomendados por las mejores herramientas de la comunidad:
    - `--extractor-args "youtube:player_client=android,web"`: Evita bloqueos por "Sign in to confirm you're not a bot" frecuentes en clientes web convencionales.
    - `--geo-bypass`: Supera restricciones geográficas básicas.
    - `--no-check-certificates`: Previene fallos por certificados locales desactualizados.
    - `--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ..."`: Cabecera uniforme que evita rechazos 403 HTTP.
    - `--windows-filenames`: Sanitiza títulos con dos puntos, barras o comillas que provocan fallos de sistema de archivos.

### Decisión 2: Optimización de la Fusión de Audio sin Recodificar Video
- **Implementación**:
  - Parámetro post-procesador de FFmpeg: `--postprocessor-args "ffmpeg:-c:v copy -c:a aac"`
  - **Ventaja**: El video se copia tal cual (ultra-rápido, 0 pérdida de calidad) y el audio se encapsula en AAC estándar compatible con cualquier reproductor (Windows Media Player, QuickTime, Smart TVs, teléfonos).

### Decisión 3: Limpieza Global de Cadenas de Texto
- **Implementación**:
  - Búsqueda exhaustiva en todo el árbol de código fuente para garantizar que ninguna cadena contenga "4K Downloader", ni nombres de las herramientas de referencia ni menciones derivadas.

---

## 4. Diagrama de Arquitectura Mejorada

```
┌────────────────────────────────────────────────────────┐
│             RS Downloader Pro - Interfaz               │
│  - Limpieza total de marcas y nombres externos         │
│  - Mensaje de diagnóstico exacto al probar             │
│  - Control de 20 descargas/día con reset a medianoche │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Servidor Local (server.ts)                 │
│  - Pipeline Anti-Bot: player_client=android,web        │
│  - Resiliencia de Red: 10 reintentos automáticos       │
│  - Sanitización de Nombres: --windows-filenames        │
│  - Fusión FFmpeg directa: -c:v copy -c:a aac           │
│  - Metadatos & Capítulos: --embed-metadata             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Motores Binarios de Ejecución              │
│  - yt-dlp: Extracción paralela resiliente              │
│  - ffmpeg: Fusión y multiplexación sin pérdidas        │
└────────────────────────────────────────────────────────┘
```

---

## 5. Plan de Verificación

1. **Verificación de Textos**:
   - Comprobar que ninguna pantalla, modal o mensaje contenga "4K Downloader" o los nombres de los repositorios consultados.
   - Presionar "Probar ahora" en la pestaña de Diagnóstico y validar que el mensaje resultante sea exactamente:
     `Diagnóstico exitoso: Motor de extracción y FFmpeg listos para descargas`.
2. **Verificación de Banners y Modales**:
   - Abrir Modal de Diagnóstico y corroborar la ausencia del banner eliminado.
   - Abrir Modal Acerca de y comprobar la tarjeta de características técnicas actualizada.
3. **Verificación de Resiliencia de Descargas**:
   - Descargar enlaces con caracteres especiales en el título para confirmar que `--windows-filenames` los procesa sin fallos.
   - Verificar la velocidad de descarga con la fusión optimizada de audio AAC.
4. **Compilación y Linters**:
   - Ejecutar `compile_applet` para garantizar que la aplicación compila sin errores.
