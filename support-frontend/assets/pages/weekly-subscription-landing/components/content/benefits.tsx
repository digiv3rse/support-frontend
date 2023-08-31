import { List } from 'components/list/list';
import BenefitsContainer from './benefitsContainer';
import BenefitsHeading from './benefitsHeading';

const coreBenefits = [
	{
		content: `Every issue delivered with up to 35% off the cover price`,
	},
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

function Benefits(): JSX.Element {
	return (
		<BenefitsContainer
			sections={[
				{
					id: 'benefits',
					content: (
						<>
							<BenefitsHeading text="As a subscriber you’ll enjoy" />
							<List items={coreBenefits} />
						</>
					),
				},
			]}
		/>
	);
}

export default Benefits;
