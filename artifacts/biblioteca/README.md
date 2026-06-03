# Biblioteca Online

Sistema web de gerenciamento de acervo bibliográfico pessoal, desenvolvido como projeto acadêmico para demonstração de competências em desenvolvimento frontend com integração a banco de dados em nuvem.

---

## Objetivo do Sistema

O **Biblioteca Online** é uma aplicação web que permite ao usuário cadastrar, visualizar, editar e excluir livros de sua coleção pessoal. O sistema conta com autenticação completa (cadastro, login e logout), área protegida acessível apenas para usuários autenticados e interface responsiva para uso em dispositivos móveis e desktops.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| HTML5 | — | Estrutura das páginas |
| CSS3 | — | Estilização base |
| JavaScript (ES2022+) | — | Lógica do frontend |
| TypeScript | 5.9 | Tipagem estática |
| React | 19 | Componentização da interface |
| Tailwind CSS | 4 | Estilização utilitária responsiva |
| Vite | 7 | Bundler e servidor de desenvolvimento |
| Supabase | — | Backend as a Service (autenticação + banco de dados PostgreSQL) |

---

## Integração com Supabase

O sistema utiliza a **API REST nativa do Supabase** diretamente via `fetch`, sem SDK adicional, demonstrando compreensão dos protocolos HTTP e da estrutura RESTful.

- **Autenticação**: endpoint `/auth/v1` para signup, login e logout
- **Banco de dados**: endpoint `/rest/v1` para operações CRUD nas tabelas
- **Segurança**: token JWT armazenado em `localStorage`, enviado via header `Authorization: Bearer <token>` em todas as requisições autenticadas
- **Row Level Security (RLS)**: cada usuário acessa apenas seus próprios livros via filtro `usuario_id`

---

## Estrutura do Banco de Dados

### Diagrama de Entidades

```
usuarios (gerenciada pelo Supabase Auth)
│
│   id (UUID, PK)
│   nome (VARCHAR)
│   email (VARCHAR)
│
└─── livros
         id (BIGINT, PK, autoincrement)
         titulo (VARCHAR, NOT NULL)
         autor (VARCHAR, NOT NULL)
         genero (VARCHAR, NOT NULL)
         ano_publicacao (INTEGER, NOT NULL)
         quantidade (INTEGER, NOT NULL, DEFAULT 1)
         usuario_id (UUID, FK → usuarios.id, NOT NULL)
```

A tabela `livros` possui **6 atributos** além da chave primária e **1 chave estrangeira** (`usuario_id`) referenciando a tabela `usuarios`.

---

## SQL das Tabelas

### Tabela `usuarios`

```sql
-- Criada e gerenciada automaticamente pelo Supabase Auth.
-- A tabela pública abaixo espelha os dados essenciais do usuário.

CREATE TABLE public.usuarios (
  id      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome    VARCHAR     NOT NULL,
  email   VARCHAR     NOT NULL UNIQUE
);

-- Permissões de acesso via Row Level Security
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê apenas seus próprios dados"
  ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuário insere seus próprios dados"
  ON public.usuarios
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Tabela `livros`

```sql
CREATE TABLE public.livros (
  id              BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo          VARCHAR     NOT NULL,
  autor           VARCHAR     NOT NULL,
  genero          VARCHAR     NOT NULL,
  ano_publicacao  INTEGER     NOT NULL CHECK (ano_publicacao >= 1000),
  quantidade      INTEGER     NOT NULL DEFAULT 1 CHECK (quantidade >= 0),
  usuario_id      UUID        NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

-- Permissões de acesso via Row Level Security
ALTER TABLE public.livros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia apenas seus próprios livros"
  ON public.livros
  FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
```

---

## Funcionalidades Implementadas

### Autenticação

| Funcionalidade | Descrição |
|---|---|
| **Cadastro de usuário** | Formulário com nome, email e senha (mínimo 6 caracteres). Cria conta via Supabase Auth e registra dados na tabela `usuarios`. |
| **Login** | Autenticação via email e senha. Token JWT salvo em `localStorage` para persistência de sessão. |
| **Logout** | Invalida o token no servidor Supabase e limpa a sessão local. |
| **Área protegida** | O Dashboard só é acessível com sessão válida. Sem autenticação, o sistema redireciona automaticamente para a tela de login. |
| **Mensagens de erro amigáveis** | Feedback específico para cada tipo de erro: credenciais inválidas, email não confirmado, campos obrigatórios, etc. |

### CRUD de Livros

| Operação | Método HTTP | Descrição |
|---|---|---|
| **CREATE** | `POST /rest/v1/livros` | Formulário modal com título, autor, gênero, ano de publicação e quantidade |
| **READ** | `GET /rest/v1/livros` | Listagem em tabela (desktop) e cards (mobile), com busca por título, autor ou gênero |
| **UPDATE** | `PATCH /rest/v1/livros?id=eq.{id}` | Botão "Editar" abre o mesmo formulário modal preenchido com os dados atuais |
| **DELETE** | `DELETE /rest/v1/livros?id=eq.{id}` | Botão "Excluir" com confirmação antes de remover o registro |

### Interface e Responsividade

- Layout adaptável: tabela no desktop, cartões empilhados no mobile
- Navbar fixa com avatar do usuário e botão de logout
- Modal de formulário centralizado com scroll interno
- Campo de busca em tempo real para filtrar a lista de livros
- Indicadores visuais de carregamento (spinners) e estados vazios
- Badges coloridos para gênero e quantidade disponível

---

## Instruções para Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [pnpm](https://pnpm.io/) (ou npm/yarn)
- Conta no [Supabase](https://supabase.com/) com as tabelas criadas (SQL acima)

### Passo a passo

**1. Clonar o repositório**
```bash
git clone https://github.com/seu-usuario/biblioteca-online.git
cd biblioteca-online
```

**2. Instalar dependências**
```bash
pnpm install
# ou: npm install
```

**3. Configurar as credenciais do Supabase**

Abra o arquivo `src/lib/supabase.ts` e substitua os valores:

```typescript
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA-ANON-KEY";
```

As credenciais estão disponíveis em: **Supabase Dashboard → Project Settings → API**

**4. Executar em desenvolvimento**
```bash
pnpm run dev
# ou: npm run dev
```

Acesse em: `http://localhost:5173`

**5. Gerar build para produção (GitHub Pages)**
```bash
pnpm run build
# ou: npm run build
```

Os arquivos estáticos serão gerados na pasta `dist/` e podem ser publicados diretamente no GitHub Pages.

### Configuração do Supabase

1. Acesse o painel do Supabase → **Authentication → Settings**
2. Para testes, desative **"Enable email confirmations"**
3. Execute os scripts SQL da seção anterior no editor do Supabase (**SQL Editor → New query**)

---

## Estrutura de Pastas

```
biblioteca-online/
│
├── public/                   # Arquivos estáticos públicos
│
├── src/
│   ├── lib/
│   │   ├── supabase.ts       # Configuração e funções de autenticação (signUp, signIn, signOut, sessão)
│   │   └── api.ts            # Funções CRUD para a tabela livros (getLivros, createLivro, updateLivro, deleteLivro)
│   │
│   ├── pages/
│   │   ├── Login.tsx         # Tela de login com email e senha
│   │   ├── Cadastro.tsx      # Tela de cadastro de novo usuário
│   │   └── Dashboard.tsx     # Área protegida com listagem e CRUD de livros
│   │
│   ├── App.tsx               # Componente raiz com roteamento entre telas
│   ├── main.tsx              # Ponto de entrada da aplicação React
│   └── index.css             # Estilos globais e configuração do Tailwind CSS
│
├── index.html                # HTML raiz da SPA
├── vite.config.ts            # Configuração do bundler Vite
├── tsconfig.json             # Configuração do TypeScript
├── package.json              # Dependências e scripts do projeto
└── README.md                 # Este arquivo
```

---

## Requisitos Acadêmicos Atendidos

| # | Requisito | Implementação |
|---|---|---|
| 1 | HTML, CSS, JavaScript e Tailwind | React + Tailwind CSS v4 compilado para HTML/CSS/JS estático |
| 2 | API REST do Supabase | `fetch` direto para `/rest/v1` e `/auth/v1` sem SDK |
| 3 | Autenticação completa | Cadastro, login e logout funcionais |
| 4 | Área protegida | Dashboard inacessível sem sessão válida |
| 5 | CRUD completo | Create, Read, Update e Delete na tabela `livros` |
| 6 | Duas tabelas | `usuarios` e `livros` |
| 7 | 5+ atributos e Foreign Key | `livros`: titulo, autor, genero, ano_publicacao, quantidade + `usuario_id` (FK) |
| 8 | Operações assíncronas | Todas as chamadas utilizam `async/await` com tratamento de erros |
| 9 | Interface responsiva | Layout adaptado para mobile (cards) e desktop (tabela) |
| 10 | Pronto para publicação | Build estático via `pnpm run build`, compatível com GitHub Pages |

---

## Autor

Desenvolvido como projeto de conclusão de disciplina de Desenvolvimento Web.

---

*Projeto desenvolvido com fins acadêmicos.*
