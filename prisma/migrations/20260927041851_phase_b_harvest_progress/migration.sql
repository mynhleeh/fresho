-- CreateTable
CREATE TABLE "harvest_progress_updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "note" TEXT,
    "previous_value" TEXT,
    "new_value" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "harvest_progress_updates_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "harvest_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
