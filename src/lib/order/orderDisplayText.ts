export function formatHarvestDate(isoDate: string | undefined): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function describeBuyerWaiting(status: string, deliveryMethod: string): string {
  if (status === 'deposited' || status === 'awaiting_harvest') return 'Nông dân đang chuẩn bị thu hoạch.';
  if (status !== 'ready_for_handover') return '';
  return deliveryMethod === 'carrier'
    ? 'Hàng đã sẵn sàng. Đang chờ nông dân giao cho vận chuyển.'
    : 'Hàng đã sẵn sàng. Hãy đến nhận theo thông tin liên hệ của nông dân.';
}
