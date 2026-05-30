# Usuários

## Endpoints

### GET /users
- Lista usuários do tenant do usuário autenticado.
- Permitido para `MASTER` e `ADMIN`.

### POST /users
- Cria um usuário.
- Se o ator for `ADMIN`, o usuário criado tem automaticamente `company_id` do ator e `role` = `OPERATOR`.
- Senha é armazenada com Argon2id.
- Permitido para `MASTER` e `ADMIN`.

### GET /users/{id}
- Retorna dados do usuário por ID.
- Permitido para `MASTER` e `ADMIN`.

### PUT /users/{id}
- Atualiza dados do usuário.
- Se `password` for informado, ele é re-hashado com Argon2id.
- Permitido para `MASTER` e `ADMIN`.

### DELETE /users/{id}
- Remove um usuário.
- Permitido para `MASTER` e `ADMIN`.

## Observações

- `must_change_password` é usado para forçar troca de senha no primeiro login.
- `two_factor_enabled` e `two_factor_secret` controlam 2FA.
