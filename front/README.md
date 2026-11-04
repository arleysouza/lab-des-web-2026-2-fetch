# Aula 3 — Consulta de dados no Next.js

Este frontend é um exemplo de gestão de estudantes com Next.js, App Router e TypeScript. Ele consulta uma API NestJS e permite cadastrar, visualizar, editar e remover estudantes. A gestão de cursos e matrículas será desenvolvida pelos alunos como exercício.

## 1. Como executar

Use Node.js 24. Para consultar e alterar registros, a API e o banco de dados precisam estar em execução.

Na pasta `front/`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra http://localhost:3001/alunos. Copie o arquivo de ambiente apenas na primeira configuração, preservando seus ajustes nas próximas execuções.

O endereço da API é configurado em `.env.local`, sem `/api` no final:

```dotenv
API_URL=http://localhost:3002
```

Essa é a porta padrão da API exposta pelo Docker Compose. Se executar o NestJS diretamente na porta 3000, use `http://localhost:3000`.

Para executar o projeto completo pelo Docker, rode na raiz do exemplo:

```powershell
docker compose up --build
```

Nesse caso, o frontend fica em http://localhost:8080/alunos, conforme `FRONT_PORT_HOST`. O Compose fornece ao Next.js o endereço interno `http://server:3000`, usando a porta definida em `SERVER_PORT`.

## 2. Backend: referência para desenvolver o frontend

A API recebe e devolve JSON. Os caminhos abaixo são relativos ao endereço configurado em `API_URL`. Não é necessário conhecer a implementação do banco para consumir esses endpoints.

### Estudantes

Um estudante possui `ra` numérico e `name` textual. O RA é informado no cadastro e não pode ser alterado na atualização.

| Método | Endpoint | Corpo JSON | Resultado no sucesso |
| --- | --- | --- | --- |
| GET | `/api/students` | — | Lista de estudantes, ordenada por nome. |
| GET | `/api/students/:ra` | — | Um estudante. |
| POST | `/api/students` | `{ "ra": 123, "name": "Ana Silva" }` | Estudante criado. |
| PATCH | `/api/students/:ra` | `{ "name": "Ana Souza" }` | Estudante atualizado. |
| DELETE | `/api/students/:ra` | — | Objeto com mensagem de remoção. |

O nome deve ter entre 3 e 100 caracteres. O RA deve ser um inteiro positivo, dentro do limite do campo no banco (até 2147483647). Um RA repetido gera conflito. Estudantes com matrículas não podem ser excluídos.

Exemplo de resposta individual:

```json
{ "ra": 123, "name": "Ana Silva" }
```

### Cursos

Um curso possui `id` numérico, gerado pelo backend, e `name` textual. O nome deve ter entre 3 e 100 caracteres e ser único.

| Método | Endpoint | Corpo JSON | Resultado no sucesso |
| --- | --- | --- | --- |
| GET | `/api/courses` | — | Lista de cursos, ordenada por ID. |
| GET | `/api/courses/:id` | — | Um curso. |
| POST | `/api/courses` | `{ "name": "Desenvolvimento Web" }` | Curso criado, incluindo seu ID. |
| PATCH | `/api/courses/:id` | `{ "name": "Desenvolvimento Web II" }` | Curso atualizado. |
| DELETE | `/api/courses/:id` | — | Objeto com mensagem de remoção. |

Cursos com matrículas também não podem ser excluídos.

### Matrículas

Uma matrícula relaciona um estudante a um curso. Ela é identificada pelo par `studentRa` e `courseId`; não possui um ID individual. A resposta também contém `enrolledAt`, a data e hora de criação, serializada como texto no JSON.

| Método | Endpoint | Corpo JSON | Resultado no sucesso |
| --- | --- | --- | --- |
| GET | `/api/enrollments` | — | Lista de matrículas. |
| GET | `/api/enrollments/student/:studentRa/course/:courseId` | — | Uma matrícula. |
| POST | `/api/enrollments` | `{ "studentRa": 123, "courseId": 1 }` | Matrícula criada. |
| DELETE | `/api/enrollments/student/:studentRa/course/:courseId` | — | Objeto com mensagem de remoção. |

O estudante e o curso precisam existir. Não é permitido matricular o mesmo estudante duas vezes no mesmo curso. A API não oferece PATCH para matrículas.

As respostas contêm os identificadores do estudante e do curso, sem seus nomes. Para apresentar os nomes na interface, consulte também os serviços de estudantes e cursos.

### Disponibilidade e erros

`GET /health` retorna `{ "status": "ok" }`, indicando que a aplicação respondeu à requisição. Esse endpoint não consulta o banco.

| Status HTTP | Significado para o frontend |
| --- | --- |
| 200 | Consulta, atualização ou exclusão concluída. |
| 201 | Cadastro concluído. |
| 400 | Entrada inválida, como nome curto ou parâmetro que não é inteiro. |
| 404 | Registro não encontrado; ao matricular, pode indicar estudante ou curso inexistente. |
| 409 | Conflito, como RA ou nome de curso repetido, matrícula duplicada ou exclusão impedida por matrículas. |
| 500 | Falha inesperada no backend. |

Uma lista vazia (`[]`) é uma consulta bem-sucedida, não um erro. Além dos status HTTP, podem ocorrer falhas de conexão ou timeout, sem resposta da API.

## 3. Arquitetura do frontend

```text
src/
├── app/
│   ├── layout.tsx                   Layout geral: cabeçalho, conteúdo e rodapé
│   ├── page.tsx                     Redireciona / para /alunos
│   ├── globals.css                  Estilos compartilhados
│   └── alunos/
│       ├── layout.tsx               Configuração de renderização da seção
│       ├── page.tsx                 Lista de estudantes
│       ├── loading.tsx              Interface durante a consulta
│       ├── error.tsx                Interface para falhas inesperadas
│       ├── actions.ts               Validação e fluxo das alterações
│       ├── novo/page.tsx            Cadastro
│       └── [ra]/
│           ├── page.tsx             Detalhes
│           ├── not-found.tsx        Estudante não encontrado
│           ├── editar/page.tsx      Edição
│           └── remover/page.tsx     Exclusão
├── components/
│   ├── student-form.tsx             Formulário de cadastro e edição
│   └── delete-student-form.tsx      Formulário de exclusão
├── services/
│   └── students.ts                  Todas as requisições à API de estudantes
├── lib/
│   └── validation.ts                Validação compartilhada de RA
└── types/
    └── student.ts                   Tipo Student: ra e name
```

O prefixo `@/` nos imports representa a pasta `src/`, conforme o `tsconfig.json`. Por exemplo, `@/services/students` aponta para `src/services/students.ts`.

### App Router: as pastas definem as rotas

O arquivo `page.tsx` define o conteúdo de uma URL. Assim, `app/alunos/page.tsx` atende `/alunos`, enquanto `app/alunos/novo/page.tsx` atende `/alunos/novo`.

Colchetes indicam uma parte variável da URL. Em `/alunos/123`, a pasta `[ra]` recebe o valor `123`. A página lê esse valor com `await params`, valida o RA e consulta a API.

`layout.tsx` envolve as páginas com uma estrutura compartilhada. O layout principal define o documento HTML e a navegação. O layout de alunos envolve somente essa seção e configura sua renderização por requisição.

As pastas `services`, `components`, `lib` e `types` são escolhas de organização do projeto. Elas não criam rotas. Da mesma forma, `actions.ts` é um arquivo comum: seu nome não cria um endpoint de negócio.

### Server Components: consultar antes de apresentar

As páginas deste projeto são Server Components. Elas executam no servidor Next.js e podem ser funções assíncronas:

```tsx
import { getStudents } from "@/services/students";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <ul>
      {students.map((student) => (
        <li key={student.ra}>{student.name}</li>
      ))}
    </ul>
  );
}
```

A página aguarda a consulta e usa o resultado para produzir a interface. Não é preciso usar `useEffect` para carregar essa lista no navegador.

O fluxo de consulta é:

```text
Navegador acessa /alunos
  → página executa no servidor Next.js
  → página chama getStudents() no service
  → service consulta GET /api/students no NestJS
  → página renderiza os estudantes recebidos
```

### Services: comunicação com a API

`services/students.ts` concentra os cinco `fetch`. Esse arquivo conhece os endpoints, os métodos HTTP, a conversão para JSON e a variável `API_URL`.

| Função | Responsabilidade |
| --- | --- |
| `getStudents()` | Consultar a lista e devolver `Student[]`. |
| `getStudent(ra)` | Consultar um estudante e devolver `Student` ou `null` para HTTP 404. |
| `createStudent(ra, name)` | Enviar POST e devolver a resposta HTTP. |
| `updateStudent(ra, name)` | Enviar PATCH e devolver a resposta HTTP. |
| `deleteStudent(ra)` | Enviar DELETE e devolver a resposta HTTP. |

Nas consultas, o service verifica `response.ok` antes de ler o JSON. Nas alterações, ele devolve a resposta para que a action escolha a mensagem conforme o status. Uma resposta HTTP de erro não faz o `fetch` lançar uma exceção automaticamente; falhas de rede e timeout podem lançar.

O arquivo importa `server-only`, impedindo seu uso direto em Client Components. `API_URL` fica no ambiente do servidor e não usa o prefixo `NEXT_PUBLIC_`. Nesse fluxo, o navegador acessa o Next.js, e o Next.js acessa o NestJS; não é necessário habilitar CORS no NestJS para essas chamadas.

O tipo `Student` documenta os campos esperados e ajuda o TypeScript durante o desenvolvimento. Ele não valida o JSON recebido em tempo de execução.

### Client Components: interação nos formulários

Os formulários usam `"use client"` porque precisam de estado e eventos do navegador. Isso permite usar:

- `useState` para os campos, a mensagem de erro e o indicador de envio;
- `onChange` para atualizar o valor digitado;
- `onSubmit` para tratar o envio;
- `event.preventDefault()` para impedir o envio HTML tradicional;
- `disabled` para bloquear o botão durante a operação.

`StudentForm` é compartilhado: sem a propriedade `student`, cadastra; com essa propriedade, edita o nome e mantém o RA somente para leitura. Os valores ficam no estado do componente e são preservados se a operação falhar.

`DeleteStudentForm` apresenta o estudante e executa a exclusão ao clicar em **Remover estudante**, sem checkbox adicional.

### Server Actions: executar alterações no servidor

`app/alunos/actions.ts` começa com `"use server"`. Suas funções são chamadas pelos formulários, mas executam no servidor Next.js. O framework faz a comunicação entre o navegador e essas funções; importar uma action no formulário não transfere seu código de servidor para o navegador.

As actions validam os argumentos, chamam o service e tratam o resultado. A validação também acontece no servidor porque as restrições dos inputs HTML podem ser contornadas.

```text
Usuário envia o formulário
  → onSubmit chama handleSubmit()
  → handleSubmit() chama a Server Action
  → action valida e chama o service
  → service envia POST, PATCH ou DELETE à API
  → em caso de falha, action retorna uma mensagem
  → no sucesso, action revalida a seção e redireciona
```

O service executa a requisição; a action decide o próximo passo da interface. Por isso, `redirect()` e `revalidatePath()` ficam nas actions, e não no service.

### Consulta atualizada e navegação

As consultas usam `cache: "no-store"`, buscando dados atuais sempre que executadas no servidor. O layout de alunos declara `dynamic = "force-dynamic"`, fazendo a seção ser renderizada por requisição e permitindo compilar o frontend sem a API disponível.

Após uma alteração, `revalidatePath("/alunos", "layout")` invalida o conteúdo da seção, incluindo suas páginas descendentes. Isso também participa da atualização do cache de navegação do Next.js. Já `redirect()` encaminha o usuário para os detalhes ou para a listagem; redirecionar, por si só, não é uma operação de invalidação de cache.

`redirect()` interrompe a execução usando um sinal interno do Next.js. Por isso, ele fica fora do `try/catch`, evitando que seja tratado como falha da API.

Essas configurações não atualizam continuamente uma aba aberta. Uma nova consulta acontece quando há uma nova renderização da página no servidor.

### Carregamento, ausência e erro

| Situação | Comportamento |
| --- | --- |
| Página aguardando dados | `loading.tsx` apresenta a interface de carregamento. |
| Lista retornada como `[]` | A própria listagem apresenta “Nenhum estudante cadastrado”. |
| RA inválido ou consulta individual com 404 | A página chama `notFound()` e apresenta `not-found.tsx`. |
| Falha inesperada ao consultar | O erro chega a `error.tsx`. |
| Falha esperada ao cadastrar, editar ou remover | A action retorna uma mensagem, exibida pelo formulário. |

`loading.tsx` cria uma interface de espera por meio de uma fronteira de Suspense adicionada pelo Next.js ao segmento. Sua exibição depende do tempo da consulta e da navegação; respostas rápidas podem torná-la pouco perceptível.

`error.tsx` é um Client Component e oferece **Tentar novamente**, que recarrega a página e repete a consulta. Os formulários possuem seus próprios indicadores de envio; eles não dependem de `loading.tsx` para mostrar “Salvando…” ou “Removendo…”.

## 4. Roteiro para estudar e experimentar

1. Leia `app/alunos/page.tsx` e acompanhe sua chamada até `services/students.ts`.
2. Clique no RA da lista e observe a rota `/alunos/[ra]` e o uso de `await params`.
3. Abra `/alunos/abc` e um RA válido que não exista para observar `notFound()`.
4. Pare a API, recarregue a página e observe `error.tsx`. Reinicie a API e tente novamente.
5. Introduza temporariamente um atraso na API para observar `loading.tsx`. A conexão entre Next.js e NestJS acontece no servidor; limitar a rede do navegador não simula esse atraso diretamente.
6. Cadastre um estudante, altere seu nome e remova-o. Acompanhe formulário → action → service.
7. Tente cadastrar um RA repetido e remover um estudante com matrícula para observar as mensagens de conflito.

Para verificar compilação e tipos:

```powershell
npm run build
npm run typecheck
```

## 5. Exercícios: cursos e matrículas

Reproduza a organização utilizada em estudantes: tipos de resposta, services, páginas de consulta, formulários e actions. Inclua carregamento, registro inexistente e mensagens de erro.

Para cursos, use o ID gerado pelo backend. Para matrículas, use os dois identificadores e lembre que não existe operação de atualização. Consulte os controllers e DTOs em `../server/src/modules/` quando precisar conferir o contrato da API.
