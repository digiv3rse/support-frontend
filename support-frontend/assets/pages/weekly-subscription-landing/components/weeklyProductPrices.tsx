import type { Product } from 'components/product/productOption';
import type { IsoCountry } from 'helpers/internationalisation/country';
import { currencies } from 'helpers/internationalisation/currency';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import type { WeeklyBillingPeriod } from 'helpers/productPrice/billingPeriods';
import {
	billingPeriodTitle,
	weeklyBillingPeriods,
	weeklyGiftBillingPeriods,
} from 'helpers/productPrice/billingPeriods';
import 'components/product/productOption';
import { getWeeklyFulfilmentOption } from 'helpers/productPrice/fulfilmentOptions';
import { getSimplifiedPriceDescription } from 'helpers/productPrice/priceDescriptions';
import {
	getFirstValidPrice,
	getProductPrice,
} from 'helpers/productPrice/productPrices';
import type {
	ProductPrice,
	ProductPrices,
} from 'helpers/productPrice/productPrices';
import type { Promotion } from 'helpers/productPrice/promotions';
import {
	getAppliedPromo,
	promoQueryParam,
} from 'helpers/productPrice/promotions';
import type { SubscriptionProduct } from 'helpers/productPrice/subscriptions';
import {
	fixDecimals,
	sendTrackingEventsOnClick,
	sendTrackingEventsOnView,
} from 'helpers/productPrice/subscriptions';
import { getOrigin, getQueryParameter } from 'helpers/urls/url';
import type { OphanComponentType } from '../../../helpers/tracking/ophan';
import Prices from './content/prices';

const getCheckoutUrl = (
	billingPeriod: WeeklyBillingPeriod,
	orderIsGift: boolean,
): string => {
	const promoCode = getQueryParameter(promoQueryParam);
	const promoQuery = promoCode ? `&${promoQueryParam}=${promoCode}` : '';
	const gift = orderIsGift ? '/gift' : '';
	return `${getOrigin()}/subscribe/weekly/checkout${gift}?period=${billingPeriod.toString()}${promoQuery}`;
};

const getCurrencySymbol = (currencyId: IsoCurrency): string =>
	currencies[currencyId].glyph;

const getPriceWithSymbol = (currencyId: IsoCurrency, price: number) =>
	getCurrencySymbol(currencyId) + fixDecimals(price);

const getPromotionLabel = (promotion?: Promotion) => {
	if (!promotion || !promotion.discount) {
		return '';
	}

	return `Save ${Math.round(promotion.discount.amount)}%`;
};

const getMainDisplayPrice = (
	productPrice: ProductPrice,
	promotion?: Promotion | null,
): number => {
	if (promotion) {
		const introductoryPrice = promotion.introductoryPrice?.price;
		return getFirstValidPrice(
			promotion.discountedPrice,
			introductoryPrice,
			productPrice.price,
		);
	}

	return productPrice.price;
};

const weeklyProductProps = (
	billingPeriod: WeeklyBillingPeriod,
	productPrice: ProductPrice,
	orderIsAGift = false,
) => {
	const promotion = getAppliedPromo(productPrice.promotions);
	const mainDisplayPrice = getMainDisplayPrice(productPrice, promotion);
	const offerCopy = promotion?.landingPage?.roundel ?? '';
	const trackingProperties = {
		id: orderIsAGift
			? `subscribe_now_cta_gift-${billingPeriod}`
			: `subscribe_now_cta-${billingPeriod}`,
		product: 'GuardianWeekly' as SubscriptionProduct,
		componentType: 'ACQUISITIONS_BUTTON' as OphanComponentType,
	};

	// TODO: remove/review this when the 12 for 12 offer is over
	const isSpecialOffer = promotion?.promoCode.startsWith('12for12');
	const label = isSpecialOffer
		? `Special Offer: 12 for ${currencies[productPrice.currency].glyph}${
				promotion?.discountedPrice ?? '12'
		  }`
		: getPromotionLabel(promotion);

	return {
		title: billingPeriodTitle(billingPeriod, orderIsAGift),
		price: getPriceWithSymbol(productPrice.currency, mainDisplayPrice),
		offerCopy,
		priceCopy: (
			<span>{getSimplifiedPriceDescription(productPrice, billingPeriod)}</span>
		),
		buttonCopy: 'Subscribe now',
		href: getCheckoutUrl(billingPeriod, orderIsAGift),
		label,
		onClick: sendTrackingEventsOnClick(trackingProperties),
		onView: sendTrackingEventsOnView(trackingProperties),
		isSpecialOffer,
	};
};

type WeeklyProductPricesProps = {
	countryId: IsoCountry;
	productPrices: ProductPrices | null | undefined;
	orderIsAGift: boolean;
	isPriceCardsAbTestVariant?: boolean;
};

const getProducts = ({
	countryId,
	productPrices,
	orderIsAGift,
}: WeeklyProductPricesProps): Product[] => {
	const billingPeriodsToUse = orderIsAGift
		? weeklyGiftBillingPeriods
		: weeklyBillingPeriods();

	return billingPeriodsToUse.map((billingPeriod) => {
		const productPrice = productPrices
			? getProductPrice(
					productPrices,
					countryId,
					billingPeriod,
					getWeeklyFulfilmentOption(countryId),
			  )
			: {
					price: 0,
					fixedTerm: false,
					currency: 'GBP' as IsoCurrency,
			  };

		return weeklyProductProps(billingPeriod, productPrice, orderIsAGift);
	});
};

function WeeklyProductPrices({
	countryId,
	productPrices,
	orderIsAGift,
	isPriceCardsAbTestVariant,
}: WeeklyProductPricesProps): JSX.Element | null {
	if (!productPrices) {
		return null;
	}

	const products = getProducts({
		countryId,
		productPrices,
		orderIsAGift,
		isPriceCardsAbTestVariant,
	});

	return (
		<Prices
			products={products}
			orderIsAGift={orderIsAGift}
			isPriceCardsAbTestVariant={isPriceCardsAbTestVariant ?? false}
		/>
	);
}

// ----- Exports ----- //

export default WeeklyProductPrices;
