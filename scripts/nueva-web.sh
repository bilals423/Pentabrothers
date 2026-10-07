#!/usr/bin/env bash
# Crea una web nueva para un cliente.
# Uso: scripts/nueva-web.sh <nombre> <dominio> [dominio2 ...]
# Ej.: scripts/nueva-web.sh panaderia-lopez panaderialopez.com www.panaderialopez.com
set -euo pipefail

if [ $# -lt 2 ]; then
	echo "Uso: $0 <nombre> <dominio> [dominio2 ...]" >&2
	exit 1
fi

nombre="$1"; shift
if ! [[ "$nombre" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
	echo "El nombre solo puede tener minúsculas, números y guiones" >&2
	exit 1
fi

raiz="$(cd "$(dirname "$0")/.." && pwd)"
dir_web="$raiz/sites/$nombre"
conf="$raiz/caddy/sites/$nombre.caddy"

if [ -e "$conf" ]; then
	echo "Ya existe $conf" >&2
	exit 1
fi

mkdir -p "$dir_web"
if [ ! -f "$dir_web/index.html" ]; then
	cat > "$dir_web/index.html" <<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>$nombre</title></head>
<body><h1>$nombre</h1><p>Web en construcción.</p></body>
</html>
HTML
fi

dominios="$(printf "%s, " "$@")"; dominios="${dominios%, }"
cat > "$conf" <<CADDY
# Cliente: $nombre
$dominios {
	import web_estatica $nombre
}
CADDY

echo "Creada sites/$nombre y caddy/sites/$nombre.caddy"
echo "1) Apunta el DNS (registro A) de: $* -> IP del servidor"
echo "2) git add . && git commit -m 'Nueva web: $nombre' && git push"
