<?php

declare(strict_types=1);

use App\Application\Services\AuthService;
use App\Infrastructure\Config\Env;
use App\Infrastructure\Database\Connection;
use App\Infrastructure\Http\Router;
use App\Infrastructure\Security\JwtService;
use App\Infrastructure\Security\TotpService;
use App\Middleware\AuthMiddleware;
use App\Repositories\AuditLogRepository;
use App\Repositories\CompanyRepository;
use App\Repositories\PlanRepository;
use App\Repositories\UserRepository;
use App\Shared\Response;

require __DIR__ . '/../bootstrap.php';
Env::load(__DIR__ . '/../.env');

$pdo = Connection::make();
$jwt = new JwtService();
$totp = new TotpService();
$audit = new AuditLogRepository($pdo);
$plans = new PlanRepository($pdo);
$companies = new CompanyRepository($pdo);
$users = new UserRepository($pdo);
$auth = new AuthService($pdo, $users, $audit, $jwt, $totp);
$authMiddleware = new AuthMiddleware($jwt);
$router = new Router();

$input = fn (): array => json_decode(file_get_contents('php://input') ?: '[]', true) ?: [];
$ip = fn (): string => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ua = fn (): string => $_SERVER['HTTP_USER_AGENT'] ?? '';
$actor = null;

$router->add('GET', '/', fn () => ['status' => 'ok', 'service' => 'MultEmpresas API'], false);
$router->add('GET', '/docs', fn () => file_get_contents(__DIR__ . '/../swagger/index.html'), false);
$router->add('GET', '/swagger/openapi.json', fn () => json_decode(file_get_contents(__DIR__ . '/../swagger/openapi.json'), true), false);
$router->add('POST', '/auth/login', fn () => $auth->login($input(), $ip(), $ua()), false);
$router->add('POST', '/auth/refresh', fn () => $auth->refresh((string) ($input()['refresh_token'] ?? '')), false);
$router->add('POST', '/auth/logout', function () use (&$actor, $pdo, $audit, $ip, $ua) {
    $pdo->prepare('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = :id AND revoked_at IS NULL')->execute(['id' => $actor['user_id']]);
    $audit->write($actor['company_id'], $actor['user_id'], 'LOGOUT', 'users', $actor['user_id'], $ip(), $ua());
    return ['message' => 'Logout realizado.'];
});

$router->add('POST', '/auth/2fa/setup', function () use (&$actor, $users, $totp) {
    $secret = $totp->secret();
    $users->save((int) $actor['user_id'], ['two_factor_secret' => $secret]);
    $user = $users->find((int) $actor['user_id'], ['role' => 'MASTER']);
    return ['secret' => $secret, 'otpauth_url' => $totp->provisioningUri((string) $user['email'], $secret), 'qr_code_url' => 'https://api.qrserver.com/v1/create-qr-code/?data=' . rawurlencode($totp->provisioningUri((string) $user['email'], $secret))];
});
$router->add('POST', '/auth/2fa/verify', function () use (&$actor, $users, $totp, $input) {
    $user = $users->byEmail((string) $users->find((int) $actor['user_id'], ['role' => 'MASTER'])['email']);
    return ['valid' => $totp->verify((string) $user['two_factor_secret'], (string) ($input()['code'] ?? ''))];
});
$router->add('POST', '/auth/2fa/enable', function () use (&$actor, $users, $totp, $input) {
    $user = $users->byEmail((string) $users->find((int) $actor['user_id'], ['role' => 'MASTER'])['email']);
    if (!$totp->verify((string) $user['two_factor_secret'], (string) ($input()['code'] ?? ''))) { throw new RuntimeException('Código TOTP inválido.'); }
    $users->save((int) $actor['user_id'], ['two_factor_enabled' => 1]);
    return ['message' => '2FA habilitado.'];
});
$router->add('POST', '/auth/2fa/disable', function () use (&$actor, $users) {
    if (in_array($actor['role'], ['MASTER', 'ADMIN'], true)) { throw new RuntimeException('2FA é obrigatório para MASTER e ADMIN.'); }
    $users->save((int) $actor['user_id'], ['two_factor_enabled' => 0, 'two_factor_secret' => null]);
    return ['message' => '2FA desabilitado.'];
});

$router->add('GET', '/plans', fn () => ['data' => $plans->all()], true, ['MASTER']);
$router->add('POST', '/plans', function () use ($plans, $input, &$actor, $audit, $ip, $ua) {
    $data = $input(); $permissions = $data['permissions'] ?? []; unset($data['permissions']);
    $id = $plans->create(['name' => $data['name'], 'description' => $data['description'] ?? null, 'price' => $data['price'] ?? 0, 'active' => $data['active'] ?? 1]);
    $plans->syncPermissions($id, $permissions); $audit->write(null, $actor['user_id'], 'CREATE', 'plans', $id, $ip(), $ua());
    return ['id' => $id];
}, true, ['MASTER']);
$router->add('GET', '/plans/{id}', fn ($p) => ['data' => $plans->find((int) $p['id'])], true, ['MASTER']);
$router->add('PUT', '/plans/{id}', function ($p) use ($plans, $input, &$actor, $audit, $ip, $ua) {
    $data = $input(); $permissions = $data['permissions'] ?? null; unset($data['permissions']); $plans->save((int) $p['id'], $data); if (is_array($permissions)) { $plans->syncPermissions((int) $p['id'], $permissions); }
    $audit->write(null, $actor['user_id'], 'UPDATE', 'plans', (int) $p['id'], $ip(), $ua()); return ['message' => 'Plano atualizado.'];
}, true, ['MASTER']);
$router->add('DELETE', '/plans/{id}', function ($p) use ($plans, &$actor, $audit, $ip, $ua) { $plans->delete((int) $p['id']); $audit->write(null, $actor['user_id'], 'DELETE', 'plans', (int) $p['id'], $ip(), $ua()); return ['message' => 'Plano removido.']; }, true, ['MASTER']);

$router->add('GET', '/companies', function () use ($companies, &$actor) { return ['data' => $companies->all($actor)]; }, true, ['MASTER','ADMIN']);
$router->add('POST', '/companies', function () use ($companies, $input, &$actor, $audit, $ip, $ua) { $data = $input(); $id = $companies->create($data + ['active' => 1]); $audit->write($id, $actor['user_id'], 'CREATE', 'companies', $id, $ip(), $ua()); return ['id' => $id]; }, true, ['MASTER']);
$router->add('GET', '/companies/{id}', function ($p) use ($companies, &$actor) { return ['data' => $companies->find((int) $p['id'], $actor)]; }, true, ['MASTER','ADMIN']);
$router->add('PUT', '/companies/{id}', function ($p) use ($companies, $input, &$actor, $audit, $ip, $ua) { $companies->save((int) $p['id'], $input()); $audit->write($actor['company_id'], $actor['user_id'], 'UPDATE', 'companies', (int) $p['id'], $ip(), $ua()); return ['message' => 'Empresa atualizada.']; }, true, ['MASTER','ADMIN']);
$router->add('DELETE', '/companies/{id}', function ($p) use ($companies, &$actor, $audit, $ip, $ua) { $companies->delete((int) $p['id']); $audit->write(null, $actor['user_id'], 'DELETE', 'companies', (int) $p['id'], $ip(), $ua()); return ['message' => 'Empresa removida.']; }, true, ['MASTER']);
$router->add('GET', '/companies/cnpj/{cnpj}', function ($p) {
    $cnpj = preg_replace('/\D/', '', (string) $p['cnpj']);
    if (strlen($cnpj) !== 14) { throw new RuntimeException('CNPJ inválido.'); }
    $url = rtrim((string) Env::get('CNPJ_API_URL'), '/') . '/' . $cnpj;
    $data = json_decode(file_get_contents($url) ?: '[]', true);
    if (($data['descricao_situacao_cadastral'] ?? '') !== 'ATIVA') { throw new RuntimeException('CNPJ não está ativo.'); }
    return ['data' => $data];
}, true, ['MASTER']);
$router->add('POST', '/companies/{id}/logo', function ($p) use ($companies, &$actor) {
    if (empty($_FILES['logo'])) { throw new RuntimeException('Arquivo logo obrigatório.'); }
    $file = $_FILES['logo']; $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = mime_content_type($file['tmp_name']); if (!isset($allowed[$mime])) { throw new RuntimeException('Formato inválido.'); }
    $name = 'company_' . (int) $p['id'] . '_' . bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
    move_uploaded_file($file['tmp_name'], __DIR__ . '/../storage/logos/' . $name);
    $companies->save((int) $p['id'], ['logo_url' => '/storage/logos/' . $name]);
    return ['logo_url' => '/storage/logos/' . $name];
}, true, ['MASTER','ADMIN']);

$router->add('GET', '/users', function () use ($users, &$actor) { return ['data' => $users->all($actor)]; }, true, ['MASTER','ADMIN']);
$router->add('POST', '/users', function () use ($users, $input, &$actor, $audit, $ip, $ua) {
    $data = $input(); if ($actor['role'] === 'ADMIN') { $data['company_id'] = $actor['company_id']; $data['role'] = 'OPERATOR'; }
    $data['password'] = password_hash((string) $data['password'], PASSWORD_ARGON2ID); $data += ['active' => 1, 'two_factor_enabled' => 0, 'must_change_password' => 1];
    $id = $users->create($data); $audit->write($data['company_id'] ?? null, $actor['user_id'], 'CREATE', 'users', $id, $ip(), $ua()); return ['id' => $id];
}, true, ['MASTER','ADMIN']);
$router->add('GET', '/users/{id}', function ($p) use ($users, &$actor) { return ['data' => $users->find((int) $p['id'], $actor)]; }, true, ['MASTER','ADMIN']);
$router->add('PUT', '/users/{id}', function ($p) use ($users, $input, &$actor, $audit, $ip, $ua) { $data = $input(); if (isset($data['password'])) { $data['password'] = password_hash((string) $data['password'], PASSWORD_ARGON2ID); } $users->save((int) $p['id'], $data); $audit->write($actor['company_id'], $actor['user_id'], 'UPDATE', 'users', (int) $p['id'], $ip(), $ua()); return ['message' => 'Usuário atualizado.']; }, true, ['MASTER','ADMIN']);
$router->add('DELETE', '/users/{id}', function ($p) use ($users, &$actor, $audit, $ip, $ua) { $users->delete((int) $p['id']); $audit->write($actor['company_id'], $actor['user_id'], 'DELETE', 'users', (int) $p['id'], $ip(), $ua()); return ['message' => 'Usuário removido.']; }, true, ['MASTER','ADMIN']);
$router->add('GET', '/audit-logs', function () use ($audit, &$actor) { return ['data' => $audit->all($actor)]; }, true, ['MASTER','ADMIN']);

try {
    [$route, $params] = $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
    if ($route['auth'] ?? true) { $actor = $authMiddleware->actor(); $authMiddleware->requireRoles($actor, $route['roles'] ?? []); }
    $result = ($route['handler'])($params);
    if (is_string($result)) { header('Content-Type: text/html; charset=utf-8'); echo $result; exit; }
    Response::json($result, $route['status'] ?? 200);
} catch (Throwable $e) {
    Response::json(['error' => $e->getMessage()], 400);
}
