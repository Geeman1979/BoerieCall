-- BoerieCall Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This creates all tables needed for the BoerieCall e-commerce app.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
create table users (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null unique,
  password text not null,
  phone text,
  address text,
  city text default 'Other',
  role text default 'BUYER' check (role in ('BUYER', 'RESELLER', 'ADMIN')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
create table products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  description text,
  category text not null check (category in ('COLD_SMOKED', 'HOT_SMOKED', 'BILTONG', 'ACCESSORIES')),
  subcategory text,
  cost_price numeric(10,2) not null default 0,
  markup_percent numeric(5,2) default 0,
  markup_amount numeric(10,2) default 0,
  selling_price numeric(10,2) not null default 0,
  weight numeric(5,2) default 0,
  stock_quantity integer default 0,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- CART ITEMS TABLE
-- =============================================
create table cart_items (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references users(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, product_id)
);

-- =============================================
-- ORDERS TABLE
-- =============================================
create table orders (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references users(id) on delete cascade,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) default 0,
  delivery_fee numeric(10,2) default 0,
  total_amount numeric(10,2) not null default 0,
  status text default 'PENDING' check (status in ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')),
  delivery_address text not null,
  city text not null,
  total_weight numeric(5,2) default 0,
  payment_method text default 'STITCH',
  stitch_payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
create table order_items (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  product_name text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  weight numeric(5,2) default 0,
  created_at timestamptz default now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
create index idx_products_category on products(category);
create index idx_products_active on products(is_active);
create index idx_cart_items_user on cart_items(user_id);
create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_order_items_order on order_items(order_id);
create index idx_users_email on users(email);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Disable RLS for simplicity with service role key
-- For production, enable RLS and create policies
-- =============================================
alter table users enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Allow service role to do everything (used by API routes)
create policy "Service role full access" on users for all using (true) with check (true);
create policy "Service role full access" on products for all using (true) with check (true);
create policy "Service role full access" on cart_items for all using (true) with check (true);
create policy "Service role full access" on orders for all using (true) with check (true);
create policy "Service role full access" on order_items for all using (true) with check (true);

-- Allow anon key to read active products (for storefront)
create policy "Public read active products" on products for select using (is_active = true);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at before update on users for each row execute procedure update_updated_at_column();
create trigger update_products_updated_at before update on products for each row execute procedure update_updated_at_column();
create trigger update_cart_items_updated_at before update on cart_items for each row execute procedure update_updated_at_column();
create trigger update_orders_updated_at before update on orders for each row execute procedure update_updated_at_column();
