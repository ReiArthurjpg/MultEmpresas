<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

abstract class BaseRepository
{
    public function __construct(protected PDO $pdo) {}

    protected function tenantWhere(array $actor, string $alias = ''): array
    {
        if (($actor['role'] ?? '') === 'MASTER') {
            return ['', []];
        }
        $prefix = $alias === '' ? '' : $alias . '.';
        return [" AND {$prefix}company_id = :tenant_company_id", ['tenant_company_id' => $actor['company_id']]];
    }

    protected function insert(string $table, array $data): int
    {
        $columns = array_keys($data);
        $sql = sprintf('INSERT INTO %s (%s) VALUES (%s)', $table, implode(',', $columns), ':' . implode(',:', $columns));
        $this->pdo->prepare($sql)->execute($data);
        return (int) $this->pdo->lastInsertId();
    }

    protected function update(string $table, int $id, array $data): void
    {
        $sets = implode(', ', array_map(fn ($column) => $column . ' = :' . $column, array_keys($data)));
        $data['id'] = $id;
        $this->pdo->prepare("UPDATE {$table} SET {$sets} WHERE id = :id")->execute($data);
    }
}
