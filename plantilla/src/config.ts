// ─────────────────────────────────────────────────────────────
//  DATOS DEL CLIENTE — lo primero que hay que cambiar en cada web
// ─────────────────────────────────────────────────────────────
export const SITE = {
  // Dominio final (sin barra al final). Se usa en el sitemap, canonical y Open Graph.
  url: 'https://www.ejemplo.com',
  nombre: 'Nombre del Negocio',
  descripcion: 'Descripción de 140-160 caracteres que aparecerá en Google. Di qué haces, para quién y dónde.',
  idioma: 'es',
  locale: 'es_ES',
  // Imagen para compartir en redes/WhatsApp (1200x630), dentro de /public
  imagenOg: '/og.png',

  contacto: {
    email: 'hola@ejemplo.com',
    telefono: '+34 600 000 000',
    whatsapp: '34600000000', // solo números, con prefijo; '' para ocultar el botón
  },

  // Datos para Google (SEO local). Deja calle vacía si el negocio no tiene local.
  direccion: {
    calle: 'Calle Ejemplo 1',
    ciudad: 'Madrid',
    cp: '28001',
    region: 'Madrid',
    pais: 'ES',
  },
  // Tipo de negocio de schema.org: LocalBusiness, Dentist, Restaurant, Store, ProfessionalService…
  tipoNegocio: 'LocalBusiness',

  redes: [
    // 'https://www.instagram.com/ejemplo',
  ] as string[],

  menu: [
    { texto: 'Inicio', href: '/' },
    { texto: 'Contacto', href: '/contacto' },
  ],

  // Datos legales para el aviso legal y la política de privacidad
  legal: {
    titular: 'Nombre Apellido / Empresa S.L.',
    nif: 'B00000000',
  },
};
