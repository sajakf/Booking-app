-- AlterTable
ALTER TABLE "Classroom" ADD COLUMN "activityType" TEXT;

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "classroomId" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "childAge" INTEGER NOT NULL,
    "childGender" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "offeredAt" DATETIME,
    "expiresAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Waitlist_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Waitlist_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "markedAt" DATETIME,
    "markedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendance_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
INSERT INTO "new_Booking" ("bookingRef", "childAge", "childGender", "childName", "confirmationEmailSentAt", "confirmationWhatsappSentAt", "createdAt", "discountKwd", "hasSibling", "id", "invoiceId", "lineItemsJson", "medicalNotes", "notes", "paidAt", "parentEmail", "parentName", "parentPhone", "paymentId", "paymentStatus", "promoCode", "status", "subtotalKwd", "totalKwd", "updatedAt") SELECT "bookingRef", "childAge", "childGender", "childName", "confirmationEmailSentAt", "confirmationWhatsappSentAt", "createdAt", "discountKwd", "hasSibling", "id", "invoiceId", "lineItemsJson", "medicalNotes", "notes", "paidAt", "parentEmail", "parentName", "parentPhone", "paymentId", "paymentStatus", "promoCode", "status", "subtotalKwd", "totalKwd", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_bookingRef_key" ON "Booking"("bookingRef");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_parentEmail_idx" ON "Booking"("parentEmail");
CREATE INDEX "Booking_bookingRef_idx" ON "Booking"("bookingRef");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");
CREATE TABLE "new_Instructor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "photo" TEXT,
    "certifications" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Instructor" ("bio", "createdAt", "email", "id", "isActive", "nameAr", "nameEn", "phone", "updatedAt") SELECT "bio", "createdAt", "email", "id", "isActive", "nameAr", "nameEn", "phone", "updatedAt" FROM "Instructor";
DROP TABLE "Instructor";
ALTER TABLE "new_Instructor" RENAME TO "Instructor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Waitlist_classroomId_idx" ON "Waitlist"("classroomId");

-- CreateIndex
CREATE INDEX "Waitlist_sessionId_idx" ON "Waitlist"("sessionId");

-- CreateIndex
CREATE INDEX "Waitlist_status_idx" ON "Waitlist"("status");

-- CreateIndex
CREATE INDEX "Attendance_classroomId_date_idx" ON "Attendance"("classroomId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_bookingId_date_key" ON "Attendance"("bookingId", "date");
