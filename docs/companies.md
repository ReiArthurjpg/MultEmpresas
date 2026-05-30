# Empresas

## Endpoints

### GET /companies
- Lista empresas.
- Permitido para `MASTER` e `ADMIN`.

### POST /companies
- Cria uma nova empresa.
- Permitido apenas para `MASTER`.

### GET /companies/{id}
- Retorna dados da empresa por ID.
- Permitido para `MASTER` e `ADMIN`.

### PUT /companies/{id}
- Atualiza dados da empresa.
- Permitido para `MASTER` e `ADMIN`.

### DELETE /companies/{id}
- Remove uma empresa.
- Permitido apenas para `MASTER`.

### GET /companies/cnpj/{cnpj}
- Consulta dados de CNPJ via API externa (`CNPJ_API_URL`).
- Retorna erro se o CNPJ não estiver ativo.
- Permitido apenas para `MASTER`.

### POST /companies/{id}/logo
- Faz upload de logo (`image/jpeg`, `image/png`, `image/webp`).
- Atualiza o campo `logo_url` da empresa.
- Permitido para `MASTER` e `ADMIN`.

## Observações

- As empresas são usadas para estabelecer o escopo de tenant em `ADMIN` e `OPERATOR`.
- Os uploads de logo são salvos em `storage/logos/`.
- O campo `company_id` é aplicado automaticamente nos repositórios conforme o JWT.
