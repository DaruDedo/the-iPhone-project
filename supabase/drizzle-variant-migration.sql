create extension if not exists pgcrypto;

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

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  iphone_model_id uuid references public.iphone_models(id) on delete set null,
  sku text not null unique,
  title text,
  variant_label text,
  price integer not null check (price >= 0),
  mrp integer not null check (mrp >= price),
  stock integer not null default 0 check (stock >= 0),
  is_available boolean not null default true,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, iphone_model_id, variant_label)
);

alter table public.product_images
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null;

alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null;

create index if not exists products_category_idx on public.products(category_id);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_variants_model_idx on public.product_variants(iphone_model_id);
create index if not exists product_variants_available_idx on public.product_variants(is_available, sort_order);
create index if not exists order_items_variant_idx on public.order_items(variant_id);

alter table public.product_categories enable row level security;
alter table public.product_variants enable row level security;

drop policy if exists "Public can read active product categories" on public.product_categories;
create policy "Public can read active product categories"
on public.product_categories for select
using (is_active = true);

drop policy if exists "Admins manage product categories" on public.product_categories;
create policy "Admins manage product categories"
on public.product_categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read available product variants" on public.product_variants;
create policy "Public can read available product variants"
on public.product_variants for select
using (
  is_available = true
  and exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
);

drop policy if exists "Admins manage product variants" on public.product_variants;
create policy "Admins manage product variants"
on public.product_variants for all
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

insert into public.collections (slug, title, description, sort_order, is_active)
values
  ('frosted-air', 'Frosted Air', 'Translucent. Featherlight. 22g.', 1, true),
  ('privacy-glass', 'Privacy Glass', 'Tempered screen protection with side-view privacy.', 5, true),
  ('lens-guard', 'Lens Guard', 'Camera lens protection for everyday scratches.', 6, true),
  ('snap-wallet', 'Snap Wallet', 'MagSafe wallets for cards and everyday carry.', 7, true),
  ('daily-accessories', 'Daily Accessories', 'Chargers, cables, stands, and useful iPhone extras.', 8, true)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

update public.products p
set
  category_id = coalesce(p.category_id, (select id from public.product_categories where slug = 'covers-cases')),
  requires_model_fit = coalesce(p.requires_model_fit, true),
  default_iphone_model_id = coalesce(
    p.default_iphone_model_id,
    (
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
  );

insert into public.product_variants (
  product_id,
  iphone_model_id,
  sku,
  title,
  variant_label,
  price,
  mrp,
  stock,
  is_available,
  is_default,
  sort_order
)
select
  p.id,
  inventory.iphone_model_id,
  inventory.sku,
  p.name || ' for ' || model.name,
  model.name,
  p.price,
  p.mrp,
  inventory.stock,
  inventory.is_available,
  inventory.iphone_model_id = p.default_iphone_model_id,
  model.sort_order
from public.product_model_inventory inventory
join public.products p on p.id = inventory.product_id
join public.iphone_models model on model.id = inventory.iphone_model_id
on conflict (sku) do update set
  title = excluded.title,
  variant_label = excluded.variant_label,
  price = excluded.price,
  mrp = excluded.mrp,
  stock = excluded.stock,
  is_available = excluded.is_available,
  is_default = excluded.is_default,
  sort_order = excluded.sort_order,
  updated_at = now();

update public.product_variants variant
set is_default = true
from public.products product
where variant.product_id = product.id
  and product.default_iphone_model_id is not null
  and variant.iphone_model_id = product.default_iphone_model_id;

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  city text not null,
  rating integer not null check (rating between 1 and 5),
  quote text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_id_idx
  on public.product_reviews(product_id);

create index if not exists product_reviews_is_approved_idx
  on public.product_reviews(is_approved);
