# Planos

## Endpoints

### GET /plans
- Lista todos os planos.
- Permitido apenas para `MASTER`.

### POST /plans
- Cria um plano com campos:
  - `name`
  - `description`
  - `price`
  - `active`
  - `permissions`
- Permitido apenas para `MASTER`.

### GET /plans/{id}
- Retorna dados de um plano específico.
- Permitido apenas para `MASTER`.

### PUT /plans/{id}
- Atualiza um plano e sincroniza permissões.
- Permitido apenas para `MASTER`.

### DELETE /plans/{id}
- Remove um plano.
- Permitido apenas para `MASTER`.

## Observações

- Os planos têm permissões associadas, que são armazenadas e sincronizadas separadamente.
- Apenas `MASTER` pode gerenciar planos.
