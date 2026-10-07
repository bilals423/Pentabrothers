#!/usr/bin/env bash
# Prepara un VPS Ubuntu/Debian recién creado. Ejecutar como root:
#   curl -fsSL https://raw.githubusercontent.com/<usuario>/<repo>/main/scripts/instalar-servidor.sh | bash -s -- <url-del-repo>
set -euo pipefail

REPO_URL="${1:?Pasa la URL git del repositorio}"
DESTINO=/opt/agencia

apt-get update
apt-get install -y ca-certificates curl git ufw

if ! command -v docker >/dev/null; then
	curl -fsSL https://get.docker.com | sh
fi

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

if [ ! -d "$DESTINO/.git" ]; then
	git clone "$REPO_URL" "$DESTINO"
fi

cd "$DESTINO"
if [ ! -f .env ]; then
	cp .env.example .env
	sed -i "s/^N8N_ENCRYPTION_KEY=.*/N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)/" .env
	echo ">> Edita $DESTINO/.env (ACME_EMAIL y N8N_DOMAIN) y luego ejecuta: cd $DESTINO && docker compose up -d"
else
	docker compose up -d
fi
