import { ApiError } from '@/lib/errors';

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
const MAX_TEXT_LENGTH = 100;

type BatchSort = 'newest' | 'trustScore' | 'harvestDate';

export type OpenBatchFilter = {
  cropName?: string;
  location?: string;
  minPricePerUnit?: number;
  maxPricePerUnit?: number;
  minQuantityAvailable?: number;
  harvestDateFrom?: Date;
  harvestDateTo?: Date;
  sortBy: BatchSort;
  limit: number;
  offset: number;
};

function parsePaginationParam(rawValue: string | null, defaultValue: number, minValue: number, maxValue: number): number {
  if (rawValue === null) return defaultValue;
  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed < minValue) return defaultValue;
  return Math.min(parsed, maxValue);
}

function parseTextParam(rawValue: string | null): string | undefined {
  const trimmed = rawValue?.trim().slice(0, MAX_TEXT_LENGTH);
  return trimmed ? trimmed : undefined;
}

function parseNonNegativeNumber(rawValue: string | null, fieldLabel: string): number | undefined {
  if (!rawValue) return undefined;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ApiError('invalid_input', `${fieldLabel} phải là một số không âm.`, 400);
  }
  return parsed;
}

function parseDateParam(rawValue: string | null, fieldLabel: string): Date | undefined {
  if (!rawValue) return undefined;
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError('invalid_input', `${fieldLabel} chưa hợp lệ.`, 400);
  }
  return parsed;
}

function parseSortParam(rawValue: string | null): BatchSort {
  return rawValue === 'trustScore' || rawValue === 'harvestDate' ? rawValue : 'newest';
}

export function parseOpenBatchFilter(searchParams: URLSearchParams): OpenBatchFilter {
  return {
    cropName: parseTextParam(searchParams.get('cropName')),
    location: parseTextParam(searchParams.get('location')),
    minPricePerUnit: parseNonNegativeNumber(searchParams.get('minPricePerUnit'), 'Giá tối thiểu'),
    maxPricePerUnit: parseNonNegativeNumber(searchParams.get('maxPricePerUnit'), 'Giá tối đa'),
    minQuantityAvailable: parseNonNegativeNumber(searchParams.get('minQuantityAvailable'), 'Số lượng cần mua'),
    harvestDateFrom: parseDateParam(searchParams.get('harvestDateFrom'), 'Ngày nhận hàng từ'),
    harvestDateTo: parseDateParam(searchParams.get('harvestDateTo'), 'Ngày nhận hàng đến'),
    sortBy: parseSortParam(searchParams.get('sortBy')),
    limit: parsePaginationParam(searchParams.get('limit'), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE),
    offset: parsePaginationParam(searchParams.get('offset'), 0, 0, Number.MAX_SAFE_INTEGER),
  };
}
