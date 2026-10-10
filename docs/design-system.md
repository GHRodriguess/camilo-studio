# Design System — Rose Gold & Nude Chic

Este documento formaliza as especificações de design extraídas do projeto no Google Stitch ([Stitch 7569087254048681171](https://stitch.withgoogle.com/projects/7569087254048681171)).

---

## 1. Filosofia Estética

O **Camilo Studio** adota uma atmosfera **editorial de alto padrão**, fugindo do visual utilitário e frio dos sistemas SaaS convencionais.
- **Sofisticação Editorial:** Tipografia serifada em títulos, ampla respiração de espaçamento e contrastes suaves.
- **Sensação Tátil:** Cores neutras quentes, tons nude, champanhe e detalhes metálicos em *rose gold*.
- **Precisão Confortável:** Tipografia sans-serif limpa para dados, tabelas, horários e controles operacionais.

---

## 2. Paleta de Cores & Tokens

Todos os tokens devem ser declarados exclusivamente em `frontend/app/globals.css`.

### 2.1. Superfícies e Fundos
| Token | Valor Hex | Finalidade |
| :--- | :--- | :--- |
| `--color-surface` | `#FFF8F7` | Fundo principal da aplicação (Soft Cream) |
| `--color-surface-dim` | `#E5D7D5` | Superfície atenuada |
| `--color-surface-bright` | `#FFF8F7` | Superfície destacada/luminosa |
| `--color-surface-container-lowest` | `#FFFFFF` | Branco puro para modais e popovers destacados |
| `--color-surface-container-low` | `#FFF0EE` | Containers sutis |
| `--color-surface-container` | `#FAEDE8` | Cards de repouso e áreas de agrupamento |
| `--color-surface-container-high` | `#F4E5E3` | Destaques de superfície |
| `--color-surface-container-highest` | `#EEDFDD` | Bordas e áreas elevadas |

### 2.2. Acentos Primários & Metálicos (Rose Gold)
| Token | Valor Hex | Finalidade |
| :--- | :--- | :--- |
| `--color-primary` | `#88503D` / `#C5836E` | Rose Gold primário (botões principais, ênfases ativas) |
| `--color-on-primary` | `#FFFFFF` | Texto em cima de botões primários |
| `--color-primary-container` | `#C5836E` | Fundo de containers primários |
| `--color-on-primary-container` | `#4B1F10` | Texto em containers primários |
| `--color-secondary` | `#815343` | Acentos secundários |
| `--color-secondary-container` | `#FEC1AC` | Chips e tags secundárias |

### 2.3. Tipografia & Tinta (Dark Warm Espresso)
| Token | Valor Hex | Finalidade |
| :--- | :--- | :--- |
| `--color-on-surface` | `#211A19` / `#2C2423` | Dark Warm Espresso (evitar `#000000` absoluto) |
| `--color-on-surface-variant` | `#52433F` / `#4A403F` | Textos secundários, legendas e metadados |
| `--color-outline` | `#85736E` | Contornos firmes |
| `--color-outline-variant` | `#EADCD2` / `#D7C2BC` | Divisores sutis (Champagne Veil) |

### 2.4. Feedback & Estados Críticos
| Token | Valor Hex | Finalidade |
| :--- | :--- | :--- |
| `--color-error` | `#BA1A1A` | Alerta e erros (utilizar com moderação) |
| `--color-error-container` | `#FFDAD6` | Fundo de badges e alertas |
| `--color-on-error-container` | `#93000A` | Texto de erro |

---

## 3. Tipografia

A tipografia do sistema combina duas famílias complementares:

### 3.1. Playfair Display (Serif)
Utilizada para títulos editoriais, nomes de clientes em destaque, valores de faturamento hero e cabeçalhos de cards.
- **display-lg:** `48px`, peso `400`, line-height `56px`, tracking `-0.02em`
- **headline-lg:** `32px`, peso `500`, line-height `40px`, tracking `-0.01em`
- **headline-md:** `24px`, peso `500`, line-height `32px`
- **headline-sm:** `20px`, peso `600`, line-height `28px`
> **Regra:** Nunca utilizar caixa alta (ALL CAPS) em títulos com Playfair Display para preservar a elegância serifada.

### 3.2. Plus Jakarta Sans (Sans-serif)
Utilizada em dados de interface, navegação, tabelas, horários de agenda, formulários e chips.
- **body-lg:** `16px`, peso `400`, line-height `26px`
- **body-md:** `14px`, peso `400`, line-height `22px`
- **body-sm:** `12px`, peso `400`, line-height `18px`
- **label-lg:** `14px`, peso `600`, line-height `20px`, tracking `+0.02em`
- **label-md:** `12px`, peso `600`, line-height `16px`, tracking `+0.04em`
- **label-sm:** `10px`, peso `700`, line-height `14px`, tracking `+0.08em`

---

## 4. Raios de Borda (Shapes)

O design preza por formas curvilíneas que remetem a produtos de alta cosmética e arquitetura orgânica:
- **Pílula (`rounded-full`):** Botões principais, campos de busca, chips de filtro e badges de status.
- **Cards amplos (`rounded-3xl` / `1.5rem` - `2rem`):** Containers de tratamentos, fichas de clientes e cartões de agenda.
- **Elementos aninhados (`rounded-xl` / `rounded-lg`):** Entradas de dados e miniaturas de fotos internas.

---

## 5. Profundidade & Glassmorphism

- **Sombras Tépidas:** Sombras difusas e quentes (não usar cinzas neutros frios).
  - *Cards em repouso:* `0 4px 20px -2px rgba(44, 36, 35, 0.04), 0 2px 6px -1px rgba(44, 36, 35, 0.02)`
  - *Modais e Popovers:* `0 16px 40px -8px rgba(44, 36, 35, 0.08), 0 4px 12px -2px rgba(44, 36, 35, 0.03)`
- **Champagne Glassmorphism:** Menus fixos e barras de topo com `backdrop-filter: blur(16px)` com 85% de opacidade da cor de superfície e borda inferior sutil de `1px solid var(--color-outline-variant)`.
