# Sincronización SDS TPV → Supabase (EU Movil Control)

`eu-movil-sync.user.js` es un script de Tampermonkey. Mientras haya una pestaña de
https://sdstpv.es abierta con la sesión iniciada, lee stock, ventas y devoluciones
(solo lectura, nunca pulsa nada en SDS) y los envía a la edge function `sds-sync`.

- Cada hora, de 9 a 21 h (hora de Madrid), de lunes a sábado.
- Relee los últimos 3 días de ventas y devoluciones (el upsert evita duplicados).
- Con varias pestañas abiertas solo sincroniza una.
- Si el stock leído baja más de un 30 % respecto a la última vez, no marca nada como vendido.
- Indicador abajo a la izquierda: verde = OK, rojo = error. Clic = sincronizar ahora.

El secreto (`SYNC_SECRET_AQUI`) no se sube al repositorio: está en `app_config.sync_secret`
en Supabase. La copia con el secreto puesto va en `privado/` (ignorada por git).

## Instalación
1. Instalar la extensión Tampermonkey en Chrome/Edge.
2. Tampermonkey → Crear un nuevo script → borrar lo que trae y pegar la copia de `privado/`.
3. Guardar (Ctrl+S) y abrir o recargar sdstpv.es.
4. En Chrome: chrome://extensions → activar "Modo de desarrollador" (Tampermonkey lo necesita).
