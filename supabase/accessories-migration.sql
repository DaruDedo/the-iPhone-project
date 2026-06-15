create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists category_id uuid references public.product_categories(id) on delete restrict,
  add column if not exists default_iphone_model_id uuid references public.iphone_models(id) on delete set null,
  add column if not exists requires_model_fit boolean not null default true;

alter table public.product_categories enable row level security;

drop policy if exists "Public can read active product categories" on public.product_categories;
create policy "Public can read active product categories"
on public.product_categories for select
using (is_active = true);

drop policy if exists "Admins manage product categories" on public.product_categories;
create policy "Admins manage product categories"
on public.product_categories for all
using (public.is_admin())
with check (public.is_admin());

insert into public.product_categories (slug, title, description, sort_order, is_active)
values
  ('covers-cases', 'Covers & Cases', 'Everyday iPhone protection, style, and MagSafe-ready cases.', 1, true),
  ('tempered-glass', 'Tempered Glass', 'Screen protectors, privacy glass, and edge-to-edge protection.', 2, true),
  ('camera-protection', 'Camera Protection', 'Lens protectors and camera guards for iPhone.', 3, true),
  ('magsafe-wallets', 'MagSafe Wallets', 'Snap-on wallets made for MagSafe cases and iPhone.', 4, true),
  ('accessories', 'Accessories', 'Chargers, cables, stands, grips, and everyday iPhone add-ons.', 5, true)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

update public.products p
set
  category_id = (select id from public.product_categories where slug = 'covers-cases'),
  requires_model_fit = true,
  default_iphone_model_id = (
    select id
    from public.iphone_models
    where slug = case p.slug
      when 'cosmic-orange-frosted-air' then 'iphone-17-pro'
      when 'sky-blue-frosted-air' then 'iphone-17'
      when 'lavender-frosted-air' then 'iphone-air'
      when 'blush-pink-frosted-air' then 'iphone-17'
      when 'space-black-frosted-air' then 'iphone-16-pro-max'
      when 'arctic-clear-frosted-air' then 'iphone-16-pro'
      when 'mist-purple-frosted-air' then 'iphone-15-pro'
      when 'rose-crystal-frosted-air' then 'iphone-15'
      else 'iphone-17'
    end
  )
where p.category_id is null;
