-- COPIA DESDE AQUI HACIA ABAJO --

-- 1. Crear Tabla de Perfiles (Roles)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  role text default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Habilitar Seguridad
alter table public.profiles enable row level security;

-- (Opcional) Limpiar politicas viejas si existen para evitar errores de duplicado
drop policy if exists "Public profiles are viewable by self" on public.profiles;
drop policy if exists "Authenticated users can read profiles" on public.profiles;

create policy "Public profiles are viewable by self" on public.profiles for select using ( auth.uid() = id );
create policy "Authenticated users can read profiles" on public.profiles for select using ( auth.role() = 'authenticated' );

-- 3. Trigger Automático (Para que funcione el registro)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'staff');
  return new;
end;
$$ language plpgsql security definer;

-- (Opcional) Limpiar trigger viejo
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Función para hacerte Administrador
create or replace function promote_to_admin(target_email text)
returns text as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = target_email;
  if target_id is null then return 'User not found'; end if;
  update public.profiles set role = 'admin' where id = target_id;
  return 'User promoted to admin';
end;
$$ language plpgsql security definer;

-- FIN DE COPIA --
