-- Incremental migration: add max_installments to plans
-- Use this to update existing databases without editing the initial migration
ALTER TABLE `plans`
  ADD COLUMN IF NOT EXISTS `max_installments` INT NOT NULL DEFAULT 1 AFTER `price`;
