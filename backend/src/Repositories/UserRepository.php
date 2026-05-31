<?php

declare(strict_types=1);

namespace App\Repositories;

final class UserRepository extends BaseRepository
{
    public function byEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT u.*, c.company_name, c.logo_url, c.active AS company_active FROM users u LEFT JOIN companies c ON c.id = u.company_id WHERE u.email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        return $stmt->fetch() ?: null;
    }

    public function all(array $actor): array
    {
        [$where, $params] = $this->tenantWhere($actor, 'u');
        $stmt = $this->pdo->prepare('SELECT u.id,u.company_id,u.name,u.email,u.role,u.avatar,u.active,u.two_factor_enabled,u.must_change_password,u.created_at,u.updated_at,c.company_name FROM users u LEFT JOIN companies c ON c.id = u.company_id WHERE 1=1' . $where . ' ORDER BY u.id DESC');
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function find(int $id, array $actor): ?array
    {
        [$where, $params] = $this->tenantWhere($actor, 'u');
        $stmt = $this->pdo->prepare('SELECT u.id,u.company_id,u.name,u.email,u.role,u.avatar,u.active,u.two_factor_enabled,u.must_change_password,u.created_at,u.updated_at,c.company_name FROM users u LEFT JOIN companies c ON c.id = u.company_id WHERE u.id = :id' . $where);
        $stmt->execute(['id' => $id] + $params);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int
    {
        return $this->insert('users', $data + ['created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);
    }

    public function save(int $id, array $data): void
    {
        $this->update('users', $id, $data + ['updated_at' => date('Y-m-d H:i:s')]);
    }

    public function delete(int $id): void
    {
        $this->pdo->prepare('DELETE FROM users WHERE id = :id')->execute(['id' => $id]);
    }
}
