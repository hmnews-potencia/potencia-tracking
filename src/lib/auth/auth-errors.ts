/**
 * Maps Supabase Auth error messages to user-friendly Portuguese messages.
 */
export function formatAuthError(errorMessage: string): string {
  if (errorMessage === 'Invalid login credentials') {
    return 'Credenciais inválidas';
  }

  if (errorMessage.includes('Email not confirmed')) {
    return 'Email não confirmado. Verifique sua caixa de entrada.';
  }

  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('Failed to fetch')
  ) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  return 'Erro de conexão. Tente novamente.';
}
