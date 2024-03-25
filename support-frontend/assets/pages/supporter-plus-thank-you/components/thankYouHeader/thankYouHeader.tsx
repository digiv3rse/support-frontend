import { css } from '@emotion/react';
import { body, from, space, titlepiece } from '@guardian/source-foundations';
import type { ContributionType } from 'helpers/contributions';
import type { IsoCurrency } from 'helpers/internationalisation/currency';
import type { UserTypeFromIdentityResponse } from 'helpers/redux/checkout/personalDetails/state';
import DirectDebitMessage from './directDebitMessage';
import Heading from './heading';
import Subheading, { ToteHeading } from './subheading';

export const header = css`
	background: white;
	padding-top: ${space[4]}px;
	padding-bottom: ${space[5]}px;

	${from.tablet} {
		background: none;
	}
`;

export const headerTitleText = css`
	${titlepiece.small()};
	font-size: 24px;
	${from.tablet} {
		font-size: 40px;
	}
`;

export const headerSupportingText = css`
	${body.small()};
	padding-top: ${space[3]}px;

	${from.tablet} {
		font-size: 17px;
	}
`;

type ThankYouHeaderProps = {
	name: string | null;
	showDirectDebitMessage: boolean;
	isOneOffPayPal: boolean;
	contributionType: ContributionType;
	amount: number | undefined;
	currency: IsoCurrency;
	amountIsAboveThreshold: boolean;
	isSignedIn: boolean;
	userTypeFromIdentityResponse: UserTypeFromIdentityResponse;
	showTote?: boolean;
};

function ThankYouHeader({
	name,
	showDirectDebitMessage,
	isOneOffPayPal,
	contributionType,
	amount,
	currency,
	amountIsAboveThreshold,
	isSignedIn,
	userTypeFromIdentityResponse,
	showTote,
}: ThankYouHeaderProps): JSX.Element {
	return (
		<header css={header}>
			<h1 css={headerTitleText}>
				<Heading
					name={name}
					isOneOffPayPal={isOneOffPayPal}
					amount={amount}
					currency={currency}
					contributionType={contributionType}
				/>
			</h1>
			<p css={headerSupportingText}>
				{showDirectDebitMessage && <DirectDebitMessage />}
				<Subheading
					contributionType={contributionType}
					amountIsAboveThreshold={amountIsAboveThreshold}
					isSignedIn={isSignedIn}
					userTypeFromIdentityResponse={userTypeFromIdentityResponse}
				/>
			</p>
			{showTote && (
				<p css={headerSupportingText}>
					<ToteHeading />
				</p>
			)}
		</header>
	);
}

export default ThankYouHeader;
