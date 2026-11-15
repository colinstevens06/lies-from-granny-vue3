import type { Parsed } from '../models/parsed';

export const parsed = <T>(value: T): Parsed<T> => ({ ok: true, value });

export const rejected = (error: string): Parsed<never> => ({ ok: false, error });

export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
