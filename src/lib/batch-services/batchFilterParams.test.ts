import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/errors';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, parseOpenBatchFilter } from './batchFilterParams';

const parse = (query: string) => parseOpenBatchFilter(new URLSearchParams(query));

describe('parseOpenBatchFilter pagination', () => {
  it('uses the default page size and zero offset when absent', () => {
    expect(parse('')).toMatchObject({ limit: DEFAULT_PAGE_SIZE, offset: 0, sortBy: 'newest' });
  });

  it('caps limit at the maximum page size', () => {
    expect(parse('limit=500').limit).toBe(MAX_PAGE_SIZE);
  });

  it('falls back to defaults for negative, fractional or non-numeric values', () => {
    expect(parse('limit=-3&offset=abc')).toMatchObject({ limit: DEFAULT_PAGE_SIZE, offset: 0 });
    expect(parse('limit=2.5').limit).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe('parseOpenBatchFilter filters', () => {
  it('parses price, quantity and date filters', () => {
    const filter = parse('minPricePerUnit=10000&maxPricePerUnit=30000&minQuantityAvailable=50&harvestDateFrom=2026-10-01');
    expect(filter.minPricePerUnit).toBe(10000);
    expect(filter.maxPricePerUnit).toBe(30000);
    expect(filter.minQuantityAvailable).toBe(50);
    expect(filter.harvestDateFrom?.toISOString().startsWith('2026-10-01')).toBe(true);
  });

  it('accepts zero as a valid price bound', () => {
    expect(parse('minPricePerUnit=0').minPricePerUnit).toBe(0);
  });

  it('rejects negative and non-numeric numbers with invalid_input', () => {
    for (const query of ['minPricePerUnit=-1', 'maxPricePerUnit=abc', 'minQuantityAvailable=Infinity']) {
      expect(() => parse(query)).toThrowError(ApiError);
    }
  });

  it('rejects an unparseable date with invalid_input', () => {
    expect(() => parse('harvestDateTo=khong-phai-ngay')).toThrowError(ApiError);
  });

  it('trims text filters and drops blank ones', () => {
    expect(parse('cropName=%20xoai%20&location=%20%20')).toMatchObject({ cropName: 'xoai', location: undefined });
  });

  it('only accepts whitelisted sort keys', () => {
    expect(parse('sortBy=trustScore').sortBy).toBe('trustScore');
    expect(parse('sortBy=harvestDate').sortBy).toBe('harvestDate');
    expect(parse('sortBy=price;drop').sortBy).toBe('newest');
  });
});
