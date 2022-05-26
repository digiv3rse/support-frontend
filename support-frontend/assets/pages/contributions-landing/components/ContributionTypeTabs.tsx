// ----- Imports ----- //
import { css } from '@emotion/react';
import { ChoiceCard, ChoiceCardGroup } from '@guardian/source-react-components';
import { connect } from 'react-redux';
import type {
	ContributionType,
	ContributionTypes,
	ContributionTypeSetting,
} from 'helpers/contributions';
import 'helpers/contributions';
import {
	getPaymentMethodToSelect,
	toHumanReadableContributionType,
} from 'helpers/forms/checkouts';
import type { Switches } from 'helpers/globalsAndSwitches/settings';
import type { IsoCountry } from 'helpers/internationalisation/country';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';
import {
	setCurrencyId,
	setUseLocalAmounts,
} from 'helpers/redux/commonState/actions';
import { trackComponentClick } from 'helpers/tracking/behaviour';
import { classNameWithModifiers } from 'helpers/utilities/utilities';
import { updateContributionTypeAndPaymentMethod } from '../contributionsLandingActions';
import type { State } from '../contributionsLandingReducer';

// ----- Types ----- //
type PropTypes = {
	contributionType: ContributionType;
	countryId: IsoCountry;
	countryGroupId: CountryGroupId;
	switches: Switches;
	contributionTypes: ContributionTypes;
	onSelectContributionType: (
		arg0: ContributionType,
		arg1: Switches,
		arg2: IsoCountry,
		arg3: CountryGroupId,
		arg4: boolean,
	) => void;
	useLocalCurrency: boolean;
};

const mapStateToProps = (state: State) => ({
	countryGroupId: state.common.internationalisation.countryGroupId,
	contributionType: state.page.form.contributionType,
	countryId: state.common.internationalisation.countryId,
	switches: state.common.settings.switches,
	contributionTypes: state.common.settings.contributionTypes,
	useLocalCurrency: state.common.internationalisation.useLocalCurrency,
});

const mapDispatchToProps = (dispatch: (...args: any[]) => any) => ({
	onSelectContributionType: (
		contributionType: ContributionType,
		switches: Switches,
		countryId: IsoCountry,
		countryGroupId: CountryGroupId,
		useLocalCurrency: boolean,
	) => {
		const paymentMethodToSelect = getPaymentMethodToSelect(
			contributionType,
			switches,
			countryId,
			countryGroupId,
		);
		trackComponentClick(
			`npf-contribution-type-toggle-${countryGroupId}-${contributionType}`,
		);
		dispatch(
			updateContributionTypeAndPaymentMethod(
				contributionType,
				paymentMethodToSelect,
			),
		);

		if (contributionType !== 'ONE_OFF') {
			dispatch(setCurrencyId(false));
			dispatch(setUseLocalAmounts(false));
		} else {
			dispatch(setCurrencyId(useLocalCurrency));
			dispatch(setUseLocalAmounts(useLocalCurrency));
		}
	},
});

const groupStyles = css`
	> div {
		display: flex;

		/* This is to position the group under the country drop down */
		position: relative;
		z-index: 0;

		label {
			margin: 0 8px 0 0;
		}

		label:last-of-type {
			margin: 0;
		}
	}
`;

// ----- Render ----- //
function ContributionTypeTabs(props: PropTypes) {
	const contributionTypes = props.contributionTypes[props.countryGroupId];

	const renderChoiceCards = () => (
		<ChoiceCardGroup name="contributionTypes" cssOverrides={groupStyles}>
			{contributionTypes.map(
				(contributionTypeSetting: ContributionTypeSetting) => {
					const { contributionType } = contributionTypeSetting;
					return (
						<ChoiceCard
							id={`contributionType-${contributionType}`}
							value={contributionType}
							label={toHumanReadableContributionType(contributionType)}
							onChange={() =>
								props.onSelectContributionType(
									contributionType,
									props.switches,
									props.countryId,
									props.countryGroupId,
									props.useLocalCurrency,
								)
							}
							checked={props.contributionType === contributionType}
						/>
					);
				},
			)}
		</ChoiceCardGroup>
	);

	if (
		contributionTypes.length === 1 &&
		contributionTypes[0].contributionType === 'ONE_OFF'
	) {
		return null;
	}

	return (
		<fieldset
			className={classNameWithModifiers('form__radio-group', [
				'tabs',
				'contribution-type',
			])}
		>
			<legend
				className={classNameWithModifiers('form__legend', ['radio-group'])}
			>
				How often would you like to contribute?
			</legend>
			{renderChoiceCards()}
		</fieldset>
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ContributionTypeTabs);
