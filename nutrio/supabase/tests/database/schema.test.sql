-- Testes do schema: isolamento entre usuários (RLS), integridade e funções.
-- Rodar com: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

-- Dois usuários de teste (o trigger cria os perfis).
insert into auth.users (id, email, raw_user_meta_data, aud, role) values
  ('11111111-1111-1111-1111-111111111111', 'ana@teste.dev', '{"name": "Ana", "timezone": "America/Manaus"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'bia@teste.dev', '{"name": "Bia"}', 'authenticated', 'authenticated');

select results_eq(
  $$ select name, timezone from public.profiles order by name $$,
  $$ values ('Ana'::text, 'America/Manaus'::text), ('Bia', 'America/Sao_Paulo') $$,
  'cadastro cria o perfil com nome e fuso dos metadados'
);

-- ---------------------------------------------------------------- usuária A
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

insert into public.foods (id, name, base, kcal, protein, carbs, fat, sodium)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Pão integral', 'g', 253, 11.3, 43.7, 3.6, null);

insert into public.food_portions (food_id, name, amount)
values ('aaaaaaaa-0000-0000-0000-000000000001', '1 fatia', 25);

select isnt(
  (select public.add_meal_item('2026-10-21', 'Almoço', 'aaaaaaaa-0000-0000-0000-000000000001', 50, '1 fatia', 2, 25)),
  null,
  'registrar alimento cria a refeição pelo nome'
);

select results_eq(
  $$ select food_name, kcal, sodium is null, amount from public.meal_items $$,
  $$ values ('Pão integral'::text, 253::numeric, true, 50::numeric) $$,
  'o item guarda o snapshot do alimento (nulo continua nulo)'
);

update public.foods set kcal = 999, name = 'Pão novo' where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select results_eq(
  $$ select food_name, kcal from public.meal_items $$,
  $$ values ('Pão integral'::text, 253::numeric) $$,
  'editar o alimento não altera registros antigos'
);

select throws_ok(
  $$ delete from public.foods where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '23503', null,
  'alimento já registrado não pode ser excluído'
);

select throws_ok(
  $$ insert into public.foods (name, base, kcal) values ('Inválido', 'g', -1) $$,
  '23514', null,
  'nutriente negativo é rejeitado'
);

-- Ordem das refeições no dia.
select public.create_meal('2026-10-21', 'Jantar');
select public.create_meal('2026-10-21', 'Café da manhã', '07:30');
select public.create_meal('2026-10-21', 'Pré-treino');
select results_eq(
  $$ select name from public.meals where date = '2026-10-21' order by position $$,
  $$ values ('Café da manhã'::text), ('Almoço'), ('Jantar'), ('Pré-treino') $$,
  'nova refeição entra na posição natural do dia; nome livre vai para o fim'
);

select public.move_meal((select id from public.meals where name = 'Pré-treino'), 'up');
select results_eq(
  $$ select name from public.meals where date = '2026-10-21' order by position $$,
  $$ values ('Café da manhã'::text), ('Almoço'), ('Pré-treino'), ('Jantar') $$,
  'mover para cima troca com a vizinha'
);

select public.duplicate_meal((select id from public.meals where name = 'Almoço'), '2026-10-22');
select results_eq(
  $$ select m.name, count(i.id) from public.meals m
       left join public.meal_items i on i.meal_id = m.id
      where m.date = '2026-10-22' group by m.name $$,
  $$ values ('Almoço'::text, 1::bigint) $$,
  'duplicar copia a refeição e os itens para a outra data'
);

-- Metas por data de início.
select results_eq(
  $$ select replaced from public.save_goal_version('2026-10-01', '{"kcal": {"value": 2100, "kind": "target"}}') $$,
  $$ values (false) $$,
  'primeira versão é criada'
);
select results_eq(
  $$ select replaced from public.save_goal_version('2026-10-01', '{"kcal": {"value": 2000, "kind": "target"}, "sodium": {"value": 2000, "kind": "limit"}}') $$,
  $$ values (true) $$,
  'mesma data de início substitui a versão'
);
select is((select count(*) from public.goal_versions), 1::bigint, 'continua uma versão só');
select is((select count(*) from public.goal_targets), 2::bigint, 'metas da versão foram trocadas');
select throws_ok(
  $$ select * from public.save_goal_version('2026-10-22', '{"kcal": {"value": 0, "kind": "target"}}') $$,
  '23514', null,
  'meta deve ser maior que zero'
);

-- ---------------------------------------------------------------- usuária B
set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is((select count(*) from public.profiles), 1::bigint, 'B só enxerga o próprio perfil');
select is((select count(*) from public.foods), 0::bigint, 'B não enxerga alimentos de A');
select is((select count(*) from public.food_portions), 0::bigint, 'B não enxerga porções de A');
select is((select count(*) from public.meals), 0::bigint, 'B não enxerga refeições de A');
select is((select count(*) from public.meal_items), 0::bigint, 'B não enxerga itens de A');
select is((select count(*) from public.goal_versions), 0::bigint, 'B não enxerga metas de A');

select is_empty(
  $$ update public.foods set name = 'hackeado' where id = 'aaaaaaaa-0000-0000-0000-000000000001' returning 1 $$,
  'B não consegue alterar alimento de A pelo id'
);

select throws_ok(
  $$ insert into public.foods (user_id, name, base) values ('11111111-1111-1111-1111-111111111111', 'Plantado', 'g') $$,
  '42501', null,
  'B não consegue criar dados em nome de A'
);

select throws_ok(
  $$ select public.add_meal_item('2026-10-21', 'Almoço', 'aaaaaaaa-0000-0000-0000-000000000001', 100) $$,
  'P0002', null,
  'B não consegue registrar o alimento de A'
);

select public.create_meal('2026-10-21', 'Almoço');
select throws_ok(
  $$ insert into public.meal_items (meal_id, food_id, food_name, base, amount)
     values ((select id from public.meals limit 1), 'aaaaaaaa-0000-0000-0000-000000000001', 'x', 'g', 10) $$,
  '23503', null,
  'item não pode apontar para alimento de outro usuário'
);

select throws_ok(
  $$ select public.move_meal((select id from public.meals where name = 'Jantar' limit 1), 'up') $$,
  'P0002', null,
  'B não consegue reordenar refeição de A'
);

reset role;
select is(
  (select name from public.foods where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  'Pão novo',
  'o alimento de A continua intacto'
);

-- ---------------------------------------------------------------- anônimo
set local role anon;
select throws_ok($$ select * from public.foods $$, '42501', null, 'visitante sem login não acessa tabelas');
select throws_ok($$ select public.delete_account() $$, '42501', null, 'visitante sem login não chama funções');

-- ---------------------------------------------------------------- exclusão de conta
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select lives_ok($$ select public.delete_account() $$, 'A exclui a própria conta');

reset role;
select is(
  (select count(*) from public.foods where user_id = '11111111-1111-1111-1111-111111111111'),
  0::bigint,
  'alimentos de A foram removidos'
);
select is(
  (select count(*) from public.meal_items where user_id = '11111111-1111-1111-1111-111111111111'),
  0::bigint,
  'registros de A foram removidos'
);
select is(
  (select count(*) from public.goal_versions where user_id = '11111111-1111-1111-1111-111111111111'),
  0::bigint,
  'metas de A foram removidas'
);
select is((select count(*) from auth.users), 1::bigint, 'conta de B continua existindo');

select * from finish();
rollback;
