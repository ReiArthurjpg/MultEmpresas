<?php

declare(strict_types=1);

namespace App\Infrastructure\Http;

final class Router
{
    private array $routes = [];

    public function add(string $method, string $path, callable $handler, bool $auth = true, array $roles = []): void
    {
        $this->routes[] = compact('method', 'path', 'handler', 'auth', 'roles');
    }

    public function dispatch(string $method, string $uri): array
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        foreach ($this->routes as $route) {
            $pattern = '#^' . preg_replace('#\{([a-zA-Z_]+)\}#', '(?P<$1>[^/]+)', $route['path']) . '$#';
            if ($route['method'] === $method && preg_match($pattern, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                return [$route, $params];
            }
        }
        return [['handler' => fn () => ['error' => 'Rota não encontrada'], 'auth' => false, 'roles' => [], 'status' => 404], []];
    }
}
