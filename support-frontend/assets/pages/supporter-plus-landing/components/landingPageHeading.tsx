import { css } from '@emotion/react';
import {
	from,
	headline,
	neutral,
	space,
	until,
} from '@guardian/source-foundations';

const headingStyles = css`
	color: ${neutral[100]};
	display: inline-block;
	${headline.medium({ fontWeight: 'bold' })}

	${until.mobileMedium} {
		font-size: 28px;
	}

	${from.tablet} {
		font-size: 38px;
	}

	${until.desktop} {
		margin: 0 auto;
		margin-bottom: ${space[6]}px;
	}
	${from.desktop} {
		${headline.large({ fontWeight: 'bold' })}
		margin-bottom: ${space[3]}px;
	}
`;

export function LandingPageHeading(): JSX.Element {
	return (
		<h1 css={headingStyles}>Support&nbsp;fearless, independent journalism</h1>
	);
}
