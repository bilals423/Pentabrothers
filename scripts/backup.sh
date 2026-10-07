#!/usr/bin/env bash
# Copia de seguridad de n8n (flujos y credenciales) y certificados.
# Las webs ya están guardadas en git. Programar con cron, p. ej.:
#   0 3 * * * /opt/agencia/scripts/backup.sh
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
destino="$raiz/backups"
fecha="$(date +%F)"
mkdir -p "$destino"

for vol in n8n_data caddy_data; do
	docker run --rm \
		-v "$(basename "$raiz")_${vol}:/datos:ro" \
		-v "$destino:/backup" \
		alpine tar czf "/backup/${vol}-${fecha}.tar.gz" -C /datos .
done
cp "$raiz/.env" "$destino/env-${fecha}"

# Conserva solo los últimos 14 días
find "$destino" -type f -mtime +14 -delete
echo "Backup guardado en $destino"
