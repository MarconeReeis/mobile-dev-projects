-- Funções de trigger não devem ser chamáveis pela API (/rest/v1/rpc).
-- O Supabase concede EXECUTE ao papel `authenticated` por padrão; os triggers continuam
-- funcionando, porque a permissão de execução não é checada quando o trigger dispara.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- public.delete_account() continua executável por `authenticated` de propósito:
-- é SECURITY DEFINER para poder apagar de auth.users, mas só remove a conta de quem chama
-- (auth.uid()). O aviso "authenticated_security_definer_function_executable" é esperado.
comment on function public.delete_account() is
  'Exclui a conta do usuário logado (auth.uid()) e todos os seus dados. SECURITY DEFINER intencional.';
