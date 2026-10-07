#!/usr/bin/env bash
# Crea la carpeta de una web nueva para un cliente.
# Uso: scripts/nueva-web.sh <nombre>
# Ej.: scripts/nueva-web.sh panaderia-lopez  →  https://panaderia-lopez.pages.dev
set -euo pipefail

if [ $# -ne 1 ]; then
	echo "Uso: $0 <nombre>" >&2
	exit 1
fi

nombre="$1"
if ! [[ "$nombre" =~ ^[a-z0-9][a-z0-9-]{0,57}$ ]]; then
	echo "El nombre solo puede tener minúsculas, números y guiones (máx. 58)" >&2
	exit 1
fi

dir_web="$(cd "$(dirname "$0")/.." && pwd)/sites/$nombre"
if [ -e "$dir_web" ]; then
	echo "Ya existe sites/$nombre" >&2
	exit 1
fi

mkdir -p "$dir_web"
cat > "$dir_web/index.html" <<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>$nombre</title></head>
<body><h1>$nombre</h1><p>Web en construcción.</p></body>
</html>
HTML

echo "Creada sites/$nombre — copia ahí los archivos de la web y haz:"
echo "  git add . && git commit -m 'Nueva web: $nombre' && git push"
