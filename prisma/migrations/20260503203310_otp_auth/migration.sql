/*
  Warnings:

  - Made the column `phone` on table `ParentAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "PhoneOTP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ParentAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ParentAccount" ("createdAt", "email", "id", "isVerified", "name", "passwordHash", "phone", "updatedAt") SELECT "createdAt", "email", "id", "isVerified", "name", "passwordHash", "phone", "updatedAt" FROM "ParentAccount";
DROP TABLE "ParentAccount";
ALTER TABLE "new_ParentAccount" RENAME TO "ParentAccount";
CREATE UNIQUE INDEX "ParentAccount_phone_key" ON "ParentAccount"("phone");
CREATE UNIQUE INDEX "ParentAccount_email_key" ON "ParentAccount"("email");
CREATE INDEX "ParentAccount_phone_idx" ON "ParentAccount"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PhoneOTP_phone_idx" ON "PhoneOTP"("phone");
