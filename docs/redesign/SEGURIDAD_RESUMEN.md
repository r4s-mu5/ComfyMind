# ComfyMind: nota de seguridad

**Alcance:** backend (FastAPI) y conexión con el frontend.

La demo v6 adjunta al mail funciona **sin backend**. Esta nota es solo para la app real.
Todavía no está lista para usarse con personas reales y necesita una revisión de seguridad antes de publicarse.

1. **Control de acceso.** Varios endpoints no comprueban quién hace la petición:
   - `GET /users/` devuelve todos los usuarios sin autenticación.
   - cualquier usuario autenticado puede crear sesiones entre otras dos personas.
   - los endpoints de generación no comprueban que el `user_id` coincida con el usuario autenticado.
2. **WebSocket del chat.** El rol llega como parámetro de la ruta y solo se validan `patient` y `therapist`. Con cualquier otro valor, un usuario autenticado puede conectarse a una sesión ajena y enviar mensajes a la persona usuaria. El JSON se reenvía sin validar, así que puede hacerse pasar por la terapeuta. El JWT también viaja en la query string de la URL, así que queda en los logs.
3. **Configuración por defecto insegura:**
   - el `SECRET_KEY` que firma los JWT es `"changeme"` si no se define.
   - CORS acepta cualquier origen (`*`) con credenciales.
   - el JWT se guarda en `localStorage`, sin refresh ni revocación.
   - no hay rate limiting en login ni en registro.
   - cualquiera puede registrarse con rol de terapeuta.
4. **Ficheros.** La ruta de la imagen de entrada se une al directorio de assets sin normalizarla, lo que permite *path traversal*: se puede copiar cualquier fichero del servidor a la carpeta de entrada de ComfyUI. Las obras subidas y generadas se guardan dentro del árbol de código del frontend.
5. **Denegación de servicio (DoS).** Los endpoints de generación son `async` pero hacen llamadas bloqueantes a ComfyUI (hasta varios minutos). Mientras tanto el event loop queda bloqueado y la API y el chat dejan de responder para todos. Unas pocas peticiones simultáneas bastan para dejar el servicio sin respuesta.

**Recomendación:** revisión de seguridad específica del backend antes de cualquier uso real.
