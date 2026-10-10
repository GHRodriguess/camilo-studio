# Camilo Studio

> Sistema de gestão integrada para ateliês de beleza e estética de alto padrão, unindo sofisticação visual e controle operacional de agenda, clientes, equipe e fichas técnicas químicas.

Projetado sob a identidade visual **Violet Luminary** ([Stitch 7569087254048681171](https://stitch.withgoogle.com/projects/7569087254048681171)).

---

## 📚 Documentação do Projeto

- **Diretrizes para IA e Desenvolvedores:** [`gemini.md`](gemini.md)
- **Design System & Tokens:** [`docs/design-system.md`](docs/design-system.md)
- **Diretrizes de Frontend:** [`docs/frontend.md`](docs/frontend.md)
- **Diretrizes de Backend:** [`docs/backend.md`](docs/backend.md)
- **Padrões de Commit & Git:** [`docs/git-workflow.md`](docs/git-workflow.md)
- **Módulos & Telas:** [`docs/modulos.md`](docs/modulos.md)

---

## 🏗️ Estrutura do Monorepo

```text
camilo-studio/
├── backend/                  # API REST em Django REST Framework (Python 3.11+)
├── frontend/                 # Aplicação web em Next.js 16 (App Router, TypeScript)
├── docs/                     # Documentação modular e especificações
├── .gitignore                # Regras de exclusão Git
├── gemini.md                 # Guia executivo de IA e convenções
└── README.md                 # Este arquivo
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Backend (Django REST Framework)

```bash
cd backend

# Criar e ativar o ambiente virtual
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar migrações do banco de dados (SQLite)
python manage.py migrate

# Iniciar o servidor de desenvolvimento
python manage.py runserver
```

A API estará disponível em `http://127.0.0.1:8000/`.

---

### 2. Frontend (Next.js 16)

```bash
cd frontend

# Instalar dependências
npm install

# Validar linting e tokens de design
npm run lint

# Iniciar o servidor de desenvolvimento
npm run dev
```

A interface web estará disponível em `http://localhost:3000/`.

---

## 📝 Padrão de Commits

O projeto adota **Conventional Commits em português**:

```text
tipo(escopo): descrição
```

- **Tipos permitidos no CHANGELOG:** `pivot`, `feat`, `fix`, `perf`, `refactor`.
- **Tipos fora do CHANGELOG:** `docs`, `test`, `chore`, `ci`, `build`, `style`, `revert`.
- **Escopos (sempre no plural):** `agendamentos`, `clientes`, `servicos`, `equipe`, `formulas`, `whatsapp`, `financeiro`, `ui`, `infra`, `auth`, `configuracoes`.
- **Regra de ouro:** Mudou o que o usuário vê na interface? O commit é obrigatoriamente `feat` ou `fix`.

Consulte [`docs/git-workflow.md`](docs/git-workflow.md) para detalhes completos e exemplos.
