import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, increment } from "firebase/firestore";
import type { user, video } from "../types/index"
import Header from "../components/common/Header";
import VideoList from "../components/admin/VideoList";
import UserList from "../components/admin/UserList";

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
            // Prendiamo anche il DisplayName dello user che ha suggerito il video
            const suggesterQuery = query(collection(db, "users"), where("uid", "==", d.submittedBy));
            const suggesterSnapshot = await getDocs(suggesterQuery);
            const suggesterData = suggesterSnapshot.empty ? null : suggesterSnapshot.docs[0].data() as any;
            return {
              id: doc.id,
              thumbnail: datayoutube.thumbnail_url,
              title: datayoutube.title,
              country: datacountry[0].name.common,
              flag: datacountry[0].flags.png,
              suggesterName: suggesterData?.displayName || "Utente sconosciuto",
              suggesterEmail: suggesterData?.email || "Email non disponibile",
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
              suggesterName: "Utente sconosciuto",
              suggesterEmail: "Email non disponibile",
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
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header user={user} page="Admin"/>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex flex-col gap-15 max-w-7xl mx-auto p-4 md:p-8">

        <div className="grid grid-cols-1 gap-6">
          <VideoList 
            videos={pendingVideos} 
            loading={loading} 
            updating={updating} 
            onUpdateStatus={updateVideoStatus} 
          />
        </div>
        {user.role === "admin" && (
          <div className="grid grid-cols-1 gap-6">
            <UserList 
              currentUser={user}
            />
          </div>
        )}
      </main>
    </div>
  );
}
