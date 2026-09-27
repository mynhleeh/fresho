-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "trust_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "harvest_batches" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "harvest_batches_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pre_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_per_unit" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_confirmation',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pre_orders_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "harvest_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pre_orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pre_order_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deposits_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pre_order_id" TEXT NOT NULL,
    "final_quantity" INTEGER NOT NULL,
    "final_goods_amount" INTEGER NOT NULL,
    "shipping_fee" INTEGER NOT NULL,
    "final_payment_amount" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "settlements_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pre_order_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ledger_entries_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "delivery_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pre_order_id" TEXT NOT NULL,
    "logistics_partner_id" TEXT,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ready_for_handover',
    "tracking_note" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "delivery_records_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "delivery_records_logistics_partner_id_fkey" FOREIGN KEY ("logistics_partner_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dispute_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pre_order_id" TEXT NOT NULL,
    "raised_by_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "resolution_note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dispute_logs_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dispute_logs_raised_by_id_fkey" FOREIGN KEY ("raised_by_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "settlements_pre_order_id_key" ON "settlements"("pre_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_records_pre_order_id_key" ON "delivery_records"("pre_order_id");
