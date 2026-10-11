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
    let errorDetail = 'Erro na requisição';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.error || JSON.stringify(errorJson);
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
    fetchApi<{ message: string; dev_token?: string }>('/auth/esqueci-senha/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  confirmarRedefinicaoSenha: (data: { email: string; token: string; nova_senha: string; confirmacao_senha: string }) =>
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

  criarAcessoProfissional: (id: number, email: string, perfil: 'admin' | 'profissional' = 'profissional') =>
    fetchApi<{ message: string; email: string; senha_temp?: string }>(`/profissionais/${id}/criar-acesso/`, {
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

  // Configurações
  getConfiguracoes: () => fetchApi<ConfiguracaoAtelie>('/configuracoes/'),

  updateConfiguracoes: (data: Partial<ConfiguracaoAtelie>) =>
    fetchApi<ConfiguracaoAtelie>('/configuracoes/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
