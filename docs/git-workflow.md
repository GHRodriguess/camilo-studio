# Fluxo Git & Padrões de Commit — Camilo Studio

Este documento padroniza as convenções de commits, branches e merge requests adotadas no projeto **Camilo Studio**.

---

## 1. Conventional Commits em Português

Todos os commits devem seguir rigorosamente o padrão:

```text
tipo(escopo): descrição
```

### 1.1. Regras Fundamentais
- **Idioma:** Exclusivamente em **português**.
- **Tempo Verbal:** Verbo no **presente do indicativo** (ex: *adiciona*, *corrige*, *ajusta*, *remove*, não usar *adicionando*, *adicionado* nem infinitivo *adicionar*).
- **Limite de Caracteres:** Alvo de até **72 caracteres** na primeira linha.
- **Escopos:** Sempre grafados no **plural** e em minúsculas.

---

## 2. Tipos de Commit e Impacto no CHANGELOG

| Tipo | Entra no CHANGELOG? | Descrição / Uso |
| :--- | :---: | :--- |
| `pivot` | **Sim** | Mudança estrutural significativa de produto, modelo ou arquitetura de negócio |
| `feat` | **Sim** | Nova funcionalidade ou qualquer alteração perceptível para o usuário final |
| `fix` | **Sim** | Correção de bug em funcionalidade existente |
| `perf` | **Sim** | Melhoria de desempenho (tempo de resposta, renderização, queries) |
| `refactor` | **Sim** | Refatoração interna de código **sem qualquer mudança no comportamento observável** |
| `docs` | Não | Alterações em arquivos de documentação (`README.md`, `docs/`, docstrings) |
| `test` | Não | Adição ou correção de testes automatizados |
| `chore` | Não | Tarefas de manutenção rotineira, atualização de scripts de build ou configs |
| `ci` | Não | Configuração de pipelines de integração contínua (GitHub Actions, etc.) |
| `build` | Não | Modificações no sistema de empacotamento ou dependências externas |
| `style` | Não | Ajustes estéticos que não afetam significado (formatação, lint, ponto e vírgula) |
| `revert` | Não | Reversão de commits anteriores |

---

## 3. Regra de Ouro (Visual vs. Refactor)

> [!IMPORTANT]
> **Mudou o que o usuário vê na interface, é `feat` ou `fix`!**
> 
> Mesmo que seja apenas renomear um rótulo de botão, remover um campo secundário de formulário ou ajustar o espaçamento de um card: se o usuário percebe a alteração na tela, o commit **não pode ser classificado como `refactor`**.
> O tipo `refactor` é restrito a alterações onde o comportamento e a apresentação final permanecem exatamente idênticos (ex: extrair função utilitária, tipar melhor uma interface interna, reorganizar imports).

---

## 4. Escopos Padronizados (Sempre no Plural)

Os escopos refletem as fronteiras do domínio e das camadas do monorepo:

- `agendamentos` — Agendamento de horários, slots e status de atendimento
- `clientes` — Cadastro, perfil e dados de clientes
- `servicos` — Catálogo de serviços, preços e durações
- `equipe` — Profissionais, cadeiras e escalas
- `formulas` — Fichas técnicas capilares, tons e proporções químicas
- `whatsapp` — Notificações, deep links e integrações de mensagens
- `financeiro` — Comprovantes, fechamento de caixa e faturamento
- `ui` — Componentes visuais genéricos (átomos, moléculas, layout)
- `infra` — Docker, scripts de deploy e infraestrutura
- `auth` — Autenticação, permissões e login
- `configuracoes` — Preferências do sistema e do salão

---

## 5. Exemplos Práticos

### ✅ Exemplos Corretos
- `feat(agendamentos): adiciona seleção de profissional no fluxo de marcação`
- `fix(whatsapp): corrige codificação de espaços no texto da mensagem`
- `refactor(clientes): simplifica validação de telefone no serializer`
- `perf(agendamentos): otimiza busca de horários disponíveis no dia`
- `docs(git-workflow): documenta regra de escopos no plural`
- `feat(ui): inclui estado vazio para a listagem de serviços`

### ❌ Exemplos Incorretos
- `refactor(ui): muda a cor do botão para violeta` ❌ *(Mudou o que o usuário vê, deve ser `feat` ou `fix`)*
- `feat(cliente): cria tela de perfil` ❌ *(Escopo no singular; o correto é `clientes`)*
- `fix(agendamentos): corrigindo erro de fuso horário` ❌ *(Verbo no gerúndio; usar `corrige`)*
- `Add new component` ❌ *(Em inglês e sem seguir a convenção `tipo(escopo): descrição`)*
