-- Add width/height columns to media_items so images can render at their natural aspect ratio.
-- Nullable: existing rows (and audio items) have NULL dimensions.
alter table media_items
  add column width integer,
  add column height integer;
