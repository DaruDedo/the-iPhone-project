create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.iphone_models (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  generation integer not null,
  sort_order integer not null default 0,
  is_popular boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid references public.product_categories(id) on delete restrict,
  collection_id uuid not null references public.collections(id) on delete restrict,
  default_iphone_model_id uuid references public.iphone_models(id) on delete set null,
  requires_model_fit boolean not null default true,
  description text,
  price integer not null check (price >= 0),
  mrp integer not null check (mrp >= price),
  tag text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_features (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

create table if not exists public.product_model_inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  iphone_model_id uuid not null references public.iphone_models(id) on delete cascade,
  sku text not null unique,
  stock integer not null default 0 check (stock >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, iphone_model_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  pincode text not null,
  payment_method text not null check (payment_method in ('COD', 'UPI')),
  subtotal integer not null check (subtotal >= 0),
  shipping integer not null default 0 check (shipping >= 0),
  total integer not null check (total >= 0),
  status text not null default 'new' check (
    status in ('new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  iphone_model_id uuid references public.iphone_models(id) on delete set null,
  product_name text not null,
  model_name text not null,
  sku text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0)
);

create index if not exists products_collection_idx on public.products(collection_id);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_sort_idx on public.products(is_active, sort_order);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_variants_model_idx on public.product_variants(iphone_model_id);
create index if not exists product_variants_available_idx on public.product_variants(is_available, sort_order);
create index if not exists inventory_model_idx on public.product_model_inventory(iphone_model_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_variant_idx on public.order_items(variant_id);

alter table public.admin_users enable row level security;
alter table public.collections enable row level security;
alter table public.product_categories enable row level security;
alter table public.iphone_models enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_features enable row level security;
alter table public.product_model_inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read active collections" on public.collections;
create policy "Public can read active collections"
on public.collections for select
using (is_active = true);

drop policy if exists "Public can read active product categories" on public.product_categories;
create policy "Public can read active product categories"
on public.product_categories for select
using (is_active = true);

drop policy if exists "Public can read active iphone models" on public.iphone_models;
create policy "Public can read active iphone models"
on public.iphone_models for select
using (is_active = true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
using (is_active = true);

drop policy if exists "Public can read available product variants" on public.product_variants;
create policy "Public can read available product variants"
on public.product_variants for select
using (
  is_available = true
  and exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
);

drop policy if exists "Public can read images for active products" on public.product_images;
create policy "Public can read images for active products"
on public.product_images for select
using (exists (select 1 from public.products p where p.id = product_id and p.is_active = true));

drop policy if exists "Public can read features for active products" on public.product_features;
create policy "Public can read features for active products"
on public.product_features for select
using (exists (select 1 from public.products p where p.id = product_id and p.is_active = true));

drop policy if exists "Public can read available inventory" on public.product_model_inventory;
create policy "Public can read available inventory"
on public.product_model_inventory for select
using (
  is_available = true
  and exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
);

drop policy if exists "Admins manage admin users" on public.admin_users;
create policy "Admins manage admin users"
on public.admin_users for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections"
on public.collections for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage product categories" on public.product_categories;
create policy "Admins manage product categories"
on public.product_categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage iphone models" on public.iphone_models;
create policy "Admins manage iphone models"
on public.iphone_models for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage product variants" on public.product_variants;
create policy "Admins manage product variants"
on public.product_variants for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images"
on public.product_images for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage product features" on public.product_features;
create policy "Admins manage product features"
on public.product_features for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage inventory" on public.product_model_inventory;
create policy "Admins manage inventory"
on public.product_model_inventory for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders"
on public.orders for select
using (public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins read order items" on public.order_items;
create policy "Admins read order items"
on public.order_items for select
using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read product images bucket" on storage.objects;
create policy "Public can read product images bucket"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Admins manage product images bucket" on storage.objects;
create policy "Admins manage product images bucket"
on storage.objects for all
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

insert into public.collections (slug, title, description, sort_order, is_active)
values
  ('frosted-air', 'Frosted Air', 'Translucent. Featherlight. 22g.', 1, true),
  ('leather-edition', 'Leather Edition', 'Full-grain leather with MagSafe.', 2, true),
  ('clear-shield', 'Clear Shield', 'Crystal clear, anti-yellowing protection.', 3, true),
  ('studio-drops', 'Studio Editions', 'Limited drops by Indian artists.', 4, true)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

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

insert into public.iphone_models (slug, name, generation, sort_order, is_popular, is_active)
values
  ('iphone-17-pro-max', 'iPhone 17 Pro Max', 17, 1, true, true),
  ('iphone-17-pro', 'iPhone 17 Pro', 17, 2, true, true),
  ('iphone-17', 'iPhone 17', 17, 3, true, true),
  ('iphone-air', 'iPhone Air', 17, 4, false, true),
  ('iphone-16-pro-max', 'iPhone 16 Pro Max', 16, 5, true, true),
  ('iphone-16-pro', 'iPhone 16 Pro', 16, 6, true, true),
  ('iphone-16-plus', 'iPhone 16 Plus', 16, 7, false, true),
  ('iphone-16', 'iPhone 16', 16, 8, true, true),
  ('iphone-16e', 'iPhone 16e', 16, 9, false, true),
  ('iphone-15-pro-max', 'iPhone 15 Pro Max', 15, 10, false, true),
  ('iphone-15-pro', 'iPhone 15 Pro', 15, 11, false, true),
  ('iphone-15-plus', 'iPhone 15 Plus', 15, 12, false, true),
  ('iphone-15', 'iPhone 15', 15, 13, true, true),
  ('iphone-14-pro-max', 'iPhone 14 Pro Max', 14, 14, false, true),
  ('iphone-14-pro', 'iPhone 14 Pro', 14, 15, false, true),
  ('iphone-14-plus', 'iPhone 14 Plus', 14, 16, false, true),
  ('iphone-14', 'iPhone 14', 14, 17, false, true),
  ('iphone-13-pro-max', 'iPhone 13 Pro Max', 13, 18, false, true),
  ('iphone-13-pro', 'iPhone 13 Pro', 13, 19, false, true),
  ('iphone-13', 'iPhone 13', 13, 20, false, true),
  ('iphone-13-mini', 'iPhone 13 mini', 13, 21, false, true),
  ('iphone-12-pro-max', 'iPhone 12 Pro Max', 12, 22, false, true),
  ('iphone-12-pro', 'iPhone 12 Pro', 12, 23, false, true),
  ('iphone-12', 'iPhone 12', 12, 24, false, true),
  ('iphone-12-mini', 'iPhone 12 mini', 12, 25, false, true)
on conflict (slug) do update set
  name = excluded.name,
  generation = excluded.generation,
  sort_order = excluded.sort_order,
  is_popular = excluded.is_popular,
  is_active = excluded.is_active;

insert into public.products (
  slug,
  name,
  category_id,
  collection_id,
  default_iphone_model_id,
  requires_model_fit,
  description,
  price,
  mrp,
  tag,
  is_active,
  is_featured,
  sort_order
)
values
  (
    'cosmic-orange-frosted-air',
    'Cosmic Orange',
    (select id from public.product_categories where slug = 'covers-cases'),
    (select id from public.collections where slug = 'frosted-air'),
    (select id from public.iphone_models where slug = 'iphone-17-pro'),
    true,
    'A featherlight translucent case tuned to the orange iPhone finish, with reinforced corners and a clean MagSafe snap.',
    1499,
    1999,
    'Bestseller',
    true,
    true,
    1
  ),
  (
    'sky-blue-frosted-air',
    'Sky Blue',
    (select id from public.product_categories where slug = 'covers-cases'),
    (select id from public.collections where slug = 'frosted-air'),
    (select id from public.iphone_models where slug = 'iphone-17'),
    true,
    'Soft blue protection with a satin grip, clicky buttons, and exact cutouts for the newest iPhone line.',
    1299,
    1799,
    'New',
    true,
    true,
    2
  ),
  (
    'lavender-frosted-air',
    'Lavender',
    (select id from public.product_categories where slug = 'covers-cases'),
    (select id from public.collections where slug = 'frosted-air'),
    (select id from public.iphone_models where slug = 'iphone-air'),
    true,
    'A limited lavender finish made for slimmer phones, balancing everyday protection with a barely-there feel.',
    1399,
    1899,
    'Limited',
    true,
    true,
    3
  ),
  (
    'blush-pink-frosted-air',
    'Blush Pink',
    (select id from public.product_categories where slug = 'covers-cases'),
    (select id from public.collections where slug = 'frosted-air'),
    (select id from public.iphone_models where slug = 'iphone-17'),
    true,
    'Warm pink, clean edges, and all-day scratch protection for customers who want a softer iPhone look.',
    1299,
    1799,
    'Trending',
    true,
    true,
    4
  ),
  (
    'space-black-frosted-air',
    'Space Black',
    (select id from public.product_categories where slug = 'covers-cases'),
    (select id from public.collections where slug = 'frosted-air'),
    (select id from public.iphone_models where slug = 'iphone-16-pro-max'),
    true,
    'A smoked translucent finish with slim corner protection and a clean MagSafe snap.',
    1499,
    1999,
    'New',
    true,
    true,
    5
  ),
  (
    'arctic-clear-frosted-air',
    'Arctic Clear',
    (select id from public.product_categories where slug = 'covers-cases'),
    (select id from public.collections where slug = 'frosted-air'),
    (select id from public.iphone_models where slug = 'iphone-16-pro'),
    true,
    'A clean frosted clear case made for customers who want the iPhone finish to stay visible.',
    1199,
    1699,
    'Fresh',
    true,
    true,
    6
  ),
  (
    'mist-purple-frosted-air',
    'Mist Purple',
    (select id from public.product_categories where slug = 'covers-cases'),
    (select id from public.collections where slug = 'frosted-air'),
    (select id from public.iphone_models where slug = 'iphone-15-pro'),
    true,
    'A soft purple translucent cover with exact iPhone cutouts and pocket-friendly protection.',
    1299,
    1799,
    'Limited',
    true,
    true,
    7
  ),
  (
    'rose-crystal-frosted-air',
    'Rose Crystal',
    (select id from public.product_categories where slug = 'covers-cases'),
    (select id from public.collections where slug = 'frosted-air'),
    (select id from public.iphone_models where slug = 'iphone-15'),
    true,
    'A rose-tinted frosted case for a softer iPhone look with everyday scratch protection.',
    1199,
    1699,
    'Trending',
    true,
    true,
    8
  )
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  collection_id = excluded.collection_id,
  default_iphone_model_id = excluded.default_iphone_model_id,
  requires_model_fit = excluded.requires_model_fit,
  description = excluded.description,
  price = excluded.price,
  mrp = excluded.mrp,
  tag = excluded.tag,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order;

insert into public.product_images (product_id, url, alt, sort_order, is_primary)
select p.id, image.url, image.alt, 1, true
from public.products p
join (
  values
    ('cosmic-orange-frosted-air', 'https://theiphoneproject.co/seed/case-orange.jpg', 'Cosmic Orange iPhone cover'),
    ('sky-blue-frosted-air', 'https://theiphoneproject.co/seed/case-blue.jpg', 'Sky Blue iPhone cover'),
    ('lavender-frosted-air', 'https://theiphoneproject.co/seed/case-purple.jpg', 'Lavender iPhone cover'),
    ('blush-pink-frosted-air', 'https://theiphoneproject.co/seed/case-pink.jpg', 'Blush Pink iPhone cover'),
    ('space-black-frosted-air', 'https://theiphoneproject.co/seed/case-orange.jpg', 'Space Black iPhone cover'),
    ('arctic-clear-frosted-air', 'https://theiphoneproject.co/seed/case-blue.jpg', 'Arctic Clear iPhone cover'),
    ('mist-purple-frosted-air', 'https://theiphoneproject.co/seed/case-purple.jpg', 'Mist Purple iPhone cover'),
    ('rose-crystal-frosted-air', 'https://theiphoneproject.co/seed/case-pink.jpg', 'Rose Crystal iPhone cover')
) as image(slug, url, alt) on image.slug = p.slug
where not exists (
  select 1 from public.product_images existing where existing.product_id = p.id and existing.is_primary = true
);

insert into public.product_features (product_id, label, sort_order)
select p.id, feature.label, feature.sort_order
from public.products p
join (
  values
    ('cosmic-orange-frosted-air', '22g shell', 1),
    ('cosmic-orange-frosted-air', '3m drop tested', 2),
    ('cosmic-orange-frosted-air', 'MagSafe ready', 3),
    ('cosmic-orange-frosted-air', 'Raised camera lip', 4),
    ('sky-blue-frosted-air', 'Anti-slip rails', 1),
    ('sky-blue-frosted-air', 'MagSafe ready', 2),
    ('sky-blue-frosted-air', 'Soft microfiber rim', 3),
    ('sky-blue-frosted-air', '7-day returns', 4),
    ('lavender-frosted-air', 'Slim profile', 1),
    ('lavender-frosted-air', '3m drop tested', 2),
    ('lavender-frosted-air', 'Precision buttons', 3),
    ('lavender-frosted-air', 'COD available', 4),
    ('blush-pink-frosted-air', 'Scratch resistant', 1),
    ('blush-pink-frosted-air', 'Wireless charging', 2),
    ('blush-pink-frosted-air', 'Raised screen edge', 3),
    ('blush-pink-frosted-air', 'Free shipping', 4),
    ('space-black-frosted-air', 'Smoked finish', 1),
    ('space-black-frosted-air', 'MagSafe ready', 2),
    ('space-black-frosted-air', 'Raised lens lip', 3),
    ('space-black-frosted-air', 'Slim everyday grip', 4),
    ('arctic-clear-frosted-air', 'Frosted clear back', 1),
    ('arctic-clear-frosted-air', 'Wireless charging', 2),
    ('arctic-clear-frosted-air', 'Soft rails', 3),
    ('arctic-clear-frosted-air', '7-day returns', 4),
    ('mist-purple-frosted-air', 'Soft-touch finish', 1),
    ('mist-purple-frosted-air', '3m drop tested', 2),
    ('mist-purple-frosted-air', 'Camera lip', 3),
    ('mist-purple-frosted-air', 'COD available', 4),
    ('rose-crystal-frosted-air', 'Rose tint', 1),
    ('rose-crystal-frosted-air', 'Anti-scratch back', 2),
    ('rose-crystal-frosted-air', 'Raised screen edge', 3),
    ('rose-crystal-frosted-air', 'Free shipping', 4)
) as feature(slug, label, sort_order) on feature.slug = p.slug
where not exists (
  select 1 from public.product_features existing
  where existing.product_id = p.id and existing.label = feature.label
);

insert into public.product_model_inventory (product_id, iphone_model_id, sku, stock, is_available)
select
  p.id,
  m.id,
  upper(replace(p.slug, '-', '')) || '-' || upper(replace(m.slug, '-', '')),
  25,
  true
from public.products p
cross join public.iphone_models m
on conflict (product_id, iphone_model_id) do nothing;

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
