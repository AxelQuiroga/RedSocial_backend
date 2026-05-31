-- AlterTable: Add profile fields to User table
ALTER TABLE "User" ADD COLUMN "displayName" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "coverUrl" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "website" TEXT;
