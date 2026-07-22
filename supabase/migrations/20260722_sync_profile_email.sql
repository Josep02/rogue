-- Mantiene profiles.email sincronizado con auth.users.email.
--
-- profiles.email es una copia desnormalizada que solo se rellenaba en el alta
-- (trigger handle_new_user). Si el usuario cambiaba su email en Supabase Auth,
-- esta copia quedaba obsoleta y el login por username (que resuelve
-- username -> profiles.email -> signInWithPassword) dejaba de funcionar.
--
-- Este trigger propaga cualquier cambio de email de auth.users a profiles.

create or replace function sync_profile_email()
returns trigger as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
      set email = new.email,
          updated_at = now()
      where user_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute procedure sync_profile_email();

-- Backfill de filas ya desincronizadas (emails cambiados antes de esta
-- migracion). Idempotente: solo toca las que difieren.
update public.profiles p
  set email = u.email,
      updated_at = now()
  from auth.users u
  where u.id = p.user_id
    and p.email is distinct from u.email;
