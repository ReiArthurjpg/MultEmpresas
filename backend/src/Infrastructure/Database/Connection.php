<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Infrastructure\Config\Env;
use PDO;

final class Connection
{
    public static function make(): PDO
    {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', Env::get('DB_HOST', 'mysql'), Env::get('DB_PORT', '3306'), Env::get('DB_DATABASE', 'multempresas'));
        return new PDO($dsn, (string) Env::get('DB_USERNAME', 'multempresas'), (string) Env::get('DB_PASSWORD', ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
}
