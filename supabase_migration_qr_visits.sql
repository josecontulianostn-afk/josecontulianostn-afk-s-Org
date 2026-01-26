-- Migration: QR Visit System Tables & Functions

-- 1. Table: Pending Visit Registrations
create table if not exists public.visit_registrations (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) not null,
  check_in_time timestamp with time zone default timezone('utc'::text, now()),
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text, -- Details of service/purchase
  validated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.visit_registrations enable row level security;

-- Policies
-- Allow anyone to create a registration (Authenticated or Anon via check-in page)
create policy "Enable insert for all users" on public.visit_registrations for insert with check (true);

-- Allow admins to read all
create policy "Enable read for admins and staff" on public.visit_registrations for select using ( auth.role() = 'authenticated' );

-- Allow admins to update
create policy "Enable update for admins" on public.visit_registrations for update using ( auth.role() = 'authenticated' );


-- 2. RPC: Process Visit Validation
-- This function is called by the admin when validatng a visit
create or replace function process_visit_validation(
  registration_id uuid,
  new_status text,
  notes text,
  count_as_loyalty boolean
)
returns json
language plpgsql
security definer
as $$
declare
  reg_record record;
  current_client record;
  new_visits int;
  is_eligible boolean;
begin
  -- Get registration
  select * into reg_record from public.visit_registrations where id = registration_id;
  
  if not found then
    return json_build_object('success', false, 'message', 'Registro de visita no encontrado');
  end if;

  if reg_record.status != 'pending' then
    return json_build_object('success', false, 'message', 'Esta visita ya fue procesada');
  end if;

  -- Update registration status
  update public.visit_registrations 
  set status = new_status,
      admin_notes = notes,
      validated_at = now()
  where id = registration_id;

  -- If rejected, stop here
  if new_status = 'rejected' then
    return json_build_object('success', true, 'message', 'Visita rechazada correctamente');
  end if;

  -- If approved AND counts for loyalty
  if new_status = 'approved' and count_as_loyalty = true then
    -- Get Client
    select * into current_client from public.clients where id = reg_record.client_id;
    
    -- Calculate new stats
    new_visits := current_client.visits + 1;
    is_eligible := (new_visits % 5) = 0; -- Simplistic rule, can be refined

    -- Update Client
    update public.clients 
    set visits = new_visits,
        tier = case 
          when new_visits >= 10 then 'Diamante'
          when new_visits >= 5 then 'Gold'
          else 'Silver'
        end,
        last_visit = now()
    where id = current_client.id;

    -- Log Event
    insert into public.loyalty_events (client_id, type, description, metadata)
    values (
      current_client.id, 
      'visit_approved', 
      'Visita validada por admin: ' || notes,
      json_build_object('registration_id', registration_id)
    );
     
     return json_build_object(
      'success', true, 
      'message', 'Visita validada y puntos asignados',
      'new_visits', new_visits
    );
  else
    -- Approved but NO loyalty points (e.g. just a consult)
    return json_build_object('success', true, 'message', 'Visita registrada sin puntos de lealtad');
  end if;
end;
$$;
