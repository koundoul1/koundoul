-- Group Duels (3 or 4 players)
CREATE TABLE IF NOT EXISTS "group_duels" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "creatorId" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT 'Mathematiques',
    "level" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "timeLimit" INTEGER NOT NULL DEFAULT 600,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "maxPlayers" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "inviteCode" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 200,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "group_duels_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "group_duels_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "group_duels_inviteCode_key" ON "group_duels"("inviteCode");
CREATE INDEX IF NOT EXISTS "group_duels_status_idx" ON "group_duels"("status");

-- Group Duel Participants
CREATE TABLE IF NOT EXISTS "group_duel_participants" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "groupDuelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER,
    "answers" JSONB,
    "timeSpent" INTEGER,
    "completedAt" TIMESTAMP(3),
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "group_duel_participants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "group_duel_participants_groupDuelId_fkey" FOREIGN KEY ("groupDuelId") REFERENCES "group_duels"("id") ON DELETE CASCADE,
    CONSTRAINT "group_duel_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "group_duel_participants_groupDuelId_userId_key" ON "group_duel_participants"("groupDuelId", "userId");
