<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Infrastructure\Security\JwtService;
use RuntimeException;

final class AuthMiddleware
{
    public function __construct(private JwtService $jwt) {}

    public function actor(): array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            throw new RuntimeException('Token Bearer obrigatório.');
        }
        return $this->jwt->verify($matches[1]);
    }

    public function requireRoles(array $actor, array $roles): void
    {
        if ($roles !== [] && !in_array($actor['role'] ?? '', $roles, true)) {
            throw new RuntimeException('Permissão insuficiente.');
        }
    }
}
