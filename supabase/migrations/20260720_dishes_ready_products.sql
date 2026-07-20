-- Migracion: platos "listos" (productos preparados escaneados). Un plato listo
-- no tiene ingredientes enlazables a la despensa, asi que guarda sus propias
-- macros por 100 g y la lista de ingredientes (informativa). Aditiva: no borra
-- ni cambia datos existentes. Pegar y ejecutar en el SQL Editor de Supabase.
alter table pantry_dishes
  add column if not exists protein numeric not null default 0,
  add column if not exists carbs numeric not null default 0,
  add column if not exists fat numeric not null default 0,
  add column if not exists ingredients jsonb not null default '[]';
