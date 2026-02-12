-- Diagrams table
create table diagrams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  category text default 'general',
  prompt text not null,
  mermaid_syntax text,
  excalidraw_json jsonb not null,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast user lookups
create index idx_diagrams_user_id on diagrams(user_id);
create index idx_diagrams_created_at on diagrams(created_at desc);

-- RLS policies
alter table diagrams enable row level security;

create policy "Users can view own diagrams"
  on diagrams for select using (auth.uid() = user_id);

create policy "Users can insert own diagrams"
  on diagrams for insert with check (auth.uid() = user_id);

create policy "Users can update own diagrams"
  on diagrams for update using (auth.uid() = user_id);

create policy "Users can delete own diagrams"
  on diagrams for delete using (auth.uid() = user_id);

-- Create storage bucket for diagram exports and AI images
insert into storage.buckets (id, name, public)
values ('diagrams', 'diagrams', true);

-- Storage policies
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'diagrams'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view diagram images"
  on storage.objects for select
  using (bucket_id = 'diagrams');

create policy "Users can delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'diagrams'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
