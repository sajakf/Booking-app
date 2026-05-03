/*
  Warnings:

  - You are about to drop the column `amountKwd` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `childNameAr` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `childNameEn` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `confirmationSmsSentAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `parentCivilId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `priceKwd` on the `Session` table. All the data in the column will be lost.
  - Added the required column `childName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountKwd` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineItemsJson` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalKwd` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalKwd` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerDay` to the `Classroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatsTotal` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingRef" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lineItemsJson" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "childAge" INTEGER NOT NULL,
    "childGender" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "hasSibling" BOOLEAN NOT NULL DEFAULT false,
    "promoCode" TEXT,
    "medicalNotes" TEXT,
    "subtotalKwd" DECIMAL NOT NULL,
    "discountKwd" DECIMAL NOT NULL,
    "totalKwd" DECIMAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'INITIATED',
    "paymentId" TEXT,
    "invoiceId" TEXT,
    "paidAt" DATETIME,
    "confirmationEmailSentAt" DATETIME,
    "confirmationWhatsappSentAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Booking" ("bookingRef", "childAge", "childGender", "confirmationEmailSentAt", "confirmationWhatsappSentAt", "createdAt", "id", "invoiceId", "notes", "paidAt", "parentEmail", "parentName", "parentPhone", "paymentId", "paymentStatus", "status", "updatedAt") SELECT "bookingRef", "childAge", "childGender", "confirmationEmailSentAt", "confirmationWhatsappSentAt", "createdAt", "id", "invoiceId", "notes", "paidAt", "parentEmail", "parentName", "parentPhone", "paymentId", "paymentStatus", "status", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_bookingRef_key" ON "Booking"("bookingRef");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_parentEmail_idx" ON "Booking"("parentEmail");
CREATE INDEX "Booking_bookingRef_idx" ON "Booking"("bookingRef");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");
CREATE TABLE "new_Classroom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "ageRangeMin" INTEGER NOT NULL DEFAULT 5,
    "ageRangeMax" INTEGER NOT NULL DEFAULT 18,
    "pricePerDay" DECIMAL NOT NULL,
    "weekDiscount" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Classroom" ("capacity", "createdAt", "gender", "id", "isActive", "nameAr", "nameEn", "updatedAt") SELECT "capacity", "createdAt", "gender", "id", "isActive", "nameAr", "nameEn", "updatedAt" FROM "Classroom";
DROP TABLE "Classroom";
ALTER TABLE "new_Classroom" RENAME TO "Classroom";
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classroomId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "seatsTotal" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("classroomId", "createdAt", "day", "endTime", "id", "instructorId", "isActive", "notes", "startTime", "updatedAt") SELECT "classroomId", "createdAt", "day", "endTime", "id", "instructorId", "isActive", "notes", "startTime", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE INDEX "Session_classroomId_idx" ON "Session"("classroomId");
CREATE INDEX "Session_instructorId_idx" ON "Session"("instructorId");
CREATE INDEX "Session_day_idx" ON "Session"("day");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
