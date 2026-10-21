function parseErrorObject(obj: Record<string, unknown>): string | null {
  if (typeof obj.detail === 'string' && obj.detail.trim()) return obj.detail;
  if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
  if (typeof obj.error === 'string' && obj.error.trim()) return obj.error;
  if (obj.non_field_errors) {
    const msg = extractApiErrorMessage(obj.non_field_errors);
    if (msg) return msg;
  }
  const msgs: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (!['detail', 'message', 'error', 'non_field_errors'].includes(key)) {
      const fieldMsg = extractApiErrorMessage(val);
      if (fieldMsg) msgs.push(fieldMsg);
    }
  }
  return msgs.length > 0 ? msgs.join('\n') : null;
}

export function extractApiErrorMessage(errorData: unknown): string {
  if (!errorData) return 'Ocorreu um erro inesperado. Tente novamente.';
  if (typeof errorData === 'string') {
    const trimmed = errorData.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return extractApiErrorMessage(JSON.parse(trimmed));
      } catch {
        return errorData;
      }
    }
    return errorData;
  }
  if (Array.isArray(errorData)) {
    return errorData.map(extractApiErrorMessage).filter(Boolean).join('\n');
  }
  if (typeof errorData === 'object') {
    const res = parseErrorObject(errorData as Record<string, unknown>);
    if (res) return res;
  }
  return 'Ocorreu um erro na requisição. Tente novamente.';
}
