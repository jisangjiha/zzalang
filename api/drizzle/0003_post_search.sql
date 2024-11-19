DROP TABLE IF EXISTS `posts_content_fts`;

CREATE VIRTUAL TABLE `posts_content_fts` USING fts5(
    title,
    content,
    content='posts',
    content_rowid='id',
);

-- Insert all posts into the FTS table
INSERT INTO `posts_content_fts`(`rowid`, `title`, `content`)
SELECT `id`, `title`, `content` FROM `posts`;

-- Set up triggers to keep the FTS table up to date
DROP TRIGGER IF EXISTS `posts_ai`;
CREATE TRIGGER `posts_ai` AFTER INSERT ON `posts` BEGIN
    INSERT INTO `posts_content_fts`(`rowid`, `title`, `content`)
    VALUES (new.`id`, new.`title`, new.`content`);
END;

DROP TRIGGER IF EXISTS `posts_ad`;
CREATE TRIGGER `posts_ad` AFTER DELETE ON `posts` BEGIN
    INSERT INTO `posts_content_fts`(`posts_content_fts`, `rowid`, `title`, `content`) VALUES ('delete', old.`id`, old.`title`, old.`content`);
END;

DROP TRIGGER IF EXISTS `posts_au`;
CREATE TRIGGER `posts_au` AFTER UPDATE ON `posts` BEGIN
    INSERT INTO `posts_content_fts`(`posts_content_fts`, `rowid`, `title`, `content`) VALUES ('delete', old.`id`, old.`title`, old.`content`);
    INSERT INTO `posts_content_fts`(`rowid`, `title`, `content`) VALUES (new.`id`, new.`title`, new.`content`);
END;
