# Supabase 設定

このプロジェクトでは、以下の Supabase リソースが必要です。

## 1. Receipts 用（既存のレシートアプリ用）

- `receipts` テーブル
- `receipt_items` テーブル
- `receipt-images` ストレージバケット

既存の `supabase/migrations/001_receipts.sql` を実行してください。

## 2. Card Manager 用（Next.js 名刺管理用）

- `cards` テーブル
- `business-card-images` ストレージバケット

以下の SQL を `supabase/migrations/002_cards.sql` で実行してください。

```sql
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
```

## 3. Environment Variables

Vercel では以下の値を登録します。

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` はこのアプリの API Route で使用されます。公開しないようにしてください。

## 4. セキュリティ

- `business-card-images` バケットは公開 URL を返します。
- 画像を非公開にする場合は、公開バケットではなく署名付きURLの仕組みへ変更してください。
