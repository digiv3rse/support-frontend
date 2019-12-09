import { postcodeIsWithinDeliveryArea, postcodeHasPrefix } from '../deliveryCheck';

describe('Delivery Check', () => {

  describe('postcodeIsWithinDeliveryArea', () => {
    it('should return true if the postcode is in the delivery area', () => {
      expect(postcodeIsWithinDeliveryArea('SE2 2LB')).toBeTruthy();
      expect(postcodeIsWithinDeliveryArea('SE20 2LB')).toBeTruthy();
      expect(postcodeIsWithinDeliveryArea('SE8 2AD')).toBeTruthy();
      expect(postcodeIsWithinDeliveryArea('SW17 2LB')).toBeTruthy();
      expect(postcodeIsWithinDeliveryArea('SE19 2HL')).toBeTruthy();
    });

    it('should return false if postcode is outside delivery area', () => {
      expect(postcodeIsWithinDeliveryArea('DA19 2HL')).toBeFalsy();
      expect(postcodeIsWithinDeliveryArea('DA20 2HL')).toBeFalsy();
    });

    it('should false if input is not a valid postcode prefix', () => {
      expect(postcodeIsWithinDeliveryArea('Se 2LB')).toBeFalsy();
      expect(postcodeIsWithinDeliveryArea('should not work')).toBeFalsy();
      expect(postcodeIsWithinDeliveryArea('GE1 5JK')).toBeFalsy();
    });

    it('should false if input is less than 3 characters', () => {
      expect(postcodeIsWithinDeliveryArea('Se')).toBeFalsy();
    });
  });

  describe('postcodeHasPrefix', () => {
    it('should return true if the postcode prefix matches the prefix', () => {
      const postcode = 'SE23 2AB';
      const prefix = 'SE23';

      expect(postcodeHasPrefix(postcode, prefix)).toBeTruthy();
    });
  });
});
