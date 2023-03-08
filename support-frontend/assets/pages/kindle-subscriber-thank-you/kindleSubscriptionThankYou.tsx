import { Column, Columns, LinkButton } from '@guardian/source-react-components';
import { FooterWithContents } from '@guardian/source-react-components-development-kitchen';
import { useEffect, useMemo } from 'preact/hooks';
import { Header } from 'components/headers/simpleHeader/simpleHeader';
import { Container } from 'components/layout/container';
import { PageScaffold } from 'components/page/pageScaffold';
import type { ThankYouModuleType } from 'components/thankYou/thankYouModule';
import ThankYouModule from 'components/thankYou/thankYouModule';
import { getThankYouModuleData } from 'components/thankYou/thankYouModuleData';
import type { CampaignSettings } from 'helpers/campaigns/campaigns';
import { getCampaignSettings } from 'helpers/campaigns/campaigns';
import { DirectDebit } from 'helpers/forms/paymentMethods';
import { getSubscriptionPrices } from 'helpers/redux/checkout/product/selectors/subscriptionPrice';
import { useContributionsSelector } from 'helpers/redux/storeHooks';
import { OPHAN_COMPONENT_ID_RETURN_TO_GUARDIAN } from 'helpers/thankYouPages/utils/ophan';
import { trackComponentClick } from 'helpers/tracking/behaviour';
import ThankYouFooter from 'pages/supporter-plus-thank-you/components/thankYouFooter';
import {
	buttonContainer,
	checkoutContainer,
	columnContainer,
	firstColumnContainer,
	headerContainer,
} from 'pages/supporter-plus-thank-you/supporterPlusThankYou';
import ThankYouHeader from './components/thankYouHeader';

export function KindleSubscriptionThankYou(): JSX.Element {
	const campaignSettings = useMemo<CampaignSettings | null>(
		() => getCampaignSettings(campaignCode),
		[],
	);
	const { countryId, countryGroupId, currencyId } = useContributionsSelector(
		(state) => state.common.internationalisation,
	);
	const { csrf } = useContributionsSelector((state) => state.page.checkoutForm);
	const { campaignCode } = useContributionsSelector(
		(state) => state.common.referrerAcquisitionData,
	);
	const { firstName, email, userTypeFromIdentityResponse } =
		useContributionsSelector(
			(state) => state.page.checkoutForm.personalDetails,
		);
	const paymentMethod = useContributionsSelector(
		(state) => state.page.checkoutForm.payment.paymentMethod.name,
	);
	const { billingPeriod } = useContributionsSelector(
		(state) => state.page.checkoutForm.product,
	);
	const { isSignedIn } = useContributionsSelector((state) => state.page.user);
	const isNewAccount = userTypeFromIdentityResponse === 'new';
	const { monthlyPrice, annualPrice } = useContributionsSelector(
		getSubscriptionPrices,
	);
	// const isAmountLargeDonation = amount
	// 	? isLargeDonation(amount, contributionType, paymentMethod)
	// 	: false;

	useEffect(() => {
		if (monthlyPrice || annualPrice) {
			// TO-DO - add tracking for Kindle
			//
			// sendEventContributionCheckoutConversion(
			// 	amount,
			// 	contributionType,
			// 	currencyId,
			// );
			// trackUserData(
			// 	paymentMethod,
			// 	contributionType,
			// 	isSignedIn,
			// 	!isNewAccount,
			// 	isAmountLargeDonation,
			// );
		}
	}, []);

	const thankYouModuleData = getThankYouModuleData(
		countryId,
		countryGroupId,
		campaignSettings?.createReferralCodes ?? false,
		csrf,
		email,
		campaignSettings?.campaignCode,
	);

	const maybeThankYouModule = (
		condtion: boolean,
		moduleType: ThankYouModuleType,
	): ThankYouModuleType[] => (condtion ? [moduleType] : []);

	const thankYouModules: ThankYouModuleType[] = [
		...maybeThankYouModule(isNewAccount, 'signUp'),
		...maybeThankYouModule(
			!isNewAccount && !isSignedIn && email.length > 0,
			'signIn',
		),
		'appDownloadKindle',
		// Disable Feedback module
		// 'feedbackKindle', // we will need to create this
		...maybeThankYouModule(countryId === 'AU', 'ausMap'),
		'socialShare',
	];

	const numberOfModulesInFirstColumn = thankYouModules.length === 3 ? 1 : 2;
	const firstColumn = thankYouModules.slice(0, numberOfModulesInFirstColumn);
	const secondColumn = thankYouModules.slice(numberOfModulesInFirstColumn);

	return (
		<PageScaffold
			id="supporter-plus-thank-you"
			header={<Header />}
			footer={
				<FooterWithContents>
					<ThankYouFooter />
				</FooterWithContents>
			}
		>
			<div css={checkoutContainer}>
				<Container>
					<div css={headerContainer}>
						<ThankYouHeader
							name={firstName}
							showDirectDebitMessage={paymentMethod === DirectDebit}
							billingPeriod={billingPeriod}
							amount={billingPeriod === 'Monthly' ? monthlyPrice : annualPrice}
							currency={currencyId}
						/>
					</div>

					<Columns collapseUntil="desktop">
						<Column cssOverrides={[columnContainer, firstColumnContainer]}>
							{firstColumn.map((moduleType) => (
								<ThankYouModule
									moduleType={moduleType}
									isSignedIn={isSignedIn}
									{...thankYouModuleData[moduleType]}
								/>
							))}
						</Column>
						<Column cssOverrides={columnContainer}>
							{secondColumn.map((moduleType) => (
								<ThankYouModule
									moduleType={moduleType}
									isSignedIn={isSignedIn}
									{...thankYouModuleData[moduleType]}
								/>
							))}
						</Column>
					</Columns>

					<div css={buttonContainer}>
						<LinkButton
							href="https://www.theguardian.com"
							priority="tertiary"
							onClick={() =>
								trackComponentClick(OPHAN_COMPONENT_ID_RETURN_TO_GUARDIAN)
							}
						>
							Return to the Guardian
						</LinkButton>
					</div>
				</Container>
			</div>
		</PageScaffold>
	);
}