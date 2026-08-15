-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authProvider" TEXT,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;
