<?php

declare(strict_types=1);

use App\Infrastructure\Config\Env;
use App\Infrastructure\Database\Connection;

require __DIR__ . '/../../../bootstrap.php';
Env::load(__DIR__ . '/../../../.env');
$pdo = Connection::make();
foreach (glob(__DIR__ . '/../../../database/seeders/*.sql') as $file) {
    $pdo->exec(file_get_contents($file));
    echo 'Seeded: ' . basename($file) . PHP_EOL;
}
$password = password_hash('Master@123', PASSWORD_ARGON2ID);
$stmt = $pdo->prepare("INSERT INTO users (company_id, name, email, password, role, active, two_factor_enabled, must_change_password, created_at, updated_at)
VALUES (NULL, 'Master System', 'master@system.local', :password, 'MASTER', 1, 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE must_change_password = 1");
$stmt->execute(['password' => $password]);
echo "Seeded master user: master@system.local / Master@123" . PHP_EOL;
