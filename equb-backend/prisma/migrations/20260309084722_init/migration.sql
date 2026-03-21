-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "EqubStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('PENDING', 'COLLECTING', 'PAID');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'PAID', 'LATE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equb" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contributionGoldGram" DECIMAL(10,3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "totalMembers" INTEGER NOT NULL,
    "totalRounds" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "EqubStatus" NOT NULL DEFAULT 'PENDING',
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EqubMember" (
    "id" SERIAL NOT NULL,
    "equbId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payoutOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EqubMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "equbId" INTEGER NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "payoutGoldGram" DECIMAL(10,3) NOT NULL,
    "roundDate" TIMESTAMP(3) NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" SERIAL NOT NULL,
    "equbId" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "goldGram" DECIMAL(10,3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" SERIAL NOT NULL,
    "equbId" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "totalGoldGram" DECIMAL(10,3) NOT NULL,
    "payoutDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldPrice" (
    "id" SERIAL NOT NULL,
    "pricePerGram" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EqubMember_equbId_userId_key" ON "EqubMember"("equbId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_equbId_roundNumber_key" ON "Round"("equbId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_roundId_userId_key" ON "Contribution"("roundId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_roundId_key" ON "Payout"("roundId");

-- AddForeignKey
ALTER TABLE "Equb" ADD CONSTRAINT "Equb_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EqubMember" ADD CONSTRAINT "EqubMember_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "Equb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EqubMember" ADD CONSTRAINT "EqubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "Equb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "Equb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "Equb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
