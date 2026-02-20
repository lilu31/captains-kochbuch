-- Schema for Captain's magisches Kombüsen-Kochbuch

-- Enable uuid extensions
create extension if not exists "uuid-ossp";

-- 1. Recipes Table
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade null,
  title text not null,
  ingredients jsonb not null,
  steps jsonb not null,
  image_url text,
  is_system_recipe boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Favorites Table
create table public.favorites (
  user_id uuid references auth.users(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, recipe_id)
);

-- Set Row Level Security (RLS) policies

-- Enable RLS
alter table public.recipes enable row level security;
alter table public.favorites enable row level security;

-- Recipes Policies
create policy "Public system recipes are viewable by everyone."
  on public.recipes for select
  using ( is_system_recipe = true );

create policy "Users can view their own recipes."
  on public.recipes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own recipes."
  on public.recipes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own recipes."
  on public.recipes for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own recipes."
  on public.recipes for delete
  using ( auth.uid() = user_id );

-- Favorites Policies
create policy "Users can view their own favorites."
  on public.favorites for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own favorites."
  on public.favorites for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own favorites."
  on public.favorites for delete
  using ( auth.uid() = user_id );
