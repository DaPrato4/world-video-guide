import { useEffect, useState } from "react";
import { FiGlobe, FiTrash2 } from "react-icons/fi";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import type { user } from "../../types";
import { db, messaging } from "../../firebase";
import { EXPRESS_API_URL } from "../../apiConfig";

type FollowedCountryItem = {
	name: string;
	label: string;
	flagUrl?: string;
};

interface FollowedCountryProps {
	user: user | null;
}

async function fetchCountryDetails(countryName: string): Promise<FollowedCountryItem> {
	const endpoint = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,flags,translations,cca2`;

	try {
		let response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		const country = data?.[0];

        console.error(country);
		return {
			name: countryName,
			label: country?.translations?.ita?.common || country?.name?.common || countryName,
			flagUrl: `https://hatscripts.github.io/circle-flags/flags/${country?.cca2?.toLowerCase()}.svg`,
		};
	} catch {
		return {
			name: countryName,
			label: countryName,
		};
	}
}

export default function FollowedCountry({ user }: FollowedCountryProps) {
	const [countries, setCountries] = useState<FollowedCountryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [removingCountry, setRemovingCountry] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const loadCountries = async () => {
			if (!user?.subscriptions?.length) {
				setCountries([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const uniqueCountries = Array.from(new Set(user.subscriptions));
				const details = await Promise.all(uniqueCountries.map((country) => fetchCountryDetails(country)));

				if (!cancelled) {
					setCountries(details.sort((a, b) => a.label.localeCompare(b.label)));
				}
			} catch (loadError) {
				console.error("Errore caricamento nazioni seguite:", loadError);
				if (!cancelled) {
					setError("Impossibile caricare le nazioni seguite.");
					setCountries(user.subscriptions.map((country) => ({ name: country, label: country })));
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		loadCountries();

		return () => {
			cancelled = true;
		};
	}, [user?.subscriptions]);

	const handleRemoveCountry = async (countryName: string) => {
		if (!user) return;

		if (!navigator.onLine) {
			setError("Sei offline. Connettiti a internet per rimuovere una nazione seguita.");
			return;
		}

		setRemovingCountry(countryName);
		setError(null);

		try {
			const currentToken = await getToken(messaging, {
				vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
			});

			if (!currentToken) {
				throw new Error("Token notifiche non disponibile");
			}

			const response = await fetch(`${EXPRESS_API_URL}/unsubscribe`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					country: countryName,
					uid: user.uid,
					token: currentToken,
				}),
			});

			const data = await response.json();

			if (!response.ok || !data?.success) {
				throw new Error(data?.message || "Errore durante la disiscrizione");
			}

			await updateDoc(doc(db, "users", user.uid), {
				subscriptions: arrayRemove(countryName),
			});

			setCountries((current) => current.filter((country) => country.name !== countryName));
		} catch (removeError) {
			console.error("Errore rimozione nazione seguita:", removeError);
			setError("Non è stato possibile rimuovere la nazione seguita.");
		} finally {
			setRemovingCountry(null);
		}
	};

	if (!user) return null;

	const hasCountries = countries.length > 0;

	return (
		<section className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800/50 rounded-2xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
			<div className="flex items-start justify-between gap-4 mb-5">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
							<FiGlobe className="w-5 h-5" />
						</div>
						<div>
							<h2 className="text-xl md:text-2xl font-bold text-white">Nazioni seguite</h2>
							<p className="text-sm text-neutral-400">Le nazioni salvate nel tuo profilo e sincronizzate con le notifiche.</p>
						</div>
					</div>
				</div>
				<div className="hidden md:flex items-center gap-2 text-sm text-neutral-400 bg-neutral-950/60 border border-neutral-800 rounded-full px-3 py-2">
					<span className="font-semibold text-white">{countries.length}</span>
					<span>seguite</span>
				</div>
			</div>

			{loading ? (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="h-20 rounded-2xl border border-neutral-800 bg-neutral-950/60 animate-pulse" />
					))}
				</div>
			) : hasCountries ? (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{countries.map((country) => {
						const isRemoving = removingCountry === country.name;

						return (
							<div
								key={country.name}
								className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 shadow-lg transition-colors hover:border-neutral-700"
							>
								<div className="h-12 w-12 overflow-hidden rounded-xl shrink-0 flex items-center justify-center">
									{country.flagUrl ? (
										<img src={country.flagUrl} alt={country.label} className="h-full w-full object-cover" />
									) : (
										<span className="text-xs font-bold text-neutral-400">{country.label.slice(0, 2).toUpperCase()}</span>
									)}
								</div>

								<div className="min-w-0 flex-1">
									<p className="truncate text-base font-semibold text-white">{country.label}</p>
									<p className="truncate text-xs text-neutral-500">{country.name}</p>
								</div>

								<button
									type="button"
									onClick={() => handleRemoveCountry(country.name)}
									disabled={isRemoving}
									className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
								>
									<FiTrash2 className={isRemoving ? "animate-pulse" : ""} />
									<span className="hidden sm:inline">Rimuovi</span>
								</button>
							</div>
						);
					})}
				</div>
			) : (
				<div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/50 px-6 py-10 text-center">
					<FiGlobe className="mx-auto mb-4 h-12 w-12 text-neutral-600" />
					<h3 className="text-lg font-semibold text-white">Nessuna nazione seguita</h3>
					<p className="mt-2 text-sm text-neutral-400">
						Quando segui un paese dalla mappa, comparirà qui e potrai rimuoverlo in qualsiasi momento.
					</p>
				</div>
			)}

			{error && (
				<p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
					{error}
				</p>
			)}
		</section>
	);
}
