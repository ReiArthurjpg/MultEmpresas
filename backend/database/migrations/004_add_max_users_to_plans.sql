-- Incremental migration: add max_users to plans
ALTER TABLE `plans`
  ADD COLUMN IF NOT EXISTS `max_users` INT NOT NULL DEFAULT 0 AFTER `credits`;
