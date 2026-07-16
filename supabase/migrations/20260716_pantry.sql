-- Migracion: despensa persistente (alimentos y platos propios del usuario).
-- Pegar y ejecutar en el SQL Editor del dashboard de Supabase.
-- (Mismo contenido que la seccion 8 de schema.sql.)

create table if not exists pantry_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  -- Macros por 100 g.
  kcal numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  is_favorite boolean not null default false,
  health_score text check (health_score in ('green', 'yellow', 'orange', 'red')),
  created_at timestamptz not null default now()
);

create table if not exists pantry_dishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  -- Kcal totales del plato (suma de sus ingredientes).
  kcal numeric not null default 0,
  -- Ingredientes ({alimentoId, quantityG}[]); solo se leen en bloque para
  -- pintar la despensa, por eso jsonb en vez de una tabla aparte.
  foods jsonb not null default '[]',
  is_favorite boolean not null default false,
  health_score text check (health_score in ('green', 'yellow', 'orange', 'red')),
  created_at timestamptz not null default now()
);

create index if not exists pantry_foods_user_idx on pantry_foods (user_id);
create index if not exists pantry_dishes_user_idx on pantry_dishes (user_id);

alter table pantry_foods enable row level security;
alter table pantry_dishes enable row level security;

create policy "el usuario gestiona sus alimentos" on pantry_foods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "el usuario gestiona sus platos" on pantry_dishes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
