/** Mensagens do Supabase Auth em português, sem revelar se um e-mail tem conta. */
export function authErrorMessage(error: { message: string; code?: string }): string {
  const code = error.code ?? "";
  const msg = error.message.toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  }
  if (code === "user_already_exists" || msg.includes("already registered")) {
    return "Já existe uma conta com este e-mail. Entre ou recupere a senha.";
  }
  if (code === "weak_password" || msg.includes("password should be")) {
    return "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.";
  }
  if (code === "same_password") return "A nova senha precisa ser diferente da atual.";
  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    msg.includes("rate limit")
  ) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network"))
    return "Sem conexão com o servidor. Verifique sua internet.";
  return "Não foi possível concluir agora. Tente novamente.";
}
