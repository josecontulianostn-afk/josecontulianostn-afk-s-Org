-- INIT: Script de Configuración Base de Datos Tus3B Style
-- Ejecutar este script completo en el Editor SQL de Supabase

-- 1. Tabla Perfiles (Roles de Admin/Staff)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  role text default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

-- Limpiar politicas previas para evitar errores
drop policy if exists "Public profiles are viewable by self" on public.profiles;
drop policy if exists "Authenticated users can read profiles" on public.profiles;

create policy "Public profiles are viewable by self" on public.profiles for select using ( auth.uid() = id );
create policy "Authenticated users can read profiles" on public.profiles for select using ( auth.role() = 'authenticated' );

-- Trigger para crear perfil automatico
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'staff');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tabla Clientes (Wallet & Lealtad)
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text unique not null,
  rut text,
  visits int default 0,
  referrals int default 0,
  hair_service_count int default 0,
  discount_5th_visit_available boolean default false,
  free_cut_available boolean default false,
  member_token text, -- Token para tarjeta digital
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.clients enable row level security;

-- Limpiar politica clientes
drop policy if exists "Enable access to all users" on public.clients;

-- Permitir lectura/escritura a todos (anon) para que funcione el registro sin login de usuario
create policy "Enable access to all users" on public.clients for all using (true) with check (true);

-- 3. Tabla Recompensas y Inventario
create table if not exists public.rewards (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cost_visits int not null,
  type text default 'general',
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.rewards enable row level security;

drop policy if exists "Enable read access for all users" on public.rewards;
create policy "Enable read access for all users" on public.rewards for select using (true);

create table if not exists public.inventory (
  id uuid default gen_random_uuid() primary key,
  product_id text unique not null,
  name text,
  quantity int default 0,
  category text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.inventory enable row level security;

drop policy if exists "Enable read access for all users" on public.inventory;
drop policy if exists "Enable write access for authenticated users" on public.inventory;

create policy "Enable read access for all users" on public.inventory for select using (true);
create policy "Enable write access for authenticated users" on public.inventory for all using (auth.role() = 'authenticated');

-- 4. Funciones RPC (Opcionales para logica de negocio)
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

-- Insertar datos semilla (Rewards)
insert into public.rewards (name, cost_visits, type, description)
values 
  ('Descuento 10%', 5, 'discount', 'Descuento en tu próximo servicio'),
  ('Corte Gratis', 10, 'service', 'Corte de cabello gratis')
on conflict do nothing;

