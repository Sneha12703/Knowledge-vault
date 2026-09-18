-- Run this against an empty database to create all required tables.

CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tags (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    content     TEXT NOT NULL,
    category_id INT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notes_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE SET NULL,
    FULLTEXT KEY ft_notes_title_content (title, content)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS note_tags (
    note_id     INT NOT NULL,
    tag_id      INT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT fk_note_tags_note FOREIGN KEY (note_id)
        REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_tags_tag FOREIGN KEY (tag_id)
        REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes to speed up common lookups/filters
CREATE INDEX idx_notes_category_id ON notes(category_id);
CREATE INDEX idx_notes_updated_at  ON notes(updated_at DESC);
CREATE INDEX idx_note_tags_tag_id  ON note_tags(tag_id);

-- Predefined categories
INSERT IGNORE INTO categories (name) VALUES
    ('Programming'),
    ('AWS'),
    ('Databases'),
    ('System Design'),
    ('Books'),
    ('Ideas'),
    ('Other');
