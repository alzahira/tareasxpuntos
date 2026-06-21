-- Enable Row Level Security (RLS) is optional for public access but good practice.
-- For "Anyone can enter", we will enable RLS but add a policy that allows everything for anon users.

-- 1. Tasks Table
create table tasks (
  id text primary key, -- keeping text to match current Date.now().toString() logic, or can switch to uuid default gen_random_uuid()
  title text not null,
  points int not null,
  type text not null, -- 'obligatory', 'bonus'
  completed boolean default false,
  frequency text default 'daily',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Rewards Table
create table rewards (
  id text primary key,
  title text not null,
  cost int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. App State (Points, History)
-- We'll store simple key-value pairs for global state like points
create table app_state (
  key text primary key,
  value jsonb not null
);

-- Permitir acceso público total (como pidió el usuario: "cualquiera puede entrar")
alter table tasks enable row level security;
alter table rewards enable row level security;
alter table app_state enable row level security;

create policy "Public Access Tasks" on tasks for all using (true) with check (true);
create policy "Public Access Rewards" on rewards for all using (true) with check (true);
create policy "Public Access AppState" on app_state for all using (true) with check (true);

-- Initial Data
insert into app_state (key, value) values ('points', '0');
insert into app_state (key, value) values ('history', '{}');
