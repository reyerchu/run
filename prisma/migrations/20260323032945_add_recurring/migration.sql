-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "region" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "registrationStart" DATETIME,
    "registrationEnd" DATETIME,
    "distances" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "websiteUrl" TEXT,
    "registrationUrl" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "source" TEXT,
    "sourceUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "estimatedMonth" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("city", "country", "createdAt", "date", "description", "distances", "featured", "id", "imageUrl", "name", "nameEn", "region", "registrationEnd", "registrationStart", "registrationUrl", "source", "sourceUrl", "status", "updatedAt", "verified", "websiteUrl") SELECT "city", "country", "createdAt", "date", "description", "distances", "featured", "id", "imageUrl", "name", "nameEn", "region", "registrationEnd", "registrationStart", "registrationUrl", "source", "sourceUrl", "status", "updatedAt", "verified", "websiteUrl" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_region_date_idx" ON "Event"("region", "date");
CREATE INDEX "Event_status_idx" ON "Event"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
