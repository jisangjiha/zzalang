ALTER TABLE `users` ADD `handle` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` blob NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email`;