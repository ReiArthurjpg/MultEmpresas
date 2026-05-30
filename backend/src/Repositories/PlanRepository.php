<?php

declare(strict_types=1);

namespace App\Repositories;

final class PlanRepository extends BaseRepository
{
    public function all(): array
    {
        return $this->pdo->query('SELECT * FROM plans ORDER BY id DESC')->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM plans WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int
    {
        return $this->insert('plans', $data + ['created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);
    }

    public function save(int $id, array $data): void
    {
        $this->update('plans', $id, $data + ['updated_at' => date('Y-m-d H:i:s')]);
    }

    public function delete(int $id): void
    {
        $this->pdo->prepare('DELETE FROM plans WHERE id = :id')->execute(['id' => $id]);
    }

    public function syncPermissions(int $planId, array $permissions): void
    {
        $this->pdo->prepare('DELETE FROM plan_permissions WHERE plan_id = :id')->execute(['id' => $planId]);
        foreach ($permissions as $permission) {
            $this->insert('plan_permissions', ['plan_id' => $planId, 'permission' => strtoupper((string) $permission)]);
        }
    }
}
