import type { IsoCountry } from './country';

const gwDeliverableCountries: Partial<Record<IsoCountry, string>> = {
	GB: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
	NZ: 'New Zealand',
	CK: 'Cook Islands',
	CA: 'Canada',
	AD: 'Andorra',
	AL: 'Albania',
	AM: 'Armenia',
	AT: 'Austria',
	BA: 'Bosnia-Herzegovina',
	BB: 'Barbados',
	BE: 'Belgium',
	BG: 'Bulgaria',
	BL: 'Saint Barthélemy',
	BM: 'Bermuda',
	CH: 'Switzerland',
	CY: 'Cyprus',
	CZ: 'Czech Republic',
	DE: 'Germany',
	DO: 'Dominican Republic',
	DK: 'Denmark',
	EC: 'Ecuador',
	EE: 'Estonia',
	ES: 'Spain',
	FI: 'Finland',
	FO: 'Faroe Islands',
	FR: 'France',
	GD: 'Grenada',
	GF: 'French Guiana',
	GL: 'Greenland',
	GP: 'Guadeloupe',
	GR: 'Greece',
	GY: 'Guyana',
	HR: 'Croatia',
	HU: 'Hungary',
	// HT: 'Haiti',
	IE: 'Ireland',
	IN: 'India',
	IT: 'Italy',
	JM: 'Jamaica',
	KY: 'Cayman Islands',
	KW: 'Kuwait',
	LI: 'Liechtenstein',
	LT: 'Lithuania',
	LU: 'Luxembourg',
	LV: 'Latvia',
	MC: 'Monaco',
	MF: 'Saint Martin',
	IS: 'Iceland',
	ME: 'Montenegro',
	MQ: 'Martinique',
	MT: 'Malta',
	NL: 'Netherlands',
	NO: 'Norway',
	PE: 'Peru',
	PL: 'Poland',
	PM: 'Saint Pierre & Miquelon',
	PT: 'Portugal',
	RE: 'Réunion',
	RO: 'Romania',
	RS: 'Serbia',
	SE: 'Sweden',
	SI: 'Slovenia',
	SJ: 'Svalbard and Jan Mayen',
	SK: 'Slovakia',
	SM: 'San Marino',
	TF: 'French Southern Territories',
	TR: 'Turkey',
	WF: 'Wallis & Futuna',
	YT: 'Mayotte',
	VA: 'Holy See',
	AX: 'Åland Islands',
	KI: 'Kiribati',
	NR: 'Nauru',
	NF: 'Norfolk Island',
	TV: 'Tuvalu',
	AE: 'United Arab Emirates',
	AG: 'Antigua & Barbuda',
	AI: 'Anguilla',
	AO: 'Angola',
	AQ: 'Antarctica',
	AR: 'Argentina',
	AS: 'American Samoa',
	AW: 'Aruba',
	AZ: 'Azerbaijan',
	BD: 'Bangladesh',
	BF: 'Burkina Faso',
	BH: 'Bahrain',
	BI: 'Burundi',
	BJ: 'Benin',
	BN: 'Brunei Darussalam',
	BO: 'Bolivia',
	BQ: 'Bonaire, Saint Eustatius and Saba',
	BR: 'Brazil',
	BS: 'Bahamas',
	BT: 'Bhutan',
	BV: 'Bouvet Island',
	BW: 'Botswana',
	BZ: 'Belize',
	CC: 'Cocos (Keeling) Islands',
	CD: 'Congo (Kinshasa)',
	CF: 'Central African Republic',
	CG: 'Congo (Brazzaville)',
	CI: 'Ivory Coast',
	CL: 'Chile',
	CM: 'Cameroon',
	CN: 'China',
	CO: 'Colombia',
	CR: 'Costa Rica',
	CV: 'Cape Verde Islands',
	CW: 'Curaçao',
	CX: 'Christmas Island',
	DM: 'Dominica',
	DZ: 'Algeria',
	EG: 'Egypt',
	EH: 'Western Sahara',
	ER: 'Eritrea',
	ET: 'Ethiopia',
	FM: 'Micronesia',
	GA: 'Gabon',
	GE: 'Georgia',
	GH: 'Ghana',
	GM: 'Gambia',
	GN: 'Guinea',
	GQ: 'Equatorial Guinea',
	GS: 'South Georgia & The South Sandwich Islands',
	GT: 'Guatemala',
	GU: 'Guam',
	GW: 'Guinea-Bissau',
	HK: 'Hong Kong',
	HM: 'Heard Island and McDonald Islands',
	HN: 'Honduras',
	ID: 'Indonesia',
	IL: 'Israel',
	IO: 'British Indian Ocean Territory',
	IQ: 'Iraq',
	JO: 'Jordan',
	JP: 'Japan',
	KE: 'Kenya',
	KG: 'Kyrgyzstan',
	KH: 'Cambodia',
	KM: 'Comoros',
	KN: 'Saint Christopher & Nevis',
	KR: 'South Korea',
	KZ: 'Kazakhstan',
	LA: 'Laos',
	LB: 'Lebanon',
	LC: 'Saint Lucia',
	LR: 'Liberia',
	LS: 'Lesotho',
	MA: 'Morocco',
	MD: 'Moldova',
	MG: 'Madagascar',
	MH: 'Marshall Islands',
	MK: 'Macedonia',
	ML: 'Mali',
	MM: 'Myanmar',
	MO: 'Macau',
	MP: 'Northern Mariana Islands',
	MS: 'Montserrat',
	MV: 'Maldives',
	MX: 'Mexico',
	MY: 'Malaysia',
	MZ: 'Mozambique',
	NA: 'Namibia',
	NC: 'New Caledonia',
	NE: 'Niger',
	NG: 'Nigeria',
	NI: 'Nicaragua',
	NU: 'Niue',
	OM: 'Oman',
	PA: 'Panama',
	PG: 'Papua New Guinea',
	PH: 'Philippines',
	PK: 'Pakistan',
	PN: 'Pitcairn Islands',
	PR: 'Puerto Rico',
	PS: 'Palestinian Territories',
	PW: 'Palau',
	QA: 'Qatar',
	SA: 'Saudi Arabia',
	SB: 'Solomon Islands',
	SC: 'Seychelles',
	SD: 'Sudan',
	SG: 'Singapore',
	SL: 'Sierra Leone',
	SN: 'Senegal',
	SO: 'Somalia',
	SR: 'Suriname',
	ST: 'Sao Tome & Principe',
	SV: 'El Salvador',
	SX: 'Sint Maarten',
	SZ: 'Swaziland',
	TD: 'Chad',
	TC: 'Turks & Caicos Islands',
	TH: 'Thailand',
	TJ: 'Tajikistan',
	TK: 'Tokelau',
	TL: 'East Timor',
	TM: 'Turkmenistan',
	TO: 'Tonga',
	TT: 'Trinidad & Tobago',
	TW: 'Taiwan',
	UG: 'Uganda',
	UM: 'United States Minor Outlying Islands',
	UY: 'Uruguay',
	UZ: 'Uzbekistan',
	VC: 'Saint Vincent & The Grenadines',
	VG: 'British Virgin Islands',
	VI: 'United States Virgin Islands',
	VN: 'Vietnam',
	VU: 'Vanuatu',
	ZA: 'South Africa',
	ZM: 'Zambia',
	FK: 'Falkland Islands',
	GI: 'Gibraltar',
	GG: 'Guernsey',
	IM: 'Isle of Man',
	JE: 'Jersey',
	SH: 'Saint Helena',
	WS: 'Samoa',
	RW: 'Rwanda',
	TG: 'Togo',
	PF: 'French Polynesia',
	DJ: 'Djibouti',
	MW: 'Malawi',
	TZ: 'Tanzania',
	TN: 'Tunisia',
	ZW: 'Zimbabwe',
	MU: 'Mauritius',
	NP: 'Nepal',
	MR: 'Mauritania',
};
export { gwDeliverableCountries };
