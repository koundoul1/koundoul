-- AlterTable: add subject and level columns to discussions
ALTER TABLE "discussions" ADD COLUMN "subject" TEXT;
ALTER TABLE "discussions" ADD COLUMN "level" TEXT;

-- AlterTable: add default cuid to discussion_votes and reply_votes
-- (existing rows without id are not expected; column already has @id but no default)
-- These ALTER are no-ops in PostgreSQL since DEFAULT only applies to future inserts
-- but Prisma needs the column to accept auto-generation at the ORM level.
-- No SQL change needed for @default(cuid()) — Prisma generates the value in JS.
