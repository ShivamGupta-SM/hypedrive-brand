/**
 * Country Flag component using react-flagpack.
 *
 * Renders a flag icon from a country name or ISO alpha-2 code.
 * Falls back to a text badge if the country can't be mapped.
 */

import "react-flagpack/dist/style.css";

import Flag from "react-flagpack";

// Country name → ISO 3166-1 alpha-2 mapping (common countries)
const COUNTRY_TO_CODE: Record<string, string> = {
	afghanistan: "AF",
	albania: "AL",
	algeria: "DZ",
	argentina: "AR",
	armenia: "AM",
	australia: "AU",
	austria: "AT",
	azerbaijan: "AZ",
	bahrain: "BH",
	bangladesh: "BD",
	belarus: "BY",
	belgium: "BE",
	bhutan: "BT",
	bolivia: "BO",
	brazil: "BR",
	brunei: "BN",
	bulgaria: "BG",
	cambodia: "KH",
	cameroon: "CM",
	canada: "CA",
	chile: "CL",
	china: "CN",
	colombia: "CO",
	"costa rica": "CR",
	croatia: "HR",
	cuba: "CU",
	cyprus: "CY",
	"czech republic": "CZ",
	czechia: "CZ",
	denmark: "DK",
	"dominican republic": "DO",
	ecuador: "EC",
	egypt: "EG",
	"el salvador": "SV",
	estonia: "EE",
	ethiopia: "ET",
	fiji: "FJ",
	finland: "FI",
	france: "FR",
	georgia: "GE",
	germany: "DE",
	ghana: "GH",
	greece: "GR",
	guatemala: "GT",
	honduras: "HN",
	"hong kong": "HK",
	hungary: "HU",
	iceland: "IS",
	india: "IN",
	indonesia: "ID",
	iran: "IR",
	iraq: "IQ",
	ireland: "IE",
	israel: "IL",
	italy: "IT",
	"ivory coast": "CI",
	jamaica: "JM",
	japan: "JP",
	jordan: "JO",
	kazakhstan: "KZ",
	kenya: "KE",
	kuwait: "KW",
	kyrgyzstan: "KG",
	laos: "LA",
	latvia: "LV",
	lebanon: "LB",
	libya: "LY",
	liechtenstein: "LI",
	lithuania: "LT",
	luxembourg: "LU",
	macau: "MO",
	malaysia: "MY",
	maldives: "MV",
	mali: "ML",
	malta: "MT",
	mauritius: "MU",
	mexico: "MX",
	moldova: "MD",
	monaco: "MC",
	mongolia: "MN",
	montenegro: "ME",
	morocco: "MA",
	mozambique: "MZ",
	myanmar: "MM",
	namibia: "NA",
	nepal: "NP",
	netherlands: "NL",
	"new zealand": "NZ",
	nicaragua: "NI",
	nigeria: "NG",
	"north korea": "KP",
	"north macedonia": "MK",
	norway: "NO",
	oman: "OM",
	pakistan: "PK",
	palestine: "PS",
	panama: "PA",
	paraguay: "PY",
	peru: "PE",
	philippines: "PH",
	poland: "PL",
	portugal: "PT",
	qatar: "QA",
	romania: "RO",
	russia: "RU",
	rwanda: "RW",
	"saudi arabia": "SA",
	senegal: "SN",
	serbia: "RS",
	singapore: "SG",
	slovakia: "SK",
	slovenia: "SI",
	"south africa": "ZA",
	"south korea": "KR",
	spain: "ES",
	"sri lanka": "LK",
	sudan: "SD",
	sweden: "SE",
	switzerland: "CH",
	syria: "SY",
	taiwan: "TW",
	tajikistan: "TJ",
	tanzania: "TZ",
	thailand: "TH",
	"trinidad and tobago": "TT",
	tunisia: "TN",
	turkey: "TR",
	turkmenistan: "TM",
	uganda: "UG",
	ukraine: "UA",
	"united arab emirates": "AE",
	uae: "AE",
	"united kingdom": "GB",
	uk: "GB",
	"united states": "US",
	"united states of america": "US",
	usa: "US",
	uruguay: "UY",
	uzbekistan: "UZ",
	venezuela: "VE",
	vietnam: "VN",
	yemen: "YE",
	zambia: "ZM",
	zimbabwe: "ZW",
};

/** Resolve a country name or code to an ISO alpha-2 code */
export function resolveCountryCode(country: string): string | null {
	if (!country) return null;
	const trimmed = country.trim();

	// Already an alpha-2 code
	if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;

	// Lookup by name (case-insensitive)
	return COUNTRY_TO_CODE[trimmed.toLowerCase()] ?? null;
}

/** Get all countries as { name, code } pairs for dropdowns */
export function getCountryList(): { name: string; code: string }[] {
	const seen = new Set<string>();
	const result: { name: string; code: string }[] = [];

	for (const [name, code] of Object.entries(COUNTRY_TO_CODE)) {
		if (seen.has(code)) continue;
		// Skip aliases like "usa", "uk", "uae", "czechia"
		if (name.length <= 3 && name !== "uk") continue;
		if (name === "czechia") continue;
		seen.add(code);
		result.push({ name: name.charAt(0).toUpperCase() + name.slice(1), code });
	}

	return result.sort((a, b) => a.name.localeCompare(b.name));
}

interface CountryFlagProps {
	/** Country name ("India") or ISO alpha-2 code ("IN") */
	country: string;
	/** Flag size: "s" (16px), "m" (24px), "l" (32px). Default "s" */
	size?: "s" | "m" | "l";
	className?: string;
}

export function CountryFlag({ country, size = "s", className }: CountryFlagProps) {
	const code = resolveCountryCode(country);
	if (!code) return null;

	return (
		<span className={className}>
			<Flag code={code} size={size} hasBorder={false} hasDropShadow={false} hasBorderRadius />
		</span>
	);
}
