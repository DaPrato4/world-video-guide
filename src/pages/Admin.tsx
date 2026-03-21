import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, increment } from "firebase/firestore";
import type { user, video } from "../types/index"

export default function Admin({ user }: { user: user | null }) {
  const [pendingVideos, setPendingVideos] = useState<video[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Carica i video in stato pending
  useEffect(() => {
    const fetchPendingVideos = async () => {
      try {
        setLoading(true);
        const videosRef = collection(db, "videos");
        const q = query(videosRef, where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        
        const videosPromises = querySnapshot.docs.map(async (doc) => {
          try {
            const d = doc.data() as any;
            const res = await fetch(`https://www.youtube.com/oembed?url=${d.url}&format=json`);
            const datayoutube = await res.json();
            const rescountry = await fetch(`https://restcountries.com/v3.1/alpha/${d.countryCode}`);
            const datacountry = await rescountry.json();
            return {
              id: doc.id,
              thumbnail: datayoutube.thumbnail_url,
              title: datayoutube.title,
              country: datacountry[0].name.common,
              flag: datacountry[0].flags.png,
              ...d
            } as video;
          } catch (error) {
            console.error("Errore nel recupero dei dati di YouTube per il video:", doc.id, error);
            const d = doc.data() as any;
            return {
              id: doc.id,
              thumbnail: null,
              title: "Video senza titolo",
              country: "Paese non disponibile",
              flag: null,
              ...d
            } as video;
          }
        });

        const videos = await Promise.all(videosPromises);

        setPendingVideos(videos);
      } catch (error) {
        console.error("Errore nel caricamento dei video:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" || user?.role === "moderator") {
      fetchPendingVideos();
    }
  }, [user]);

  // Aggiorna lo stato del video
  const updateVideoStatus = async (videoId: string, newStatus: "approved" | "rejected") => {
    try {
      setUpdating(videoId);
      
      // Troviamo il video localmente per avere i dati necessari (es. submittedBy)
      const targetVideo = pendingVideos.find(v => v.id === videoId);
      if (!targetVideo) {
        throw new Error("Video non trovato nella lista locale");
      }

      const videoRef = doc(db, "videos", videoId);
      await updateDoc(videoRef, { status: newStatus });

      // Usiamo submittedBy che abbiamo salvato in fase di creazione
      const suggesterUid = targetVideo.submittedBy;

      if (suggesterUid && suggesterUid !== "anonymous") {
        await updateDoc(doc(db, "users", suggesterUid), {
          "stats.pendingVideos": increment(-1),
          ...(newStatus === "approved" && { "stats.approvedVideos": increment(1) }),
          ...(newStatus === "rejected" && { "stats.rejectedVideos": increment(1) }),
        });
      }
      
      // Rimuovi il video dalla lista dopo l'aggiornamento
      setPendingVideos(pendingVideos.filter(v => v.id !== videoId));
    } catch (error) {
      console.error("Errore nell'aggiornamento del video:", error);
    } finally {
      setUpdating(null);
    }
  };

  // 1. Gestione caricamento/permessi
  if (!user || user.role !== "admin" && user.role !== "moderator") {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 text-center">
        <div className="bg-neutral-800 p-8 rounded-3xl border border-white/5 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-4">Accesso Riservato</h1>
          <p className="text-neutral-400 mb-6">Solo gli utenti autorizzati possono accedere a questa area</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
            Torna alla Mappa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* HEADER ADMIN RESPONSIVE */}
      <header className="bg-neutral-800 border-b border-white/5 p-4 md:p-6 sticky top-0 z-10 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
              Admin <span className="text-blue-500">Panel</span>
            </h1>
            <span className="bg-blue-600/10 text-blue-400 text-[10px] px-2 py-1 rounded font-bold border border-blue-500/20">
              {user.role === "moderator" ? "MODERATORE" : "ADMIN"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user.displayName}</p>
              <p className="text-[10px] text-neutral-500">{user.email}</p>
            </div>
            <Link to="/" className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-lg text-xs font-bold transition-all">
              ← Esci
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENUTO PRINCIPALE */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 gap-6">
          <section className="bg-neutral-800/50 border border-white/5 rounded-3xl p-6 md:p-10">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              📂 Gestione Video Pending <span className="text-neutral-500 text-sm font-normal">({pendingVideos.length})</span>
            </h2>
            
            {loading ? (
              <div className="border-2 border-dashed border-neutral-700 rounded-2xl h-64 flex items-center justify-center text-neutral-600">
                <p>Caricamento video...</p>
              </div>
            ) : pendingVideos.length === 0 ? (
              <div className="border-2 border-dashed border-neutral-700 rounded-2xl h-64 flex items-center justify-center text-neutral-600">
                <p>Nessun video in attesa di approvazione</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-neutral-700/50 border border-neutral-600 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-neutral-700/70 transition-colors"
                  >
                    {/* Video Info */}
                    <div className="flex gap-4 flex-1 w-full">
                        {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt="Thumbnail"
                          className="w-24 h-16 rounded-lg object-cover shrink-0"
                        />
                        )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{video.title || "Video senza titolo"}</h3>
                        <p className="text-xs text-neutral-400 mt-1 break-all line-clamp-2">
                          {video.url}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-neutral-500">
                          Paese: <span className="text-neutral-300 font-semibold">{video.country || video.countryCode}</span>
                          </p>
                          {video.flag && (
                          <img
                            src={video.flag}
                            alt="Flag"
                            className="h-5 w-8 rounded-md object-contain"
                          />
                          )}                        
                        </div>
                        
                      </div>
                    </div>

                    {/* Pulsanti Azione */}
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => updateVideoStatus(video.id, "approved")}
                        disabled={updating === video.id}
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                      >
                        {updating === video.id ? "⏳" : "✓"} Approva
                      </button>
                      <button
                        onClick={() => updateVideoStatus(video.id, "rejected")}
                        disabled={updating === video.id}
                        className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                      >
                        {updating === video.id ? "⏳" : "✕"} Rifiuta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}