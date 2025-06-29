import { describe, it, expect } from 'vitest';
import { find } from '../scripts/macros';

describe('find function', () => {
  describe('Basic object traversal', () => {
    it('should find simple property paths', () => {
      const obj = { a: { b: { c: 'value' } } };
      const result = find(obj, ['a', 'b', 'c']);
      
      expect(result).toEqual({ 'a.b.c': 'value' });
    });

    it('should return empty object when path does not exist', () => {
      const obj = { a: { b: 'value' } };
      const result = find(obj, ['a', 'nonexistent']);
      
      expect(result).toEqual({});
    });

    it('should handle single-level property access', () => {
      const obj = { name: 'John', age: 30 };
      const result = find(obj, ['name']);
      
      expect(result).toEqual({ name: 'John' });
    });

    it('should handle deep nested objects', () => {
      const obj = { 
        level1: { 
          level2: { 
            level3: { 
              level4: { 
                value: 'deep' 
              } 
            } 
          } 
        } 
      };
      const result = find(obj, ['level1', 'level2', 'level3', 'level4', 'value']);
      
      expect(result).toEqual({ 'level1.level2.level3.level4.value': 'deep' });
    });
  });

  describe('Array traversal', () => {
    it('should find elements by array index', () => {
      const obj = { items: ['first', 'second', 'third'] };
      const result = find(obj, ['items', '1']);
      
      expect(result).toEqual({ 'items.1': 'second' });
    });

    it('should handle nested arrays', () => {
      const obj = { 
        matrix: [
          ['a', 'b'],
          ['c', 'd']
        ]
      };
      const result = find(obj, ['matrix', '0', '1']);
      
      expect(result).toEqual({ 'matrix.0.1': 'b' });
    });

    it('should return empty object for out-of-bounds array access', () => {
      const obj = { items: ['first', 'second'] };
      const result = find(obj, ['items', '5']);
      
      expect(result).toEqual({});
    });

    it('should return empty object for negative array indices', () => {
      const obj = { items: ['first', 'second'] };
      const result = find(obj, ['items', '-1']);
      
      expect(result).toEqual({});
    });

    it('should handle non-numeric array indices', () => {
      const obj = { items: ['first', 'second'] };
      const result = find(obj, ['items', 'abc']);
      
      expect(result).toEqual({});
    });
  });

  describe('Wildcard patterns', () => {
    it('should match all object properties with wildcard', () => {
      const obj = { 
        users: { 
          john: { name: 'John' }, 
          jane: { name: 'Jane' } 
        }
      };
      const result = find(obj, ['users', '*', 'name']);
      
      expect(result).toEqual({
        'users.john.name': 'John',
        'users.jane.name': 'Jane'
      });
    });

    it('should match all array elements with wildcard', () => {
      const obj = { 
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      };
      const result = find(obj, ['items', '*', 'name']);
      
      expect(result).toEqual({
        'items.0.name': 'Item 1',
        'items.1.name': 'Item 2'
      });
    });

    it('should handle multiple wildcards in pattern', () => {
      const obj = {
        categories: {
          electronics: {
            phones: ['iPhone', 'Samsung'],
            laptops: ['MacBook', 'Dell']
          },
          books: {
            fiction: ['Novel1', 'Novel2'],
            nonfiction: ['Guide1', 'Guide2']
          }
        }
      };
      const result = find(obj, ['categories', '*', '*', '0']);
      
      expect(result).toEqual({
        'categories.electronics.phones.0': 'iPhone',
        'categories.electronics.laptops.0': 'MacBook',
        'categories.books.fiction.0': 'Novel1',
        'categories.books.nonfiction.0': 'Guide1'
      });
    });

    it('should handle wildcard at the end of pattern', () => {
      const obj = { 
        config: { 
          debug: true, 
          timeout: 5000, 
          retries: 3 
        } 
      };
      const result = find(obj, ['config', '*']);
      
      expect(result).toEqual({
        'config.debug': true,
        'config.timeout': 5000,
        'config.retries': 3
      });
    });

    it('should handle wildcard with empty arrays', () => {
      const obj = { items: [] };
      const result = find(obj, ['items', '*']);
      
      expect(result).toEqual({});
    });

    it('should handle wildcard with empty objects', () => {
      const obj = { config: {} };
      const result = find(obj, ['config', '*']);
      
      expect(result).toEqual({});
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null objects', () => {
      const result = find(null, ['a', 'b']);
      
      expect(result).toEqual({});
    });

    it('should handle undefined objects', () => {
      const result = find(undefined, ['a', 'b']);
      
      expect(result).toEqual({});
    });

    it('should handle primitive values', () => {
      const result = find('string', ['prop']);
      
      expect(result).toEqual({});
    });

    it('should handle empty pattern array', () => {
      const obj = { a: 'value' };
      const result = find(obj, []);
      
      expect(result).toEqual({ '': obj });
    });

    it('should handle objects with null/undefined properties', () => {
      const obj = { 
        validProp: 'value',
        nullProp: null,
        undefinedProp: undefined
      };
      const result1 = find(obj, ['nullProp']);
      const result2 = find(obj, ['undefinedProp']);
      const result3 = find(obj, ['validProp']);
      
      expect(result1).toEqual({ nullProp: null });
      expect(result2).toEqual({ undefinedProp: undefined });
      expect(result3).toEqual({ validProp: 'value' });
    });

    it('should not traverse through null/undefined values', () => {
      const obj = { a: null };
      const result = find(obj, ['a', 'b']);
      
      expect(result).toEqual({});
    });

    it('should handle circular references without infinite loops', () => {
      const obj: any = { a: {} };
      obj.a.circular = obj;
      
      // This should not cause infinite recursion
      const result = find(obj, ['a', 'circular', 'a']);
      
      expect(result).toHaveProperty('a.circular.a');
    });

    it('should handle arrays with holes', () => {
      const arr = new Array(3);
      arr[0] = 'first';
      arr[2] = 'third';
      const obj = { items: arr };
      
      const result1 = find(obj, ['items', '0']);
      const result2 = find(obj, ['items', '1']);
      const result3 = find(obj, ['items', '2']);
      
      expect(result1).toEqual({ 'items.0': 'first' });
      expect(result2).toEqual({ 'items.1': undefined });
      expect(result3).toEqual({ 'items.2': 'third' });
    });
  });

  describe('Complex nested structures', () => {
    it('should handle mixed object and array structures', () => {
      const obj = {
        data: {
          users: [
            { 
              id: 1, 
              profile: { 
                settings: { 
                  notifications: ['email', 'sms'] 
                } 
              } 
            },
            { 
              id: 2, 
              profile: { 
                settings: { 
                  notifications: ['push'] 
                } 
              } 
            }
          ]
        }
      };
      
      const result = find(obj, ['data', 'users', '*', 'profile', 'settings', 'notifications', '0']);
      
      expect(result).toEqual({
        'data.users.0.profile.settings.notifications.0': 'email',
        'data.users.1.profile.settings.notifications.0': 'push'
      });
    });

    it('should handle objects with prototype properties', () => {
      function TestConstructor(this: any) {
        this.ownProp = 'own';
      }
      TestConstructor.prototype.protoProp = 'proto';
      
      const obj = new (TestConstructor as any)();
      const result = find(obj, ['*']);
      
      // Should only find own properties, not prototype properties
      expect(result).toEqual({ ownProp: 'own' });
      expect(result).not.toHaveProperty('protoProp');
    });

    // TODO: Support other object types
    // it('should handle Date objects', () => {
    //   const date = new Date('2023-01-01');
    //   const obj = { timestamp: date };
    //   const result = find(obj, ['timestamp']);
      
    //   expect(result).toEqual({ timestamp: date });
    // });

    // it('should handle RegExp objects', () => {
    //   const regex = /test/gi;
    //   const obj = { pattern: regex };
    //   const result = find(obj, ['pattern']);
      
    //   expect(result).toEqual({ pattern: regex });
    // });
  });

  describe('Performance and boundary testing', () => {
    it('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
      const obj = { items: largeArray };
      
      const result = find(obj, ['items', '999', 'id']);
      
      expect(result).toEqual({ 'items.999.id': 999 });
    });

    it('should handle deeply nested structures', () => {
      let deepObj: any = { value: 'deep' };
      for (let i = 0; i < 50; i++) {
        deepObj = { level: deepObj };
      }
      
      const pattern = Array(50).fill('level').concat(['value']);
      const result = find(deepObj, pattern);
      
      const expectedKey = Array(50).fill('level').join('.') + '.value';
      expect(result).toEqual({ [expectedKey]: 'deep' });
    });
  });

  describe('Type safety and value preservation', () => {
    it('should preserve different data types in results', () => {
      const obj = {
        string: 'text',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        nullValue: null,
        undefinedValue: undefined
      };
      
      const stringResult = find(obj, ['string']);
      const numberResult = find(obj, ['number']);
      const booleanResult = find(obj, ['boolean']);
      const arrayResult = find(obj, ['array']);
      const objectResult = find(obj, ['object']);
      const nullResult = find(obj, ['nullValue']);
      const undefinedResult = find(obj, ['undefinedValue']);
      
      expect(stringResult).toEqual({ string: 'text' });
      expect(numberResult).toEqual({ number: 42 });
      expect(booleanResult).toEqual({ boolean: true });
      expect(arrayResult).toEqual({ array: [1, 2, 3] });
      expect(objectResult).toEqual({ object: { nested: 'value' } });
      expect(nullResult).toEqual({ nullValue: null });
      expect(undefinedResult).toEqual({ undefinedValue: undefined });
    });

    it('should maintain object references', () => {
      const sharedObject = { shared: true };
      const obj = {
        ref1: sharedObject,
        ref2: sharedObject
      };
      
      const result1 = find(obj, ['ref1']);
      const result2 = find(obj, ['ref2']);
      
      expect(result1.ref1).toBe(result2.ref2);
      expect(result1.ref1).toBe(sharedObject);
    });
  });
});