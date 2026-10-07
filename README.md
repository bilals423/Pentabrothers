# Servidor de la agencia — webs + automatizaciones

Un único servidor (VPS) donde viven **todas las webs de los clientes**, cada una con su dominio y HTTPS automático, más **n8n** para las automatizaciones. Todo se gestiona desde este repositorio: haces `git push` y el servidor se actualiza solo.

```
sites/<cliente>/          ← los archivos de cada web (index.html, css, imágenes…)
caddy/sites/<cliente>.caddy ← qué dominio(s) sirven esa web
caddy/Caddyfile           ← configuración general (HTTPS, n8n, cabeceras)
docker-compose.yml        ← Caddy (servidor web) + n8n (automatizaciones)
scripts/                  ← instalar servidor, crear web nueva, backups
.github/workflows/deploy.yml ← despliegue automático al hacer push a main
```

## 1. Contratar el servidor

Cualquier VPS con Ubuntu 24.04 sirve. Para empezar basta con 2 vCPU / 4 GB RAM (p. ej. Hetzner CX22 ≈ 4–5 €/mes, o DigitalOcean, Contabo, OVH…). Anota la **IP pública**.

## 2. DNS

En el proveedor de cada dominio crea registros **A** apuntando a la IP del servidor:

| Registro | Apunta a |
|---|---|
| `n8n.tuagencia.com` | IP del servidor |
| `pentabrothers.tuagencia.com` (o el dominio real del cliente) | IP del servidor |

## 3. Instalar (una sola vez)

Conéctate por SSH como root y ejecuta:

```bash
curl -fsSL https://raw.githubusercontent.com/bilals423/Pentabrothers/main/scripts/instalar-servidor.sh \
  | bash -s -- https://github.com/bilals423/Pentabrothers.git
nano /opt/agencia/.env          # pon tu ACME_EMAIL y N8N_DOMAIN
cd /opt/agencia && docker compose up -d
```

> Si el repositorio es privado, añade antes una *deploy key* (Settings → Deploy keys) o clona con un token.

Esto instala Docker, abre el firewall (22, 80, 443), clona el repo en `/opt/agencia` y genera una clave de cifrado para n8n. En un minuto tendrás:

- `https://n8n.tuagencia.com` → crea tu usuario administrador de n8n
- `https://pentabrothers.tuagencia.com` → la web de Penta Brothers

## 4. Despliegue automático con GitHub

En GitHub → *Settings → Secrets and variables → Actions* añade:

| Secret | Valor |
|---|---|
| `SERVER_HOST` | IP del servidor |
| `SERVER_USER` | `root` (o el usuario con acceso a Docker) |
| `SERVER_SSH_KEY` | clave privada SSH autorizada en el servidor |

Desde ese momento, cada push a `main` hace `git pull` en el servidor y recarga Caddy, sin cortes.

## Añadir la web de un cliente nuevo

```bash
scripts/nueva-web.sh panaderia-lopez panaderialopez.com www.panaderialopez.com
# copia los archivos de la web a sites/panaderia-lopez/
git add . && git commit -m "Nueva web: panaderia-lopez" && git push
```

Apunta el DNS del dominio a la IP del servidor y Caddy sacará el certificado HTTPS automáticamente.

## Copias de seguridad

Las webs ya quedan guardadas en git. Para n8n (flujos y credenciales) programa el backup diario en el servidor:

```bash
crontab -e
0 3 * * * /opt/agencia/scripts/backup.sh
```

Guarda los backups en `/opt/agencia/backups/` (14 días). Conviene copiarlos también fuera del servidor (o activar los snapshots del proveedor del VPS).

## Comandos útiles en el servidor

```bash
cd /opt/agencia
docker compose ps                 # estado
docker compose logs -f caddy      # ver errores de certificados / dominios
docker compose pull && docker compose up -d   # actualizar n8n y Caddy
```
