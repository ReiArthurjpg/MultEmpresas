<?php

declare(strict_types=1);

namespace App\Application\Services;

use App\Infrastructure\Config\Env;
use App\Infrastructure\Security\JwtService;
use App\Infrastructure\Security\TotpService;
use App\Repositories\AuditLogRepository;
use App\Repositories\UserRepository;
use PDO;
use RuntimeException;

final class AuthService
{
    public function __construct(private PDO $pdo, private UserRepository $users, private AuditLogRepository $audit, private JwtService $jwt, private TotpService $totp) {}

    public function login(array $input, string $ip, string $ua): array
    {
        $this->checkRateLimit($ip);
        $user = $this->users->byEmail((string) ($input['email'] ?? ''));
        if (!$user || !password_verify((string) ($input['password'] ?? ''), (string) $user['password']) || !(bool) $user['active']) {
            $this->registerFailedAttempt($ip);
            throw new RuntimeException('Credenciais inválidas.');
        }
        $roleRequires2fa = in_array($user['role'], ['MASTER', 'ADMIN'], true);
        if ($roleRequires2fa && empty($user['two_factor_secret'])) {
            $twoFactorSetupRequired = true;
        } elseif (($roleRequires2fa || (bool) $user['two_factor_enabled']) && empty($input['totp_code'])) {
            return ['two_factor_required' => true, 'message' => 'Informe o código TOTP para concluir o login.'];
        }
        if (!empty($input['totp_code']) && !empty($user['two_factor_secret']) && !$this->totp->verify($user['two_factor_secret'], (string) $input['totp_code'])) {
            throw new RuntimeException('Código TOTP inválido.');
        }
        $claims = ['user_id' => (int) $user['id'], 'company_id' => $user['company_id'] !== null ? (int) $user['company_id'] : null, 'role' => $user['role']];
        $refresh = bin2hex(random_bytes(40));
        $this->pdo->prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) VALUES (:user_id,:token_hash,:expires_at,:created_at)')->execute([
            'user_id' => $user['id'], 'token_hash' => hash('sha256', $refresh), 'expires_at' => date('Y-m-d H:i:s', time() + $this->seconds((string) Env::get('REFRESH_TOKEN_EXPIRE', '30d'))), 'created_at' => date('Y-m-d H:i:s'),
        ]);
        $this->audit->write($claims['company_id'], $claims['user_id'], 'LOGIN', 'users', $claims['user_id'], $ip, $ua);
        return [
            'access_token' => $this->jwt->issue($claims, (string) Env::get('ACCESS_TOKEN_EXPIRE', '15m')),
            'refresh_token' => $refresh,
            'user' => ['id' => (int) $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role'], 'must_change_password' => (bool) $user['must_change_password']],
            'company' => $user['company_id'] ? ['id' => (int) $user['company_id'], 'name' => $user['company_name'], 'logo_url' => $user['logo_url']] : null,
            'two_factor_setup_required' => $twoFactorSetupRequired ?? false,
        ];
    }

    public function refresh(string $token): array
    {
        $stmt = $this->pdo->prepare('SELECT rt.*, u.company_id, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token_hash = :hash AND rt.revoked_at IS NULL AND rt.expires_at > NOW()');
        $stmt->execute(['hash' => hash('sha256', $token)]);
        $row = $stmt->fetch();
        if (!$row) { throw new RuntimeException('Refresh token inválido.'); }
        return ['access_token' => $this->jwt->issue(['user_id' => (int) $row['user_id'], 'company_id' => $row['company_id'] !== null ? (int) $row['company_id'] : null, 'role' => $row['role']], (string) Env::get('ACCESS_TOKEN_EXPIRE', '15m'))];
    }

    private function checkRateLimit(string $ip): void
    {
        $limit = (int) Env::get('LOGIN_RATE_LIMIT', 12);
        $stmt = $this->pdo->prepare('SELECT COUNT(*) AS total FROM login_attempts WHERE ip = :ip AND success = 0 AND created_at > DATE_SUB(NOW(), INTERVAL :seconds SECOND)');
        $stmt->bindValue('ip', $ip);
        $stmt->bindValue('seconds', (int) Env::get('LOGIN_BLOCK_SECONDS', 900), PDO::PARAM_INT);
        $stmt->execute();
        if ((int) $stmt->fetchColumn() >= $limit) { throw new RuntimeException('Muitas tentativas. Tente novamente mais tarde.'); }
    }

    private function registerFailedAttempt(string $ip): void
    {
        $this->pdo->prepare('INSERT INTO login_attempts (ip, success, created_at) VALUES (:ip, 0, NOW())')->execute(['ip' => $ip]);
    }

    private function seconds(string $ttl): int
    {
        $unit = substr($ttl, -1); $value = (int) substr($ttl, 0, -1);
        return match ($unit) {'m' => $value * 60, 'h' => $value * 3600, 'd' => $value * 86400, default => (int) $ttl};
    }
}
