# Aula 3 — Consulta de dados no Next.js

Projeto didático com frontend Next.js (App Router e TypeScript), API NestJS e banco PostgreSQL com Drizzle ORM. O frontend implementa a gestão de estudantes; cursos e matrículas estão disponíveis na API e ficam como exercícios para os alunos.

O frontend utiliza Server Components para consultar dados e Client Components para os formulários. As páginas são renderizadas pelo servidor Next.js, com navegação integrada pelo App Router. O processo Node.js do Next.js também executa as Server Actions e as chamadas à API.

## Executar o projeto

Com Docker e Docker Compose disponíveis, copie o ambiente se ainda não existir:

```powershell
Copy-Item .env.example .env
```

Na raiz do projeto:

```powershell
docker compose up -d --build
```

O backend aguarda o banco ficar saudável e o frontend aguarda o healthcheck do backend.

| Endereço padrão | Finalidade |
| --- | --- |
| http://localhost:8080/alunos | Frontend Next.js: gestão de estudantes. |
| http://localhost:3002/api/students | Consulta direta à API de estudantes. |
| http://localhost:3002/health | Verifica se a API responde; não consulta o banco. |
| `localhost:5433` | Conexão externa com o PostgreSQL. |

As portas publicadas são configuradas no `.env` por `FRONT_PORT_HOST`, `SERVER_PORT_HOST` e `DB_PORT_HOST`. As variáveis `DB_NAME`, `DB_USER` e `DB_PASSWORD` configuram o banco do exemplo; `SERVER_PORT` e `DB_PORT` definem as portas internas.

No Compose, o Next.js recebe `API_URL=http://server:${SERVER_PORT}`. As requisições ao NestJS partem do servidor Next.js pela rede interna do Docker. O frontend é servido por `next start`, sem Nginx ou proxy `/api` no frontend.

Para acompanhar a execução e encerrar:

```powershell
docker compose ps
docker compose logs -f server database front
```

```powershell
docker compose down
```

O volume `aula3_database_data` preserva os dados. Os scripts `database/init.sql` e `database/seed.sql` são executados somente na primeira inicialização de um diretório de dados vazio.

Para desenvolver o frontend fora do Docker, use Node.js 24 e mantenha a API disponível:

```powershell
cd front
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra http://localhost:3001/alunos. Em `front/.env.local`, use `API_URL=http://localhost:3002` para a API publicada pelo Compose, ou `http://localhost:3000` para o NestJS iniciado diretamente na porta padrão.

## Serviços do backend

Os endpoints recebem e devolvem JSON. Os parâmetros `:ra`, `:id`, `:studentRa` e `:courseId` devem ser substituídos pelos identificadores reais.

| Recurso | Listar | Consultar um registro | Cadastrar | Atualizar | Remover |
| --- | --- | --- | --- | --- | --- |
| Estudantes | GET `/api/students` | GET `/api/students/:ra` | POST `/api/students` | PATCH `/api/students/:ra` | DELETE `/api/students/:ra` |
| Cursos | GET `/api/courses` | GET `/api/courses/:id` | POST `/api/courses` | PATCH `/api/courses/:id` | DELETE `/api/courses/:id` |
| Matrículas | GET `/api/enrollments` | GET `/api/enrollments/student/:studentRa/course/:courseId` | POST `/api/enrollments` | Não disponível | DELETE `/api/enrollments/student/:studentRa/course/:courseId` |

| Cadastro | Corpo de exemplo | Dados retornados |
| --- | --- | --- |
| Estudante | `{ "ra": 123, "name": "Ana Silva" }` | `ra`, `name`. |
| Curso | `{ "name": "Desenvolvimento Web" }` | `id` gerado pelo backend, `name`. |
| Matrícula | `{ "studentRa": 123, "courseId": 1 }` | `studentRa`, `courseId`, `enrolledAt`. |

A atualização de estudantes e cursos recebe `{ "name": "Novo nome" }`. O RA identifica o estudante e não é alterado. Os nomes devem ter entre 3 e 100 caracteres; o RA deve ser inteiro positivo. A matrícula usa uma chave composta pelo RA e pelo ID do curso.

Listagens retornam arrays, inclusive `[]` quando não há registros. Cadastros retornam HTTP 201; consultas, atualizações e exclusões bem-sucedidas retornam 200. Exclusões retornam um objeto com `message`.

Entradas inválidas geram 400; registros inexistentes, 404; conflitos, 409. Os conflitos incluem RA repetido, nome de curso repetido, matrícula duplicada e tentativa de remover um estudante ou curso com matrículas. Para cadastrar uma matrícula, estudante e curso precisam existir.

Os controllers e DTOs em `server/src/modules/` são a referência do contrato da API. O frontend atual oferece telas somente para estudantes.

## Arquitetura do frontend

```text
front/src/
├── app/
│   ├── layout.tsx               Documento HTML, cabeçalho e rodapé
│   ├── page.tsx                 Redireciona / para /alunos
│   ├── globals.css              Estilos compartilhados
│   └── alunos/
│       ├── layout.tsx           Renderização por requisição
│       ├── page.tsx             Lista de estudantes
│       ├── loading.tsx          Carregamento da seção
│       ├── error.tsx            Falhas inesperadas de consulta
│       ├── actions.ts           Validação, chamada ao service e redirecionamento
│       ├── novo/page.tsx        Cadastro
│       └── [ra]/
│           ├── page.tsx         Detalhes por RA
│           ├── not-found.tsx    Registro inexistente
│           ├── editar/page.tsx  Edição
│           └── remover/page.tsx Exclusão
├── components/                  Formulários interativos
├── services/students.ts         Os cinco fetch para a API de estudantes
├── lib/validation.ts            Validação compartilhada de RA
└── types/student.ts             Contrato TypeScript do estudante
```

### Rotas e layouts

No App Router, as pastas dentro de `app` organizam as URLs e os arquivos `page.tsx` definem suas páginas. A pasta `[ra]` captura um parâmetro: em `/alunos/123`, `await params` permite obter o RA `123`.

Os layouts envolvem as páginas com uma estrutura compartilhada. O layout principal contém o HTML e a navegação; o layout da seção de alunos declara `dynamic = "force-dynamic"`, mantendo a renderização por requisição. A API não precisa estar disponível durante o build dessa seção.

### Consulta com Server Components

As páginas são Server Components por padrão. A página de alunos é assíncrona: chama `getStudents()`, aguarda os dados e renderiza a lista. O navegador recebe o resultado da renderização, sem precisar executar um `useEffect` para consultar essa lista.

```text
Navegador → página no Next.js → service → API NestJS → PostgreSQL
```

O service usa `fetch`, verifica os resultados e mantém `API_URL` no servidor. O import `server-only` impede seu uso direto nos componentes do navegador. As consultas usam `cache: "no-store"` para buscar dados atuais a cada execução.

### Interação com Client Components e Server Actions

Os formulários possuem `"use client"` para usar `useState`, `onChange` e `onSubmit`. O estado guarda os valores digitados, as mensagens e o indicador de envio.

As funções de `app/alunos/actions.ts` possuem `"use server"` e executam no servidor Next.js. O formulário chama a action; a action valida os argumentos e chama o service; o service envia POST, PATCH ou DELETE ao NestJS.

```text
Formulário no navegador → Server Action no Next.js → service → API NestJS
```

Em caso de erro, a action retorna uma mensagem ao formulário. No sucesso, `revalidatePath` invalida o conteúdo da seção e `redirect` encaminha para detalhes ou listagem. Essas funções ficam nas actions; o service concentra a comunicação HTTP.

### Carregamento e erros

`loading.tsx` fornece o conteúdo de espera por meio de uma fronteira de Suspense criada pelo Next.js. `error.tsx` apresenta falhas inesperadas de consulta e permite tentar novamente.

Na consulta individual, o service converte HTTP 404 em `null`; a página chama `notFound()` para apresentar `not-found.tsx`. Lista vazia é tratada pela própria listagem. Os formulários exibem localmente os erros das alterações e desabilitam o botão durante o envio.
