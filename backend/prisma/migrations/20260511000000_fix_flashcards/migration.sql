-- Fix FlashcardReview: add unique constraint for userId+flashcardId
CREATE UNIQUE INDEX IF NOT EXISTS "flashcard_reviews_userId_flashcardId_key" ON "flashcard_reviews"("userId", "flashcardId");

-- Add chapter and isOfficial fields to flashcards
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "chapter" TEXT;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "isOfficial" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "createdById" TEXT REFERENCES "users"("id") ON DELETE SET NULL;

-- Add status field to flashcard_reviews for SM-2 tracking
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'new';

-- FlashcardDeck table for user custom decks
CREATE TABLE IF NOT EXISTS "flashcard_decks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "flashcard_decks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "flashcard_decks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "flashcard_decks_userId_idx" ON "flashcard_decks"("userId");

-- Add deckId to flashcard_reviews
ALTER TABLE "flashcard_reviews" ADD COLUMN IF NOT EXISTS "deckId" TEXT REFERENCES "flashcard_decks"("id") ON DELETE SET NULL;
