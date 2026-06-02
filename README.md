# MultEmpresas

Monorepo preparado para um SaaS multiempresa com backend PHP 8.3 e frontend React/Next.js.

## Estrutura

```text
backend/   API REST PHP + MySQL + Swagger + Docker
frontend/  aplicação React/Next.js com login e dashboard inicial
/docs      documentação do projeto
```

## Executar com Docker

Todos os comandos de infraestrutura devem ser executados a partir de `backend/`:

```bash
cd backend
cp .env.example .env
docker compose up -d
docker compose exec api composer migrate
docker compose exec api composer seed
```

URLs:



- API: <http://localhost:8010>
- Swagger: <http://localhost:8010/docs>
- PhpMyAdmin: <http://localhost:8080>
- MySQL: `localhost:3306`

## Executar o Frontend

A tela de login e o dashboard inicial ficam em `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

URLs:

- Frontend: <http://localhost:3000>
- API consumida pelo frontend: `NEXT_PUBLIC_API_URL` (padrão: <http://localhost:8010>)

Endpoints usados pelo login:

- `POST /auth/login` com `email`, `password` e opcionalmente `totp_code`.
- `POST /auth/logout` com header `Authorization: Bearer <access_token>`.

## Usuário Master inicial

- Email: `master@system.local`
- Senha: `Master@123`
- `must_change_password` nasce ativo para exigir troca de senha no primeiro login.


## Arquitetura

A API foi organizada em camadas inspiradas em Clean Architecture e DDD: domínio, aplicação, infraestrutura, apresentação, repositórios, serviços, middlewares, DTOs e validadores. O tenant é obtido do JWT (`company_id`) e aplicado nos repositórios para usuários, empresas e auditoria.
