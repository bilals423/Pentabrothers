-- Tabla de mensajes del formulario de contacto.
-- Un solo proyecto de Supabase puede recibir los formularios de varias webs (columna "web").
-- Ejecutar una vez en Supabase → SQL Editor.

create table if not exists public.contactos (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  web text not null check (char_length(web) <= 255),
  nombre text not null check (char_length(nombre) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200 and email like '%@%'),
  telefono text check (char_length(telefono) <= 40),
  mensaje text not null check (char_length(mensaje) between 1 and 5000)
);

alter table public.contactos enable row level security;

-- Las webs solo pueden INSERTAR mensajes. Nadie puede leerlos con la clave pública;
-- se consultan desde el panel de Supabase.
drop policy if exists "webs pueden enviar mensajes" on public.contactos;
create policy "webs pueden enviar mensajes"
  on public.contactos for insert
  to anon
  with check (true);
