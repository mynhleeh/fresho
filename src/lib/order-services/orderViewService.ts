import { prisma } from '@/lib/db';
import { ApiError } from '@/lib/errors';

import type { Actor } from '@/lib/order-services/actor';
type CounterpartRow = { id: string; name: string; trustScore: number; phone: string; address: string };

const CONTACT_VISIBLE_STATUSES = ['ready_for_handover', 'in_transit', 'delivered', 'settled'];

const COUNTERPART_SELECT = { id: true, name: true, trustScore: true, phone: true, address: true } as const;

function toCounterpart(user: CounterpartRow, orderStatus: string) {
  const { id, name, trustScore, phone, address } = user;
  if (CONTACT_VISIBLE_STATUSES.includes(orderStatus)) return { id, name, trustScore, phone, address };
  return { id, name, trustScore };
}

const ORDER_VIEW_INCLUDE = {
  batch: { include: { farmer: { select: COUNTERPART_SELECT } } },
  buyer: { select: COUNTERPART_SELECT },
  deposits: true,
  settlement: true,
  ratings: true,
  delivery: true,
  disputes: true,
  agreements: { orderBy: { createdAt: 'desc' } },
} as const;

function toOrderView<T extends { status: string; buyer: CounterpartRow; batch: { farmer: CounterpartRow } }>(order: T) {
  return {
    ...order,
    buyer: toCounterpart(order.buyer, order.status),
    batch: { ...order.batch, farmer: toCounterpart(order.batch.farmer, order.status) },
  };
}

export async function listPreOrdersForFarmer(farmerId: string) {
  const orders = await prisma.preOrder.findMany({
    where: { batch: { farmerId } },
    include: ORDER_VIEW_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(toOrderView);
}

export async function listPreOrdersForBuyer(buyerId: string) {
  const orders = await prisma.preOrder.findMany({
    where: { buyerId },
    include: ORDER_VIEW_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(toOrderView);
}

export async function getPreOrderForActor(preOrderId: string, actor: Actor) {
  if (actor.role !== 'buyer' && actor.role !== 'farmer') {
    throw new ApiError('forbidden', 'Vai trò của bạn không được xem chi tiết đơn này.', 403);
  }
  const order = await prisma.preOrder.findUnique({
    where: { id: preOrderId },
    include: { ...ORDER_VIEW_INCLUDE, ledgerEntries: { orderBy: { createdAt: 'asc' } } },
  });
  const isParticipant = order && (order.buyerId === actor.id || order.batch.farmerId === actor.id);
  if (!order || !isParticipant) {
    throw new ApiError('pre_order_not_found', 'Không tìm thấy đơn đặt trước.', 404);
  }
  return toOrderView(order);
}
