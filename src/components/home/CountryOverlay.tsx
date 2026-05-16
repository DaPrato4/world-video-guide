import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { video } from "../../types";
import { collection, addDoc, doc, updateDoc, increment, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import SuggestVideoModal from "./SuggestVideoOverlay";
import Alert from "../common/Alert";
import { FiFolderMinus, FiPlus, FiVideo, FiUser, FiBell, FiBellOff } from "react-icons/fi";
import { TbWorld } from "react-icons/tb";

import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase";
import { EXPRESS_API_URL } from "../../apiConfig";

interface CountryOverlayProps {
  country: any;
  videos: video[];
  onClose: () => void;
  user: any;
  onLogin: () => void;
  flagUrl?: string;
}

export default function CountryOverlay({ country, videos : videosWithoutMetadata, onClose, user, onLogin, flagUrl }: CountryOverlayProps) {
    const [isSuggestOverlayOpen, setIsSuggestOverlayOpen] = useState(false);
    const [videos, setVideos] = useState<video[]>(videosWithoutMetadata ?? []);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [filteredVideos, setFilteredVideos] = useState<video[]>(videosWithoutMetadata ?? []);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(user?.subscriptions?.includes(country.name) || false);

    const countryName = country.itName || country.name || "Nome sconosciuto";
    const countryVideos = videos;

    // Quando il componente si monta, recupera titolo e thumbnail per ciascuno usando l'endpoint oEmbed di YouTube
    useEffect(() => {
        // Aggiorna i metadati dei video (titolo e thumbnail) usando l'endpoint oEmbed di YouTube
        if (!videosWithoutMetadata || videosWithoutMetadata.length === 0) return;

        (async () => {
            try {
                const updated = await Promise.all(
                    (videosWithoutMetadata ?? []).map(async (element) => {
                        try {
                            const res = await fetch(`https://www.youtube.com/oembed?url=${element.url}&format=json`);
                            const data = await res.json();

                            return {
                                ...element,
                                title: data.title,
                                thumbnail: data.thumbnail_url,
                                categories: element.categories || ["Uncategorized"] // Se non c'è categoria, assegna "Uncategorized"
                            } as video;
                        } catch (err) {
                            console.error("Errore recupero titolo video:", err);
                            return element;
                        }
                    })
                );

                setVideos(updated);
                setFilteredVideos(updated);

                // Estrai le categorie uniche dai video aggiornati
                const uniqueCats = Array.from(new Set(
                    updated.flatMap(v => v.status === "approved" ? v.categories || [] : [])
                ));
                uniqueCats.sort((a, b) => a.localeCompare(b)); // Ordina alfabeticamente
                setCategories(uniqueCats);

            } catch (err) {
                console.error("Errore aggiornamento metadati video:", err);
            }
        })();

        // controlla se l'utente è già iscritto alle notifiche di questo paese
        setIsSubscribed(user?.subscriptions?.includes(country.name) || false);


    }, []);

    const handleSubscribeToCountry = async () => {
        if (!user) {
            setAlert({ type: "error", message: "Devi accedere per attivare le notifiche." });
            return;
        }

        setIsSubscribing(true);
        try {
            // 1. Chiediamo il permesso al browser
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setAlert({ type: "error", message: "Devi consentire le notifiche nel browser per iscriverti." });
                setIsSubscribing(false);
                return;
            }

            // 2. Otteniamo il token del dispositivo
            const currentToken = await getToken(messaging, { 
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
            });

            if (!currentToken) {
                setAlert({ type: "error", message: "Impossibile generare il token delle notifiche." });
                setIsSubscribing(false);
                return;
            }

            // 3. Inviamo il token al server per associarlo all'utente e al paese scelto
            const response = await fetch(`${EXPRESS_API_URL}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: currentToken,
                    country: country.name, 
                    uid: user.uid
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setAlert({ type: "success", message: `Notifiche attivate per ${countryName}!` });
                setIsSubscribed(true);
            } else {
                throw new Error("Errore dal server");
            }
        } catch (error) {
            console.error("Errore iscrizione:", error);
            setAlert({ type: "error", message: "Si è verificato un errore durante l'attivazione delle notifiche." });
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleUnsubscribeFromCountry = async () => {
        // Logica per disiscrivere l'utente dalle notifiche del paese
        setIsSubscribing(true);
        try {
            const currentToken = await getToken(messaging, { 
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
            });

            if (!currentToken) {
                setAlert({ type: "error", message: "Impossibile generare il token delle notifiche." });
                setIsSubscribing(false);
                return;
            }

            const response = await fetch(`${EXPRESS_API_URL}/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    country: country.name,
                    uid: user.uid,
                    token: currentToken
                })
            });

            const data = await response.json();

            if (data.success) {
                setAlert({ type: "success", message: `Notifiche disattivate per ${countryName}!` });
                setIsSubscribed(false);
            } else {
                throw new Error("Errore dal server");
            }
        } catch (error) {
            console.error("Errore disiscrizione:", error);
            setAlert({ type: "error", message: "Si è verificato un errore durante la disattivazione delle notifiche." });
        } finally {
            setIsSubscribing(false);
        }
    };

    // Funzione per aggiungere un nuovo video al database
    const handleAddVideo = async (videoUrl: string, countryCode: number, categories: string[] = []) => {

        if (!videoUrl) return;

        try {
            const q = query(collection(db, "users"), where("uid", "==", user?.uid));
            const pendingVideosDoc = await getDocs(q);
            if(pendingVideosDoc.docs[0]?.data()?.stats?.pendingVideos >= 5) {
                setAlert({ type: "error", message: "Hai raggiunto il limite di 5 video in attesa. Attendi la revisione o rimuovi alcuni prima di suggerirne altri." });
                return;
            }


            // Salviamo solo i due dati fondamentali
            await addDoc(collection(db, "videos"), {
            url: videoUrl,
            countryCode: Number(countryCode),  // es. 380
            categories,
            createdAt: new Date(),      // utile per l'ordinamento
            status: "pending",          // Stato iniziale
            submittedBy: user?.uid || "anonymous" // ID dell'utente che ha suggerito (se disponibile)
            });
            // Aggiorniamo il numero di video suggeriti in stato pending dell' utente utilizzando un campo stats
            if (user) {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, { 
                    "stats.pendingVideos": increment(1),
                    "stats.suggestedVideos": increment(1)

                });

            }

            // Mostra alert di successo
            setAlert({ type: "success", message: "Video suggerito con successo! Verrà revisionato a breve." });
        } catch (error) {
            // Mostra alert di errore
            setAlert({ type: "error", message: "Errore nel suggerire il video. Riprova più tardi." });
            console.error("Errore aggiunta video:", error);
        }
    };

    function selectCategory(cat: string) {
            if (cat === "all") {
                setSelectedCategories([]);
                setFilteredVideos(videos);
                return;
            }

            const nextSelected = selectedCategories.includes(cat)
                ? selectedCategories.filter((c) => c !== cat)
                : [...selectedCategories, cat];

            setSelectedCategories(nextSelected);

            if (nextSelected.length === 0) {
                setFilteredVideos(videos);
                return;
            }

            setFilteredVideos(
                videos.filter((v) =>
                    nextSelected.some((c) => v.categories?.includes(c))
                )
            );
        }


    return (
        <>
        <AnimatePresence>
            {alert && (
                <Alert
                    key="global-alert"
                    type={alert.type}
                    message={alert.message}
                    duration={4000}
                    onClose={() => setAlert(null)}
                />
            )}
        </AnimatePresence>
        <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(1px)" }} 
            exit={{ 
                opacity: 0, 
                backdropFilter: "blur(0px)", 
                transition: { delay: 0, duration: 0.2 } 
            }} 
            transition={{ duration: 1.4, delay: 0 }} 
            
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0, opacity: 0 }} // Parte letteralmente da un pixel invisibile
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { delay: 0, duration: 0.9 } }}
                transition={{ 
                    duration: 0.9, 
                    delay: 1,
                    type: "spring",
                    bounce: 0.5
                }} 
                className="bg-neutral-900 w-full max-w-6xl h-full md:h-[85vh] rounded-none md:rounded-3xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* --- SIDEBAR SINISTRA (Identità e Navigazione) --- */}
                <aside className="w-full md:w-1/4 bg-neutral-950 flex flex-col border-b md:border-b-0 md:border-r border-white/5 max-h-[40vh] md:max-h-full">
                    {/* Intestazione Sidebar con Bandiera */}
                    <div className="p-4 md:p-6 flex flex-row md:flex-col items-center justify-between gap-4 md:gap-0 border-b border-white/5">
                            {flagUrl ? (
                                <div className="w-fit max-w-full mb-0 md:mb-4 bg-neutral-900 rounded-lg md:rounded-xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center shrink-0">
                                    <img src={flagUrl} alt="Bandiera" className="block w-auto h-auto max-w-24 md:max-w-full max-h-12 md:max-h-30 object-contain" />
                                </div>
                            ) : (
                                <div className="w-fit max-w-full mb-0 md:mb-4 rounded-lg md:rounded-xl animate-pulse bg-neutral-700 p-1 md:p-2 shrink-0">
                                    <div className="w-24 md:w-40 h-12 md:h-30 rounded-md md:rounded-lg bg-neutral-700"></div>
                                </div>
                            )}
                        <div className="text-left md:text-center mr-auto md:mr-0">
                            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-white line-clamp-1 md:line-clamp-2">
                                {countryName}
                            </h2>
                            <div className="w-8 md:w-12 h-1 bg-blue-500 rounded-full mt-1 md:mt-3 mx-0 md:mx-auto"></div>
                        </div>
                        <div className="flex gap-2 text-[10px] md:text-xs text-neutral-400 mt-2">
                            <span className="bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700 whitespace-nowrap flex items-center">
                                {filteredVideos.filter(v => v.status === "approved").length} Video
                            </span>
                            
                            {/* BOTTONE NOTIFICHE */}
                            {isSubscribed ? (
                            <button 
                                onClick={handleUnsubscribeFromCountry}
                                disabled={isSubscribing}
                                className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 whitespace-nowrap flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                                <FiBell className={isSubscribing ? "animate-pulse" : ""} />
                            </button>
                            ) : (
                            <button 
                                onClick={handleSubscribeToCountry}
                                disabled={isSubscribing}
                                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-3 py-1 rounded-full border border-neutral-700/50 whitespace-nowrap flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                                <FiBellOff className={isSubscribing ? "animate-pulse" : ""} />
                            </button>
                            )}
                        </div>
                    </div>

                    {/* Menu Navigazione / Filtri (Contenitore scrollabile su mobile) */}
                    <nav className="flex-1 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden overflow-y-auto scrollbar-none md:mt-4 whitespace-nowrap md:whitespace-normal">
                        <div className="hidden md:block">
                            <p className="px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Categorie</p>
                        </div>
                        {categories.length > 0 && (
                            <>
                                <button 
                                    className={"flex items-center gap-3 px-4 md:px-3 py-2 rounded-xl text-neutral-400 hover:bg-white/5 font-medium text-xs md:text-sm transition-all group " + (selectedCategories.length === 0 ? "bg-white/10 text-white" : "")}
                                    onClick={()=>(selectCategory("all"))}
                                    >
                                    <span className="group-hover:scale-110 transition-transform"><TbWorld /></span> <span className="md:inline">Tutte le Categorie</span>
                                </button>
                                {categories.map((cat) => (
                                    <button 
                                        key={cat} 
                                        className={`flex items-center gap-3 px-4 md:px-3 py-2 rounded-xl text-neutral-400 hover:bg-white/5 font-medium text-xs md:text-sm transition-all group ${selectedCategories.includes(cat) ? "bg-white/10 text-white" : ""}`}
                                        onClick={()=>(
                                            selectCategory(cat)
                                        )}
                                    >
                                        <span className="group-hover:scale-110 transition-transform"><FiFolderMinus /></span> <span className="md:inline">{cat}</span>
                                    </button>
                                ))}
                            </>
                        )}
                    </nav>

                    {/* Pulsanti Azione in basso alla Sidebar */}
                    <div className="p-4 flex flex-row md:flex-col gap-2 mt-auto border-t border-white/5 md:border-t-0">
                        {/* LOGICA CONDIZIONALE: Se c'è l'utente mostra SUGGERISCI, altrimenti mostra ACCEDI */}
                        {user ? (
                            <div className="flex-1 md:flex-none flex flex-col gap-2">
                                <p className="hidden md:block text-[10px] text-center text-neutral-500">
                                    {user.displayName}
                                </p>
                                <button 
                                    onClick={() => setIsSuggestOverlayOpen(true)}
                                    className="w-full py-2.5 md:py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all border border-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    <FiPlus />
                                    <span className="hidden md:inline"> SUGGERISCI VIDEO</span>
                                    <span className="md:hidden">SUGGERISCI</span>
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={
                                    () => {
                                        if(navigator.onLine) {
                                            onLogin()
                                        } else {
                                            setAlert({ type: "error", message: "Sei offline. Connettiti a internet per accedere o registrarti." })
                                        }
                                    }
                                }
                                className="flex-1 md:flex-none py-2.5 md:py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                            >
                                <span><FiUser /></span>
                                <span className="hidden md:inline"> ACCEDI PER SUGGERIRE</span>
                                <span className="md:hidden">ACCEDI</span>
                            </button>
                        )}

                        <button 
                            onClick={onClose}
                            className="flex-none md:w-full px-4 md:px-0 py-2.5 md:py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold rounded-xl transition-all border border-red-600/20"
                        >
                            <span className="hidden md:inline">CHIUDI</span>
                            <span className="md:hidden">✕</span>
                        </button>
                    </div>
                </aside>

                {/* --- AREA CONTENUTO DESTRA (Feed Video) --- */}
                <main className="flex-1 flex flex-col bg-neutral-900/50 min-h-0">
                    {/* Header superiore del contenuto */}
                        <header className="hidden md:flex px-4 py-4 md:px-8 md:py-6 flex-row justify-between items-center sm:items-center gap-4 border-b border-white/5">
                        <div>
                            <h3 className="md:text-xl font-bold text-white uppercase tracking-tight">Discovery Feed</h3>
                            <p className="text-[10px] md:text-xs text-neutral-500">Contenuti selezionati per {countryName}</p>
                        </div>
                        <div className="flex gap-2 text-[10px] md:text-xs text-neutral-400">
                            <span className="bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
                                {filteredVideos.filter(v => v.status === "approved").length} Video trovati
                            </span>
                        </div>
                    </header>

                    {/* Griglia Video con Scroll */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 pr-4 custom-scrollbar touch-pan-y">
                        {countryVideos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                                {filteredVideos
                                    .filter(v => v.status === "approved")
                                    .map(v => (
                                    <div 
                                        key={v.id} 
                                        className="group bg-neutral-800/40 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10"
                                        onClick={() => {
                                            if (navigator.onLine) {
                                                window.open(v.url, "_blank");
                                            }else{
                                                setAlert({ type: "error", message: "Non puoi aprire il video mentre sei offline. Riconnettiti a internet e riprova." });
                                            }
                                        }}
                                    >
                                        <div className="relative aspect-video overflow-hidden">
                                            {v.thumbnail ? (
                                                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-4xl">🎬</div>
                                            )}
                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                                                    <span className="text-xs">▶</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="text-sm font-bold text-neutral-200 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                                {v.title || "Video senza titolo"}
                                            </h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <FiVideo className="text-6xl mb-4 text-neutral-300" />
                                <p className="text-lg font-medium">Ancora nessun video qui.</p>
                                <p className="text-sm">Sii il primo a contribuire alla guida!</p>
                            </div>
                        )}
                    </div>
                </main>
            </motion.div>
        </motion.div>
        <AnimatePresence>
            {isSuggestOverlayOpen && (
                <SuggestVideoModal 
                countryName={countryName}
                onClose={() => setIsSuggestOverlayOpen(false)}
                onSubmit={(url, categories) => {
                    handleAddVideo(url, country.id, categories); // La funzione Firebase
                    setIsSuggestOverlayOpen(false);
                }}
                />
            )}
        </AnimatePresence>
        </>
    );
}