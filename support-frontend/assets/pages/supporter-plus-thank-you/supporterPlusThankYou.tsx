import { css } from '@emotion/react';
import { between, from, space, sport } from '@guardian/source-foundations';
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
import type { ContributionType } from 'helpers/contributions';
import { getAmount } from 'helpers/contributions';
import type { PaymentMethod } from 'helpers/forms/paymentMethods';
import { DirectDebit, PayPal } from 'helpers/forms/paymentMethods';
import { getContributionType } from 'helpers/redux/checkout/product/selectors/productType';
import { useContributionsSelector } from 'helpers/redux/storeHooks';
import { trackComponentClick } from 'helpers/tracking/behaviour';
import ContributionThankYouHeader from 'pages/contributions-landing/components/ContributionThankYou/ContributionThankYouHeader';
import {
	OPHAN_COMPONENT_ID_RETURN_TO_GUARDIAN,
	trackUserData,
} from 'pages/contributions-landing/components/ContributionThankYou/utils/ophan';
import { showBenefitsThankYouText as shouldShowBenefitsThankYouText } from 'pages/contributions-landing/components/DigiSubBenefits/helpers';
import ThankYouFooter from './components/thankYouFooter';

const checkoutContainer = css`
	${from.tablet} {
		background-color: ${sport[800]};
	}
`;

const columnContainer = css`
	> *:not(:last-child) {
		${from.tablet} {
			margin-bottom: ${space[6]}px;
		}

		${from.desktop} {
			margin-bottom: ${space[5]}px;
		}
	}
`;

const firstColumnContainer = css`
		${between.tablet.and.desktop} {
			margin-bottom: ${space[6]}px;
		}
	}
`;

const headerContainer = css`
	${from.desktop} {
		width: 60%;
	}
	${from.leftCol} {
		width: calc(50% - ${space[3]}px);
	}
`;

const buttonContainer = css`
	padding: ${space[12]}px 0;
`;

const isLargeDonation = (
	amount: number,
	contributionType: ContributionType,
	paymentMethod: PaymentMethod,
): boolean => {
	if (paymentMethod === PayPal && contributionType === 'ONE_OFF') {
		// We do not have the amount after the redirect
		return false;
	}

	const largeDonations = {
		MONTHLY: 20,
		ANNUAL: 100,
		ONE_OFF: 100,
	};
	return amount >= largeDonations[contributionType];
};

export function SupporterPlusThankYou(): JSX.Element {
	const campaignSettings = useMemo<CampaignSettings | null>(
		() => getCampaignSettings(campaignCode),
		[],
	);

	useEffect(() => {
		trackUserData(
			paymentMethod,
			contributionType,
			isSignedIn,
			!isNewAccount,
			isLargeDonation(amount, contributionType, paymentMethod),
		);
	}, []);

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
	const { paymentMethod } = useContributionsSelector(
		(state) => state.page.checkoutForm.payment,
	);
	const { selectedAmounts, otherAmounts } = useContributionsSelector(
		(state) => state.page.checkoutForm.product,
	);
	const { isSignedIn } = useContributionsSelector((state) => state.page.user);
	const contributionType = useContributionsSelector(getContributionType);
	const isNewAccount = userTypeFromIdentityResponse === 'new';
	const isInNewProductTest =
		useContributionsSelector(
			(state) => state.common.abParticipations.newProduct,
		) === 'variant';

	const amount = getAmount(selectedAmounts, otherAmounts, contributionType);

	const showNewProductThankYouText =
		isInNewProductTest &&
		shouldShowBenefitsThankYouText(countryId, amount, contributionType);

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

	const defaultTYModuleTypes: ThankYouModuleType[] = [
		...maybeThankYouModule(isNewAccount, 'signUp'),
		...maybeThankYouModule(
			!isNewAccount && !isSignedIn && email.length > 0,
			'signIn',
		),
		...maybeThankYouModule(contributionType !== 'ONE_OFF', 'appDownload'),
		...maybeThankYouModule(
			contributionType === 'ONE_OFF' && email.length > 0,
			'marketingConsent',
		),
		...maybeThankYouModule(
			contributionType === 'ONE_OFF' && email.length > 0,
			'supportReminder',
		),
		'feedback',
		'socialShare',
	];

	const ausTYModuleTypes: ThankYouModuleType[] = [
		...maybeThankYouModule(isNewAccount, 'signUp'),
		...maybeThankYouModule(
			!isNewAccount && !isSignedIn && email.length > 0,
			'signIn',
		),
		...maybeThankYouModule(contributionType !== 'ONE_OFF', 'appDownload'),
		...maybeThankYouModule(
			contributionType === 'ONE_OFF' && email.length > 0,
			'marketingConsent',
		),
		...maybeThankYouModule(
			contributionType === 'ONE_OFF' && email.length > 0,
			'supportReminder',
		),
		'feedback',
		...maybeThankYouModule(countryId === 'AU', 'ausMap'),
		'socialShare',
	];

	const thankYouModules =
		countryId === 'AU' ? ausTYModuleTypes : defaultTYModuleTypes;

	const numberOfModulesInFirstColumn = thankYouModules.length >= 6 ? 3 : 2;
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
						<ContributionThankYouHeader
							name={firstName}
							showDirectDebitMessage={paymentMethod === DirectDebit}
							paymentMethod={paymentMethod}
							contributionType={contributionType}
							amount={amount}
							currency={currencyId}
							shouldShowLargeDonationMessage={isLargeDonation(
								amount,
								contributionType,
								paymentMethod,
							)}
							showNewProductThankYouText={showNewProductThankYouText}
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
