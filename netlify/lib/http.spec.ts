import { describe, expect, it } from 'vitest';
import { idFrom } from './http';

describe('idFrom', () => {
	it('reads a positive integer path segment', () => {
		expect(idFrom('1')).toBe(1);
		expect(idFrom('2147483647')).toBe(2147483647);
	});

	// Copilot review on PR 21: a ten-digit id past Postgres `integer` made the query throw, a 500 instead of a 404.
	it.each(['2147483648', '9999999999', '0', '01', '-1', 'abc', '', undefined])('rejects %s', segment => {
		expect(idFrom(segment)).toBeUndefined();
	});
});
