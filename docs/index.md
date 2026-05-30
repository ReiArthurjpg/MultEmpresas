# Documentação do Backend MultEmpresas

Esta pasta contém a documentação do backend API REST do MultEmpresas, com seções separadas por tema.

## Seções

- [Autenticação](auth.md)
- [Empresas](companies.md)
- [Planos](plans.md)
- [Usuários](users.md)
- [Auditoria](audit.md)

## Visão geral

A API foi organizada com as seguintes características:

- Multi-tenant em `Single Database + Shared Schema`.
- Tenant determinado pelo JWT (`company_id`).
- Papel de usuário: `MASTER`, `ADMIN`, `OPERATOR`.
- Swagger UI disponível em `/docs`.
- Especificação OpenAPI em `/swagger/openapi.json`.

## Como usar

Abra os arquivos acima para ver endpoints, permissões e observações específicas de cada módulo.
