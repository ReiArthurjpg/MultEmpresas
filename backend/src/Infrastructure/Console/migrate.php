<?php

declare(strict_types=1);

use App\Infrastructure\Config\Env;
use App\Infrastructure\Database\Connection;

require __DIR__ . '/../../../bootstrap.php';
Env::load(__DIR__ . '/../../../.env');
$pdo = Connection::make();
foreach (glob(__DIR__ . '/../../../database/migrations/*.sql') as $file) {
    $pdo->exec(file_get_contents($file));
    echo 'Migrated: ' . basename($file) . PHP_EOL;
}
