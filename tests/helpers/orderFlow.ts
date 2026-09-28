import { prisma } from '@/lib/db';
import { calculateGoodsAmount } from '@/lib/order/orderPricing';
import { calculateDepositAmount } from '@/lib/order/depositAmount';
import { confirmPreOrder } from '@/lib/order-services/preOrderService';
import { payDeposit } from '@/lib/order-services/depositService';
import { quoteShipping } from '@/lib/batch-services/shippingQuoteService';

export async function confirmAndDeposit(preOrderId: string, farmerId: string) {
  await confirmPreOrder(preOrderId, { id: farmerId, role: 'farmer' });
  const preOrder = await prisma.preOrder.findUniqueOrThrow({ where: { id: preOrderId } });
  const amount = calculateDepositAmount(calculateGoodsAmount(preOrder.quantity, preOrder.pricePerUnit));
  return payDeposit(preOrderId, amount);
}

export async function createStoredShippingQuote(batchId: string, buyerId: string, quantity: number) {
  const quote = await quoteShipping({ batchId, buyerId, quantity, vehicleType: 'small_truck', distanceKm: 20 });
  return quote.estimatedFee;
}
