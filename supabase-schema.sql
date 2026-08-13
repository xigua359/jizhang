-- 在 Supabase 项目 SQL Editor 中执行一次。
create table if not exists public.ledger_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ledger_data enable row level security;

drop policy if exists "Users can read their own ledger" on public.ledger_data;
create policy "Users can read their own ledger" on public.ledger_data for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own ledger" on public.ledger_data;
create policy "Users can insert their own ledger" on public.ledger_data for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own ledger" on public.ledger_data;
create policy "Users can update their own ledger" on public.ledger_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on table public.ledger_data to authenticated;
