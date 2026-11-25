# ComfyMind: nota de seguridad antes de publicar

**Fecha:** 25 de noviembre de 2026 · **Alcance:** backend (FastAPI) y conexión con el frontend.

## En resumen

La demo v6 funciona **sin backend**.
La app real **no está lista para usarse con personas reales**. **Antes de publicar nada hace falta una revisión de seguridad.**

## Lo más importante

1. **Permisos.** Algunas rutas no comprueban quién hace la petición:
   - la lista de todos los usuarios es pública.
   - cualquier usuario con sesión iniciada puede crear sesiones entre otras dos personas.
   - al generar imágenes no se comprueba que pertenezcan al usuario que las pide.
2. **Chat en directo.** Cualquier usuario con sesión iniciada puede entrar en el chat de una sesión ajena, leer los mensajes y enviar otros. La clave de acceso viaja en la dirección web, donde queda registrada.
3. **Configuración insegura por defecto:**
   - la clave que firma los accesos es un valor de ejemplo ("changeme").
   - el servidor acepta peticiones desde cualquier web.
   - el acceso se guarda en el navegador y no caduca ni puede anularse.
   - no hay límite de intentos al iniciar sesión.
   - cualquiera puede registrarse como terapeuta.
4. **Ficheros.** Una ruta de imagen sin validar permite copiar cualquier fichero del servidor. Las obras se guardan dentro de la carpeta del código.
5. **Disponibilidad.** Mientras se genera una imagen, el servidor no atiende nada más, hasta varios minutos. Unas pocas peticiones bastan para dejar la app y el chat sin servicio para todos.

**Recomendación:** revisión de seguridad dedicada del backend antes de cualquier uso real.
