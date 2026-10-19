const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface User {
  id: number;
  email: string;
  nome: string;
  perfil: 'admin' | 'profissional';
  telefone?: string;
  deve_redefinir_senha: boolean;
  is_staff: boolean;
  is_active: boolean;
}

export interface Servico {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  duracao_minutos: number;
  preco: string | number;
  ativo: boolean;
}

export interface Profissional {
  id: number;
  nome: string;
  cargo: string;
  cor_hex: string;
  foto_url?: string;
  servicos?: number[];
  servicos_detalhes?: Servico[];
  ativo: boolean;
  usuario?: number | null;
  email_usuario?: string | null;
  possui_acesso?: boolean;
  usuario_ativo?: boolean;
  total_historico?: number;
}

export interface FormulaQuimica {
  id: number;
  cliente: number;
  nome_cliente?: string;
  profissional?: number;
  profissional_detalhes?: Profissional;
  data_aplicacao: string;
  procedimento: string;
  formula_texto: string;
  volumagem_ox: string;
  tempo_pausa_minutos: number;
  fundo_clareamento?: string;
  observacoes?: string;
  foto_resultado_url?: string;
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  data_nascimento?: string;
  signo?: string;
  foto_url?: string;
  tags?: string;
  observacoes_alergias?: string;
  preferencias_sensoriais?: string;
  total_investido: string | number;
  visitas_realizadas: number;
  ultima_visita?: string;
  formulas?: FormulaQuimica[];
}

export interface Agendamento {
  id: number;
  cliente: number;
  cliente_detalhes?: Cliente;
  profissional?: number | null;
  profissional_detalhes?: Profissional | null;
  servicos: number[];
  servicos_detalhes?: Servico[];
  data_hora_inicio: string;
  data_hora_fim: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado';
  status_display?: string;
  valor_total: string | number;
  observacoes?: string;
}

export interface ConfiguracaoAtelie {
  id: number;
  nome_atelie: string;
  slogan: string;
  telefone: string;
  email: string;
  endereco: string;
  horario_funcionamento: string;
  template_confirmacao: string;
  template_lembrete: string;
  politica_cancelamento: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('camilo_token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('camilo_token', token);
  } else {
    localStorage.removeItem('camilo_token');
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('camilo_user');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('camilo_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('camilo_user');
  }
}

/**
 * Extrai de forma limpa e amigável as mensagens de erro retornadas pela API (Django REST Framework),
 * evitando exibir JSON bruto como {"non_field_errors": ["..."]} na interface.
 */
export function extractApiErrorMessage(errorData: unknown): string {
  if (!errorData) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  if (typeof errorData === 'string') {
    // Se a string contiver JSON serializado, tenta decodificar para extrair o texto amigável
    const trimmed = errorData.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractApiErrorMessage(parsed);
      } catch {
        return errorData;
      }
    }
    return errorData;
  }

  if (Array.isArray(errorData)) {
    const messages = errorData
      .map((item) => extractApiErrorMessage(item))
      .filter((msg) => Boolean(msg && msg.trim()));
    return messages.join('\n');
  }

  if (typeof errorData === 'object') {
    const obj = errorData as Record<string, unknown>;

    // 1. Mensagens diretas comuns
    if (typeof obj.detail === 'string' && obj.detail.trim()) {
      return obj.detail;
    }
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message;
    }
    if (typeof obj.error === 'string' && obj.error.trim()) {
      return obj.error;
    }

    // 2. Erros globais do DRF (non_field_errors)
    if (obj.non_field_errors) {
      const nonFieldMsg = extractApiErrorMessage(obj.non_field_errors);
      if (nonFieldMsg) return nonFieldMsg;
    }

    // 3. Erros por campo (ex: email, password, etc.)
    const messages: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
      if (key === 'detail' || key === 'message' || key === 'error' || key === 'non_field_errors') {
        continue;
      }
      const fieldMsg = extractApiErrorMessage(val);
      if (fieldMsg) {
        messages.push(fieldMsg);
      }
    }

    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  return 'Ocorreu um erro na requisição. Tente novamente.';
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Erro na comunicação com o servidor. Tente novamente.';
    try {
      const text = await response.text();
      try {
        const errorJson = JSON.parse(text);
        errorDetail = extractApiErrorMessage(errorJson);
      } catch {
        if (text && text.trim().length > 0 && text.length < 300 && !text.includes('<!DOCTYPE')) {
          errorDetail = text.trim();
        }
      }
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetchApi<{ token: string; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setToken(res.token);
    setStoredUser(res.user);
    return res;
  },

  logout: async () => {
    try {
      await fetchApi('/auth/logout/', { method: 'POST' });
    } finally {
      setToken(null);
      setStoredUser(null);
    }
  },

  getMe: () => fetchApi<User>('/auth/me/'),

  redefinirSenhaPrimeiroAcesso: async (data: { nova_senha: string; confirmacao_senha: string }) => {
    const res = await fetchApi<{ message: string; token: string; user: User }>('/auth/redefinir-senha/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(res.token);
    setStoredUser(res.user);
    return res;
  },

  esqueciSenha: (email: string) =>
    fetchApi<{ message: string }>('/auth/esqueci-senha/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  confirmarRedefinicaoSenha: (data: { email: string; codigo?: string; token?: string; nova_senha: string; confirmacao_senha: string }) =>
    fetchApi<{ message: string; token: string; user: User }>('/auth/confirmar-redefinicao/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Agendamentos
  getAgendamentos: (params?: string) =>
    fetchApi<{ count: number; results: Agendamento[] } | Agendamento[]>(`/agendamentos/${params ? `?${params}` : ''}`),

  getAgendamento: (id: number) => fetchApi<Agendamento>(`/agendamentos/${id}/`),

  createAgendamento: (data: Partial<Agendamento>) =>
    fetchApi<Agendamento>('/agendamentos/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAgendamento: (id: number, data: Partial<Agendamento>) =>
    fetchApi<Agendamento>(`/agendamentos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAgendamento: (id: number) =>
    fetchApi(`/agendamentos/${id}/`, {
      method: 'DELETE',
    }),

  gerarLinkWhatsapp: (id: number) =>
    fetchApi<{
      agendamento_id: number;
      cliente: string;
      telefone: string;
      telefone_link: string;
      mensagem: string;
      link_whatsapp: string;
      notificacao_id: number;
    }>(`/agendamentos/${id}/gerar-whatsapp/`),

  confirmarWhatsapp: (id: number) =>
    fetchApi<{ message: string; agendamento: Agendamento }>(`/agendamentos/${id}/confirmar-whatsapp/`, {
      method: 'POST',
    }),

  // Clientes
  getClientes: (search?: string) =>
    fetchApi<{ count: number; results: Cliente[] } | Cliente[]>(
      `/clientes/${search ? `?search=${encodeURIComponent(search)}` : ''}`
    ),

  getCliente: (id: number) => fetchApi<Cliente>(`/clientes/${id}/`),

  createCliente: (data: Partial<Cliente>) =>
    fetchApi<Cliente>('/clientes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCliente: (id: number, data: Partial<Cliente>) =>
    fetchApi<Cliente>(`/clientes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCliente: (id: number) =>
    fetchApi(`/clientes/${id}/`, {
      method: 'DELETE',
    }),

  // Serviços
  getServicos: () => fetchApi<{ count: number; results: Servico[] } | Servico[]>('/servicos/'),

  createServico: (data: Partial<Servico>) =>
    fetchApi<Servico>('/servicos/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateServico: (id: number, data: Partial<Servico>) =>
    fetchApi<Servico>(`/servicos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteServico: (id: number) =>
    fetchApi(`/servicos/${id}/`, {
      method: 'DELETE',
    }),

  // Equipe
  getEquipe: () => fetchApi<{ count: number; results: Profissional[] } | Profissional[]>('/profissionais/'),

  createProfissional: (data: Partial<Profissional>) =>
    fetchApi<Profissional>('/profissionais/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProfissional: (id: number, data: Partial<Profissional>) =>
    fetchApi<Profissional>(`/profissionais/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProfissional: (id: number) =>
    fetchApi<{ message: string; soft_deleted: boolean; profissional?: Profissional }>(`/profissionais/${id}/`, {
      method: 'DELETE',
    }),

  toggleAtivoProfissional: (id: number, ativo?: boolean) =>
    fetchApi<{ message: string; profissional: Profissional }>(`/profissionais/${id}/toggle-ativo/`, {
      method: 'POST',
      body: JSON.stringify(ativo !== undefined ? { ativo } : {}),
    }),

  resetarSenhaProfissional: (id: number) =>
    fetchApi<{ message: string; profissional: Profissional }>(`/profissionais/${id}/resetar-senha/`, {
      method: 'POST',
    }),

  criarAcessoProfissional: (id: number, email: string, perfil: 'admin' | 'profissional' = 'profissional') =>
    fetchApi<{ message: string; email: string; profissional: Profissional }>(`/profissionais/${id}/criar-acesso/`, {
      method: 'POST',
      body: JSON.stringify({ email, perfil }),
    }),

  // Fórmulas
  getFormulas: (clienteId?: number) =>
    fetchApi<{ count: number; results: FormulaQuimica[] } | FormulaQuimica[]>(
      `/formulas/${clienteId ? `?cliente=${clienteId}` : ''}`
    ),

  createFormula: (data: Partial<FormulaQuimica>) =>
    fetchApi<FormulaQuimica>('/formulas/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFormula: (id: number, data: Partial<FormulaQuimica>) =>
    fetchApi<FormulaQuimica>(`/formulas/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteFormula: (id: number) =>
    fetchApi(`/formulas/${id}/`, {
      method: 'DELETE',
    }),

  // Configurações
  getConfiguracoes: () => fetchApi<ConfiguracaoAtelie>('/configuracoes/'),

  updateConfiguracoes: (data: Partial<ConfiguracaoAtelie>) =>
    fetchApi<ConfiguracaoAtelie>('/configuracoes/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
