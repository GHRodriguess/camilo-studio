# Diretrizes de Frontend — Camilo Studio

Este documento detalha a arquitetura, convenções e regras de validação do código em `frontend/` (Next.js 16, App Router, TypeScript e Tailwind CSS).

---

## 1. Stack e Ferramental

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript (strict mode ativado)
- **Estilização:** Tailwind CSS acoplado a variáveis CSS puras em `frontend/app/globals.css`
- **Biblioteca Base de Componentes:** shadcn/ui adicionado estritamente via CLI oficial (`npx shadcn@latest add <component>`) para moléculas/átomos, adaptando seus tokens para o design system do projeto
- **Ícones:** Lucide React
- **Gerenciador de Pacotes:** `npm`

---

## 2. Atomic Design

A estrutura de componentes é rigorosamente organizada em 4 níveis hierárquicos dentro de `frontend/components/`:

```text
frontend/components/
├── atoms/        # Elementos indivisíveis sem regra/estado de negócio
├── molecules/    # Composições de átomos
├── organisms/    # Blocos completos de tela com regras de negócio
└── templates/    # Estruturas de layout e cascas de página
```

### 2.1. Regras dos Níveis
1. **Átomos (`atoms/`):**
   - Exemplos: `Button`, `Input`, `Badge`, `Avatar`, `Spinner`, `Checkbox`.
   - **Regra:** Nunca devem conter estado de negócio (apenas estados visuais/controlados via props como `isLoading`, `disabled`, `variant`).
2. **Moléculas (`molecules/`):**
   - Exemplos: `SearchBar` (Input + Ícone + Botão limpar), `FormField` (Label + Input + Mensagem de erro), `ClientBadge` (Avatar + Nome + Status).
   - **Regra:** Combinam átomos para executar uma unidade de interação clara.
3. **Organismos (`organisms/`):**
   - Exemplos: `AppointmentCard`, `FormulaEditorModal`, `ScheduleTimeline`, `ClientsTable`.
   - **Regra:** Conectam átomos e moléculas à lógica do domínio. **Organismos grandes são construídos junto com a tela que precisa deles, nunca com antecedência especulativa.**
4. **Templates (`templates/`):**
   - Exemplos: `DashboardLayout`, `MobileAppShell`.
   - **Regra:** Definem áreas de header, drawer, conteúdo e rodapé sem vincular dados concretos.

### 2.2. Ciclo de Vida de Novos Componentes e shadcn/ui
- **Criação via CLI:** Nunca crie componentes do shadcn/ui manualmente do zero. Sempre utilize o comando oficial:
  ```bash
  npx shadcn@latest add <componente>
  ```
- **Adaptação:** Após a inclusão via comando, adeque as cores e raios aos tokens de `globals.css` (Rose Gold & Nude Chic).
- Todo componente novo **nasce como átomo ou molécula** e deve ser incluído na vitrine de componentes da página de desenvolvimento/showcase para validação visual antes de ser incorporado a fluxos produtivos.

---

## 3. Tokens e Regras de Lint

### 3.1. Proibição de Cores Hardcoded
- Cores, raios de curvatura, sombras e famílias tipográficas só podem ser declarados em `frontend/app/globals.css`.
- O comando `npm run lint` executa a validação de tokens (`lint:tokens`).
- Exemplo incorreto: `<div className="bg-[#C5836E] text-black">` ❌
- Exemplo correto: `<div className="bg-primary text-on-surface">` ou usando classes mapeadas para as variáveis CSS ✅

### 3.2. Suporte Obrigatório a Temas (Light e Dark)
- O tema **Claro** é o padrão do sistema.
- O tema **Escuro** é ativado pela classe `.dark` aplicada na tag `<html>`.
- Todo componente deve funcionar e manter contraste nos dois modos através das variáveis de tema declaradas em `globals.css`.

---

## 4. Estados Obrigatórios de Lista

Toda listagem (seja de agendamentos, clientes, serviços ou histórico químico de fórmulas) deve prever três estados de tela obrigatórios:

1. **Vazio (`EmptyState`):** Quando o usuário ainda não possui registros cadastrados, fornecendo uma mensagem calorosa e um CTA convidativo (ex: *"Nenhum agendamento para hoje. Clique abaixo para marcar o primeiro atendimento."*).
2. **Busca sem Resultado (`NoSearchResultsState`):** Quando filtros ou o campo de busca não encontram correspondência, com opção clara de limpar filtros.
3. **Carregando (`LoadingState`):** Esqueletos de carregamento (*skeletons*) elegantes ou spinners com os tokens do sistema, evitando telas em branco ou pulos de layout (CLS).

---

## 5. Regras de Interface e Ergonomia

- **Um botão primário por folha:** Cada tela ou modal deve possuir apenas uma ação primária em destaque (pílula em tom Rose Gold). Ações secundárias devem usar estilo ghost ou outline sutil.
- **Ações Destrutivas (Lixeira):** O botão de exclusão/lixeira deve permanecer **neutro em repouso** (cinza/marrom suave) e acender em **vermelho apenas no estado `:hover` ou foco**, evitando sobrecarregar a interface com sinais de alerta desnecessários.
