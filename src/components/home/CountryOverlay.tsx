import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { video } from "../../types";
import { collection, addDoc, doc, updateDoc, increment, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import SuggestVideoModal from "./SuggestVideoOverlay";
import Alert from "../common/Alert";

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
                            } as video;
                        } catch (err) {
                            console.error("Errore recupero titolo video:", err);
                            return element;
                        }
                    })
                );

                setVideos(updated);
            } catch (err) {
                console.error("Errore aggiornamento metadati video:", err);
            }
        })();

    }, []);

    // Funzione per aggiungere un nuovo video al database
    const handleAddVideo = async (videoUrl: string, countryCode: number) => {

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
                className="bg-neutral-900 w-full max-w-6xl h-[85vh] rounded-3xl flex overflow-hidden shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* --- SIDEBAR SINISTRA (Identità e Navigazione) --- */}
                <aside className="w-1/4 bg-neutral-950 flex flex-col border-r border-white/5">
                    {/* Intestazione Sidebar con Bandiera */}
                    <div className="p-6 flex flex-col items-center border-b border-white/5">
                            {flagUrl ? (
                                <div className="mb-4 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center">
                                    <img src={flagUrl} alt="Bandiera" className="max-w-full max-h-30 object-contain" />
                                </div>
                            ) : (
                                <div className="mb-4 rounded-xl animate-pulse bg-neutral-700 w-full h-30"></div>
                            )}
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white text-center line-clamp-2">
                            {countryName}
                        </h2>
                        <div className="w-12 h-1 bg-blue-500 rounded-full mt-3"></div>
                    </div>

                    {/* Menu Navigazione / Filtri (Placeholder grafici) */}
                    <nav className="flex-1 p-4 space-y-2 mt-4">
                        <p className="px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Esplora</p>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-600/10 text-blue-400 font-medium text-sm transition-all border border-blue-600/20">
                            <span>🌐</span> Tutti i Video
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 hover:bg-white/5 font-medium text-sm transition-all group">
                            <span className="group-hover:scale-110 transition-transform">🍲</span> Gastronomia
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 hover:bg-white/5 font-medium text-sm transition-all group">
                            <span className="group-hover:scale-110 transition-transform">🏛️</span> Storia & Cultura
                        </button>
                    </nav>

                    {/* Pulsanti Azione in basso alla Sidebar */}
                    <div className="p-4 space-y-2 mt-auto">
                        {/* LOGICA CONDIZIONALE: Se c'è l'utente mostra SUGGERISCI, altrimenti mostra ACCEDI */}
                        {user ? (
                            <>
                                <p className="text-[10px] text-center text-neutral-500">
                                    Loggato come {user.displayName}
                                </p>
                                <button 
                                    onClick={() => setIsSuggestOverlayOpen(true)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all border border-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    ➕ SUGGERISCI VIDEO
                                </button>
                                
                            </>
                        ) : (
                            <button 
                                onClick={onLogin}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                            >
                                👤 ACCEDI PER SUGGERIRE
                            </button>
                        )}

                        <button 
                            onClick={onClose}
                            className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold rounded-xl transition-all border border-red-600/20 mt-2"
                        >
                            CHIUDI
                        </button>
                    </div>
                </aside>

                {/* --- AREA CONTENUTO DESTRA (Feed Video) --- */}
                <main className="flex-1 flex flex-col bg-neutral-900/50">
                    {/* Header superiore del contenuto */}
                    <header className="px-8 py-6 flex justify-between items-center border-b border-white/5">
                        <div>
                            <h3 className="text-xl font-bold text-white">Discovery Feed</h3>
                            <p className="text-xs text-neutral-500">Contenuti selezionati per {countryName}</p>
                        </div>
                        <div className="flex gap-2 text-xs text-neutral-400">
                            <span className="bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
                                {countryVideos.length} Video trovati
                            </span>
                        </div>
                    </header>

                    {/* Griglia Video con Scroll */}
                    <div className="flex-1 overflow-y-auto p-8 pr-4 custom-scrollbar">
                        {countryVideos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-6">
                                {countryVideos
                                    .filter(v => v.status === "approved")
                                    .map(v => (
                                    <div 
                                        key={v.id} 
                                        className="group bg-neutral-800/40 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10"
                                        onClick={() => window.open(v.url, "_blank")}
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
                                <span className="text-6xl mb-4">🏜️</span>
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
                onSubmit={(url) => {
                    handleAddVideo(url, country.id); // La funzione Firebase
                    setIsSuggestOverlayOpen(false);
                }}
                />
            )}
        </AnimatePresence>
        </>
    );
}