-- Fix missing columns in clients table
alter table public.clients add column if not exists name text;

-- Ensure RLS is permissive for the check-in (if not already)
drop policy if exists "Enable access to all users" on public.clients;
create policy "Enable access to all users" on public.clients for all using (true) with check (true);
