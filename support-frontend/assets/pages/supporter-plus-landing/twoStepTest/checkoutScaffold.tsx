import { css } from '@emotion/react';
import {
	from,
	palette,
	space,
	textSans,
	until,
} from '@guardian/source-foundations';
import { Column, Columns, Hide } from '@guardian/source-react-components';
import {
	FooterLinks,
	FooterWithContents,
} from '@guardian/source-react-components-development-kitchen';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutHeading } from 'components/checkoutHeading/checkoutHeading';
import type { CountryGroupSwitcherProps } from 'components/countryGroupSwitcher/countryGroupSwitcher';
import CountryGroupSwitcher from 'components/countryGroupSwitcher/countryGroupSwitcher';
import GridImage from 'components/gridImage/gridImage';
import { CountrySwitcherContainer } from 'components/headers/simpleHeader/countrySwitcherContainer';
import { Header } from 'components/headers/simpleHeader/simpleHeader';
import { Container } from 'components/layout/container';
import { LoadingOverlay } from 'components/loadingOverlay/loadingOverlay';
import Nav from 'components/nav/nav';
import { PageScaffold } from 'components/page/pageScaffold';
import { SecureTransactionIndicator } from 'components/secureTransactionIndicator/secureTransactionIndicator';
import {
	AUDCountries,
	Canada,
	EURCountries,
	GBPCountries,
	International,
	NZDCountries,
	UnitedStates,
} from 'helpers/internationalisation/countryGroup';
import { useContributionsSelector } from 'helpers/redux/storeHooks';
import { CheckoutDivider } from '../components/checkoutDivider';
import { GuardianTsAndCs } from '../components/guardianTsAndCs';
import { LandingPageHeading } from '../components/landingPageHeading';
import { PatronsMessage } from '../components/patronsMessage';

const checkoutContainer = css`
	position: relative;
	color: ${palette.neutral[7]};
	${textSans.medium()};
	padding-top: ${space[3]}px;
	padding-bottom: ${space[9]}px;
	${from.tablet} {
		padding-bottom: ${space[12]}px;
	}
	${from.desktop} {
		padding-top: ${space[6]}px;
	}
`;

const darkBackgroundContainerMobile = css`
	background-color: ${palette.neutral[97]};
	${until.tablet} {
		background-color: ${palette.brand[400]};
		border-bottom: 1px solid ${palette.brand[600]};
	}
`;

const subHeading = css`
	font-weight: normal;
	padding-right: ${space[2]}px;
`;

export function SupporterPlusCheckoutScaffold({
	children,
	thankYouRoute,
}: {
	children: React.ReactNode;
	thankYouRoute: string;
}): JSX.Element {
	const { countryGroupId } = useContributionsSelector(
		(state) => state.common.internationalisation,
	);

	const { paymentComplete, isWaiting } = useContributionsSelector(
		(state) => state.page.form,
	);

	const navigate = useNavigate();

	const countrySwitcherProps: CountryGroupSwitcherProps = {
		countryGroupIds: [
			GBPCountries,
			UnitedStates,
			AUDCountries,
			EURCountries,
			NZDCountries,
			Canada,
			International,
		],
		selectedCountryGroup: countryGroupId,
		subPath: '/contribute',
	};
	const heading = <LandingPageHeading />;

	useEffect(() => {
		if (paymentComplete) {
			navigate(thankYouRoute, { replace: true });
		}
	}, [paymentComplete]);

	return (
		<PageScaffold
			id="supporter-plus-landing"
			header={
				<>
					<Header>
						<Hide from="desktop">
							<CountrySwitcherContainer>
								<CountryGroupSwitcher {...countrySwitcherProps} />
							</CountrySwitcherContainer>
						</Hide>
					</Header>
					<Nav {...countrySwitcherProps} />
				</>
			}
			footer={
				<FooterWithContents>
					<FooterLinks></FooterLinks>
				</FooterWithContents>
			}
		>
			<CheckoutHeading
				heading={heading}
				image={
					<GridImage
						gridId="supporterPlusLanding"
						srcSizes={[500]}
						sizes="500px"
						imgType="png"
						altText=""
					/>
				}
			>
				<p css={subHeading}>
					As a reader-funded news organisation, we rely on your generosity.
					Please give what you can, so millions can benefit from quality
					reporting on the events shaping our world.
				</p>
			</CheckoutHeading>
			<Container sideBorders cssOverrides={darkBackgroundContainerMobile}>
				<Columns cssOverrides={checkoutContainer} collapseUntil="tablet">
					<Column span={[0, 2, 5]}></Column>
					<Column span={[1, 8, 7]}>
						<Hide from="desktop">
							<SecureTransactionIndicator
								align="left"
								theme="light"
								cssOverrides={css`
									margin-bottom: 10px;
								`}
							/>
						</Hide>
						{children}
						<CheckoutDivider spacing="loose" mobileTheme={'light'} />
						<PatronsMessage
							countryGroupId={countryGroupId}
							mobileTheme={'light'}
						/>
						<CheckoutDivider spacing="tight" mobileTheme={'light'} />
						<GuardianTsAndCs mobileTheme={'light'} />
					</Column>
				</Columns>
			</Container>
			{isWaiting && (
				<LoadingOverlay>
					<p>Processing transaction</p>
					<p>Please wait</p>
				</LoadingOverlay>
			)}
		</PageScaffold>
	);
}