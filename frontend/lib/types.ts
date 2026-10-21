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
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'nao_compareceu';
  status_display?: string;
  indicador_temporal?: string;
  tempo_relativo_display?: string;
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

export interface PaginatedResponse<T> {
  count: number;
  total_pages?: number;
  page_size?: number;
  current_page?: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AgendamentoQueryParams {
  filtro?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
