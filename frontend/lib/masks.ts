/**
 * Utilitários de máscara e validação para dados cadastrais do Camilo Studio.
 */

/**
 * Formata um número de telefone com a máscara automática (xx) xxxxx-xxxx.
 * Conforme o usuário digita os números, insere automaticamente os parênteses, espaço e hífen.
 * Trata também backspace natural e colagem de números com ou sem +55.
 */
export function formatarTelefone(valor: string, valorAnterior?: string): string {
  // Se o usuário estiver apagando e acabou de deletar o espaço de ") " ou o hífen "-"
  if (valorAnterior && valor.length < valorAnterior.length) {
    if (valorAnterior.endsWith(') ') && valor === valorAnterior.slice(0, -1)) {
      const d = valor.replace(/\D/g, '');
      return d.length > 0 ? `(${d.slice(0, -1)}` : '';
    }
    if (valorAnterior.endsWith('-') && valor === valorAnterior.slice(0, -1)) {
      const d = valor.replace(/\D/g, '');
      return d.length > 0 ? formatarTelefone(d.slice(0, -1)) : '';
    }
  }

  let digits = valor.replace(/\D/g, '');

  // Remove código de país 55 se o usuário colou do WhatsApp (+55 11 9...)
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);

  if (!digits) return '';
  if (digits.length === 1) return `(${digits}`;
  if (digits.length === 2) return `(${digits}) `;
  if (digits.length < 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length === 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Valida se um número de telefone está completo e de acordo com o padrão brasileiro (xx) xxxxx-xxxx.
 */
export function validarTelefone(valor: string): { valido: boolean; mensagem?: string } {
  const digits = valor.replace(/\D/g, '');
  if (!digits) {
    return { valido: false, mensagem: 'O WhatsApp / Telefone é obrigatório.' };
  }
  if (digits.length < 10 || digits.length > 11) {
    return {
      valido: false,
      mensagem: 'Telefone incompleto. O formato exigido é (xx) xxxxx-xxxx com DDD e 9 dígitos.',
    };
  }
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) {
    return {
      valido: false,
      mensagem: 'DDD inválido. Informe um DDD brasileiro válido entre 11 e 99.',
    };
  }
  if (digits.length === 11 && digits[2] !== '9') {
    return {
      valido: false,
      mensagem: 'Celular inválido. Números com 11 dígitos devem começar com 9 após o DDD.',
    };
  }
  return { valido: true };
}
