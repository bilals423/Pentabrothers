#!/usr/bin/env bash
# Crea una web nueva para un cliente en sites/<nombre>.
# Uso: scripts/nueva-web.sh <nombre>          → copia la plantilla de la agencia (Astro)
#      scripts/nueva-web.sh <nombre> --html   → carpeta vacía para HTML hecho a mano
# Ej.: scripts/nueva-web.sh panaderia-lopez   → https://panaderia-lopez.pages.dev
set -euo pipefail

if [ $# -lt 1 ] || [ $# -gt 2 ] || { [ $# -eq 2 ] && [ "$2" != "--html" ]; }; then
	echo "Uso: $0 <nombre> [--html]" >&2
	exit 1
fi

nombre="$1"
if ! [[ "$nombre" =~ ^[a-z0-9][a-z0-9-]{0,57}$ ]]; then
	echo "El nombre solo puede tener minúsculas, números y guiones (máx. 58)" >&2
	exit 1
fi

raiz="$(cd "$(dirname "$0")/.." && pwd)"
dir_web="$raiz/sites/$nombre"
if [ -e "$dir_web" ]; then
	echo "Ya existe sites/$nombre" >&2
	exit 1
fi

if [ "${2:-}" = "--html" ]; then
	mkdir -p "$dir_web"
	cat > "$dir_web/index.html" <<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>$nombre</title></head>
<body><h1>$nombre</h1><p>Web en construcción.</p></body>
</html>
HTML
	echo "Creada sites/$nombre (HTML). Copia ahí los archivos de la web."
else
	mkdir -p "$dir_web"
	tar -C "$raiz/plantilla" --exclude=node_modules --exclude=dist --exclude=.astro --exclude=.env -cf - . | tar -C "$dir_web" -xf -
	sed -i "s/\"name\": \"plantilla-web\"/\"name\": \"$nombre\"/" "$dir_web/package.json"
	echo "Creada sites/$nombre desde la plantilla. Siguientes pasos:"
	echo "  1) Edita sites/$nombre/src/config.ts (datos del cliente) y src/styles/global.css (colores)"
	echo "  2) Para verla en local: cd sites/$nombre && npm install && npm run dev"
fi
echo "Para publicarla: git add . && git commit -m 'Nueva web: $nombre' && git push"
