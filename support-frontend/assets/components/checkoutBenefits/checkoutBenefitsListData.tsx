import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import { neutral } from '@guardian/source-foundations';
import { SvgCrossRound, SvgTickRound } from '@guardian/source-react-components';

const greyedOut = css`
	color: ${neutral[60]};

	svg {
		fill: ${neutral[60]};
	}
`;

const boldText = css`
	font-weight: bold;
`;

const highlightText = css`
	color: red;
`;

type TierUnlocks = {
	higherTier: boolean;
};

export type CheckListData = {
	icon: JSX.Element;
	text?: JSX.Element;
	maybeGreyedOut?: SerializedStyles;
};

export const getSvgIcon = (isUnlocked: boolean): JSX.Element =>
	isUnlocked ? (
		<SvgTickRound isAnnouncedByScreenReader size="small" />
	) : (
		<SvgCrossRound isAnnouncedByScreenReader size="small" />
	);

export const checkListData = (
	{ higherTier }: TierUnlocks,
	isAustralia: boolean,
): CheckListData[] => {
	const maybeGreyedOutHigherTier = higherTier ? undefined : greyedOut;

	return [
		...(isAustralia
			? [
					{
						icon: getSvgIcon(true),
						text: (
							<p>
								<span css={boldText}>
									Limited-edition Guardian Australia tote bag.{' '}
								</span>
								<span css={highlightText}>Offer ends 31 May</span>
							</p>
						),
					},
			  ]
			: []),
		{
			icon: getSvgIcon(true),
			text: (
				<p>
					<span css={boldText}>A regular supporter newsletter. </span>Get
					exclusive insight from our newsroom
				</p>
			),
		},
		{
			icon: getSvgIcon(true),
			text: (
				<p>
					<span css={boldText}>Uninterrupted reading. </span> See far fewer asks
					for support
				</p>
			),
		},
		{
			icon: getSvgIcon(higherTier),
			text: (
				<p>
					<span css={boldText}>Full access to our news app. </span>Read our
					reporting on the go
				</p>
			),
			maybeGreyedOut: maybeGreyedOutHigherTier,
		},
		{
			icon: getSvgIcon(higherTier),
			text: (
				<p>
					<span css={boldText}>Ad-free reading. </span>Avoid ads on all your
					devices
				</p>
			),
			maybeGreyedOut: maybeGreyedOutHigherTier,
		},
	];
};
