import type {
  User,
  Servico,
  Profissional,
  Cliente,
  FormulaQuimica,
  Agendamento,
  ConfiguracaoAtelie,
} from './types';
import { extractApiErrorMessage } from './errors';

export * from './types';
export { extractApiErrorMessage } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
  getAgendamentos: (params?: string | import('./types').AgendamentoQueryParams) => {
    let query = '';
    if (typeof params === 'string') {
      query = params ? `?${params}` : '';
    } else if (params && typeof params === 'object') {
      const sp = new URLSearchParams();
      if (params.filtro) sp.set('filtro', params.filtro);
      if (params.search) sp.set('search', params.search);
      if (params.page) sp.set('page', String(params.page));
      if (params.page_size) sp.set('page_size', String(params.page_size));
      const qs = sp.toString();
      query = qs ? `?${qs}` : '';
    }
    return fetchApi<import('./types').PaginatedResponse<Agendamento>>(`/agendamentos/${query}`);
  },

  getAgendamento: (id: number) => fetchApi<Agendamento>(`/agendamentos/${id}/`),

  getConflitosAgendamento: (inicio: string, fim: string, excludeId?: number) =>
    fetchApi<Agendamento[]>(
      `/agendamentos/conflitos/?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}${
        excludeId ? `&exclude_id=${excludeId}` : ''
      }`
    ),

  getAgendamentosClienteNoDia: (clienteId: number, data: string, excludeId?: number) =>
    fetchApi<Agendamento[]>(
      `/agendamentos/cliente-dia/?cliente_id=${clienteId}&data=${encodeURIComponent(data)}${
        excludeId ? `&exclude_id=${excludeId}` : ''
      }`
    ),

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

  iniciarAgendamento: (id: number) =>
    fetchApi<Agendamento>(`/agendamentos/${id}/iniciar/`, {
      method: 'POST',
    }),

  concluirAgendamento: (id: number) =>
    fetchApi<Agendamento>(`/agendamentos/${id}/concluir/`, {
      method: 'POST',
    }),

  marcarNaoCompareceuAgendamento: (id: number) =>
    fetchApi<Agendamento>(`/agendamentos/${id}/nao-compareceu/`, {
      method: 'POST',
    }),

  cancelarAgendamento: (id: number) =>
    fetchApi<Agendamento>(`/agendamentos/${id}/cancelar/`, {
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
