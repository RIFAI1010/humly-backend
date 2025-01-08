-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT;

-- AlterTable
ALTER TABLE "UserDetail" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "bio" DROP NOT NULL;
