# Webs de la agencia

Todas las webs de los clientes viven en este repositorio y se publican **gratis** en [Cloudflare Pages](https://pages.cloudflare.com) (HTTPS, CDN mundial, tráfico ilimitado y uso comercial permitido).

```
sites/<cliente>/                      ← cada web (hecha con la plantilla o HTML a mano)
plantilla/                            ← plantilla de la agencia (Astro) con SEO, contacto y legales
scripts/nueva-web.sh                  ← crea una web nueva
.github/workflows/publicar-webs.yml   ← publica automáticamente al hacer push
```

**Cómo funciona:** cada carpeta de `sites/` es una web. Al hacer `git push`, GitHub publica solo las webs que han cambiado (si la web tiene `package.json`, primero la compila):

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
scripts/nueva-web.sh panaderia-lopez          # desde la plantilla (recomendado)
scripts/nueva-web.sh panaderia-lopez --html   # o carpeta vacía para HTML hecho a mano
git add . && git commit -m "Nueva web: panaderia-lopez" && git push
```

El proyecto en Cloudflare se crea solo la primera vez.

## La plantilla de la agencia

Hecha con [Astro](https://astro.build): genera HTML puro, muy rápido y fácil de leer para Google. Incluye:

- **SEO completo:** título y descripción por página, URL canónica, Open Graph (vista previa en WhatsApp/redes), datos estructurados de negocio local (schema.org), `sitemap.xml` y `robots.txt` automáticos.
- **Formulario de contacto** que guarda los mensajes en Supabase (o abre el correo si Supabase no está configurado), con protección anti-bots.
- **Botón de WhatsApp**, diseño adaptado a móvil, página 404.
- **Aviso legal y política de privacidad** (textos orientativos, revisar con el cliente).

Para personalizar una web nueva:

1. `src/config.ts` → dominio, nombre, descripción, contacto, dirección, datos legales. **Es lo primero que hay que cambiar.**
2. `src/styles/global.css` → colores y tipografía (variables al principio).
3. `public/og.png` → imagen para compartir en redes (1200×630) y `public/favicon.svg`.
4. `src/pages/` → cada archivo `.astro` es una página (`servicios.astro` → `/servicios`). Una página por servicio importante posiciona mejor.

Verla en tu ordenador mientras la editas (necesitas [Node.js](https://nodejs.org) 22 o superior):

```bash
cd sites/panaderia-lopez
npm install
npm run dev        # abre http://localhost:4321
```

### Formulario de contacto con Supabase (opcional)

Un solo proyecto gratuito de Supabase recibe los mensajes de todas las webs (columna `web`).

1. Crea un proyecto en <https://supabase.com> y ejecuta `plantilla/supabase/contactos.sql` en *SQL Editor*.
2. En *Project Settings → API* copia la URL y la *anon key* y guárdalas como secrets de GitHub: `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
3. Los mensajes aparecen en *Table Editor → contactos*. Las webs solo pueden enviar mensajes, no leerlos.

## Poner el dominio del cliente

En Cloudflare → *Workers & Pages* → el proyecto → *Custom domains → Set up a domain*.

- Si el dominio está gestionado en Cloudflare (gratis, recomendado), se configura con un clic.
- Si está en otro proveedor, crea un registro **CNAME** de `www` apuntando a `<cliente>.pages.dev`.

## Límites del plan gratuito

- Unas 100 webs (proyectos) por cuenta; es un límite flexible que Cloudflare puede ampliar si se lo pides.
- Hasta 100 dominios propios por web.
- Archivos de hasta 25 MB y 20.000 archivos por web.
- Pensado para webs estáticas (HTML/CSS/JS, o generadas con Astro, Vite, etc.). No sirve para WordPress/PHP.
