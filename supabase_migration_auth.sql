-- 1. Create Profiles Table (Public information for users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  role text default 'staff', -- 'admin' or 'staff'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. RLS Policies
-- Allow users to view their own profile/role
create policy "Public profiles are viewable by self"
  on public.profiles for select
  using ( auth.uid() = id );

-- Allow admins (this is a bit recursive, but for now we trust the client or a secure function)
-- Ideally, policies should be based on a secure check. For simplicity in this demo:
-- We allow read if you are authenticated.
create policy "Authenticated users can read profiles"
  on public.profiles for select
  using ( auth.role() = 'authenticated' );

-- 4. Auto-create Profile on Signup (Trigger)
-- This ensures every new user gets a 'staff' entry by default.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'staff');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. FUNCTION TO PROMOTE ADMIN (Run this manually for your account)
-- Usage: select promote_to_admin('tu_email@gmail.com');
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
