# Design System — Violet Luminary

Este documento formaliza as especificações de design extraídas do projeto no Google Stitch ([Stitch 7569087254048681171](https://stitch.withgoogle.com/projects/7569087254048681171)).

---

## 1. Filosofia Estética

O **Camilo Studio** adota o tema **Violet Luminary**, combinando sofisticação editorial contemporânea com a vibração estética de pigmentos cosméticos de alta precisão.
- **Sofisticação Editorial Violeta:** Hierarquia inspirada em publicações de moda de alta-costura (*haute-couture*), com amplas margens, respiração visual e luminosidade lilás acetinada.
- **Radiância Luminosa:** Acentos em violeta elétrico (*Electric Violet*) e ametista profundo (*Royal Amethyst*), pareados com fundos claros de brilho sutil e neutros tinta grafite-ametista.
- **Precisão Confortável:** Tipografia ultra-limpa e disciplinada combinando **Inter** (para títulos editoriais, métricas e corpo de leitura) com **Geist** (para etiquetas, números técnicos de fórmulas, timestamps e micro-controles).

---

## 2. Paleta de Cores & Tokens

Todos os tokens devem ser declarados exclusivamente em `frontend/app/globals.css`.

### 2.1. Superfícies e Fundos (Luminous Lilac-White)
| Token | Valor Hex | Finalidade |
| :--- | :--- | :--- |
| `--color-surface` | `#FFF7FF` | Fundo principal da aplicação (Luminous Canvas) |
| `--color-surface-dim` | `#E4D4EF` | Superfície atenuada |
| `--color-surface-bright` | `#FFF7FF` | Superfície luminosa de destaque |
| `--color-surface-container-lowest` | `#FFFFFF` | Branco puro para modais e popovers destacados |
| `--color-surface-container-low` | `#FBF0FF` | Containers de fundo sutil |
| `--color-surface-container` | `#F7E9FF` | Fundo padrão de cards e agrupamentos |
| `--color-surface-container-high` | `#F2E2FE` | Destaques de superfície intermediária |
| `--color-surface-container-highest` | `#EDDDF8` | Bordas e áreas elevadas |

### 2.2. Acentos Violeta Elétrico & Ametista (Violet Luminary)
| Token | Valor Hex | Finalidade |
| :--- | :--- | :--- |
| `--color-primary` | `#7C3AED` / `#630ED4` | Electric Violet (botões primários, ênfases ativas, foco) |
| `--color-on-primary` | `#FFFFFF` | Texto em cima de botões primários |
| `--color-primary-container` | `#7C3AED` | Fundo de containers primários |
| `--color-on-primary-container` | `#EDE0FF` | Texto e ícones em containers primários |
| `--color-secondary` | `#831ADA` | Acentos secundários |
| `--color-secondary-container` | `#9E41F5` | Chips e tags secundárias |
| `--color-tertiary` | `#5F34A8` | Tom terciário ametista |
| `--color-tertiary-container` | `#784FC3` | Fundo de containers terciários |

### 2.3. Tipografia & Tinta (Midnight Amethyst Neutral)
| Token | Valor Hex | Finalidade |
| :--- | :--- | :--- |
| `--color-on-surface` | `#21182B` / `#1C1326` | Deep Midnight Amethyst (evitar `#000000` absoluto) |
| `--color-on-surface-variant` | `#4A4455` / `#49454F` | Textos secundários, legendas e metadados |
| `--color-outline` | `#7B7487` | Contornos firmes |
| `--color-outline-variant` | `#CCC3D8` | Divisores sutis e bordas de cards |

### 2.4. Feedback & Erros
| Token | Valor Hex | Finalidade |
| :--- | :--- | :--- |
| `--color-error` | `#BA1A1A` | Alertas e erros |
| `--color-error-container` | `#FFDAD6` | Fundo de badges de alerta |
| `--color-on-error-container` | `#93000A` | Texto de erro |

---

## 3. Tipografia

A tipografia do sistema combina duas famílias modernas:

### 3.1. Inter (Headlines, Display & Body)
Utilizada para títulos editoriais, métricas principais, cartões de procedimentos e textos corridos:
- **display-lg:** `48px`, peso `600`, line-height `56px`, tracking `-0.03em`
- **display-lg-mobile:** `36px`, peso `600`, line-height `44px`, tracking `-0.02em`
- **headline-lg:** `32px`, peso `600`, line-height `40px`, tracking `-0.02em`
- **headline-md:** `24px`, peso `600`, line-height `32px`, tracking `-0.01em`
- **headline-sm:** `20px`, peso `600`, line-height `28px`, tracking `-0.005em`
- **body-lg:** `16px`, peso `400`, line-height `26px`
- **body-md:** `14px`, peso `400`, line-height `22px`
- **body-sm:** `12px`, peso `400`, line-height `18px`

### 3.2. Geist (Labels, Metadados, Números & Micro-UI)
Utilizada para rótulos técnicos, gramaturas de fórmulas, carimbos de hora na agenda e controles interativos:
- **label-lg:** `14px`, peso `500`, line-height `20px`, tracking `+0.01em`
- **label-md:** `12px`, peso `500`, line-height `16px`, tracking `+0.03em`
- **label-sm:** `10px`, peso `600`, line-height `14px`, tracking `+0.05em`

---

## 4. Raios de Borda (Shapes)

Formas suaves e orgânicas inspiradas no design de alta cosmética:
- **Pílula (`rounded-full`):** Botões principais (CTAs), chips de filtro, badges de status, inputs e seletores rápidos.
- **Cards amplos (`rounded-3xl` / `1.5rem` - `2rem`):** Containers de tratamentos, fichas de clientes e blocos de agenda.
- **Elementos aninhados (`rounded-xl` / `rounded-lg`):** Entradas de dados e miniaturas de fotos internas.

---

## 5. Profundidade, Sombras & Glassmorphism

- **Sombras Amestista Tintadas:**
  - *Cards em repouso:* `0 4px 20px -2px rgba(28, 19, 38, 0.04), 0 2px 6px -1px rgba(28, 19, 38, 0.02)`
  - *Modais e Popovers:* `0 16px 40px -8px rgba(28, 19, 38, 0.09), 0 4px 12px -2px rgba(28, 19, 38, 0.04)`
- **Frosted Violet Glassmorphism:** Menus fixos e barras superiores com `backdrop-filter: blur(16px)` com 85% de opacidade de `#FFF7FF` e borda inferior de `1px solid var(--color-outline-variant)`.
- **Botões Primários:** Sólido `#7C3AED` ou degradê suave `linear-gradient(135deg, #7C3AED 0%, #9333EA 60%, #4C1D95 100%)` com texto branco em Geist.
- **Foco:** Halo ambiente translúcido de `3px rgba(124, 58, 237, 0.15)`.
