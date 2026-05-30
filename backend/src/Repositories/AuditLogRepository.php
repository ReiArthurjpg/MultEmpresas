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
        [$where, $params] = $this->tenantWhere($actor);
        $stmt = $this->pdo->prepare('SELECT * FROM audit_logs WHERE 1=1' . $where . ' ORDER BY id DESC LIMIT 500');
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
