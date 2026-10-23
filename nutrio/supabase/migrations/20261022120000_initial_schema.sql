-- Nutrio — schema inicial.
--
-- Princípios:
-- * Todo dado pessoal tem `user_id` e RLS restrita ao dono (auth.uid()).
-- * Chaves estrangeiras compostas (id, user_id) impedem que um registro aponte para
--   dados de outro usuário, mesmo que alguém altere ids na requisição.
-- * Nutrientes são colunas numéricas: NULL = não informado; 0 = informado como zero.
-- * Itens de refeição guardam uma cópia (snapshot) do alimento no momento do registro.
-- * Datas do diário são `date` locais (sem fuso); o fuso do usuário fica no perfil.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.food_base as enum ('g', 'ml');
create type public.goal_kind as enum ('target', 'limit');
create type public.activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very-active');
create type public.objective as enum ('maintain', 'lose', 'gain', 'track');
create type public.nutrient_key as enum (
  'kcal', 'protein', 'carbs', 'fat', 'sat_fat', 'trans_fat', 'fiber',
  'sugar', 'added_sugar', 'sodium', 'calcium', 'iron', 'potassium', 'vit_c'
);

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------

-- Funções internas ficam fora do schema public, que o Supabase expõe pela API.
create schema private;
grant usage on schema private to authenticated;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Ordem sugerida das refeições no dia (espelha DEFAULT_MEAL_NAMES do app).
-- Nomes livres ficam depois de todos.
create function private.meal_rank(meal_name text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    array_position(
      array['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'],
      meal_name
    ) - 1,
    1000
  );
$$;

-- ---------------------------------------------------------------------------
-- Perfil
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 80),
  birth_date date check (birth_date >= date '1900-01-01'),
  weight_kg numeric(5, 1) check (weight_kg between 20 and 400),
  height_cm numeric(5, 1) check (height_cm between 50 and 260),
  activity_level public.activity_level,
  objective public.objective,
  timezone text not null default 'America/Sao_Paulo' check (char_length(timezone) between 1 and 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o perfil junto com a conta. Nome e fuso podem vir dos metadados do cadastro.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, name, timezone)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'name', ''), 80),
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'America/Sao_Paulo')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Alimentos e porções
-- ---------------------------------------------------------------------------

create table public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  brand text check (char_length(brand) <= 60),
  category text check (char_length(category) <= 40),
  base public.food_base not null,
  -- Valores por 100 g ou 100 ml. NULL = não informado.
  kcal numeric check (kcal >= 0),
  protein numeric check (protein >= 0),
  carbs numeric check (carbs >= 0),
  fat numeric check (fat >= 0),
  sat_fat numeric check (sat_fat >= 0),
  trans_fat numeric check (trans_fat >= 0),
  fiber numeric check (fiber >= 0),
  sugar numeric check (sugar >= 0),
  added_sugar numeric check (added_sugar >= 0),
  sodium numeric check (sodium >= 0),
  calcium numeric check (calcium >= 0),
  iron numeric check (iron >= 0),
  potassium numeric check (potassium >= 0),
  vit_c numeric check (vit_c >= 0),
  favorite boolean not null default false,
  archived boolean not null default false,
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index foods_user_name_idx on public.foods (user_id, name);

create trigger foods_updated_at before update on public.foods
  for each row execute function public.set_updated_at();

create table public.food_portions (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null,
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  -- Equivalência em g ou ml, conforme a base do alimento.
  amount numeric not null check (amount > 0),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  foreign key (food_id, user_id) references public.foods (id, user_id) on delete cascade
);

create index food_portions_food_idx on public.food_portions (food_id, position);

-- ---------------------------------------------------------------------------
-- Metas (versões por data de início)
-- ---------------------------------------------------------------------------

create table public.goal_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  start_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, start_date),
  unique (id, user_id)
);

create trigger goal_versions_updated_at before update on public.goal_versions
  for each row execute function public.set_updated_at();

create table public.goal_targets (
  version_id uuid not null,
  user_id uuid not null default auth.uid(),
  nutrient public.nutrient_key not null,
  value numeric not null check (value > 0),
  kind public.goal_kind not null,
  primary key (version_id, nutrient),
  foreign key (version_id, user_id) references public.goal_versions (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Refeições e itens
-- ---------------------------------------------------------------------------

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  time time,
  notes text check (char_length(notes) <= 500),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index meals_user_date_idx on public.meals (user_id, date, position);

create trigger meals_updated_at before update on public.meals
  for each row execute function public.set_updated_at();

create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null,
  user_id uuid not null default auth.uid(),
  -- Sem ON DELETE: um alimento já registrado não pode ser excluído (só arquivado).
  -- Por isso delete_account() apaga os itens antes da conta.
  food_id uuid not null,
  -- Cópia do alimento no momento do registro.
  food_name text not null,
  food_brand text,
  base public.food_base not null,
  kcal numeric check (kcal >= 0),
  protein numeric check (protein >= 0),
  carbs numeric check (carbs >= 0),
  fat numeric check (fat >= 0),
  sat_fat numeric check (sat_fat >= 0),
  trans_fat numeric check (trans_fat >= 0),
  fiber numeric check (fiber >= 0),
  sugar numeric check (sugar >= 0),
  added_sugar numeric check (added_sugar >= 0),
  sodium numeric check (sodium >= 0),
  calcium numeric check (calcium >= 0),
  iron numeric check (iron >= 0),
  potassium numeric check (potassium >= 0),
  vit_c numeric check (vit_c >= 0),
  -- Quantidade final em g ou ml.
  amount numeric not null check (amount > 0),
  -- Porção usada (com a equivalência vigente no registro), ou tudo nulo.
  portion_name text,
  portion_count numeric check (portion_count > 0),
  portion_amount numeric check (portion_amount > 0),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (portion_name is null and portion_count is null and portion_amount is null)
    or (portion_name is not null and portion_count is not null and portion_amount is not null)
  ),
  foreign key (meal_id, user_id) references public.meals (id, user_id) on delete cascade,
  foreign key (food_id, user_id) references public.foods (id, user_id)
);

create index meal_items_meal_idx on public.meal_items (meal_id, position);
create index meal_items_food_idx on public.meal_items (user_id, food_id);

create trigger meal_items_updated_at before update on public.meal_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: cada usuário só enxerga e altera os próprios dados.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.foods enable row level security;
alter table public.food_portions enable row level security;
alter table public.goal_versions enable row level security;
alter table public.goal_targets enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;

-- Perfil: criado pelo trigger e removido com a conta; o usuário só lê e atualiza.
create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "perfil: atualizar o próprio" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Demais tabelas: acesso total às próprias linhas.
do $$
declare
  t text;
begin
  foreach t in array array['foods', 'food_portions', 'goal_versions', 'goal_targets', 'meals', 'meal_items']
  loop
    execute format(
      'create policy "dono: acesso total" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t
    );
  end loop;
end;
$$;

-- Visitantes não autenticados não acessam nada.
revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------------------------
-- Funções (RPC). SECURITY INVOKER: rodam com as permissões e a RLS do usuário.
-- ---------------------------------------------------------------------------

-- Insere uma refeição na posição natural do dia (pela ordem sugerida dos nomes)
-- e empurra as seguintes. Uso interno das demais funções.
create function private.insert_meal(p_date date, p_name text, p_time time, p_notes text)
returns public.meals
language plpgsql
set search_path = ''
as $$
declare
  v_position integer;
  v_meal public.meals;
begin
  -- Depois da última refeição que vem antes no dia; nomes livres (rank 1000) vão para o fim.
  select coalesce(max(m.position) filter (where private.meal_rank(m.name) <= private.meal_rank(btrim(p_name))), -1) + 1
    into v_position
    from public.meals m
   where m.user_id = auth.uid() and m.date = p_date;

  update public.meals
     set position = position + 1
   where user_id = auth.uid() and date = p_date and position >= v_position;

  insert into public.meals (date, name, time, notes, position)
  values (p_date, btrim(p_name), p_time, nullif(btrim(p_notes), ''), v_position)
  returning * into v_meal;

  return v_meal;
end;
$$;

create function public.create_meal(p_date date, p_name text, p_time time default null, p_notes text default null)
returns public.meals
language sql
set search_path = ''
as $$
  select * from private.insert_meal(p_date, p_name, p_time, p_notes);
$$;

-- Troca a refeição de lugar com a vizinha no mesmo dia.
create function public.move_meal(p_meal_id uuid, p_direction text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_meal public.meals;
  v_other public.meals;
begin
  if p_direction not in ('up', 'down') then
    raise exception 'direção inválida: %', p_direction using errcode = '22023';
  end if;

  select * into v_meal from public.meals where id = p_meal_id;
  if not found then
    raise exception 'refeição não encontrada' using errcode = 'P0002';
  end if;

  select * into v_other
    from public.meals
   where user_id = v_meal.user_id and date = v_meal.date
     and case when p_direction = 'up' then position < v_meal.position else position > v_meal.position end
   order by case when p_direction = 'up' then -position else position end
   limit 1;

  if found then
    update public.meals set position = v_other.position where id = v_meal.id;
    update public.meals set position = v_meal.position where id = v_other.id;
  end if;
end;
$$;

-- Copia a refeição e os itens (mesmos snapshots) para outra data.
create function public.duplicate_meal(p_meal_id uuid, p_target_date date)
returns public.meals
language plpgsql
set search_path = ''
as $$
declare
  v_source public.meals;
  v_copy public.meals;
begin
  select * into v_source from public.meals where id = p_meal_id;
  if not found then
    raise exception 'refeição não encontrada' using errcode = 'P0002';
  end if;

  v_copy := private.insert_meal(p_target_date, v_source.name, v_source.time, v_source.notes);

  insert into public.meal_items (
    meal_id, food_id, food_name, food_brand, base,
    kcal, protein, carbs, fat, sat_fat, trans_fat, fiber, sugar, added_sugar,
    sodium, calcium, iron, potassium, vit_c,
    amount, portion_name, portion_count, portion_amount, position
  )
  select v_copy.id, food_id, food_name, food_brand, base,
         kcal, protein, carbs, fat, sat_fat, trans_fat, fiber, sugar, added_sugar,
         sodium, calcium, iron, potassium, vit_c,
         amount, portion_name, portion_count, portion_amount, position
    from public.meal_items
   where meal_id = v_source.id;

  return v_copy;
end;
$$;

-- Primeira refeição com o nome na data; cria se não existir.
create function private.find_or_create_meal(p_date date, p_name text)
returns public.meals
language plpgsql
set search_path = ''
as $$
declare
  v_meal public.meals;
begin
  select * into v_meal
    from public.meals
   where user_id = auth.uid() and date = p_date and name = btrim(p_name)
   order by position
   limit 1;
  if not found then
    v_meal := private.insert_meal(p_date, p_name, null, null);
  end if;
  return v_meal;
end;
$$;

-- Registra um alimento. O snapshot é copiado aqui, no servidor, a partir do cadastro atual.
create function public.add_meal_item(
  p_date date,
  p_meal_name text,
  p_food_id uuid,
  p_amount numeric,
  p_portion_name text default null,
  p_portion_count numeric default null,
  p_portion_amount numeric default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_meal public.meals;
  v_food public.foods;
  v_item_id uuid;
begin
  select * into v_food from public.foods where id = p_food_id;
  if not found then
    raise exception 'alimento não encontrado' using errcode = 'P0002';
  end if;

  v_meal := private.find_or_create_meal(p_date, p_meal_name);

  insert into public.meal_items (
    meal_id, food_id, food_name, food_brand, base,
    kcal, protein, carbs, fat, sat_fat, trans_fat, fiber, sugar, added_sugar,
    sodium, calcium, iron, potassium, vit_c,
    amount, portion_name, portion_count, portion_amount, position
  )
  values (
    v_meal.id, v_food.id, v_food.name, v_food.brand, v_food.base,
    v_food.kcal, v_food.protein, v_food.carbs, v_food.fat, v_food.sat_fat, v_food.trans_fat,
    v_food.fiber, v_food.sugar, v_food.added_sugar, v_food.sodium, v_food.calcium, v_food.iron,
    v_food.potassium, v_food.vit_c,
    p_amount, p_portion_name, p_portion_count, p_portion_amount,
    (select coalesce(max(position), -1) + 1 from public.meal_items where meal_id = v_meal.id)
  )
  returning id into v_item_id;

  return v_meal.id;
end;
$$;

-- Move um item para uma refeição existente (p_target_meal_id) ou para a refeição
-- com o nome na data (criada se preciso). Devolve o id da refeição de destino.
create function public.move_meal_item(
  p_item_id uuid,
  p_target_meal_id uuid default null,
  p_target_date date default null,
  p_target_meal_name text default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_target uuid;
begin
  if not exists (select 1 from public.meal_items where id = p_item_id) then
    raise exception 'item não encontrado' using errcode = 'P0002';
  end if;

  if p_target_meal_id is not null then
    if not exists (select 1 from public.meals where id = p_target_meal_id) then
      raise exception 'refeição não encontrada' using errcode = 'P0002';
    end if;
    v_target := p_target_meal_id;
  elsif p_target_date is not null and p_target_meal_name is not null then
    v_target := (private.find_or_create_meal(p_target_date, p_target_meal_name)).id;
  else
    raise exception 'destino não informado' using errcode = '22023';
  end if;

  update public.meal_items
     set meal_id = v_target,
         position = (select coalesce(max(position), -1) + 1 from public.meal_items where meal_id = v_target)
   where id = p_item_id and meal_id <> v_target;

  return v_target;
end;
$$;

-- Salva uma versão de metas. Mesma data de início substitui a versão existente;
-- as demais versões (e os dias anteriores) não mudam.
-- p_goals: {"kcal": {"value": 2000, "kind": "target"}, ...}
create function public.save_goal_version(p_start_date date, p_goals jsonb)
returns table (version_id uuid, replaced boolean)
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_id uuid;
  v_replaced boolean;
begin
  if p_goals is null or jsonb_typeof(p_goals) <> 'object' or p_goals = '{}'::jsonb then
    raise exception 'defina ao menos uma meta' using errcode = '22023';
  end if;

  select id into v_id from public.goal_versions where user_id = auth.uid() and start_date = p_start_date;
  v_replaced := found;

  if v_replaced then
    delete from public.goal_targets where goal_targets.version_id = v_id;
    update public.goal_versions set updated_at = now() where id = v_id;
  else
    insert into public.goal_versions (start_date) values (p_start_date) returning id into v_id;
  end if;

  insert into public.goal_targets (version_id, nutrient, value, kind)
  select v_id, g.key::public.nutrient_key, (g.value ->> 'value')::numeric, (g.value ->> 'kind')::public.goal_kind
    from jsonb_each(p_goals) as g;

  return query select v_id, v_replaced;
end;
$$;

-- Exclui a conta do usuário logado. O cascade remove perfil, alimentos, porções,
-- refeições, itens e metas. SECURITY DEFINER porque auth.users não é acessível ao usuário.
create function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticado' using errcode = '42501';
  end if;
  -- Itens primeiro: eles referenciam alimentos sem ON DELETE, e o cascade a partir de
  -- auth.users checaria essa referência antes de chegar aos itens.
  delete from public.meal_items where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

-- Funções só para usuários autenticados.
revoke execute on all functions in schema public from public, anon;
revoke execute on all functions in schema private from public, anon;
grant execute on function
  public.create_meal(date, text, time, text),
  public.move_meal(uuid, text),
  public.duplicate_meal(uuid, date),
  public.add_meal_item(date, text, uuid, numeric, text, numeric, numeric),
  public.move_meal_item(uuid, uuid, date, text),
  public.save_goal_version(date, jsonb),
  public.delete_account()
to authenticated;
-- Internas: chamadas pelas funções acima, que rodam como o próprio usuário (com RLS).
grant execute on function
  private.insert_meal(date, text, time, text),
  private.find_or_create_meal(date, text),
  private.meal_rank(text)
to authenticated;
