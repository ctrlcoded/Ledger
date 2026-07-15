-- Run this AFTER pushing the Drizzle schema

-- 1. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_stat_statements";
create extension if not exists "pg_cron";

-- 2a. Default category seeding — ~12 rows per signup (see Backend_archi §3.3)
create or replace function fn_seed_default_categories(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into categories (user_id, name, icon, direction, is_system, sort_order)
  values
    (p_user, 'Salary',       'bank',      'credit', true, 0),
    (p_user, 'Dividends',    'bank',      'credit', true, 1),
    (p_user, 'Consulting',   'others',    'credit', true, 2),
    (p_user, 'Groceries',    'groceries', 'debit',  true, 3),
    (p_user, 'Dining',       'food',      'debit',  true, 4),
    (p_user, 'Transport',    'transport', 'debit',  true, 5),
    (p_user, 'Shopping',     'shopping',  'debit',  true, 6),
    (p_user, 'Utilities',    'utilities', 'debit',  true, 7),
    (p_user, 'Rent',         'home',      'debit',  true, 8),
    (p_user, 'Health',       'health',    'debit',  true, 9),
    (p_user, 'Entertainment','others',    'debit',  true, 10),
    (p_user, 'Other',        'tag',       null,     true, 11)
  on conflict (user_id, name) do nothing;
end $$;

-- 2b. Profiles Trigger
create or replace function fn_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  perform fn_seed_default_categories(new.id);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function fn_handle_new_user();

-- 3. Rollup Trigger
create or replace function fn_rollup_delta(
  p_user     uuid,
  p_day      date,
  p_currency char(3),
  p_credit   bigint,
  p_debit    bigint,
  p_count    int
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_credit = 0 and p_debit = 0 and p_count = 0 then
    return;
  end if;
 
  insert into daily_rollups as r (user_id, day, currency_code, credit_minor, debit_minor, txn_count)
  values (p_user, p_day, p_currency, p_credit, p_debit, p_count)
  on conflict (user_id, day, currency_code) do update
    set credit_minor = r.credit_minor + excluded.credit_minor,
        debit_minor  = r.debit_minor  + excluded.debit_minor,
        txn_count    = r.txn_count    + excluded.txn_count;
 
  insert into user_balances as b (user_id, currency_code, balance_minor)
  values (p_user, p_currency, p_credit - p_debit)
  on conflict (user_id, currency_code) do update
    set balance_minor = b.balance_minor + excluded.balance_minor,
        updated_at    = now();
end $$;

create or replace function trg_transactions_rollup()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- reverse the OLD row's contribution
  if tg_op in ('UPDATE', 'DELETE') and OLD.deleted_at is null then
    perform fn_rollup_delta(
      OLD.user_id, OLD.occurred_on, OLD.currency_code,
      case when OLD.direction = 'credit' then -OLD.amount_minor else 0 end,
      case when OLD.direction = 'debit'  then -OLD.amount_minor else 0 end,
      -1
    );
  end if;
 
  -- apply the NEW row's contribution
  if tg_op in ('INSERT', 'UPDATE') and NEW.deleted_at is null then
    perform fn_rollup_delta(
      NEW.user_id, NEW.occurred_on, NEW.currency_code,
      case when NEW.direction = 'credit' then NEW.amount_minor else 0 end,
      case when NEW.direction = 'debit'  then NEW.amount_minor else 0 end,
      1
    );
  end if;
 
  return null;
end $$;

drop trigger if exists transactions_rollup on transactions;
create trigger transactions_rollup
  after insert or update or delete on transactions
  for each row execute function trg_transactions_rollup();

-- 4. RLS Policies
alter table profiles        enable row level security;
alter table accounts        enable row level security;
alter table categories      enable row level security;
alter table transactions    enable row level security;
alter table daily_rollups   enable row level security;
alter table user_balances   enable row level security;
alter table recurring_rules enable row level security;
alter table subscriptions   enable row level security;
alter table audit_log       enable row level security;

-- Transactions RLS
create policy p_txn_select on transactions for select using ((select auth.uid()) = user_id);
create policy p_txn_insert on transactions for insert with check ((select auth.uid()) = user_id);
create policy p_txn_update on transactions for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Profiles RLS (a user sees and edits only their own profile row)
create policy p_profile_select on profiles for select using ((select auth.uid()) = id);
create policy p_profile_update on profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Categories RLS
create policy p_cat_select on categories for select using ((select auth.uid()) = user_id);
create policy p_cat_insert on categories for insert with check ((select auth.uid()) = user_id);
create policy p_cat_update on categories for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy p_cat_delete on categories for delete using ((select auth.uid()) = user_id);

-- Accounts RLS
create policy p_acct_select on accounts for select using ((select auth.uid()) = user_id);
create policy p_acct_insert on accounts for insert with check ((select auth.uid()) = user_id);
create policy p_acct_update on accounts for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy p_acct_delete on accounts for delete using ((select auth.uid()) = user_id);

-- Recurring rules RLS
create policy p_rec_select on recurring_rules for select using ((select auth.uid()) = user_id);
create policy p_rec_insert on recurring_rules for insert with check ((select auth.uid()) = user_id);
create policy p_rec_update on recurring_rules for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy p_rec_delete on recurring_rules for delete using ((select auth.uid()) = user_id);

-- Subscriptions RLS (read-only for users; writes come from the webhook handler)
create policy p_sub_select on subscriptions for select using ((select auth.uid()) = user_id);

-- Rollups RLS (Read-only for users)
create policy p_rollup_select on daily_rollups for select using ((select auth.uid()) = user_id);
create policy p_user_balances_select on user_balances for select using ((select auth.uid()) = user_id);

-- 5. pg_cron Audit Job
create table if not exists rollup_drift (
  id serial primary key,
  user_id uuid,
  day date,
  currency_code char(3),
  expected_net bigint,
  actual_net bigint,
  detected_at timestamptz
);

-- Nightly rollup integrity audit: recompute from source, compare, flag drift.
-- Run this from day one — a silently wrong balance is the worst bug in a money app.
select cron.schedule('rollup-audit', '0 2 * * *', $$
  insert into rollup_drift (user_id, day, currency_code, expected_net, actual_net, detected_at)
  select
    t.user_id, t.occurred_on, t.currency_code,
    sum(t.signed_minor) as expected_net,
    r.net_minor         as actual_net,
    now()
  from transactions t
  join daily_rollups r
    on r.user_id = t.user_id
   and r.day = t.occurred_on
   and r.currency_code = t.currency_code
  where t.deleted_at is null
    and t.occurred_on > current_date - interval '7 days'
  group by t.user_id, t.occurred_on, t.currency_code, r.net_minor
  having sum(t.signed_minor) <> r.net_minor;
$$);
