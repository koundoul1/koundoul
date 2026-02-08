-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastStreakDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "subject" TEXT,
    "level" TEXT,
    "options" JSONB,
    "correctAnswer" INTEGER,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankId" TEXT,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "subject" TEXT,
    "level" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardReview" (
    "id" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashcardReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "questions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeAttempt" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER,
    "answers" JSONB NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ChallengeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duel" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "questions" JSONB,
    "winnerId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Duel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuelParticipation" (
    "id" TEXT NOT NULL,
    "duelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "answers" JSONB,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DuelParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolverHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "subject" TEXT,
    "level" TEXT,
    "solution" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolverHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumDiscussion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "subject" TEXT,
    "level" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "bestAnswerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReply" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "isBestAnswer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroLessonCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MicroLessonCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "equation" TEXT NOT NULL,
    "guidanceLevel" TEXT NOT NULL,
    "steps" JSONB,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CoachSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE INDEX "Badge_category_idx" ON "Badge"("category");

-- CreateIndex
CREATE INDEX "QuestionBank_subject_level_idx" ON "QuestionBank"("subject", "level");

-- CreateIndex
CREATE INDEX "QuestionBank_type_idx" ON "QuestionBank"("type");

-- CreateIndex
CREATE INDEX "Question_bankId_idx" ON "Question"("bankId");

-- CreateIndex
CREATE INDEX "Question_subject_level_idx" ON "Question"("subject", "level");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "QuizAttempt_bankId_idx" ON "QuizAttempt"("bankId");

-- CreateIndex
CREATE INDEX "Flashcard_userId_idx" ON "Flashcard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardReview_flashcardId_userId_key" ON "FlashcardReview"("flashcardId", "userId");

-- CreateIndex
CREATE INDEX "FlashcardReview_userId_nextReview_idx" ON "FlashcardReview"("userId", "nextReview");

-- CreateIndex
CREATE INDEX "Challenge_isActive_startDate_endDate_idx" ON "Challenge"("isActive", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "ChallengeAttempt_challengeId_score_idx" ON "ChallengeAttempt"("challengeId", "score");

-- CreateIndex
CREATE INDEX "ChallengeAttempt_userId_idx" ON "ChallengeAttempt"("userId");

-- CreateIndex
CREATE INDEX "Duel_challengerId_opponentId_idx" ON "Duel"("challengerId", "opponentId");

-- CreateIndex
CREATE INDEX "Duel_status_idx" ON "Duel"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DuelParticipation_duelId_userId_key" ON "DuelParticipation"("duelId", "userId");

-- CreateIndex
CREATE INDEX "DuelParticipation_userId_idx" ON "DuelParticipation"("userId");

-- CreateIndex
CREATE INDEX "SolverHistory_userId_idx" ON "SolverHistory"("userId");

-- CreateIndex
CREATE INDEX "SolverHistory_subject_level_idx" ON "SolverHistory"("subject", "level");

-- CreateIndex
CREATE INDEX "ForumDiscussion_userId_idx" ON "ForumDiscussion"("userId");

-- CreateIndex
CREATE INDEX "ForumDiscussion_subject_level_idx" ON "ForumDiscussion"("subject", "level");

-- CreateIndex
CREATE INDEX "ForumDiscussion_createdAt_idx" ON "ForumDiscussion"("createdAt");

-- CreateIndex
CREATE INDEX "ForumReply_discussionId_idx" ON "ForumReply"("discussionId");

-- CreateIndex
CREATE INDEX "ForumReply_userId_idx" ON "ForumReply"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MicroLessonCompletion_userId_lessonId_key" ON "MicroLessonCompletion"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "MicroLessonCompletion_userId_idx" ON "MicroLessonCompletion"("userId");

-- CreateIndex
CREATE INDEX "MicroLessonCompletion_lessonId_idx" ON "MicroLessonCompletion"("lessonId");

-- CreateIndex
CREATE INDEX "CoachSession_userId_idx" ON "CoachSession"("userId");

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "QuestionBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuelParticipation" ADD CONSTRAINT "DuelParticipation_duelId_fkey" FOREIGN KEY ("duelId") REFERENCES "Duel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuelParticipation" ADD CONSTRAINT "DuelParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolverHistory" ADD CONSTRAINT "SolverHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumDiscussion" ADD CONSTRAINT "ForumDiscussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReply" ADD CONSTRAINT "ForumReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "ForumDiscussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReply" ADD CONSTRAINT "ForumReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroLessonCompletion" ADD CONSTRAINT "MicroLessonCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSession" ADD CONSTRAINT "CoachSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

