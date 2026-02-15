-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "invitationCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "parentInvitationCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_invitationCode_key" ON "User"("invitationCode");

