/*
  Warnings:

  - The `status` column on the `UserDetail` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('User', 'Seller', 'Admin');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('private', 'public', 'deactive');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'User';

-- AlterTable
ALTER TABLE "UserDetail" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'public';
