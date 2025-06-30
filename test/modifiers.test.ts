import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { expectResult } from './utils/utils';


vi.stubGlobal('console', {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
})

describe('log! macro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Object path extraction', () => {
    it('should extract nested object properties', async () => {
      await expectResult(`log!("Theme: {profile.settings.theme}", ${JSON.stringify({ profile: { settings: { theme: 'dark' } } })})`,
        ["Theme: ", { "profile.settings.theme": "dark" }], { loadVirtual: true });
    });

    it('should extract nested object properties', async () => {
      await expectResult(`log!("Theme: {profile.settings.theme:v}", ${JSON.stringify({ profile: { settings: { theme: 'dark' } } })})`,
        ["Theme: ", ["dark"]], { loadVirtual: true });
    });

    it('should extract nested object properties', async () => {
      await expectResult(`log!("Theme: {profile.settings.theme:v|first}", ${JSON.stringify({ profile: { settings: { theme: 'dark' } } })})`,
        ["Theme: ", "dark"], { loadVirtual: true });
    });

    it('should extract array elements by index', async () => {
      await expectResult(`log!("Second item: {items.1}", ${JSON.stringify({ items: ['first', 'second', 'third'] })})`,
        ["Second item: ", 'second'], { loadVirtual: true });
    });

    it('should handle non-existent paths gracefully', async () => {
      await expectResult(`log!("Missing: {b.c}", ${JSON.stringify({ a: 1 })})`,
        ["Missing: ", undefined], { loadVirtual: true });
    });
  });

  describe('Wildcard patterns', () => {
    it('should extract all object values with wildcard', async () => {
      await expectResult(`log!("Names: {*.name}", ${JSON.stringify({
        user1: { name: 'John' },
        user2: { name: 'Jane' }
      })})`,
        ["Names: ", {
          "user1.name": "John",
          "user2.name": "Jane",
        }], { loadVirtual: true });
    });

    it('should extract all array elements with wildcard', async () => {
      await expectResult(`log!("Names: {*.name:v}", ${JSON.stringify([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ])})`,
        ["Names: ", ['Item 1', 'Item 2']], { loadVirtual: true });
    });

    it('should handle nested wildcards', async () => {
      await expectResult(`log!("First items: {*.*.0:v}", ${JSON.stringify({
        tech: { phones: ['iPhone', 'Samsung'] },
        books: { fiction: ['Novel1', 'Novel2'] }
      })})`,
        ["First items: ", ['iPhone', 'Novel1']], { loadVirtual: true });
    });

    it('should handle wildcard with empty collections', async () => {
      await expectResult(`log!("Empty: {empty.*}", ${JSON.stringify({ empty: {} })})`,
        ["Empty: ", []], { loadVirtual: true });
    });
  });

  describe('Modifier operations', () => {
    describe('Values modifier (v, values, value)', () => {
      it('should extract values from objects', async () => {
        await expectResult(`log!("Values: {:v}", ${JSON.stringify({ a: 1, b: 2, c: 3 })})`,
          ["Values: ", [1, 2, 3]], { loadVirtual: true });
      });

      it('should extract values from arrays', async () => {
        await expectResult(`log!("Values: {:v}", ${JSON.stringify([1, 2, 3])})`,
          ["Values: ", [1, 2, 3]], { loadVirtual: true });
      });

      it('should handle Map objects', async () => {
        await expectResult(`log!("Values: {:v}", new Map([['a', 1], ['b', 2]]))`,
          ["Values: ", [1, 2]], { loadVirtual: true });
      });

      it('should handle Set objects', async () => {
        await expectResult(`log!("Values: {:v}", new Set([1, 2, 3]))`,
          ["Values: ", [1, 2, 3]], { loadVirtual: true });
      });

      it('should handle null values', async () => {
        await expectResult(`log!("Values: {:v}", null)`,
          ["Values: ", null], { loadVirtual: true });
      });

      it('should handle numbers', async () => {
        await expectResult(`log!("Values: {:v}", 42)`,
          ["Values: ", 42], { loadVirtual: true });
      });
    });

    describe('Keys modifier (k, keys, key)', () => {
      it('should extract keys from objects', async () => {
        await expectResult(`log!("Keys: {:k}", ${JSON.stringify({ a: 1, b: 2, c: 3 })})`,
          ["Keys: ", ['a', 'b', 'c']], { loadVirtual: true });
      });

      it('should extract indices from arrays', async () => {
        await expectResult(`log!("Keys: {:k}", ${JSON.stringify(['a', 'b', 'c'])})`,
          ["Keys: ", [0, 1, 2]], { loadVirtual: true });
      });

      it('should handle Map objects', async () => {
        await expectResult(`log!("Keys: {:k}", new Map([['x', 1], ['y', 2]]))`,
          ["Keys: ", ['x', 'y']], { loadVirtual: true });
      });

      it('should handle empty arrays for numbers', async () => {
        await expectResult(`log!("Keys: {:k}", 42)`,
          ["Keys: ", []], { loadVirtual: true });
      });

      it('should handle null values', async () => {
        await expectResult(`log!("Keys: {:k}", null)`,
          ["Keys: ", null], { loadVirtual: true });
      });
    });

    describe('Unique modifier (u, unique, uniq)', () => {
      it('should remove duplicates from arrays', async () => {
        await expectResult(`log!("Unique: {:u}", ${JSON.stringify([1, 2, 2, 3, 3, 3])})`,
          ["Unique: ", [1, 2, 3]], { loadVirtual: true });
      });

      it('should handle objects with duplicate values', async () => {
        await expectResult(`log!("Unique: {:u}", ${JSON.stringify({ a: 1, b: 2, c: 1, d: 3 })})`,
          ["Unique: ", { a: 1, b: 2, d: 3 }], { loadVirtual: true });
      });

      it('should handle Set objects', async () => {
        await expectResult(`log!("Unique: {:u}", new Set([1, 2, 3]))`,
          ["Unique: ", [1, 2, 3]], { loadVirtual: true });
      });

      it('should handle Map objects', async () => {
        await expectResult(`log!("Unique: {:u}", new Map([['a', 1], ['b', 2], ['c', 1]]))`,
          ["Unique: ", [1, 2]], { loadVirtual: true });
      });

      it('should preserve single numbers', async () => {
        await expectResult(`log!("Unique: {:u}", 42)`,
          ["Unique: ", 42], { loadVirtual: true });
      });
    });

    describe('Count modifier (c, count, len, length)', () => {
      it('should count array elements', async () => {
        await expectResult(`log!("Count: {:c}", ${JSON.stringify([1, 2, 3, 4, 5])})`,
          ["Count: ", 5], { loadVirtual: true });
      });

      it('should count object properties', async () => {
        await expectResult(`log!("Count: {:c}", ${JSON.stringify({ a: 1, b: 2, c: 3 })})`,
          ["Count: ", 3], { loadVirtual: true });
      });

      it('should count Map size', async () => {
        await expectResult(`log!("Count: {:c}", new Map([['a', 1], ['b', 2]]))`,
          ["Count: ", 2], { loadVirtual: true });
      });

      it('should count Set size', async () => {
        await expectResult(`log!("Count: {:c}", new Set([1, 2, 3]))`,
          ["Count: ", 3], { loadVirtual: true });
      });

      it('should return 1 for numbers', async () => {
        await expectResult(`log!("Count: {:c}", 42)`,
          ["Count: ", 1], { loadVirtual: true });
      });

      it('should handle null values', async () => {
        await expectResult(`log!("Count: {:c}", null)`,
          ["Count: ", null], { loadVirtual: true });
      });
    });

    describe('Comparison modifiers (gt, lt, gte, lte)', () => {
      it('should filter array elements greater than threshold', async () => {
        await expectResult(`log!("GT 10: {:gt<10>}", ${JSON.stringify([1, 5, 10, 15, 20])})`,
          ["GT 10: ", [15, 20]], { loadVirtual: true });
      });

      it('should filter array elements less than threshold', async () => {
        await expectResult(`log!("LT 10: {:lt<10>}", ${JSON.stringify([1, 5, 10, 15, 20])})`,
          ["LT 10: ", [1, 5]], { loadVirtual: true });
      });

      it('should filter array elements greater than or equal to threshold', async () => {
        await expectResult(`log!("GTE 10: {:gte<10>}", ${JSON.stringify([1, 5, 10, 15, 20])})`,
          ["GTE 10: ", [10, 15, 20]], { loadVirtual: true });
      });

      it('should filter array elements less than or equal to threshold', async () => {
        await expectResult(`log!("LTE 10: {:lte<10>}", ${JSON.stringify([1, 5, 10, 15, 20])})`,
          ["LTE 10: ", [1, 5, 10]], { loadVirtual: true });
      });

      it('should filter object values', async () => {
        await expectResult(`log!("GT 10: {:gt<10>}", ${JSON.stringify({ a: 5, b: 15, c: 25 })})`,
          ["GT 10: ", { b: 15, c: 25 }], { loadVirtual: true });
      });

      it('should handle single numbers', async () => {
        await expectResult(`log!("GT 10: {:gt<10>}", 15)`,
          ["GT 10: ", 15], { loadVirtual: true });
        await expectResult(`log!("GT 10: {:gt<10>}", 5)`,
          ["GT 10: ", null], { loadVirtual: true });
      });

      it('should handle Map objects', async () => {
        await expectResult(`log!("GT 10: {:gt<10>}", new Map([['a', 5], ['b', 15]]))`,
          ["GT 10: ", [15]], { loadVirtual: true });
      });

      it('should handle Set objects', async () => {
        await expectResult(`log!("GT 10: {:gt<10>}", new Set([5, 15, 25]))`,
          ["GT 10: ", [15, 25]], { loadVirtual: true });
      });
    });

    describe('Number modifier (n, number, num)', () => {
      it('should convert array elements to numbers', async () => {
        await expectResult(`log!("Numbers: {:n}", ${JSON.stringify(['1', '2', '3.5'])})`,
          ["Numbers: ", [1, 2, 3.5]], { loadVirtual: true });
      });

      it('should convert object values to numbers', async () => {
        await expectResult(`log!("Numbers: {:n}", ${JSON.stringify({ a: '5', b: '10.5' })})`,
          ["Numbers: ", { a: 5, b: 10.5 }], { loadVirtual: true });
      });

      it('should handle single strings', async () => {
        await expectResult(`log!("Number: {:n}", '42.5')`,
          ["Number: ", 42.5], { loadVirtual: true });
      });

      it('should handle Set objects', async () => {
        await expectResult(`log!("Numbers: {:n}", new Set(['1', '2', '3']))`,
          ["Numbers: ", [1, 2, 3]], { loadVirtual: true });
      });

      it('should handle null values', async () => {
        await expectResult(`log!("Number: {:n}", null)`,
          ["Number: ", null], { loadVirtual: true });
      });
    });
  });

  describe('Chained modifiers', () => {
    it('should apply multiple modifiers in sequence', async () => {
      // Convert to numbers, filter unique, then filter > 2
      await expectResult(`log!("Chain: {:n|u|gt<2>}", ${JSON.stringify(['1', '2', '2', '3', '10', '5'])})`,
        ["Chain: ", [3, 10, 5]], { loadVirtual: true });
    });

    it('should chain count after filtering', async () => {
      await expectResult(`log!("Count GT 10: {:gt<10>|c}", ${JSON.stringify([1, 5, 10, 15, 20])})`,
        ["Count GT 10: ", 2], { loadVirtual: true });
    });

    it('should chain unique and count', async () => {
      await expectResult(`log!("Unique count: {:u|c}", ${JSON.stringify([1, 1, 2, 2, 3, 3, 3])})`,
        ["Unique count: ", 3], { loadVirtual: true });
    });

    it('should handle complex chaining', async () => {
      // Convert to numbers, get unique values, filter > 10, then count
      await expectResult(`log!("Complex: {:n|u|gt<10>|c}", ${JSON.stringify(['5', '10', '10', '15', '20', '3'])})`,
        ["Complex: ", 2], { loadVirtual: true });
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle API response processing like the example', async () => {
      const users = [
        { id: 1, address: { geo: { lat: '40.7128' } } },
        { id: 2, address: { geo: { lat: '34.0522' } } },
        { id: 3, address: { geo: { lat: '-33.8688' } } }
      ];

      await expectResult(`log!("Original: {}", ${JSON.stringify(users)})`,
        ["Original: ", users], { loadVirtual: true });
      await expectResult(`log!("Latitudes: {*.address.geo.lat}", ${JSON.stringify(users)})`,
        ["Latitudes: ", ['40.7128', '34.0522', '-33.8688']], { loadVirtual: true });
      await expectResult(`log!("Lat keys: {*.address.geo.lat:k}", ${JSON.stringify(users)})`,
        ["Lat keys: ", [0, 1, 2]], { loadVirtual: true });
    });

    it('should handle photo album analysis like the example', async () => {
      const photos = [
        { albumId: 1, thumbnailUrl: 'thumb1.jpg' },
        { albumId: 1, thumbnailUrl: 'thumb2.jpg' },
        { albumId: 2, thumbnailUrl: 'thumb1.jpg' }, // duplicate thumbnail
        { albumId: 2, thumbnailUrl: 'thumb3.jpg' }
      ];

      await expectResult(`log!("Photos: {:count}", ${JSON.stringify(photos)})`,
        ["Photos: ", 4], { loadVirtual: true });
      await expectResult(`log!("Albums: {*.albumId:unique|count}", ${JSON.stringify(photos)})`,
        ["Albums: ", 2], { loadVirtual: true });
      await expectResult(`log!("Unique thumbnails: {*.thumbnailUrl:unique|count}", ${JSON.stringify(photos)})`,
        ["Unique thumbnails: ", 3], { loadVirtual: true });
    });

    it('should handle complex data analysis', async () => {
      const salesData = [
        { region: 'North', sales: 100, quarter: 'Q1' },
        { region: 'South', sales: 150, quarter: 'Q1' },
        { region: 'North', sales: 120, quarter: 'Q2' },
        { region: 'South', sales: 180, quarter: 'Q2' }
      ];

      await expectResult(`log!("High sales count: {*.sales:gt<130>|count}", ${JSON.stringify(salesData)})`,
        ["High sales count: ", 2], { loadVirtual: true });
      await expectResult(`log!("Regions: {*.region:unique}", ${JSON.stringify(salesData)})`,
        ["Regions: ", ['North', 'South']], { loadVirtual: true });
      await expectResult(`log!("Total sales: {*.sales:values}", ${JSON.stringify(salesData)})`,
        ["Total sales: ", [100, 150, 120, 180]], { loadVirtual: true });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed templates gracefully', async () => {
      await expectResult(`log!("Unclosed: {unclosed", ${JSON.stringify({})})`,
        ["Unclosed: {unclosed"], { loadVirtual: true });
    });

    it('should handle empty objects', async () => {
      await expectResult(`log!("Empty: {:count}", ${JSON.stringify({})})`,
        ["Empty: ", 0], { loadVirtual: true });
    });

    it('should handle nested null values', async () => {
      await expectResult(`log!("User name: {user.name}", ${JSON.stringify({ user: null })})`,
        ["User name: ", undefined], { loadVirtual: true });
    });

    it('should handle circular references', async () => {
      // For circular references, we'll simulate what would happen
      await expectResult(`log!("Name: {name}", {name: 'test', self: '[Circular]'})`,
        ["Name: ", 'test'], { loadVirtual: true });
    });

    it('should handle undefined modifiers gracefully', async () => {
      await expectResult(`log!("Invalid: {:invalidmod}", ${JSON.stringify([1, 2, 3])})`,
        ["Invalid: ", '[object Object]'], { loadVirtual: true });
    });

    it('should handle modifier parameters', async () => {
      await expectResult(`log!("GT 7: {:gt<7>}", ${JSON.stringify([1, 5, 10, 15])})`,
        ["GT 7: ", [10, 15]], { loadVirtual: true });
      await expectResult(`log!("LT 8: {:lt<8>}", ${JSON.stringify([1, 5, 10, 15])})`,
        ["LT 8: ", [1, 5]], { loadVirtual: true });
    });

    it('should handle mixed data types in arrays', async () => {
      await expectResult(`log!("Count: {:count}", ${JSON.stringify([1, 'hello', true, null, { a: 1 }])})`,
        ["Count: ", 5], { loadVirtual: true });
      await expectResult(`log!("Unique: {:unique|count}", ${JSON.stringify([1, 'hello', true, null, { a: 1 }])})`,
        ["Unique: ", 5], { loadVirtual: true });
    });
  });

  describe('Performance and boundary testing', () => {
    it('should handle large datasets efficiently', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: i * 2 }));
      await expectResult(`log!("Large count: {:count}", ${JSON.stringify(largeArray)})`,
        ["Large count: ", 10000], { loadVirtual: true });
      await expectResult(`log!("High values: {*.value:gt<15000>|count}", ${JSON.stringify(largeArray)})`,
        ["High values: ", 2500], { loadVirtual: true });
    });

    it('should handle deeply nested objects', async () => {
      await expectResult(`log!("Deep value: {level1.level2.level3.value}", ${JSON.stringify({ level1: { level2: { level3: { value: 'deep' } } } })})`,
        ["Deep value: ", 'deep'], { loadVirtual: true });
    });

    it('should handle many modifiers', async () => {
      await expectResult(`log!("Many mods: {:n|u|gt<2>|lt<10>|count}", ${JSON.stringify(['1', '2', '2', '3', '10', '5', '10'])})`,
        ["Many mods: ", 2], { loadVirtual: true });
    });
  });
});