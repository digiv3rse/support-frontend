import { css, ThemeProvider } from '@emotion/react';
import {
	brand,
	from,
	neutral,
	space,
	textSans,
	until,
} from '@guardian/source-foundations';
import {
	Button,
	buttonThemeReaderRevenueBrand,
	Column,
	Columns,
	Hide,
} from '@guardian/source-react-components';
import {
	FooterLinks,
	FooterWithContents,
} from '@guardian/source-react-components-development-kitchen';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, BoxContents } from 'components/checkoutBox/checkoutBox';
import { CheckoutHeading } from 'components/checkoutHeading/checkoutHeading';
import type { CountryGroupSwitcherProps } from 'components/countryGroupSwitcher/countryGroupSwitcher';
import CountryGroupSwitcher from 'components/countryGroupSwitcher/countryGroupSwitcher';
import GridImage from 'components/gridImage/gridImage';
import { CountrySwitcherContainer } from 'components/headers/simpleHeader/countrySwitcherContainer';
import { Header } from 'components/headers/simpleHeader/simpleHeader';
import { Container } from 'components/layout/container';
import { LoadingOverlay } from 'components/loadingOverlay/loadingOverlay';
import Nav from 'components/nav/nav';
import { PageScaffold } from 'components/page/pageScaffold';
import { PaymentButtonController } from 'components/paymentButton/paymentButtonController';
import { PaymentMethodSelector } from 'components/paymentMethodSelector/paymentMethodSelector';
import PaymentMethodSelectorContainer from 'components/paymentMethodSelector/PaymentMethodSelectorContainer';
import { PaymentRequestButtonContainer } from 'components/paymentRequestButton/paymentRequestButtonContainer';
import { PersonalDetails } from 'components/personalDetails/personalDetails';
import { PersonalDetailsContainer } from 'components/personalDetails/personalDetailsContainer';
import { SavedCardButton } from 'components/savedCardButton/savedCardButton';
import { SecureTransactionIndicator } from 'components/secureTransactionIndicator/secureTransactionIndicator';
import { ContributionsStripe } from 'components/stripe/contributionsStripe';
import type { ContributionType } from 'helpers/contributions';
import { simpleFormatAmount } from 'helpers/forms/checkouts';
import {
	AUDCountries,
	Canada,
	EURCountries,
	GBPCountries,
	International,
	NZDCountries,
	UnitedStates,
} from 'helpers/internationalisation/countryGroup';
import { currencies } from 'helpers/internationalisation/currency';
import { getContributionType } from 'helpers/redux/checkout/product/selectors/productType';
import { getUserSelectedAmount } from 'helpers/redux/checkout/product/selectors/selectedAmount';
import { useContributionsSelector } from 'helpers/redux/storeHooks';
import { shouldShowSupporterPlusMessaging } from 'helpers/supporterPlus/showMessaging';
import { CheckoutDivider } from './components/checkoutDivider';
import { DirectDebitContainer } from './components/directDebitWrapper';
import { GuardianTsAndCs } from './components/guardianTsAndCs';
import { LandingPageHeading } from './components/landingPageHeading';
import { PatronsMessage } from './components/patronsMessage';
import { PaymentFailureMessage } from './components/paymentFailure';
import { PaymentTsAndCs } from './components/paymentTsAndCs';
import { AmountAndBenefits } from './formSections/amountAndBenefits';
import { getPaymentMethodButtons } from './paymentButtons';

const buttonContainerCss = css`
	background-color: ${brand[400]};
	padding: ${space[5]}px 0 ${space[9]}px;
	${until.tablet} {
		display: flex;
		flex-direction: column;
		position: sticky;
		bottom: 0;
		margin-left: -${space[3]}px;
		margin-right: -${space[3]}px;
		padding-left: ${space[6]}px;
		padding-right: ${space[6]}px;
	}
`;
const buttonStuckCss = css`
	${until.tablet} {
		background-color: ${neutral[100]};
		box-shadow: 0px -1px 16px rgba(0, 0, 0, 0.1);
	}
`;
const buttonCentredCss = css`
	justify-content: center;
`;

const checkoutContainer = css`
	position: relative;
	color: ${neutral[7]};
	${textSans.medium()};

	padding-top: ${space[3]}px;
	padding-bottom: ${space[9]}px;

	${from.tablet} {
		padding-bottom: ${space[12]}px;
	}

	${from.desktop} {
		padding-top: ${space[6]}px;
	}
`;

const darkBackgroundContainerMobile = css`
	background-color: ${neutral[97]};
	${until.tablet} {
		background-color: ${brand[400]};
	}
`;

const shorterBoxMargin = css`
	:not(:last-child) {
		${until.tablet} {
			margin-bottom: ${space[2]}px;
		}
	}
`;
const displayContributionsStripe = (display?: boolean) => css`
	display: inline;
	${until.tablet} {
		display: ${display ? 'inline' : 'none'};
	}
`;

const subheading = css`
	font-weight: normal;
	padding-right: ${space[2]}px;
`;

export function SupporterPlusLandingPage({
	thankYouRoute,
}: {
	thankYouRoute: string;
}): JSX.Element {
	const contributionTypeToPaymentInterval: Partial<
		Record<ContributionType, 'month' | 'year'>
	> = {
		MONTHLY: 'month',
		ANNUAL: 'year',
	};

	const { countryGroupId, countryId, currencyId } = useContributionsSelector(
		(state) => state.common.internationalisation,
	);
	const currency = currencies[currencyId];
	const { switches } = useContributionsSelector(
		(state) => state.common.settings,
	);
	const { selectedAmounts, otherAmounts } = useContributionsSelector(
		(state) => state.page.checkoutForm.product,
	);
	const selectedAmount = useContributionsSelector(getUserSelectedAmount);
	const contributionType = useContributionsSelector(getContributionType);
	const amount = useContributionsSelector(getUserSelectedAmount);
	const amountWithCurrency = simpleFormatAmount(currency, selectedAmount);

	const amountIsAboveThreshold = shouldShowSupporterPlusMessaging(
		contributionType,
		selectedAmounts,
		otherAmounts,
		countryGroupId,
	);

	const optimisedMobileLayout1 = useContributionsSelector(
		isUserInAbVariant('supporterPlusMobileTest1', 'variant'),
	);
	const optimisedMobileLayout2 = useContributionsSelector(
		isUserInAbVariant('supporterPlusMobileTest2', 'variant'),
	);
	const optimisedMobileLayout =
		optimisedMobileLayout1 || optimisedMobileLayout2;
	const { paymentComplete, isWaiting } = useContributionsSelector(
		(state) => state.page.form,
	);

	const navigate = useNavigate();

	const countrySwitcherProps: CountryGroupSwitcherProps = {
		countryGroupIds: [
			GBPCountries,
			UnitedStates,
			AUDCountries,
			EURCountries,
			NZDCountries,
			Canada,
			International,
		],
		selectedCountryGroup: countryGroupId,
		subPath: '/contribute',
	};
	const heading = <LandingPageHeading />;

	useEffect(() => {
		if (paymentComplete) {
			navigate(thankYouRoute, { replace: true });
		}
	}, [paymentComplete]);

	const buttonContainerRef = useRef(null);
	const [stripeDisplayed, setStripeDisplayed] = useState(
		!optimisedMobileLayout2,
	);
	const [buttonIsStuck, setButtonIsStuck] = useState(false);

	// Use IntersectionObserver to detect when button is 'stuck' at the bottom
	// of the viewport. The bottom of the observable area is set to -1px so that
	// when the button is stuck it is not considered to be fully visible. The
	// top edge is similarly extended upwards so the button is considered fully
	// visible when scrolling off the top of the screen.

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setButtonIsStuck(entry.intersectionRatio < 1);
			},
			{ threshold: [1], rootMargin: '100px 0px -1px 0px' },
		);

		return () => {
			observer.disconnect();
		};
	}, [buttonContainerRef]);

	function onStickyButtonClick() {
		setStripeDisplayed(!stripeDisplayed);
	}

	function getStickyButtonText(
		amountWithCurrency: string,
		paymentInterval?: 'month' | 'year',
	) {
		if (!amountWithCurrency.includes('NaN')) {
			if (paymentInterval) {
				return `Continue with ${amountWithCurrency} per ${paymentInterval}`;
			}
			return `Continue with ${amountWithCurrency}`;
		}
		return `Continue`;
	}

	return (
		<>
			<PageScaffold
				id="supporter-plus-landing"
				header={
					<>
						<Header>
							<Hide from="desktop">
								<CountrySwitcherContainer>
									<CountryGroupSwitcher {...countrySwitcherProps} />
								</CountrySwitcherContainer>
							</Hide>
						</Header>
						<Nav {...countrySwitcherProps} />
					</>
				}
				footer={
					optimisedMobileLayout1 ? (
						<FooterWithContents>
							<FooterLinks></FooterLinks>
						</FooterWithContents>
					) : (
						``
					)
				}
			>
				<CheckoutHeading
					heading={heading}
					image={
						<GridImage
							gridId="supporterPlusLanding"
							srcSizes={[500]}
							sizes="500px"
							imgType="png"
							altText=""
						/>
					}
				>
					<p css={subheading}>
						As a reader-funded news organisation, we rely on your generosity.
						Please give what you can, so millions can benefit from quality
						reporting on the events shaping our world.
					</p>
				</CheckoutHeading>
				<Container
					sideBorders
					cssOverrides={
						optimisedMobileLayout
							? darkBackgroundContainerMobile
							: backgroundContainer
					}
				>
					<Columns cssOverrides={checkoutContainer} collapseUntil="tablet">
						<Column span={[0, 2, 5]}></Column>
						<Column span={[1, 8, 7]}>
							<Hide from="desktop">
								{optimisedMobileLayout1 ? (
									<SecureTransactionIndicator
										align="left"
										theme="light"
										cssOverrides={css`
											margin-bottom: 10px;
										`}
									/>
								) : (
									heading
								)}
							</Hide>
							<Box
								cssOverrides={optimisedMobileLayout ? shorterBoxMargin : css``}
							>
								<AmountAndBenefits />
							</Box>
							<div css={displayContributionsStripe(stripeDisplayed)}>
								<Box
									cssOverrides={
										optimisedMobileLayout ? shorterBoxMargin : css``
									}
								>
									<BoxContents>
										{/* The same Stripe provider *must* enclose the Stripe card form and payment button(s). Also enclosing the PRB reduces re-renders. */}
										<ContributionsStripe>
											<SecureTransactionIndicator />
											<PaymentRequestButtonContainer
												CustomButton={SavedCardButton}
											/>
											<PersonalDetailsContainer
												renderPersonalDetails={(personalDetailsProps) => (
													<PersonalDetails {...personalDetailsProps} />
												)}
											/>
											<CheckoutDivider spacing="loose" />
											<PaymentMethodSelectorContainer
												render={(paymentMethodSelectorProps) => (
													<PaymentMethodSelector
														{...paymentMethodSelectorProps}
													/>
												)}
											/>
											<PaymentButtonController
												cssOverrides={
													optimisedMobileLayout
														? css`
																margin-top: 30px;
														  `
														: css``
												}
												paymentButtons={getPaymentMethodButtons(
													contributionType,
													switches,
													countryId,
													countryGroupId,
												)}
											/>
											<ExistingRecurringContributorMessage />
											<PaymentFailureMessage />
											<DirectDebitContainer />
											{!optimisedMobileLayout && (
												<>
													<CheckoutDivider
														spacing="loose"
														mobileTheme={'dark'}
													/>
													<PatronsMessage
														countryGroupId={countryGroupId}
														mobileTheme={'dark'}
													/>
													<CheckoutDivider
														spacing="tight"
														mobileTheme={'dark'}
													/>
													<GuardianTsAndCs mobileTheme={'dark'} />
												</>
											)}
										</ContributionsStripe>
										<PaymentTsAndCs
											countryGroupId={countryGroupId}
											contributionType={contributionType}
											currency={currencyId}
											amount={amount}
											amountIsAboveThreshold={amountIsAboveThreshold}
										/>
									</BoxContents>
								</Box>
								{optimisedMobileLayout && (
									<>
										<CheckoutDivider spacing="loose" mobileTheme={'light'} />
										<PatronsMessage
											countryGroupId={countryGroupId}
											mobileTheme={'light'}
										/>
										<CheckoutDivider spacing="tight" mobileTheme={'light'} />
										<GuardianTsAndCs mobileTheme={'light'} />
									</>
								)}
							</div>
						</Column>
					</Columns>
				</Container>
				{isWaiting && (
					<LoadingOverlay>
						<p>Processing transaction</p>
						<p>Please wait</p>
					</LoadingOverlay>
				)}
			</PageScaffold>

			{optimisedMobileLayout2 && (
				<div css={displayContributionsStripe(!stripeDisplayed)}>
					<section
						css={[
							buttonContainerCss,
							buttonIsStuck && buttonStuckCss,
							css`
								display: none;
							`,
						]}
						ref={buttonContainerRef}
					>
						<ThemeProvider theme={buttonThemeReaderRevenueBrand}>
							<Button
								size="small"
								cssOverrides={buttonCentredCss}
								onClick={() => onStickyButtonClick()}
							>
								{getStickyButtonText(
									amountWithCurrency,
									contributionTypeToPaymentInterval[contributionType],
								)}
							</Button>
						</ThemeProvider>
					</section>
				</div>
			)}
			{optimisedMobileLayout2 && (
				<FooterWithContents>
					<FooterLinks></FooterLinks>
				</FooterWithContents>
			)}
		</>
	);
}
