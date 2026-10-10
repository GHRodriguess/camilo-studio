# Gemini Guidelines — Camilo Studio

Este documento serve como **índice executivo e guia mestre de instruções** para o desenvolvimento e manutenção do projeto **Camilo Studio**, tanto para assistentes de IA (como o Gemini) quanto para desenvolvedores humanos.

Para especificações detalhadas, consulte sempre a pasta [`docs/`](docs/) e o [`README.md`](README.md).

---

## 1. Visão Geral do Projeto

O **Camilo Studio** é uma plataforma dedicada de gestão para ateliês de beleza e estética de alto padrão, combinando sofisticação editorial com eficiência operacional.

- **Design de Referência (Stitch):** [Stitch Project 7569087254048681171](https://stitch.withgoogle.com/projects/7569087254048681171)
- **Tema Visual:** *Violet Luminary* (Inter + Geist, tons de violeta elétrico `#7C3AED` e ametista profundo).
- **Modelo de Negócio:** Aplicação Single-tenant dedicada à operação do Camilo Studio.

---

## 2. Estrutura do Repositório (Monorepo)

O projeto é estruturado em duas camadas principais:

```text
camilo-studio/
├── backend/                  # API REST em Python & Django REST Framework
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/                 # Next.js 16 (App Router, TypeScript, Tailwind)
│   ├── app/
│   │   ├── globals.css       # Única fonte de verdade para tokens de design
│   │   └── ...
│   ├── components/           # Atomic Design (atoms, molecules, organisms, templates)
│   ├── package.json
│   └── ...
├── docs/                     # Documentação detalhada e aprofundada
│   ├── design-system.md      # Tokens de cor, tipografia, elevação e shapes (Stitch)
│   ├── frontend.md           # Regras de Atomic Design, linting e boas práticas
│   ├── backend.md            # Arquitetura DRF, modelos de dados e APIs
│   ├── git-workflow.md       # Conventional Commits em português e branching
│   └── modulos.md            # Regras de negócio e fluxos de telas do sistema
├── .gitignore                # Regras de exclusão Git (Python, Node, macOS, envs)
├── README.md                 # Guia de setup rápido e execução
└── gemini.md                 # Este arquivo (guia executivo de IA)
```

---

## 3. Diretrizes Invioláveis

### 3.1. Commits e Merge Requests
- **Padrão:** Conventional Commits **em português**: `tipo(escopo): descrição` no presente do indicativo, com meta de 72 caracteres.
- **Tipos no CHANGELOG:** `pivot`, `feat`, `fix`, `perf`, `refactor`.
- **Tipos fora do CHANGELOG:** `docs`, `test`, `chore`, `ci`, `build`, `style`, `revert`.
- **Escopos sempre no plural:** `agendamentos`, `clientes`, `servicos`, `equipe`, `formulas`, `whatsapp`, `financeiro`, `ui`, `infra`, `auth`, `configuracoes`.
- **Regra de ouro visual:** **Mudou o que o usuário vê na interface, é `feat` ou `fix`** (mesmo removendo ou renomeando). `refactor` é estritamente reservado para quando o comportamento observável não sofre alteração.

### 3.2. Regras de Frontend (Cobrança em Lint)
- **Atomic Design:**
  - `components/atoms`: Componentes puros sem estado de negócio (botões, inputs, chips).
  - `components/molecules`: Combinações de átomos (campo de busca com ícone, item de lista).
  - `components/organisms`: Blocos completos de tela (tabela de agendamentos, card de cliente).
  - `components/templates`: Casca e layout de páginas.
  - **Fluxo:** Qualquer componente novo nasce como átomo ou molécula e entra na vitrine da página inicial/showcase. Organismos grandes são construídos em conjunto com a tela demandante, nunca isoladamente antes.
- **Design Tokens:**
  - Toda cor, sombra, raio de borda (`border-radius`) e tipografia deve residir exclusivamente em `frontend/app/globals.css`.
  - Cores ou valores hardcoded em classes CSS/Tailwind quebram a validação do `npm run lint` (`lint:tokens`).
- **Tema:**
  - Claro por padrão, escuro por classe no elemento `<html>`. Todo componente deve funcionar e ter contraste validado em ambos os modos.
- **Estados Obrigatórios de Listas:**
  - Toda listagem deve prever e tratar 3 estados: **vazio** (`empty`), **busca sem resultado** (`empty search`) e **carregando** (`loading`).
- **Interações e Botões:**
  - Apenas **um botão primário por folha/tela**.
  - Ícone/botão de lixeira deve ser neutro em repouso e vermelho apenas no `:hover`.

### 3.3. Regras de Backend
- **Python / Django REST Framework:**
  - Gestão com `venv` padrão e `requirements.txt`.
  - Banco de dados inicial: SQLite para desenvolvimento ágil local.
  - Serializers e ViewSets desacoplados e tipados.
  - Arquitetura de notificações preparada para envio direto via `wa.me` no frontend e registro de log/mensageria assíncrona no backend.
  - **Envio de E-mail:** Configuração via SMTP do Django com remetente e credenciais mantidas exclusivamente em variáveis de ambiente no `.env`.
  - **Fluxo de Usuários & Senhas:** Conta admin inicial criada via script/comando; criação de novos usuários com senha aleatória segura enviada por e-mail; redefinição de senha obrigatória no 1º login; páginas dedicadas para troca forçada e "Esqueci minha senha".

### 3.4. Regras Operacionais para o Agente de IA
- **Proibido criar arquivos de setup na mão:**
  - Para criar o projeto Django ou novos apps, execute sempre os comandos oficiais (`django-admin startproject`, `python manage.py startapp`).
  - Para adicionar componentes/moléculas de interface, execute sempre o CLI do shadcn (`npx shadcn@latest add <componente>`) e depois adapte os tokens aos de `globals.css`.
  - Nunca invente ou crie arquivos de configuração desnecessários. Prefira sempre comandos canônicos e ferramentas oficiais.
- **Consulta Obrigatória ao Obsidian em caso de dúvidas:**
  - Sempre que surgirem dúvidas sobre requisitos funcionais, regras de negócio, fluxos de telas ou campos de formulários, o agente deve **obrigatoriamente consultar os arquivos de requisitos no cofre do Obsidian**:
    `/Users/gabrielrodrigues/Library/Mobile Documents/com~apple~CloudDocs/GABRIEL RODRIGUES/Obsidian/Projetos/Camilo Studio/Requisitos/`
  - A pasta `Requisitos/` reside exclusivamente no Obsidian (nunca deve ser copiada para a pasta do código). O agente tem permissão de leitura sobre esse cofre para tirar dúvidas e conferir especificações detalhadas de cada tela.

---

## 4. Onde encontrar mais detalhes

| Assunto | Arquivo de Destino |
| :--- | :--- |
| Requisitos detalhados de cada tela e regras de negócio | `Obsidian/Projetos/Camilo Studio/Requisitos/` |
| Cores exatas, tipografia Inter/Geist e tokens Violet Luminary | [`docs/design-system.md`](docs/design-system.md) |
| Atomic design, estrutura Next.js e regras de lint | [`docs/frontend.md`](docs/frontend.md) |
| Estrutura Django, modelos e endpoints REST | [`docs/backend.md`](docs/backend.md) |
| Convenção de commits, changelog e exemplos práticos | [`docs/git-workflow.md`](docs/git-workflow.md) |
| Fluxos funcionais das telas (Agenda, Clientes, Fórmulas) | [`docs/modulos.md`](docs/modulos.md) |
