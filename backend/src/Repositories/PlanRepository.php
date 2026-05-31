<?php

declare(strict_types=1);

namespace App\Repositories;

final class PlanRepository extends BaseRepository
{
    public function all(): array
    {
        $plans = $this->pdo->query('SELECT * FROM plans ORDER BY id DESC')->fetchAll();
        foreach ($plans as &$plan) {
            $plan['permissions'] = $this->getPermissions((int) $plan['id']);
        }
        return $plans;
    }

    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM plans WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $plan = $stmt->fetch() ?: null;
        if ($plan) {
            $plan['permissions'] = $this->getPermissions($id);
        }
        return $plan;
    }

    private function getPermissions(int $planId): array
    {
        $stmt = $this->pdo->prepare('SELECT permission FROM plan_permissions WHERE plan_id = :id');
        $stmt->execute(['id' => $planId]);
        return $stmt->fetchAll(\PDO::FETCH_COLUMN) ?: [];
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
