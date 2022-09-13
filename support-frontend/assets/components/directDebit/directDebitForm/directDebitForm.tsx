// ----- Imports ----- //
import * as React from 'react';
import type { ConnectedProps } from 'react-redux';
import { connect } from 'react-redux';
import DirectDebitGuarantee from 'components/directDebit/directDebitForm/directDebitGuarantee';
import SortCodeInput from 'components/directDebit/directDebitForm/sortCodeInput';
import ErrorMessage from 'components/errorMessage/errorMessage';
import { Recaptcha } from 'components/recaptcha/recaptcha';
import SvgArrowRightStraight from 'components/svgs/arrowRightStraight';
import SvgDirectDebitSymbol from 'components/svgs/directDebitSymbol';
import SvgDirectDebitSymbolAndText from 'components/svgs/directDebitSymbolAndText';
import SvgExclamationAlternate from 'components/svgs/exclamationAlternate';
import type { PaymentAuthorisation } from 'helpers/forms/paymentIntegrations/readerRevenueApis';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { contributionsEmail } from 'helpers/legal';
import {
	setAccountHolderConfirmation,
	setAccountHolderName,
	setAccountNumber,
	setDDGuaranteeClose,
	setDDGuaranteeOpen,
	setFormError,
	setPhase,
	setSortCode,
} from 'helpers/redux/checkout/payment/directDebit/actions';
import type {
	Phase,
	SortCodeIndex,
} from 'helpers/redux/checkout/payment/directDebit/state';
import {
	confirmAccountDetails,
	directDebitErrorMessages,
	payWithDirectDebit,
} from 'helpers/redux/checkout/payment/directDebit/thunks';
import {
	expireRecaptchaToken,
	setRecaptchaToken,
} from 'helpers/redux/checkout/recaptcha/actions';
import type { ContributionsState } from 'helpers/redux/contributionsStore';
import './directDebitForm.scss';

// ----- Map State/Props ----- //
function mapStateToProps(state: ContributionsState) {
	return {
		isDDGuaranteeOpen:
			state.page.checkoutForm.payment.directDebit.isDDGuaranteeOpen,
		sortCodeArray: state.page.checkoutForm.payment.directDebit.sortCodeArray,
		accountNumber: state.page.checkoutForm.payment.directDebit.accountNumber,
		accountHolderName:
			state.page.checkoutForm.payment.directDebit.accountHolderName,
		accountHolderConfirmation:
			state.page.checkoutForm.payment.directDebit.accountHolderConfirmation,
		formError: state.page.checkoutForm.payment.directDebit.formError,
		phase: state.page.checkoutForm.payment.directDebit.phase,
		countryGroupId: state.common.internationalisation.countryGroupId,
		recaptchaCompleted: state.page.checkoutForm.recaptcha.completed,
	};
}

const mapDispatchToProps = {
	confirmAccountDetails,
	payWithDirectDebit,
	setPhase,
	setDDGuaranteeOpen,
	setDDGuaranteeClose,
	setSortCode,
	setAccountHolderConfirmation,
	setAccountHolderName,
	setAccountNumber,
	setFormError,
	setRecaptchaToken,
	expireRecaptchaToken,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropTypes = ConnectedProps<typeof connector> & {
	buttonText: string;
	onPaymentAuthorisation: (authorisation: PaymentAuthorisation) => void;
};

const recaptchaId = 'robot_checkbox';

// ----- Component ----- //
function DirectDebitForm(props: PropTypes) {
	function onSubmit() {
		if (props.recaptchaCompleted) {
			void props.payWithDirectDebit(props.onPaymentAuthorisation);
		} else {
			props.setFormError(directDebitErrorMessages.notCompletedRecaptcha);
		}
	}

	return (
		<div className="component-direct-debit-form">
			<AccountHolderNameInput
				phase={props.phase}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					props.setAccountHolderName(e.target.value)
				}
				value={props.accountHolderName}
			/>

			<AccountNumberInput
				phase={props.phase}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					props.setAccountNumber(e.target.value)
				}
				value={props.accountNumber}
			/>

			<SortCodeInput
				phase={props.phase}
				onChange={(
					index: SortCodeIndex,
					e: React.ChangeEvent<HTMLInputElement>,
				) => props.setSortCode({ index, partialSortCode: e.target.value })}
				sortCodeArray={props.sortCodeArray}
			/>

			<ConfirmationInput
				phase={props.phase}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					props.setAccountHolderConfirmation(e.target.checked)
				}
				checked={props.accountHolderConfirmation}
			/>

			{props.phase === 'confirmation' && (
				<RecaptchaInput
					setRecaptchaToken={props.setRecaptchaToken}
					expireRecaptchaToken={props.expireRecaptchaToken}
				/>
			)}

			{props.formError && (
				<div className="component-direct-debit-form__error-message-container">
					<ErrorMessage
						message={props.formError}
						svg={<SvgExclamationAlternate />}
					/>
				</div>
			)}

			<PaymentButton
				buttonText={props.buttonText}
				phase={props.phase}
				onPayClick={props.confirmAccountDetails}
				onEditClick={() => props.setPhase('entry')}
				onConfirmClick={onSubmit}
			/>

			<LegalNotice countryGroupId={props.countryGroupId} />

			<DirectDebitGuarantee
				isDDGuaranteeOpen={props.isDDGuaranteeOpen}
				openDirectDebitGuarantee={props.setDDGuaranteeOpen}
				closeDirectDebitGuarantee={props.setDDGuaranteeClose}
			/>
		</div>
	);
}

// ----- Auxiliary components ----- //
function AccountNumberInput(props: {
	phase: Phase;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	value: string;
}) {
	const editable = (
		<input
			id="account-number-input"
			data-qm-masking="blocklist"
			value={props.value}
			onChange={props.onChange}
			pattern="[0-9]*"
			minLength={6}
			maxLength={10}
			className="component-direct-debit-form__text-field focus-target"
		/>
	);
	const locked = <span>{props.value}</span>;
	return (
		<div className="component-direct-debit-form__account-number">
			<label
				htmlFor="account-number-input"
				className="component-direct-debit-form__field-label"
			>
				Account number
			</label>
			{props.phase === 'entry' ? editable : locked}
		</div>
	);
}

/*
 * BACS requirement:
 "Name of the account holder, as known by the bank. Usually this is the
 same as the name stored with the linked creditor. This field will be
 transliterated, upcased and truncated to 18 characters."
 https://developer.gocardless.com/api-reference/
 * */
function AccountHolderNameInput(props: {
	phase: Phase;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const editable = (
		<input
			id="account-holder-name-input"
			data-qm-masking="blocklist"
			value={props.value}
			onChange={props.onChange}
			maxLength={40}
			className="component-direct-debit-form__text-field focus-target"
		/>
	);
	const locked = <span>{props.value}</span>;
	return (
		<div className="component-direct-debit-form__account-holder-name">
			<label
				htmlFor="account-holder-name-input"
				className="component-direct-debit-form__field-label"
			>
				Account name
			</label>
			{props.phase === 'entry' ? editable : locked}
		</div>
	);
}

function RecaptchaInput(props: {
	setRecaptchaToken: (token: string) => void;
	expireRecaptchaToken?: () => void;
}) {
	return (
		<div className="component-direct-debit-form__recaptcha">
			<label
				htmlFor={recaptchaId}
				className="component-direct-debit-form__field-label"
			>
				Security check
			</label>
			<Recaptcha
				id={recaptchaId}
				onRecaptchaCompleted={props.setRecaptchaToken}
				onRecaptchaExpired={props.expireRecaptchaToken}
			/>
		</div>
	);
}

function ConfirmationInput(props: {
	phase: Phase;
	checked: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const editable = (
		<span>
			<div className="component-direct-debit-form__confirmation-css-checkbox">
				<input
					className="component-direct-debit-form__confirmation-input"
					id="confirmation-input"
					type="checkbox"
					onChange={props.onChange}
					checked={props.checked}
				/>
				<label
					id="qa-confirmation-input"
					className="component-direct-debit-form__confirmation-label"
					htmlFor="confirmation-input"
				/>
			</div>
			<span className="component-direct-debit-form__confirmation-text">
				I confirm that I am the account holder and I am solely able to authorise
				debit from the account
			</span>
		</span>
	);
	const locked = (
		<span>
			<label
				htmlFor="confirmation-text__locked"
				className="component-direct-debit-form__field-label"
			>
				Declaration
			</label>
			<div
				id="confirmation-text__locked"
				className="component-direct-debit-form__confirmation-text__locked"
			>
				I have confirmed that I am the account holder and that I am solely able
				to authorise debit from the account
			</div>
			<div className="component-direct-debit-form__confirmation-guidance">
				If the details above are correct press confirm to set up your direct
				debit, otherwise press back to make changes
			</div>
		</span>
	);
	return (
		<div className="component-direct-debit-form__account-holder-confirmation">
			<div>
				<label htmlFor="confirmation-input">
					{props.phase === 'entry' ? editable : locked}
				</label>
			</div>
		</div>
	);
}

function PaymentButton(props: {
	buttonText: string;
	phase: Phase;
	onPayClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onEditClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onConfirmClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
	if (props.phase === 'entry') {
		return (
			<button
				id="qa-submit-button-1"
				className="component-direct-debit-form__cta component-direct-debit-form__cta--pay-button focus-target"
				onClick={props.onPayClick}
			>
				<SvgDirectDebitSymbol />
				<span className="component-direct-debit-form__cta-text">
					{props.buttonText}
				</span>
				<SvgArrowRightStraight />
			</button>
		);
	} else {
		// confirmation phase
		return (
			<span>
				<button
					className="component-direct-debit-form__cta component-direct-debit-form__cta--edit-button focus-target"
					onClick={props.onEditClick}
				>
					<SvgArrowRightStraight />
					<span className="component-direct-debit-form__cta-text component-direct-debit-form__cta-text--inverse">
						Back
					</span>
				</button>
				<button
					id="qa-submit-button-2"
					className="component-direct-debit-form__cta component-direct-debit-form__cta--confirm-button focus-target"
					onClick={props.onConfirmClick}
				>
					<span className="component-direct-debit-form__cta-text">Confirm</span>
					<SvgArrowRightStraight />
				</button>
			</span>
		);
	}
}

function LegalNotice(props: { countryGroupId: CountryGroupId }) {
	return (
		<div className="component-direct-debit-form__legal-notice">
			<p>
				<strong>Payments by GoCardless </strong>
				<a
					href="https://gocardless.com/legal/privacy/"
					target="_blank"
					rel="noopener noreferrer"
				>
					read the GoCardless privacy notice.
				</a>
			</p>
			<p>
				<strong>Advance notice</strong> The details of your Direct Debit
				instruction including payment schedule, due date, frequency and amount
				will be sent to you within three working days. All the normal Direct
				Debit safeguards and guarantees apply.
			</p>
			<strong>Direct Debit</strong>
			<p>
				The Guardian, Unit 16, Coalfield Way, Ashby Park, Ashby-De-La-Zouch,
				LE65 1JT United Kingdom
				<br />
				Tel: 0330 333 6767 (within UK). Lines are open 8am-8pm on weekdays,
				8am-6pm at weekends (GMT/BST)
				<br />
				<a href={contributionsEmail[props.countryGroupId]}>
					{contributionsEmail[props.countryGroupId].replace('mailto:', '')}
				</a>
			</p>
			<SvgDirectDebitSymbolAndText />
		</div>
	);
} // ----- Exports ----- //

export default connector(DirectDebitForm);
