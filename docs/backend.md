# Diretrizes de Backend — Studio Marilia Camilo

Este documento estabelece as diretrizes de desenvolvimento, arquitetura e convenções da API do **Studio Marilia Camilo** em `backend/`.

---

## 1. Stack e Ambiente

- **Linguagem:** Python 3.11+
- **Framework:** Django 5.x & Django REST Framework (DRF)
- **Gerenciador de Dependências:** `venv` padrão com `requirements.txt`
- **Banco de Dados:** SQLite para o ciclo inicial de desenvolvimento local (configurado com caminho relativo para portabilidade)
- **Envio de E-mail (SMTP):** Configuração nativa do Django (`EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'`), com credenciais e remetente extraídos estritamente de variáveis de ambiente no `.env`
- **CORS & Segurança:** `django-cors-headers` configurado para comunicação com o frontend Next.js

### 1.1. Regra de Criação de Arquivos e Apps
> [!IMPORTANT]
> **Use sempre os comandos oficiais da CLI:** Nunca crie a estrutura de projeto ou de apps manualmente criando pastas e arquivos do zero.
> - Inicializar o projeto: `django-admin startproject camilo_core .`
> - Criar um novo app: `python manage.py startapp <nome_do_app> apps/<nome_do_app>`

---

## 2. Estrutura de Módulos (Django Apps)

O backend segue o princípio de separação por responsabilidades de negócio do ateliê:

```text
backend/
├── manage.py
├── requirements.txt
├── camilo_core/              # Configurações do projeto (settings, urls, wsgi)
└── apps/
    ├── clientes/             # Cadastro, perfil de preferências e histórico
    ├── servicos/             # Catálogo de serviços, durações e preços
    ├── agendamentos/         # Agenda, controle de slots e status de atendimento
    ├── formulas/             # Ficha técnica capilar e histórico de procedimentos químicos
    ├── equipe/               # Profissionais, cadeiras de atendimento e escalas
    └── notificacoes/         # Logs de WhatsApp e templates de confirmação
```

---

## 3. Principais Modelos de Dados

### 3.1. `usuarios` (Auth & Acessos)
- Modelo customizado de usuário ou extensão com `perfil` (`admin` ou `profissional`).
- Campos: `email` (identificador único de login), `nome`, `deve_redefinir_senha` (booleano, `True` ao ser criado com senha aleatória), `is_staff`, `is_active`.
- **Criação de Conta Admin:** Script de inicialização / management command (`python manage.py setup_admin`) para criar a conta inicial de administrador.
- **Criação de Contas pelo Admin:** O Admin cadastra membros da equipe; o backend gera uma senha aleatória segura, salva com hash, define `deve_redefinir_senha = True` e envia o e-mail de boas-vindas com a senha temporária e o link de primeiro login.
- **Redefinição de Senha:** Suporte nativo com geração de token de uso único por e-mail para o fluxo de "Esqueci minha senha" e endpoint dedicado para troca forçada no primeiro acesso.

### 3.2. `clientes`
- `nome`, `telefone` (normalizado com DDD), `email`, `data_nascimento`, `observacoes_alergias`, `criado_em`.

### 3.2. `servicos`
- `nome`, `descricao`, `categoria` (Corte, Mechas, Tratamento, Penteado, etc.), `duracao_minutos`, `preco`, `ativo`.

### 3.3. `agendamentos`
- `cliente` (FK Clientes), `profissional` (FK Equipe), `servicos` (ManyToMany Serviços), `data_hora_inicio`, `data_hora_fim`, `status` (`agendado`, `confirmado_whatsapp`, `em_atendimento`, `concluido`, `cancelado`), `observacoes`.

### 3.4. `formulas`
- `cliente` (FK Clientes), `data_aplicacao`, `procedimento` (ex: Mechas Globais, Tonalização), `formula_texto` (proporções, gramaturas), `volumagem_ox`, `tempo_pausa_minutos`, `fotos` (evidências e resultados), `profissional` (FK Equipe).

### 3.5. `notificacoes`
- `agendamento` (FK Agendamentos), `tipo` (`confirmacao`, `lembrete_24h`, `comprovante`), `mensagem_gerada`, `link_whatsapp`, `status_envio` (`gerado`, `enviado`, `falha`), `criado_em`.

---

## 4. Integração com WhatsApp

1. **Geração de Deep Link:** O backend expõe endpoints para gerar e retornar o payload da mensagem pré-formatada e o link `https://wa.me/55.../?text=...`.
2. **Registro de Log:** Cada solicitação de envio registra um registro em `notificacoes` para rastreamento de confirmações pendentes e histórico de contato com o cliente.
3. **Evolução Futura:** A camada de serviço de notificação deve ser encapsulada em um padrão de *Adapter*, permitindo plugar futuramente uma API automatizada (como Evolution API ou Meta Cloud API) sem alterar a interface consumida pelo frontend.

---

## 5. Convenções de Código e Boas Práticas

- **Serializers:** Utilizar `ModelSerializer` com declaração explícita de `fields`, evitando `fields = '__all__'`.
- **ViewSets:** Preferir `ModelViewSet` e `ReadOnlyModelViewSet` com filtros nativos (`django-filter`).
- **Respostas:** Manter paginação consistente (`PageNumberPagination` com metadados de total, página atual e itens).
- **Datas e Horários:** Todas as datas devem ser tratadas em UTC no backend e convertidas para o fuso local (`America/Sao_Paulo`) na serialização/frontend.

---

## 6. Validações Estruturais e Testes Obrigatórios

O backend possui uma suíte de testes de AST (`apps/usuarios/test_code_structure.py`) e um comando dedicado (`check_structure`):

- **Verificação Rápida:** `python manage.py check_structure` (executa a análise de integridade em ~0.05s).
- **Suíte Completa:** `python manage.py test` (inclui os testes estruturais e testes de integração/regras de negócio).
- **Regras Imutáveis:**
  - Máximo de 300 linhas por arquivo `.py`. Sem exceções.
  - Máximo de 50 linhas por função ou método. Sem exceções.
  - Máximo de 6 parâmetros por função.
  - Proibição de `print()` solto nas apps de negócio (usar `logging`).
  - Nomenclatura em `snake_case.py`.
