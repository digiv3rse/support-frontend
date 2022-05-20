import { css, ThemeProvider } from '@emotion/react';
import { space } from '@guardian/source-foundations';
import type { TextInputProps } from '@guardian/source-react-components';
import {
	Button,
	buttonThemeReaderRevenueBrandAlt,
	Option,
	Select,
	TextInput,
} from '@guardian/source-react-components';
import React from 'react';
import type { ConnectedComponent } from 'react-redux';
import { connect } from 'react-redux';
import type { PostcodeFinderState } from 'components/subscriptionCheckouts/address/postcodeFinderStore';
import { postcodeFinderActionCreatorsFor } from 'components/subscriptionCheckouts/address/postcodeFinderStore';
import type { PostcodeFinderResult } from 'components/subscriptionCheckouts/address/postcodeLookup';
import type { SubscriptionsState } from 'helpers/redux/subscriptionsStore';
import type { AddressType } from 'helpers/subscriptionsForms/addressType';

const root = css`
	display: flex;
	justify-content: flex-start;
	margin-bottom: ${space[6]}px;
`;

const inputStyles = css`
	margin-right: ${space[3]}px;
`;

const buttonStyles = css`
	align-self: flex-end;
`;

// Types

export type PostcodeFinderAdditionalProps = {
	onPostcodeUpdate: (newPostcode: string) => void;
	onAddressUpdate: (result: PostcodeFinderResult) => void;
	id: string;
};

// TODO: Sort this out with ConnectedProps once we've fixed the address Redux mess
type PostcodeFinderDispatchProps = {
	setPostcode: (postcode: string) => void;
	fetchResults: (postcode?: string) => void;
};

export type PostcodeFinderProps = PostcodeFinderState &
	PostcodeFinderDispatchProps &
	PostcodeFinderAdditionalProps;

// Helpers
function InputWithButton({
	onClick,
	isLoading,
	...props
}: TextInputProps & {
	onClick: () => void;
	isLoading: boolean;
}) {
	return (
		<div css={root}>
			<div>
				<TextInput
					{...props}
					onKeyPress={(e) => {
						if (e.key && e.key === 'Enter') {
							e.preventDefault();
							onClick();
						}
					}}
					css={inputStyles}
					name="postcode"
					width={10}
				/>
			</div>

			{!isLoading && (
				<ThemeProvider theme={buttonThemeReaderRevenueBrandAlt}>
					<Button
						priority="tertiary"
						css={buttonStyles}
						type="button"
						onClick={onClick}
					>
						Find address
					</Button>
				</ThemeProvider>
			)}
		</div>
	);
}

function PostcodeFinder(props: PostcodeFinderProps): JSX.Element {
	const {
		id,
		postcode,
		results,
		isLoading,
		setPostcode,
		fetchResults,
		error,
		onPostcodeUpdate,
		onAddressUpdate,
	} = props;

	return (
		<div>
			<InputWithButton
				error={error ?? ''}
				label="Postcode"
				onClick={() => {
					fetchResults(postcode ?? '');
				}}
				id={id}
				onChange={(e) => {
					setPostcode(e.target.value);
					onPostcodeUpdate(e.target.value);
				}}
				isLoading={isLoading}
				value={postcode ?? ''}
			/>
			{results.length > 0 && (
				<Select
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
						const resultIndex = Number.parseInt(e.currentTarget.value);
						if (results[resultIndex]) {
							onAddressUpdate(results[resultIndex]);
						}
					}}
					id="address"
					label={`${results.length} addresses found`}
				>
					<Option value={''}>Select an address</Option>
					<>
						{results.map((result, key) => (
							<Option key={result.lineOne} value={key}>
								{[result.lineOne, result.lineTwo].join(', ')}
							</Option>
						))}
					</>
				</Select>
			)}
		</div>
	);
}

export type PostcodeFinderComponentType = typeof PostcodeFinder;

export const withStore = (
	scope: AddressType,
	mapStateToProps: (state: SubscriptionsState) => PostcodeFinderState,
): ConnectedComponent<
	PostcodeFinderComponentType,
	PostcodeFinderAdditionalProps
> =>
	connect(
		mapStateToProps,
		postcodeFinderActionCreatorsFor(scope),
	)(PostcodeFinder);
