create extension if not exists "pgcrypto";

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  company text,
  title text,
  email text,
  phone text,
  website text,
  notes text,
  image_url text,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-card-images',
  'business-card-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public reads are intentional for the business-card-images bucket.
create policy "Public business card images are readable"
  on storage.objects for select
  using (bucket_id = 'business-card-images');
