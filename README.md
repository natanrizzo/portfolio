# Portfólio

Portfólio pessoal com painel administrativo próprio. Next.js 16 (App Router),
Postgres, Drizzle e Cloudinary, publicado num VPS atrás do Traefik.

## Stack

| Camada | Escolha |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Estilo | Tailwind CSS 4 com tokens em CSS variables |
| Banco | PostgreSQL 17 |
| ORM | Drizzle + drizzle-kit (migrations em SQL versionado) |
| Autenticação | Sessão própria: cookie httpOnly, JWT com `jose`, senha em argon2id |
| Imagens | Cloudinary, com upload assinado no servidor |
| Deploy | Docker Compose no VPS, roteado pelo Traefik, via GitHub Actions |

### Por que sessão própria e não Auth.js

O admin tem um único usuário e uma única área protegida. Não há OAuth, nem
múltiplos tenants, nem vinculação de contas. O Auth.js v5 segue em beta, então
uma sessão assinada com `jose` (cerca de 80 linhas) cobre o caso com menos
dependências e sem código instável.

A verificação acontece em duas camadas. O [proxy](src/proxy.ts) confere apenas a
assinatura do token, porque roda no Edge e não alcança o Postgres. A checagem que
vale é [`requireUser()`](src/lib/auth/current-user.ts), chamada por toda página e
Server Action do admin, que confirma o usuário no banco e compara o
`session_version`. Trocar a senha incrementa esse número e derruba as sessões
antigas sem precisar de tabela de sessões.

## Rodando localmente

Requisitos: Node 22+ e Docker.

```bash
cp .env.example .env           # preencha os valores
npm install
npm run docker:up              # sobe só o Postgres
npm run db:migrate             # aplica as migrations
npm run db:seed                # cria o admin a partir das variáveis ADMIN_*
npm run dev
```

O site fica em `http://localhost:3000` e o painel em `http://localhost:3000/admin`.

Gere o `AUTH_SECRET` com `openssl rand -base64 48`. Trocar esse valor invalida
todas as sessões abertas.

### Use `.env`, não `.env.local`

O `docker compose` só lê `.env`. O Next lê os dois e dá precedência ao
`.env.local`. Manter os dois faz os valores divergirem sem aviso: o app conecta
num banco e o compose sobe outro. Um arquivo só, `.env`.

O Postgres do container é publicado em `127.0.0.1:15432` e não em 5432, porque a
porta padrão quase sempre já pertence a um Postgres instalado na máquina. Ajuste
`DB_PORT` se quiser outra, lembrando de refletir a mesma porta no
`DATABASE_URL`. Em produção o banco não publica porta nenhuma.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run typecheck` | Gera os tipos de rota e roda o `tsc` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Gera uma migration a partir do schema |
| `npm run db:migrate` | Aplica as migrations pendentes |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run db:seed` | Cria ou atualiza o usuário admin |

Depois de mexer em [src/db/schema.ts](src/db/schema.ts), rode `db:generate` e
**commite o SQL gerado**. O deploy aplica os arquivos de [drizzle/](drizzle/), não
o schema.

## Modelo de dados

`projects` guarda o conteúdo, com `status` em `draft` ou `published`. Rascunho
não aparece em nenhuma rota pública: a listagem filtra por status e a página de
detalhe devolve 404. Isso permite salvar um projeto pela metade direto em
produção sem publicá-lo.

`tech_tags` e `project_tags` formam a relação N para N de tecnologias.
`project_images` guarda a galeria. `profile` é uma linha única (id = 1) com o
conteúdo da home e da página Sobre. `admin_users` tem exatamente uma linha,
criada pelo seed, sem rota de cadastro.

## Imagens

Os uploads vão do navegador direto para o Cloudinary. A assinatura é gerada em
uma Server Action protegida por `requireUser()`, então o `CLOUDINARY_API_SECRET`
nunca chega ao cliente. Presets não assinados não são usados de propósito: com
eles qualquer pessoa poderia enviar arquivos para a sua conta.

Excluir um projeto ou uma imagem também remove o arquivo no Cloudinary, para a
conta não acumular órfãos.

## Renderização

As páginas públicas são `force-dynamic`. A imagem Docker é construída no GitHub
Actions, onde o banco de produção não é acessível, então nada pode consultar o
Postgres em tempo de build. Para o volume de tráfego de um portfólio, uma query
por request custa poucos milissegundos, e o conteúdo publicado no admin aparece
na hora.

## Deploy

### O que preparar no VPS, uma vez

1. Crie a pasta da aplicação, por exemplo `/opt/portfolio`.
2. Copie o `.env.example` para `/opt/portfolio/.env` e preencha, incluindo
   `SITE_DOMAIN` e as variáveis `TRAEFIK_*`.
3. Confirme o nome da rede Docker do seu Traefik e use-o em `TRAEFIK_NETWORK`:

   ```bash
   docker network ls
   docker inspect <container-do-traefik> -f '{{json .NetworkSettings.Networks}}'
   ```

4. Confirme o nome do entrypoint HTTPS e do cert resolver no seu `traefik.yml`,
   e ajuste `TRAEFIK_ENTRYPOINT` e `TRAEFIK_CERTRESOLVER`. Os padrões assumidos
   são `websecure` e `letsencrypt`.
5. Aponte o DNS do domínio para o IP do servidor.
6. Crie um usuário de deploy com chave SSH dedicada, em vez de usar root com
   senha:

   ```bash
   adduser --disabled-password deploy
   usermod -aG docker deploy
   mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
   # cole a chave pública em /home/deploy/.ssh/authorized_keys
   ```

O app não publica portas no host. O Traefik o alcança pela rede Docker
compartilhada, e o Postgres só existe na rede interna do stack.

### Secrets do GitHub Actions

| Secret | Conteúdo |
| --- | --- |
| `VPS_HOST` | IP ou hostname do servidor |
| `VPS_USER` | Usuário de deploy |
| `VPS_SSH_KEY` | Chave privada correspondente à pública instalada no servidor |
| `VPS_PORT` | Porta SSH, se não for 22 |
| `VPS_APP_DIR` | Caminho da aplicação, por exemplo `/opt/portfolio` |
| `GHCR_TOKEN` | Token com `read:packages`, usado pelo servidor para baixar a imagem |
| `NEXT_PUBLIC_SITE_URL` | URL pública, embutida no bundle durante o build |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name do Cloudinary |

### O que o workflow faz

Todo push em `main` dispara [.github/workflows/deploy.yml](.github/workflows/deploy.yml):
typecheck e lint, build das imagens `app` e `migrator` publicadas no GHCR com a
tag do commit, e então, via SSH: dump do banco antes de tudo, migrations,
`docker compose up -d` só do serviço `app` e espera pelo `/api/health`. Se a nova
versão não responder saudável em 60 segundos, o job falha e imprime os logs.

O deploy usa `concurrency` para nunca rodar dois ao mesmo tempo no servidor.

### Primeiro deploy

Depois do primeiro workflow verde, crie o admin uma única vez:

```bash
cd /opt/portfolio
docker compose run --rm migrate npx tsx scripts/seed.ts
```

Ele lê `ADMIN_EMAIL`, `ADMIN_NAME` e `ADMIN_PASSWORD` do `.env`. Depois de
entrar, troque a senha em `/admin/account` e remova essas três variáveis do
arquivo.

## Backups

O serviço `backup` roda um `pg_dump` por dia no volume `pgbackups` e mantém 14
dias. O deploy também faz um dump antes de aplicar migrations, dentro da pasta
da aplicação.

Os dois ficam no mesmo servidor, o que protege contra migration ruim mas não
contra perda do disco. Para um portfólio isso costuma bastar. Se quiser
resiliência real, sincronize `/var/lib/docker/volumes/portfolio_pgbackups` para
fora da máquina.

Restaurar:

```bash
gunzip -c portfolio-AAAAMMDD-HHMM.sql.gz | \
  docker compose exec -T db psql -U portfolio -d portfolio
```
