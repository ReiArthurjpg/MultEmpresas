<?php

declare(strict_types=1);

namespace App\Repositories;

final class AuditLogRepository extends BaseRepository
{
    public function write(?int $companyId, ?int $userId, string $action, string $entity, ?int $entityId, string $ip, string $userAgent): void
    {
        $this->insert('audit_logs', [
            'company_id' => $companyId,
            'user_id' => $userId,
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'ip' => $ip,
            'user_agent' => $userAgent,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    public function all(array $actor): array
    {
        [$where, $params] = $this->tenantWhere($actor, 'a');
        $sql = '
            SELECT a.id, a.company_id, a.user_id, a.action, a.entity, a.entity_id, a.ip, a.user_agent, a.created_at,
                   u.name AS user_name, u.email AS user_email,
                   c.company_name
            FROM audit_logs a
            LEFT JOIN users u ON u.id = a.user_id
            LEFT JOIN companies c ON c.id = a.company_id
            WHERE 1=1' . $where . '
            ORDER BY a.id DESC LIMIT 500
        ';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
