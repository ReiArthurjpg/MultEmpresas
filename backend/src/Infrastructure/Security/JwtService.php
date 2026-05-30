<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Infrastructure\Config\Env;
use RuntimeException;

final class JwtService
{
    public function issue(array $claims, string $ttl): string
    {
        $now = time();
        $payload = array_merge($claims, ['iat' => $now, 'exp' => $now + $this->seconds($ttl)]);
        return $this->encode(['typ' => 'JWT', 'alg' => 'HS256'], $payload);
    }

    public function verify(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Token JWT inválido.');
        }
        [$head, $body, $sig] = $parts;
        $expected = $this->b64(hash_hmac('sha256', $head . '.' . $body, $this->secret(), true));
        if (!hash_equals($expected, $sig)) {
            throw new RuntimeException('Assinatura JWT inválida.');
        }
        $payload = json_decode($this->unb64($body), true, 512, JSON_THROW_ON_ERROR);
        if (($payload['exp'] ?? 0) < time()) {
            throw new RuntimeException('Token JWT expirado.');
        }
        return $payload;
    }

    private function encode(array $header, array $payload): string
    {
        $head = $this->b64(json_encode($header, JSON_THROW_ON_ERROR));
        $body = $this->b64(json_encode($payload, JSON_THROW_ON_ERROR));
        return $head . '.' . $body . '.' . $this->b64(hash_hmac('sha256', $head . '.' . $body, $this->secret(), true));
    }

    private function secret(): string
    {
        return (string) Env::get('JWT_SECRET', 'change-me');
    }

    private function seconds(string $ttl): int
    {
        $unit = substr($ttl, -1);
        $value = (int) substr($ttl, 0, -1);
        return match ($unit) {'m' => $value * 60, 'h' => $value * 3600, 'd' => $value * 86400, default => (int) $ttl};
    }

    private function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function unb64(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }
}
