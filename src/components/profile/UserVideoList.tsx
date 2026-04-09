import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { user, video } from "../../types";
import { FiArrowRight, FiPlayCircle } from "react-icons/fi";
import UserVideoCard from "./UserVideoCard";

interface UserVideoListProps {
  user: user | null;
  onSuggestVideo: () => void;
}

export default function UserVideoList({
  user,
  onSuggestVideo,
}: UserVideoListProps) {
  const [videos, setVideos] = useState<video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);


  // Carica i video suggeriti dall'utente
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const videosRef = collection(db, "videos");
      const q = query(
        videosRef,
        where("submittedBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const videosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          countryCode: doc.data().countryCode,
          ...doc.data(),
        })) as video[];

        const videosWithThumbnails = await Promise.all(
          videosData.map(async (video) => {
            const res = await fetch(`https://www.youtube.com/oembed?url=${video.url}&format=json`);
            const data = await res.json();
            const countryInfo = await fetch(`https://restcountries.com/v3.1/alpha/${video.countryCode}`);
            const countryData = await countryInfo.json();
            const flagUrl = countryData[0]?.flags?.png || null;
            return {
              ...video,
              thumbnail: data.thumbnail_url,
              title: data.title,
              country: countryData[0]?.name?.common || "Paese sconosciuto",
              flag: flagUrl,
              
            } as video & { thumbnail?: string };
          })
        );
        setVideos(videosWithThumbnails);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error("Errore nel caricamento video:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore nel caricamento dei video"
      );
      setLoading(false);
    }
  }, [user?.uid]);

  // Funzione per rimuovere un video
  const handleDeleteVideo = async (videoId: string) => {
    setDeletingVideo(videoId);

    // controlliamo che l'utente e l'uid siano definiti prima di aggiornare il documento user
    if (!user?.uid) {
      console.warn("Impossibile aggiornare le statistiche: user uid non definito");
      setDeletingVideo(null);
      return;
    }

    try {
      await deleteDoc(doc(db, "videos", videoId));
      await updateDoc(doc(db, "users", user.uid), {
        "stats.pendingVideos": increment(-1),
        "stats.suggestedVideos": increment(-1),
      });
    } catch (err) {
      console.error("Errore nella rimozione del video:", err);
      alert("Errore nella rimozione del video");
    }
    setDeletingVideo(null);
  };

  // Funzione per convertire Firestore timestamp a Date
  const getDate = (createdAt: any): Date => {
    if (!createdAt) return new Date();
    if (createdAt instanceof Date) return createdAt;
    if (createdAt.seconds) return new Date(createdAt.seconds * 1000);
    return new Date();
  };

  // Formattazione data
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Separa i video in due categorie
  const pendingVideos = videos
    .filter(v => v.status === "pending")
    .sort((a, b) => {
      const dateA = getDate(a.createdAt);
      const dateB = getDate(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

  const otherVideos = videos
    .filter(v => v.status !== "pending")
    .sort((a, b) => {
      if (filterStatus !== "all") {
        // Se filtrato, mostra solo quello stato
        if (a.status !== filterStatus) return 1;
      }
      const dateA = getDate(a.createdAt);
      const dateB = getDate(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

  // Applica filtro ai video non-pending
  const filteredOtherVideos = filterStatus === "all" || filterStatus === "pending"
    ? otherVideos
    : otherVideos.filter(v => v.status === filterStatus);

  // Colore badge stato
  const getStatusBadge = (
    status: "pending" | "approved" | "rejected"
  ): { bg: string; label: string } => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
          label: "In Sospeso",
        };
      case "approved":
        return {
          bg: "bg-green-500/20 border-green-500/50 text-green-300",
          label: "Approvato",
        };
      case "rejected":
        return {
          bg: "bg-red-500/20 border-red-500/50 text-red-300",
          label: "Rifiutato",
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-8 text-center">
        <div className="inline-block">
          <div className="w-8 h-8 border-3 border-neutral-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-neutral-400 mt-3">Caricamento video...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-8">
        <p className="text-red-400">Errore: {error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-12 text-center">
        <FiPlayCircle className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Nessun video suggerito
        </h3>
        <p className="text-neutral-400 mb-6">
          Inizia a suggerire i tuoi video preferiti sulla mappa mondiale!
        </p>
        <button
          onClick={onSuggestVideo}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200 border border-blue-500/30"
        >
          Suggerisci un Video
          <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SEZIONE 1: VIDEO SUGGERITI (PENDING) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-white">
            Video Suggeriti
            <span className="text-blue-400 ml-2">
              {pendingVideos.length}/5
            </span>
          </h2>
          {pendingVideos.length === 0 ? (
            <p className="text-sm text-neutral-400">Nessun video in attesa di approvazione</p>
          ) : (
            <p className="text-sm text-neutral-400">Video in sospeso</p>
          )}
        </div>

        {pendingVideos.length === 0 ? (
          <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-12 text-center">
            <FiPlayCircle className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">
              Nessun video in attesa di approvazione
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingVideos.map((video) => {
              return(
                <UserVideoCard
                  key={video.id}
                  video={video}
                  deleting={deletingVideo}
                  onDelete={handleDeleteVideo}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* SEZIONE 2: CRONOLOGIA (APPROVED + REJECTED) */}
      {filteredOtherVideos.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">Cronologia Video</h2>
          </div>

          {/* Filtri per cronologia */}
          <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-4 mb-4">
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              Filtra per Stato
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="all">Tutti</option>
              <option value="approved">Approvati</option>
              <option value="rejected">Rifiutati</option>
            </select>
          </div>

          {/* Grid cronologia */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOtherVideos.map((video) => {
              const statusBadge = getStatusBadge(video.status);
              const videoDate = getDate(video.createdAt);

              return (
                <div
                  key={video.id}
                  className="group bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50 rounded-xl overflow-hidden hover:border-neutral-700/80 transition-all duration-300 hover:shadow-lg"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-neutral-800 overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-neutral-700 to-neutral-900">
                        <FiPlayCircle className="w-12 h-12 text-neutral-500" />
                      </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 right-3 bg-black rounded-full">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {video.title || "Video senza titolo"}
                    </h3>

                    {/* Country with Flag */}
                    <div className="flex items-center gap-2 mb-3">
                      {video.flag && (
                        <img
                          src={video.flag}
                          alt={video.country}
                          className="w-5 h-4 rounded-sm object-cover"
                        />
                      )}
                      <span className="text-sm text-neutral-400">
                        {video.country || "Paese non specificato"}
                      </span>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-neutral-500 mb-3">
                      {formatDate(videoDate)}
                    </p>

                    {/* Actions */}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Guarda il video
                      <FiArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
