INSERT INTO plans (id, name, description, price, active, created_at, updated_at)
VALUES (1, 'Enterprise', 'Plano inicial com permissões administrativas.', 0.00, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT IGNORE INTO plan_permissions (plan_id, permission) VALUES
(1, 'CREATE_USERS'), (1, 'CREATE_CLIENTS'), (1, 'CREATE_ORDERS'), (1, 'VIEW_REPORTS'), (1, 'EXPORT_DATA');
