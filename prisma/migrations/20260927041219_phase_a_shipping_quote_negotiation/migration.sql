-- CreateTable
CREATE TABLE "shipping_quotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "distance_km" INTEGER NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "estimated_fee" INTEGER NOT NULL,
    "pickup_window" TEXT NOT NULL,
    "storage_requirement" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "order_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pre_order_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_messages_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pre_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_per_unit" INTEGER NOT NULL,
    "delivery_method" TEXT NOT NULL DEFAULT 'self_pickup',
    "shipping_fee_quote" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending_confirmation',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pre_orders_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "harvest_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pre_orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_pre_orders" ("batch_id", "buyer_id", "created_at", "id", "price_per_unit", "quantity", "status", "updated_at") SELECT "batch_id", "buyer_id", "created_at", "id", "price_per_unit", "quantity", "status", "updated_at" FROM "pre_orders";
DROP TABLE "pre_orders";
ALTER TABLE "new_pre_orders" RENAME TO "pre_orders";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
