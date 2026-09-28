-- AlterTable
ALTER TABLE "pre_orders" ADD COLUMN "farmer_confirmed_at" DATETIME;

-- CreateTable
CREATE TABLE "order_agreements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pre_order_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "proposed_by_id" TEXT NOT NULL,
    "responded_by_id" TEXT,
    "final_quantity" INTEGER,
    "refund_amount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" DATETIME,
    CONSTRAINT "order_agreements_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Orders already past confirmation keep their meaning: treat the farmer as having confirmed.
UPDATE "pre_orders" SET "farmer_confirmed_at" = "updated_at" WHERE "status" NOT IN ('pending_confirmation', 'negotiating');
