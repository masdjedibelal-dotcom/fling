-- Fling · Storage Buckets + RLS Policies

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'verification-docs',
    'verification-docs',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'profile-photos',
    'profile-photos',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- verification-docs: nur eigener Ordner
create policy "verification_docs_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "verification_docs_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "verification_docs_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- profile-photos: Upload + Lesen eigener Fotos; andere sehen sie via signierte URLs
create policy "profile_photos_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile_photos_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile_photos_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile_photos_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Signierte URLs für Schaufenster: authenticated Nutzer dürfen Profilfotos lesen
create policy "profile_photos_select_authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'profile-photos');

-- Hilfs-RPC: signierte URL für ein Foto (1h gültig)
create or replace function public.get_photo_signed_url(p_path text)
returns text language plpgsql security definer set search_path = public, storage as $$
declare
  signed_url text;
begin
  if p_path is null or p_path = '' then
    return null;
  end if;
  -- Client-seitig bevorzugt: supabase.storage.from('profile-photos').createSignedUrl()
  -- Dieser Stub dokumentiert den Pfad; echte URLs generiert die App.
  return p_path;
end;
$$;

grant execute on function public.get_photo_signed_url(text) to authenticated;
