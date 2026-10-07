# Webs de la agencia

Todas las webs de los clientes viven en este repositorio y se publican **gratis** en [Cloudflare Pages](https://pages.cloudflare.com) (HTTPS, CDN mundial, tráfico ilimitado y uso comercial permitido).

```
sites/<cliente>/                      ← los archivos de cada web (index.html, css, imágenes…)
scripts/nueva-web.sh                  ← crea la carpeta de una web nueva
.github/workflows/publicar-webs.yml   ← publica automáticamente al hacer push
```

**Cómo funciona:** cada carpeta de `sites/` es una web. Al hacer `git push`, GitHub publica solo las webs que han cambiado:

| Dónde haces push | Dónde se ve |
|---|---|
| rama `main` | `https://<cliente>.pages.dev` (producción) |
| cualquier otra rama | `https://<rama>.<cliente>.pages.dev` (vista previa para enseñar al cliente) |

> Si el nombre `<cliente>.pages.dev` ya lo usa otra persona en Cloudflare, te asignará uno parecido (p. ej. `cliente-abc.pages.dev`). Lo verás en el log de la publicación y en el panel de Cloudflare.

## Configuración (una sola vez, ~5 minutos)

1. Crea una cuenta gratis en <https://dash.cloudflare.com/sign-up>.
2. **Account ID:** en el panel de Cloudflare, menú *Workers & Pages* → aparece a la derecha como *Account ID*. Cópialo.
3. **API token:** *My Profile → API Tokens → Create Token → Create Custom Token*, con el permiso **Account → Cloudflare Pages → Edit**. Cópialo.
4. En GitHub → este repo → *Settings → Secrets and variables → Actions → New repository secret*, crea:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
5. Ve a la pestaña *Actions → Publicar webs → Run workflow* para publicar todas las webs por primera vez.

## Añadir la web de un cliente nuevo

```bash
scripts/nueva-web.sh panaderia-lopez
# copia los archivos de la web en sites/panaderia-lopez/
git add . && git commit -m "Nueva web: panaderia-lopez" && git push
```

El proyecto en Cloudflare se crea solo la primera vez.

## Poner el dominio del cliente

En Cloudflare → *Workers & Pages* → el proyecto → *Custom domains → Set up a domain*.

- Si el dominio está gestionado en Cloudflare (gratis, recomendado), se configura con un clic.
- Si está en otro proveedor, crea un registro **CNAME** de `www` apuntando a `<cliente>.pages.dev`.

## Límites del plan gratuito

- Unas 100 webs (proyectos) por cuenta; es un límite flexible que Cloudflare puede ampliar si se lo pides.
- Hasta 100 dominios propios por web.
- Archivos de hasta 25 MB y 20.000 archivos por web.
- Pensado para webs estáticas (HTML/CSS/JS, o generadas con Astro, Vite, etc.).
