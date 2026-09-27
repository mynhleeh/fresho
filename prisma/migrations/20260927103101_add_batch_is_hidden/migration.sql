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
    "description" TEXT,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "harvest_batches_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_harvest_batches" ("created_at", "crop_name", "description", "farmer_id", "harvest_date_estimate", "id", "location", "min_order_quantity", "photo_url", "price_per_unit", "quality_standard", "quantity_available", "quantity_total", "status", "unit") SELECT "created_at", "crop_name", "description", "farmer_id", "harvest_date_estimate", "id", "location", "min_order_quantity", "photo_url", "price_per_unit", "quality_standard", "quantity_available", "quantity_total", "status", "unit" FROM "harvest_batches";
DROP TABLE "harvest_batches";
ALTER TABLE "new_harvest_batches" RENAME TO "harvest_batches";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
