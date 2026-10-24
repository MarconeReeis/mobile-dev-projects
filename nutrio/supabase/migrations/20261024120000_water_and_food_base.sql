-- Água (registros e meta diária) e quantidade de referência livre nos alimentos.

-- ---------------------------------------------------------------------------
-- Alimentos: valores informados por uma quantidade qualquer (ex.: 35 g).
-- As colunas de nutrientes continuam por 100 g/ml (é o que os cálculos usam);
-- base_amount só lembra em que quantidade o usuário informou, para editar e exibir.
-- ---------------------------------------------------------------------------

alter table public.foods
  add column base_amount numeric not null default 100 check (base_amount > 0);

-- ---------------------------------------------------------------------------
-- Meta de água por versão de metas (sempre "meta a atingir", em ml).
-- ---------------------------------------------------------------------------

alter table public.goal_versions
  add column water_ml numeric check (water_ml > 0);

-- ---------------------------------------------------------------------------
-- Registros de água
-- ---------------------------------------------------------------------------

create table public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  -- Horário local; nulo quando registrado depois, para outro dia.
  time time,
  -- Limite alto só para pegar erros de digitação (ex.: 25000 em vez de 250).
  ml numeric not null check (ml > 0 and ml <= 5000),
  created_at timestamptz not null default now()
);

create index water_entries_user_date_idx on public.water_entries (user_id, date, created_at);

alter table public.water_entries enable row level security;

create policy "dono: acesso total" on public.water_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.water_entries from anon;

-- ---------------------------------------------------------------------------
-- save_goal_version passa a receber a meta de água. Uma versão pode ter só água.
-- ---------------------------------------------------------------------------

drop function public.save_goal_version(date, jsonb);

create function public.save_goal_version(p_start_date date, p_goals jsonb, p_water_ml numeric default null)
returns table (version_id uuid, replaced boolean)
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_id uuid;
  v_replaced boolean;
  v_goals jsonb := coalesce(p_goals, '{}'::jsonb);
begin
  if jsonb_typeof(v_goals) <> 'object' then
    raise exception 'metas inválidas' using errcode = '22023';
  end if;
  if v_goals = '{}'::jsonb and p_water_ml is null then
    raise exception 'defina ao menos uma meta' using errcode = '22023';
  end if;

  select id into v_id from public.goal_versions where user_id = auth.uid() and start_date = p_start_date;
  v_replaced := found;

  if v_replaced then
    delete from public.goal_targets where goal_targets.version_id = v_id;
    update public.goal_versions set water_ml = p_water_ml, updated_at = now() where id = v_id;
  else
    insert into public.goal_versions (start_date, water_ml) values (p_start_date, p_water_ml) returning id into v_id;
  end if;

  insert into public.goal_targets (version_id, nutrient, value, kind)
  select v_id, g.key::public.nutrient_key, (g.value ->> 'value')::numeric, (g.value ->> 'kind')::public.goal_kind
    from jsonb_each(v_goals) as g;

  return query select v_id, v_replaced;
end;
$$;

revoke execute on function public.save_goal_version(date, jsonb, numeric) from public, anon;
grant execute on function public.save_goal_version(date, jsonb, numeric) to authenticated;
