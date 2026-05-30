<?php

declare(strict_types=1);

namespace App\Infrastructure\Config;

final class Env
{
    private static array $values = [];

    public static function load(string $path): void
    {
        if (!is_file($path)) {
            return;
        }
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = array_map('trim', explode('=', $line, 2));
            $value = trim($value, "\"'");
            self::$values[$key] = $value;
            $_ENV[$key] = $_ENV[$key] ?? $value;
            putenv($key . '=' . $value);
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return $_ENV[$key] ?? getenv($key) ?: self::$values[$key] ?? $default;
    }
}
