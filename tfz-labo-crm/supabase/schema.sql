-- Supabase schema for TFZ Labo CRM

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  created_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  plan_months int,
  device text,
  mac text,
  m3u text,
  start_date date,
  end_date date,
  price numeric(10,2),
  notes text,
  created_at timestamptz default now()
);

create table lines (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions(id) on delete cascade,
  name text
);

-- Index for status queries
create index on subscriptions (end_date);
