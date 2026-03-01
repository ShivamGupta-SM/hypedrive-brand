/**
 * Location data helpers using the country-state-city package.
 * Provides countries, states/provinces, and cities for dropdowns.
 */

import { City, Country, State } from "country-state-city";

export interface LocationItem {
	name: string;
	isoCode: string;
}

/** Get all countries sorted by name */
export function getAllCountries(): LocationItem[] {
	return Country.getAllCountries()
		.map((c) => ({ name: c.name, isoCode: c.isoCode }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** Get states/provinces for a country ISO code. Returns sorted list. */
export function getStatesForCountry(countryCode: string): LocationItem[] {
	return State.getStatesOfCountry(countryCode)
		.map((s) => ({ name: s.name, isoCode: s.isoCode }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** Get cities for a country + state ISO code pair. Returns sorted list of names. */
export function getCitiesForState(countryCode: string, stateCode: string): string[] {
	return City.getCitiesOfState(countryCode, stateCode)
		.map((c) => c.name)
		.sort((a, b) => a.localeCompare(b));
}

/** Resolve a country name to its ISO code */
export function resolveCountryIsoCode(countryName: string): string | null {
	if (!countryName) return null;
	const trimmed = countryName.trim();
	// Already an ISO code
	if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;
	const found = Country.getAllCountries().find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
	return found?.isoCode ?? null;
}

/** Resolve a state name to its ISO code within a country */
export function resolveStateIsoCode(countryCode: string, stateName: string): string | null {
	if (!countryCode || !stateName) return null;
	const found = State.getStatesOfCountry(countryCode).find(
		(s) => s.name.toLowerCase() === stateName.trim().toLowerCase()
	);
	return found?.isoCode ?? null;
}
