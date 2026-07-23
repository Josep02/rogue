-- Guardado ATOMICO de un entreno (sesion + series + notas) en una transaccion.
--
-- Problema que resuelve: el cliente hacia 3 peticiones HTTP sueltas
-- (upsert sesion -> delete series -> insert series -> upsert notas). Si la red
-- se cortaba a mitad quedaba la sesion SIN series, y como el reintento borra
-- antes de insertar, un fallo entre medias podia dejarlo vacio de forma
-- permanente. Ocurrio de verdad el 23/07/2026 (sesion "Empuje" con 0 series).
--
-- Al ser una funcion, el cuerpo entero corre en UNA transaccion: o entra todo
-- o no entra nada. Sigue siendo idempotente (upsert por id generado en
-- cliente + delete/insert de series), asi que un reintento no duplica.
--
-- security invoker (por defecto): corre como el usuario que llama, de modo que
-- las politicas RLS se siguen aplicando con normalidad y user_id sale de
-- auth.uid() -- nunca de un parametro que el cliente pudiera falsear.

create or replace function log_workout(
  p_session_id   uuid,
  p_day_label    text,
  p_date         timestamptz,
  p_duration_sec int,
  p_sets         jsonb default '[]'::jsonb,
  p_notes        jsonb default '[]'::jsonb
) returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into workout_sessions (id, user_id, day_label, date, duration_sec)
  values (p_session_id, v_user, p_day_label, p_date, p_duration_sec)
  on conflict (id) do update
    set day_label    = excluded.day_label,
        date         = excluded.date,
        duration_sec = excluded.duration_sec;

  -- Reemplazo completo de las series de esta sesion (idempotente).
  delete from workout_sets where session_id = p_session_id;

  insert into workout_sets (session_id, exercise_id, categoria, weight_kg, reps, position)
  select p_session_id,
         s->>'exercise_id',
         s->>'categoria',
         (s->>'weight_kg')::numeric,
         (s->>'reps')::int,
         (s->>'position')::int
  from jsonb_array_elements(coalesce(p_sets, '[]'::jsonb)) as s;

  -- Notas: upsert por el id generado en cliente.
  insert into exercise_notes (
    id, user_id, session_id, exercise_id, flag, note, weight_kg, acknowledged, created_at
  )
  select (n->>'id')::uuid,
         v_user,
         p_session_id,
         n->>'exercise_id',
         nullif(n->>'flag', ''),
         nullif(n->>'note', ''),
         nullif(n->>'weight_kg', '')::numeric,
         coalesce((n->>'acknowledged')::boolean, false),
         coalesce((n->>'created_at')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_notes, '[]'::jsonb)) as n
  on conflict (id) do update
    set flag         = excluded.flag,
        note         = excluded.note,
        weight_kg    = excluded.weight_kg,
        acknowledged = excluded.acknowledged;
end;
$$;

grant execute on function log_workout(uuid, text, timestamptz, int, jsonb, jsonb)
  to authenticated;
