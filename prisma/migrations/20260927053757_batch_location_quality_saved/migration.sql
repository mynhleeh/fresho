-- CreateTable
CREATE TABLE "saved_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_batches_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "harvest_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "saved_batches_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_harvest_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmer_id" TEXT NOT NULL,
    "crop_name" TEXT NOT NULL,
    "quantity_total" INTEGER NOT NULL,
    "quantity_available" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "price_per_unit" INTEGER NOT NULL,
    "harvest_date_estimate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "photo_url" TEXT,
    "location" TEXT NOT NULL DEFAULT '',
    "quality_standard" TEXT,
    "min_order_quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "harvest_batches_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_harvest_batches" ("created_at", "crop_name", "farmer_id", "harvest_date_estimate", "id", "photo_url", "price_per_unit", "quantity_available", "quantity_total", "status", "unit") SELECT "created_at", "crop_name", "farmer_id", "harvest_date_estimate", "id", "photo_url", "price_per_unit", "quantity_available", "quantity_total", "status", "unit" FROM "harvest_batches";
DROP TABLE "harvest_batches";
ALTER TABLE "new_harvest_batches" RENAME TO "harvest_batches";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "saved_batches_batch_id_buyer_id_key" ON "saved_batches"("batch_id", "buyer_id");
