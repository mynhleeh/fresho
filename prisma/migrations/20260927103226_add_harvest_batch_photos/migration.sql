-- CreateTable
CREATE TABLE "harvest_batch_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "harvest_batch_photos_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "harvest_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
