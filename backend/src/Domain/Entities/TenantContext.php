<?php

declare(strict_types=1);

namespace App\Domain\Entities;

final readonly class TenantContext
{
    public function __construct(public int $userId, public ?int $companyId, public string $role) {}

    public function isMaster(): bool
    {
        return $this->role === 'MASTER';
    }
}
