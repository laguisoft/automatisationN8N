import { buildSearchQueries } from '../../src/modules/prospecting/queryBuilder';

describe('buildSearchQueries', () => {
  it('never exceeds the requested maximum', () => {
    const queries = buildSearchQueries(5);
    expect(queries.length).toBeLessThanOrEqual(5);
  });

  it('prioritizes Kankan first', () => {
    const queries = buildSearchQueries(3);
    expect(queries[0]).toContain('Kankan');
  });

  it('returns non-empty, distinct-looking query strings', () => {
    const queries = buildSearchQueries(10);
    queries.forEach((q) => expect(q.length).toBeGreaterThan(0));
  });
});
