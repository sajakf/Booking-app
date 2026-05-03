/*
  Warnings:

  - You are about to alter the column `discountKwd` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to alter the column `subtotalKwd` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to alter the column `totalKwd` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to alter the column `pricePerDay` on the `Classroom` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.

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
    "subtotalKwd" REAL NOT NULL,
    "discountKwd" REAL NOT NULL,
    "totalKwd" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'INITIATED',
    "paymentMethod" TEXT,
    "isCashPayment" BOOLEAN NOT NULL DEFAULT false,
    "paymentId" TEXT,
    "invoiceId" TEXT,
    "paidAt" DATETIME,
    "confirmationEmailSentAt" DATETIME,
    "confirmationWhatsappSentAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Booking" ("bookingRef", "childAge", "childGender", "childName", "confirmationEmailSentAt", "confirmationWhatsappSentAt", "createdAt", "discountKwd", "hasSibling", "id", "invoiceId", "isCashPayment", "lineItemsJson", "medicalNotes", "notes", "paidAt", "parentEmail", "parentName", "parentPhone", "paymentId", "paymentMethod", "paymentStatus", "promoCode", "status", "subtotalKwd", "totalKwd", "updatedAt") SELECT "bookingRef", "childAge", "childGender", "childName", "confirmationEmailSentAt", "confirmationWhatsappSentAt", "createdAt", "discountKwd", "hasSibling", "id", "invoiceId", "isCashPayment", "lineItemsJson", "medicalNotes", "notes", "paidAt", "parentEmail", "parentName", "parentPhone", "paymentId", "paymentMethod", "paymentStatus", "promoCode", "status", "subtotalKwd", "totalKwd", "updatedAt" FROM "Booking";
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
    "pricePerDay" REAL NOT NULL,
    "weekDiscount" INTEGER NOT NULL DEFAULT 10,
    "activityType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Classroom" ("activityType", "ageRangeMax", "ageRangeMin", "capacity", "createdAt", "gender", "id", "isActive", "nameAr", "nameEn", "pricePerDay", "updatedAt", "weekDiscount") SELECT "activityType", "ageRangeMax", "ageRangeMin", "capacity", "createdAt", "gender", "id", "isActive", "nameAr", "nameEn", "pricePerDay", "updatedAt", "weekDiscount" FROM "Classroom";
DROP TABLE "Classroom";
ALTER TABLE "new_Classroom" RENAME TO "Classroom";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
