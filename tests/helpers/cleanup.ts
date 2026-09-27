import { prisma } from '@/lib/db';

/**
 * Deletes all rows from every table, in FK-safe order (children before parents).
 * Shared by every test file so cleanup is consistent and never leaves orphaned
 * rows that trip FK constraints when test files run together.
 */
export async function cleanupDb() {
  await prisma.disputeLog.deleteMany();
  await prisma.deliveryRecord.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.orderMessage.deleteMany();
  await prisma.preOrder.deleteMany();
  await prisma.shippingQuote.deleteMany();
  await prisma.harvestBatch.deleteMany();
  await prisma.user.deleteMany();
}
