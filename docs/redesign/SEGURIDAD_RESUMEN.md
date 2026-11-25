# ComfyMind: nota de seguridad antes de publicar

**Fecha:** 25 de noviembre de 2026 · **Alcance:** backend (FastAPI) y conexión con el frontend.

## En resumen

La demo v6 funciona **sin backend**: no guarda datos en ningún servidor ni se conecta a ComfyUI, así que puede enseñarse con tranquilidad.
La app real **no está lista para usarse con personas reales**. La revisión del código al inicio del proyecto encontró problemas de seguridad que siguen presentes, y el rediseño no ha tocado el backend. **Antes de publicar nada hace falta una revisión de seguridad.**

## Lo más importante

1. **Permisos.** Algunas rutas no comprueban quién hace la petición:
   - la lista de todos los usuarios es pública;
   - cualquier usuario con sesión iniciada puede crear sesiones entre otras dos personas;
   - las rutas de generación de imágenes no comprueban que las imágenes sean del usuario.
2. **Chat en directo (WebSocket).** El rol va en la URL y solo se validan dos valores. Con otro valor se pueden leer y enviar mensajes en una sesión ajena. El token de acceso también viaja en la URL.
3. **Configuración insegura por defecto:**
   - la clave para firmar los tokens es `"changeme"`;
   - CORS acepta cualquier origen con credenciales;
   - el token se guarda en `localStorage`, sin caducidad ni revocación;
   - no hay límite de intentos de login;
   - cualquiera puede registrarse como terapeuta.
4. **Ficheros.** Una ruta de imagen sin validar permite copiar ficheros arbitrarios del servidor (*path traversal*). Además, las obras de los usuarios se guardan dentro de la carpeta del código del frontend.
5. **Rendimiento con efecto en la seguridad.** Mientras alguien genera una imagen, la API y el chat se bloquean hasta varios minutos.

## Qué proponemos

- Una **revisión de seguridad dedicada** del backend antes de cualquier uso real. Se estiman pocos días de trabajo, y casi todo son arreglos acotados.
- Tratarla como un requisito, no como una mejora: la app manejará obras y notas de personas en terapia.
- Los detalles técnicos, con ficheros y líneas, están en `docs/redesign/01_APP_INVENTORY.md`, §9 (P1).
