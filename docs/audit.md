# Auditoria

## Endpoints

### GET /audit-logs
- Lista registros de auditoria.
- Permitido para `MASTER` e `ADMIN`.

## Observações

- Os logs de auditoria acompanham ações como criação, atualização e exclusão de entidades.
- O `company_id` do ator é aplicado para limitar o escopo de visualização quando necessário.
