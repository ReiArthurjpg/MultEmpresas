# Backend MultEmpresas

## Documentação separada por tema

A documentação do backend foi dividida em arquivos temáticos para facilitar a leitura e a manutenção.

- [Autenticação](auth.md)
- [Empresas](companies.md)
- [Planos](plans.md)
- [Usuários](users.md)
- [Auditoria](audit.md)

## Como navegar

Abra qualquer um dos arquivos acima para ver detalhes de endpoints, permissões e observações específicas.

## Observações gerais

- O tenant é determinado pelo JWT e aplicado nos repositórios de `users`, `companies` e auditoria.
- `MASTER` tem acesso global; `ADMIN` e `OPERATOR` são restritos à própria empresa.
- A API de Swagger está disponível internamente em `/docs`.
- A especificação OpenAPI está em `/swagger/openapi.json`.
