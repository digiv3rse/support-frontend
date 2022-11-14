import { css } from '@emotion/react';
import { textSans } from '@guardian/source-foundations';

const fontStyles = css`
	${textSans.xxsmall({ lineHeight: 'regular' })};
	color: #606060;
`;

export function GuardianTsAndCs(): JSX.Element {
	return (
		<div css={fontStyles}>
			<p>
				The ultimate owner of the Guardian is The Scott Trust Limited, whose
				role it is to secure the editorial and financial independence of the
				Guardian in perpetuity. Reader payments support the Guardian’s
				journalism. Please note that your support does not constitute a
				charitable donation, so it is not eligible for Gift Aid in the UK nor a
				tax-deduction elsewhere.
			</p>
		</div>
	);
}
