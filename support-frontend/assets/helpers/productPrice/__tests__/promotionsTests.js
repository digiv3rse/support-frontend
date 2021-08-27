import {
  getAppliedPromo,
  applyDiscount,
  hasIntroductoryPrice,
  hasDiscount,
  getPromotionCopy,
  promotionHTML,
} from '../promotions';

describe('getPromotionCopy', () => {
  const sanitisablePromotionCopy = {
    title: 'The Guardian Weekly',
    description: 'The Guardian Weekly magazine:\n- is a round-up of the [world news opinion and long reads that have shaped the week.](https://www.theguardian.com/about/journalism)\n- with striking photography and insightful companion pieces, all handpicked from the Guardian and the Observer.',
    roundel: '**Save _25%_ for a year!**',
  };

  it('should return promotion copy if it exists', () => {
    expect(getPromotionCopy()).toEqual({});
    expect(getPromotionCopy(sanitisablePromotionCopy)).not.toEqual({});
  });

  it('should return a santised html string when sanitisable promotion copy is provided', () => {
    expect(getPromotionCopy(sanitisablePromotionCopy).title).toEqual(sanitisablePromotionCopy.title);
    expect(getPromotionCopy(sanitisablePromotionCopy).description).toEqual('The Guardian Weekly magazine:<ul><li>is a round-up of the <a href="https://www.theguardian.com/about/journalism">world news opinion and long reads that have shaped the week.</a></li><li>with striking photography and insightful companion pieces, all handpicked from the Guardian and the Observer.</li></ul>');
    expect(getPromotionCopy(sanitisablePromotionCopy).roundel).toEqual('<strong>Save <em>25%</em> for a year!</strong>');
  });
});

describe('hasDiscount', () => {
  it('should cope with all the possible values for promotion.discountPrice', () => {
    expect(hasDiscount(null)).toEqual(false);
    expect(hasDiscount(undefined)).toEqual(false);
    expect(hasDiscount({})).toEqual(false);
    expect(hasDiscount({ discountedPrice: null })).toEqual(false);
    expect(hasDiscount({ discountedPrice: 50 })).toEqual(true);
    expect(hasDiscount({ discountedPrice: 0 })).toEqual(true);
  });
});

describe('getAppliedPromo', () => {
  const promotions = [{
    name: 'examplePromo1',
    description: 'example promotion1',
    promoCode: 1234,
    discountedPrice: 5.99,
  }, {
    name: 'examplePromo2',
    description: 'example promotion2',
    promoCode: 5678,
    introductoryPrice: {
      price: 6.99,
      periodLength: 3,
      periodType: 'issue',
    },
  }];

  it('should return the applied promotion based on inputs', () => {
    expect(getAppliedPromo(promotions)).toEqual({
      description: 'example promotion2',
      introductoryPrice: {
        periodLength: 3,
        periodType: 'issue',
        price: 6.99,
      },
      name: 'examplePromo2',
      promoCode: 5678,
    });

    expect(getAppliedPromo()).toEqual(null);
  });
});

describe('applyDiscount', () => {
  const productWithIntroductoryPrice = {
    price: 12.99,
    currency: 'EUR',
    fixedTerm: false,
    promotions: [{
      name: 'Sept 2019 Discount',
      description: '50% off for 3 months',
      promoCode: 'GH86H9J',
      introductoryPrice: { price: 6.99, periodLength: 6, periodType: 'issue' },
    }],
  };

  const productWithDiscountedPrice = {
    price: 12.99,
    currency: 'EUR',
    fixedTerm: false,
    promotions: [{
      name: 'Sept 2019 Discount',
      description: '25% off',
      promoCode: 'GH86H9J',
      discountedPrice: 8.99,
    }],
  };

  it('should return an updated price with a discount applied', () => {
    expect(applyDiscount(productWithIntroductoryPrice, productWithIntroductoryPrice.promotions[0])).toEqual({
      currency: 'EUR',
      fixedTerm: false,
      price: 6.99,
      promotions: [{
        name: 'Sept 2019 Discount',
        description: '50% off for 3 months',
        promoCode: 'GH86H9J',
        introductoryPrice: { price: 6.99, periodLength: 6, periodType: 'issue' },
      }],
    });

    expect(applyDiscount(productWithDiscountedPrice, productWithDiscountedPrice.promotions[0])).toEqual({
      currency: 'EUR',
      fixedTerm: false,
      price: 8.99,
      promotions: [{
        name: 'Sept 2019 Discount',
        description: '25% off',
        promoCode: 'GH86H9J',
        discountedPrice: 8.99,
      }],
    });
  });
});

describe('hasIntroductoryPrice', () => {
  const promotionWithIntroductoryPrice = {
    name: 'Sept 2019 Discount',
    description: '50% off for 3 months',
    promoCode: 'GH86H9J',
    introductoryPrice: { price: 6.99, periodLength: 6, periodType: 'issue' },
  };

  const promotionWithoutIntroductoryPrice = {
    name: 'Sept 2019 Discount',
    description: '50% off for 3 months',
    promoCode: 'GH86H9J',
  };

  it('should return true if there is an introductory price', () => {
    expect(hasIntroductoryPrice(promotionWithIntroductoryPrice)).toEqual(true);
    expect(hasIntroductoryPrice(promotionWithoutIntroductoryPrice)).toEqual(false);
    expect(hasIntroductoryPrice()).toEqual(false);
  });
});

describe('promotionHTML', () => {
  it('should return promotion html if present', () => {
    expect(promotionHTML()).toEqual(null);
    expect(promotionHTML('Get 25% off').props).toEqual({ __EMOTION_TYPE_PLEASE_DO_NOT_USE__: 'span', css: '', dangerouslySetInnerHTML: { __html: 'Get 25% off' } });
    expect(promotionHTML('Get 20% off', { tag: 'div' }).props).toEqual({ __EMOTION_TYPE_PLEASE_DO_NOT_USE__: 'div', css: '', dangerouslySetInnerHTML: { __html: 'Get 20% off' } });
  });
});
