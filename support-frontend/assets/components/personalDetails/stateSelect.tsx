import { Option, Select } from '@guardian/source-react-components';
import { CountryGroup } from 'helpers/internationalisation';
import type { IsoCountry } from 'helpers/internationalisation/country';
import {
	auStates,
	caStates,
	usStates,
} from 'helpers/internationalisation/country';
import type { CountryGroupId } from 'helpers/internationalisation/countryGroup';

type StateSelectProps = {
	countryId: IsoCountry;
	state: string;
	onStateChange: (newState: string) => void;
	error?: string;
};

const stateDescriptors: Partial<Record<CountryGroupId, string>> = {
	UnitedStates: 'State',
	Canada: 'Province',
	AUDCountries: 'State / Territory',
};

const stateLists: Partial<Record<CountryGroupId, Record<string, string>>> = {
	UnitedStates: usStates,
	Canada: caStates,
	AUDCountries: auStates,
};

export function StateSelect({
	countryId,
	state,
	onStateChange,
	error,
}: StateSelectProps): JSX.Element | null {
	const countryGroupId = CountryGroup.fromCountry(countryId);
	const statesList = (countryGroupId ? stateLists[countryGroupId] : {}) ?? {};
	const stateDescriptor =
		(countryGroupId ? stateDescriptors[countryGroupId] : 'State') ?? 'State';

	return (
		<div>
			<Select
				id="state"
				label={stateDescriptor}
				value={state}
				onChange={(e) => onStateChange(e.target.value)}
				error={error}
				name={'billing-state'}
			>
				<>
					<Option value="">
						{`Select your ${stateDescriptor.toLowerCase()}`}
					</Option>
					{Object.entries(statesList).map(([abbreviation, name]) => {
						return (
							<Option value={abbreviation} selected={abbreviation === state}>
								{name}
							</Option>
						);
					})}
				</>
			</Select>
		</div>
	);
}
