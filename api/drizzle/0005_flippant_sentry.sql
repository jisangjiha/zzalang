CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `categories` (`id`, `createdAt`, `updatedAt`, `title`, `description`) 
VALUES (1, unixepoch(), unixepoch(), '기본', '기본 카테고리');
--> statement-breakpoint
ALTER TABLE `posts` ADD `categoryId` integer;
--> statement-breakpoint
UPDATE `posts` SET `categoryId` = 1 WHERE `categoryId` IS NULL;
--> statement-breakpoint
CREATE INDEX `category_index` ON `posts` (`categoryId`);
