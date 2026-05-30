# Backend MultEmpresas

## Princípios

- API First e desacoplada de frontend.
- Single Database + Shared Schema para multi-tenancy.
- Todas as entidades transacionais possuem `company_id` quando aplicável.
- MASTER pode operar globalmente; ADMIN e OPERATOR são isolados por empresa.

## Segurança

- Senhas com `password_hash(..., PASSWORD_ARGON2ID)`.
- Access token JWT configurável por `ACCESS_TOKEN_EXPIRE`.
- Refresh token persistido por hash SHA-256.
- Rate limit de login por IP.
- TOTP compatível com Google Authenticator.

## Endpoints principais

Consulte `/docs` para a especificação OpenAPI completa.
