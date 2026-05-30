# MultEmpresas

Monorepo preparado para um SaaS multiempresa. A primeira entrega contém somente o backend PHP 8.3, independente de qualquer frontend.

## Estrutura

```text
backend/   API REST PHP + MySQL + Swagger + Docker
frontend/  reservado para implementação futura
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

## Usuário Master inicial

- Email: `master@system.local`
- Senha: `Master@123`
- `must_change_password` nasce ativo para exigir troca de senha no primeiro login.

## Arquitetura

A API foi organizada em camadas inspiradas em Clean Architecture e DDD: domínio, aplicação, infraestrutura, apresentação, repositórios, serviços, middlewares, DTOs e validadores. O tenant é obtido do JWT (`company_id`) e aplicado nos repositórios para usuários, empresas e auditoria.
