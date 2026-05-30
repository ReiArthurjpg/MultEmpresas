# Autenticação

## Endpoints

### POST /auth/login
- Faz login com `email` e `password`.
- Retorna `access_token` e `refresh_token`.
- Não exige autenticação.

### POST /auth/refresh
- Renova o access token usando `refresh_token`.
- Não exige autenticação.

### POST /auth/logout
- Revoga o refresh token do usuário autenticado.
- Requer JWT válido.

## 2FA (TOTP)

### POST /auth/2fa/setup
- Gera segredo TOTP e `otpauth_url`.
- Atualiza `two_factor_secret` do usuário.
- Requer autenticação.

### POST /auth/2fa/verify
- Valida o código TOTP enviado.
- Requer autenticação.

### POST /auth/2fa/enable
- Habilita 2FA após verificação do código.
- Requer autenticação.

### POST /auth/2fa/disable
- Desabilita 2FA para usuários que não sejam `MASTER` ou `ADMIN`.
- Requer autenticação.

## Observações

- Os refresh tokens são persistidos e podem ser revogados no logout.
- O tenant é determinado pelo JWT, mas a autenticação em si é global.
- A senha é armazenada com `password_hash(..., PASSWORD_ARGON2ID)`.
