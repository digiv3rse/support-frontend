import { List } from 'components/list/list';
import type { IsoCountry } from 'helpers/internationalisation/country';
import BenefitsContainer from './benefitsContainer';
import BenefitsHeading from './benefitsHeading';

const coreBenefits = [
	{
		content: "Access to the magazine's digital archive",
	},
	{
		content: 'A weekly email newsletter from the editor',
	},
	{
		content: "The very best of the Guardian's puzzles",
	},
];

function getBenefits(countryId: IsoCountry) {
	if (countryId === 'AU') {
		return [...coreBenefits];
	}
	return [
		{
			content: 'Every issue delivered with up to 35% off the cover price',
		},
		...coreBenefits,
	];
}

function Benefits({ countryId }: { countryId: IsoCountry }): JSX.Element {
	return (
		<BenefitsContainer
			sections={[
				{
					id: 'benefits',
					content: (
						<>
							<BenefitsHeading text="As a subscriber you’ll enjoy" />
							<List items={getBenefits(countryId)} />
						</>
					),
				},
			]}
		/>
	);
}

export default Benefits;
