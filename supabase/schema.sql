create extension if not exists vector with schema extensions;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  file_type text not null,
  status text not null default 'processing',
  chunk_count integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  filename text not null,
  content text not null,
  page_number integer,
  chunk_index integer not null,
  embedding extensions.vector(384) not null
);

create index if not exists document_chunks_user_idx
  on public.document_chunks(user_id);

create index if not exists document_chunks_embedding_hnsw
  on public.document_chunks
  using hnsw (embedding vector_cosine_ops);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages(conversation_id, created_at);

create or replace function public.match_document_chunks(
  query_embedding extensions.vector(384),
  match_user_id uuid,
  match_count int default 6
)
returns table (
  id bigint,
  document_id uuid,
  filename text,
  content text,
  page_number integer,
  chunk_index integer,
  similarity float
)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.filename,
    dc.content,
    dc.page_number,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.user_id = match_user_id
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "users manage own documents"
on public.documents for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own chunks"
on public.document_chunks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own conversations"
on public.conversations for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own messages"
on public.messages for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
