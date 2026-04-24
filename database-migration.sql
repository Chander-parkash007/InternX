-- Database Migration Script
-- Date: April 24, 2026
-- Purpose: Add support for notification deep-linking and post reactions

-- ============================================================================
-- 1. Add notification deep-linking fields
-- ============================================================================
-- These fields allow notifications to link to specific posts, tasks, or connections

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_entity_id BIGINT,
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_entity 
ON notifications(related_entity_id, entity_type);

COMMENT ON COLUMN notifications.related_entity_id IS 'ID of the related post, task, or connection';
COMMENT ON COLUMN notifications.entity_type IS 'Type of entity: POST, TASK, CONNECTION, etc.';

-- ============================================================================
-- 2. Add post reaction type support
-- ============================================================================
-- This field stores the emoji reaction (👍, ❤️, 😂, 😮, 😢, 🎉)

ALTER TABLE post_likes 
ADD COLUMN IF NOT EXISTS reaction_type VARCHAR(10) DEFAULT '👍';

-- Update existing records to have default reaction
UPDATE post_likes 
SET reaction_type = '👍' 
WHERE reaction_type IS NULL;

COMMENT ON COLUMN post_likes.reaction_type IS 'Emoji reaction: 👍, ❤️, 😂, 😮, 😢, 🎉';

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify notifications table structure
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Verify post_likes table structure
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'post_likes'
ORDER BY ordinal_position;

-- Check if indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('notifications', 'post_likes')
ORDER BY tablename, indexname;

-- ============================================================================
-- Rollback Script (if needed)
-- ============================================================================

-- CAUTION: Only run this if you need to rollback the changes

-- ALTER TABLE notifications 
-- DROP COLUMN IF EXISTS related_entity_id,
-- DROP COLUMN IF EXISTS entity_type;

-- DROP INDEX IF EXISTS idx_notifications_entity;

-- ALTER TABLE post_likes 
-- DROP COLUMN IF EXISTS reaction_type;

-- ============================================================================
-- Notes
-- ============================================================================

-- 1. If using JPA with spring.jpa.hibernate.ddl-auto=update, these columns
--    will be created automatically on application startup.
--
-- 2. The reaction_type field stores UTF-8 emoji characters. Ensure your
--    database encoding supports UTF-8 (e.g., UTF8 or UTF8MB4 for MySQL).
--
-- 3. The related_entity_id is nullable because not all notifications
--    have a related entity (e.g., system notifications).
--
-- 4. The entity_type helps the frontend determine where to navigate when
--    a notification is clicked (POST → /feed, TASK → /tasks, etc.).
--
-- 5. Existing post_likes will have reaction_type = '👍' (thumbs up) by default.

-- ============================================================================
-- End of Migration Script
-- ============================================================================
