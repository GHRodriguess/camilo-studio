# Módulos e Regras de Negócio — Camilo Studio

Este documento descreve os fluxos funcionais, telas e regras de negócio do sistema **Camilo Studio**, fundamentados no protótipo de alta fidelidade desenvolvido no [Stitch 7569087254048681171](https://stitch.withgoogle.com/projects/7569087254048681171).

---

## 1. Mapa de Telas e Módulos

```text
Camilo Studio
├── Autenticação (Login Mobile)
├── Agenda & Atendimentos
│   ├── Visão da Agenda Diária / Semanal
│   ├── Novo Agendamento
│   ├── Comprovante de Agendamento
│   └── Modal de Confirmação WhatsApp
├── Gestão de Clientes
│   ├── Lista de Clientes (Busca & Filtros)
│   ├── Cadastro / Edição de Cliente
│   └── Ficha da Cliente & Histórico de Fórmulas
├── Catálogo de Serviços
│   ├── Listagem de Serviços
│   └── Cadastrar / Editar Serviço
├── Equipe & Escala
│   └── Escala de Horários e Cadeiras de Atendimento
└── Ajustes & Configurações
```

---

## 2. Detalhamento dos Módulos

### 2.1. Módulo Agenda & Confirmações WhatsApp
- **Objetivo:** Orquestrar os horários dos profissionais e as confirmações de clientes.
- **Telas Correspondentes no Stitch:**
  - `Agenda & Confirmações WhatsApp`
  - `Novo Agendamento`
  - `Comprovante de Agendamento`
  - `Modal Enviar Confirmação WhatsApp`
- **Fluxo Operacional:**
  1. O operador visualiza a grade com indicação visual de status: *Agendado*, *Confirmado*, *Em Atendimento*, *Finalizado*.
  2. Ao selecionar um agendamento pendente, aciona o modal de confirmação.
  3. O modal exibe a mensagem personalizada pronta com os dados do cliente, horário, serviços e profissional.
  4. Um clique no botão de ação principal abre a conversa no WhatsApp via link direto (`wa.me`) e atualiza o status para *Confirmado*.
  5. Após o atendimento, gera-se o comprovante digital formatado no padrão Rose Gold para envio ou impressão.

### 2.2. Módulo de Clientes & Ficha de Fórmulas
- **Objetivo:** Centralizar o cadastro e o histórico técnico das clientes do ateliê.
- **Telas Correspondentes no Stitch:**
  - `Gestão de Clientes`
  - `Cadastrar Nova Cliente`
  - `Ficha da Cliente & Fórmulas`
- **Regras de Negócio e Diferencial Técnico:**
  - Cada cliente possui um dossiê com preferências pessoais e restrições alérgicas.
  - A **Ficha de Fórmulas** registra os procedimentos químicos executados (ex: Mechas Globais, Morena Iluminada, Tonalização, Alisamento orgânico).
  - Cada registro de fórmula armazena:
    - Relação de proporção dos produtos (gramaturas de pó descolorante e tonalizantes).
    - Volumagem de oxidante (Ox 10, 20, 30 ou 40 vol).
    - Tempo de pausa cronometrado.
    - Observações sobre fundo de clareamento alcançado.

### 2.3. Módulo Catálogo de Serviços
- **Objetivo:** Gerenciar o portfólio de procedimentos oferecidos no ateliê.
- **Telas Correspondentes no Stitch:**
  - `Catálogo de Serviços`
  - `Cadastrar / Editar Serviço`
- **Campos:** Nome do serviço, categoria (Cabelo, Estética, Sobrancelha, etc.), duração estimada em minutos, valor em reais e descrição detalhada.

### 2.4. Módulo Equipe & Escala de Horários
- **Objetivo:** Organizar a capacidade operacional do salão.
- **Telas Correspondentes no Stitch:**
  - `Equipe & Escala de Horários`
- **Regras:**
  - Definição de horários de entrada, almoço e saída de cada profissional.
  - Associação de especialidades que o profissional realiza (para que a agenda só permita agendar serviços compatíveis).
  - Visualização de ocupação por cadeira/bancada.

### 2.5. Ajustes e Configurações
- **Objetivo:** Definir horários de funcionamento do espaço, templates de mensagem do WhatsApp e dados institucionais do Camilo Studio.
