import { css } from '@emotion/react';
import { space, until } from '@guardian/source-foundations';
import { Button } from '@guardian/source-react-components';
import { useNavigate } from 'react-router-dom';
import { Box, BoxContents } from 'components/checkoutBox/checkoutBox';
import { ContributionsOrderSummary } from 'components/orderSummary/contributionsOrderSummary';
import { ContributionsOrderSummaryContainer } from 'components/orderSummary/contributionsOrderSummaryContainer';
import { PaymentButtonController } from 'components/paymentButton/paymentButtonController';
import { PaymentMethodSelector } from 'components/paymentMethodSelector/paymentMethodSelector';
import PaymentMethodSelectorContainer from 'components/paymentMethodSelector/PaymentMethodSelectorContainer';
import { PaymentRequestButtonContainer } from 'components/paymentRequestButton/paymentRequestButtonContainer';
import { PersonalDetails } from 'components/personalDetails/personalDetails';
import { PersonalDetailsContainer } from 'components/personalDetails/personalDetailsContainer';
import { SavedCardButton } from 'components/savedCardButton/savedCardButton';
import { ContributionsStripe } from 'components/stripe/contributionsStripe';
import { checkoutTopUpUpperThresholdsByCountryGroup } from 'helpers/checkoutTopUp/upperThreshold';
import { countryGroups } from 'helpers/internationalisation/countryGroup';
import { setSelectedAmount } from 'helpers/redux/checkout/product/actions';
import { getContributionType } from 'helpers/redux/checkout/product/selectors/productType';
import {
	getUserSelectedAmount,
	getUserSelectedAmountBeforeAmendment,
} from 'helpers/redux/checkout/product/selectors/selectedAmount';
import {
	useContributionsDispatch,
	useContributionsSelector,
} from 'helpers/redux/storeHooks';
import { shouldShowSupporterPlusMessaging } from 'helpers/supporterPlus/showMessaging';
import { CheckoutDivider } from '../components/checkoutDivider';
import { DirectDebitContainer } from '../components/directDebitWrapper';
import { PaymentFailureMessage } from '../components/paymentFailure';
import { PaymentTsAndCs } from '../components/paymentTsAndCs';
import { getPaymentMethodButtons } from '../paymentButtons';
import { SupporterPlusCheckoutScaffold } from './checkoutScaffold';

const shorterBoxMargin = css`
	:not(:last-child) {
		${until.tablet} {
			margin-bottom: ${space[2]}px;
		}
	}
`;

export function SupporterPlusCheckout({
	thankYouRoute,
	showTopUpAmounts,
}: {
	thankYouRoute: string;
	showTopUpAmounts: boolean;
}): JSX.Element {
	const dispatch = useContributionsDispatch();
	const { countryGroupId, countryId, currencyId } = useContributionsSelector(
		(state) => state.common.internationalisation,
	);
	const { switches } = useContributionsSelector(
		(state) => state.common.settings,
	);
	const { selectedAmounts, otherAmounts } = useContributionsSelector(
		(state) => state.page.checkoutForm.product,
	);
	const contributionType = useContributionsSelector(getContributionType);
	const amount = useContributionsSelector(getUserSelectedAmount);
	const amountBeforeAmendments = useContributionsSelector(
		getUserSelectedAmountBeforeAmendment,
	);

	const amountIsAboveThreshold = shouldShowSupporterPlusMessaging(
		contributionType,
		selectedAmounts,
		otherAmounts,
		countryGroupId,
	);

	const showPreAmendedTotal =
		showTopUpAmounts &&
		contributionType !== 'ONE_OFF' &&
		amountBeforeAmendments <=
			checkoutTopUpUpperThresholdsByCountryGroup[countryGroupId][
				contributionType
			];

	const navigate = useNavigate();

	const changeButton = (
		<Button
			priority="tertiary"
			size="xsmall"
			onClick={() => {
				dispatch(
					setSelectedAmount({
						contributionType: contributionType,
						amount: `${amountBeforeAmendments}`,
					}),
				);
				navigate(
					`/${countryGroups[countryGroupId].supportInternationalisationId}/contribute`,
				);
			}}
		>
			Change
		</Button>
	);

	return (
		<SupporterPlusCheckoutScaffold thankYouRoute={thankYouRoute} isPaymentPage>
			<Box cssOverrides={shorterBoxMargin}>
				<BoxContents>
					<ContributionsOrderSummaryContainer
						renderOrderSummary={(orderSummaryProps) => (
							<ContributionsOrderSummary
								{...orderSummaryProps}
								headerButton={changeButton}
								showTopUpAmounts={showTopUpAmounts}
								showPreAmendedTotal={showPreAmendedTotal}
							/>
						)}
					/>
				</BoxContents>
			</Box>
			<Box cssOverrides={shorterBoxMargin}>
				<BoxContents>
					{/* The same Stripe provider *must* enclose the Stripe card form and payment button(s). Also enclosing the PRB reduces re-renders. */}
					<ContributionsStripe>
						<PaymentRequestButtonContainer CustomButton={SavedCardButton} />
						<PersonalDetailsContainer
							renderPersonalDetails={(personalDetailsProps) => (
								<PersonalDetails
									{...personalDetailsProps}
									overrideHeadingCopy="1. Your details"
								/>
							)}
						/>
						<CheckoutDivider spacing="loose" />
						<PaymentMethodSelectorContainer
							render={(paymentMethodSelectorProps) => (
								<PaymentMethodSelector
									{...paymentMethodSelectorProps}
									overrideHeadingCopy="2. Payment method"
								/>
							)}
						/>
						<PaymentButtonController
							cssOverrides={css`
								margin-top: 30px;
							`}
							paymentButtons={getPaymentMethodButtons(
								contributionType,
								switches,
								countryId,
								countryGroupId,
							)}
						/>
						<PaymentFailureMessage />
						<DirectDebitContainer />
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
		</SupporterPlusCheckoutScaffold>
	);
}
