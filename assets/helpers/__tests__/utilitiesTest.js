// @flow

// ----- Imports ----- //

import {
  ascending,
  descending,
  roundDp,
  generateClassName,
  parseBoolean,
} from '../utilities';


// ----- Tests ----- //

describe('utilities', () => {

  describe('ascending', () => {

    it('should return a 1 if a > b', () => {
      expect(ascending(3, 2)).toEqual(1);
    });

    it('should return a 0 if a < b', () => {
      expect(ascending(2, 3)).toEqual(0);
    });

    it('should return a 1 if a === b', () => {
      expect(ascending(2, 2)).toEqual(0);
    });

    it('should sort an array in ascending order', () => {

      const unsorted = [100, 2, 2, 46.78, 54, 67, 54, 0.3, -3];
      const sorted = [-3, 0.3, 2, 2, 46.78, 54, 54, 67, 100];

      expect(unsorted.sort(ascending)).toEqual(sorted);

    });

  });

  describe('descending', () => {

    it('should return a 0 if a > b', () => {
      expect(ascending(3, 2)).toEqual(1);
    });

    it('should return a 1 if a < b', () => {
      expect(ascending(2, 3)).toEqual(0);
    });

    it('should return a 0 if a === b', () => {
      expect(ascending(2, 2)).toEqual(0);
    });

    it('should sort an array in descending order', () => {

      const unsorted = [100, 2, 2, 46.78, 54, 67, 54, 0.3, -3];
      const sorted = [100, 67, 54, 54, 46.78, 2, 2, 0.3, -3];

      expect(unsorted.sort(descending)).toEqual(sorted);

    });

  });

  describe('roundDp', () => {

    it('should by default round to two decimal places', () => {
      expect(roundDp(1234.5678)).toEqual(1234.57);
    });

    it('should round, not floor or ceil', () => {
      expect(roundDp(12.345)).toEqual(12.35);
      expect(roundDp(12.344)).toEqual(12.34);
    });

    it('should round to a given number of decimal places', () => {
      expect(roundDp(12.3456789, 5)).toEqual(12.34568);
    });

  });

  describe('generateClassName', () => {

    it('should create the same classname if no modifier is passed', () => {
      expect(generateClassName('made-up-class')).toEqual('made-up-class');
    });

    it('should return a classname with a modifier attached', () => {
      expect(generateClassName('made-up-class', 'fake-modifier'))
        .toEqual('made-up-class made-up-class--fake-modifier');
    });

  });

  describe('parseBoolean', () => {

    it('should parse all variations of true', () => {
      expect(parseBoolean('true', false)).toBe(true);
      expect(parseBoolean('TRUE', false)).toBe(true);
      expect(parseBoolean('True', false)).toBe(true);
    });

    it('should parse all variations of false', () => {
      expect(parseBoolean('false', true)).toBe(false);
      expect(parseBoolean('FALSE', true)).toBe(false);
      expect(parseBoolean('False', true)).toBe(false);
    });

    it('should produce the correct fallbacks on failure to parse', () => {
      expect(parseBoolean('notaboolean', true)).toBe(true);
      expect(parseBoolean('notaboolean', false)).toBe(false);
    });

  });

});
