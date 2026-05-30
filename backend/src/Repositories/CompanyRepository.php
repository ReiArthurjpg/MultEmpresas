<?php

declare(strict_types=1);

namespace App\Repositories;

final class CompanyRepository extends BaseRepository
{
    public function all(array $actor): array
    {
        if (($actor['role'] ?? '') !== 'MASTER') {
            $stmt = $this->pdo->prepare('SELECT * FROM companies WHERE id = :id ORDER BY id DESC');
            $stmt->execute(['id' => $actor['company_id']]);
            return $stmt->fetchAll();
        }
        $stmt = $this->pdo->query('SELECT * FROM companies ORDER BY id DESC');
        return $stmt->fetchAll();
    }

    public function find(int $id, array $actor): ?array
    {
        if (($actor['role'] ?? '') !== 'MASTER' && (int) ($actor['company_id'] ?? 0) !== $id) {
            return null;
        }
        $stmt = $this->pdo->prepare('SELECT * FROM companies WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int
    {
        return $this->insert('companies', $data + ['created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);
    }

    public function save(int $id, array $data): void
    {
        $this->update('companies', $id, $data + ['updated_at' => date('Y-m-d H:i:s')]);
    }

    public function delete(int $id): void
    {
        $this->pdo->prepare('DELETE FROM companies WHERE id = :id')->execute(['id' => $id]);
    }
}
