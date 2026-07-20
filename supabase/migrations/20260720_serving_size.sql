-- Migracion: tamaño de racion del producto (para pre-rellenar la cantidad al
-- registrar). 0 = desconocido (se usa 100 g por defecto). Aditiva, no borra
-- nada. Pegar y ejecutar en el SQL Editor de Supabase.
--
-- Nota: la columna "ingredients" (jsonb) pasa a guardar objetos
-- {name, grams?} en vez de solo strings; no requiere cambio de esquema porque
-- ya es jsonb, y el codigo lee ambos formatos (los datos viejos siguen valiendo).
alter table pantry_foods
  add column if not exists serving_g numeric not null default 0;
alter table pantry_dishes
  add column if not exists serving_g numeric not null default 0;
