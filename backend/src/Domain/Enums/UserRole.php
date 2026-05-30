<?php

declare(strict_types=1);

namespace App\Domain\Enums;

enum UserRole: string
{
    case MASTER = 'MASTER';
    case ADMIN = 'ADMIN';
    case OPERATOR = 'OPERATOR';
}
