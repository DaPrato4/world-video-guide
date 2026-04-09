import { useState } from "react";
import { FaPlay } from "react-icons/fa";
import type { video } from "../../types/index";
import RejectionModal from "./RejectionModal";

interface VideoCardProps {
  video: video;
  updating: string | null;
  onUpdateStatus: (videoId: string, newStatus: "approved" | "rejected", reason?: string) => void;
}

export default function VideoCard({ video, updating, onUpdateStatus }: VideoCardProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleReject = (reason: string) => {
    onUpdateStatus(video.id, "rejected", reason);
    setIsRejectModalOpen(false);
  };

  return (
    <div
      className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 hover:border-white/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-neutral-700/70 transition-colors"
    >
      {/* Video Info (Linkabile) */}
      <a 
        href={video.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex gap-4 flex-1 min-w-0 w-full cursor-pointer group/link"
      >
          {video.thumbnail && (
          <div className="w-32 aspect-video shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5 group-hover/link:border-blue-500/50 transition-colors relative">
            <img
              src={video.thumbnail}
              alt="Thumbnail"
              className="w-full h-full object- group-hover/link:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 group-hover/link:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/link:opacity-100 pointer-events-none">
               <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 shadow-2xl group-hover/link:scale-100 transition-transform duration-300">
                  <FaPlay className="text-white text-xl ml-1" />
               </div>
            </div>
          </div>
          )}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-bold text-sm md:text-base text-white truncate leading-tight group-hover/link:text-blue-400 transition-colors" title={video.title}>
            {video.title || "Video senza titolo"}
          </h3>
          <p className="text-[10px] md:text-xs text-neutral-500 mt-1 truncate opacity-60">
            {video.url}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-2 overflow-hidden">
              <p className="text-[10px] md:text-xs text-neutral-400">
                Paese: <span className="text-neutral-200 font-semibold">{video.country || video.countryCode}</span>
              </p>
              {video.flag && (
              <img
                src={video.flag}
                alt="Flag"
                className="h-3 w-5 md:h-4 md:w-6 rounded-sm object-contain hidden md:block"
              />
              )}
            </span>
            <span className="flex flex-col lg:flex-row lg:gap-3 min-w-0">
              <p className="text-[10px] md:text-xs text-neutral-400">
                Suggerito da: <span className="text-neutral-200 font-semibold trun">{video.suggesterName || "Utente sconosciuto"}</span>
              </p>
              {video.suggesterEmail && (
                <span 
                  className="text-[9px] md:text-[10px] text-cyan-300/70 hover:text-blue-400 truncate max-w-40 transition-colors"
                  title={video.suggesterEmail}
                >
                  {video.suggesterEmail}
                </span>
              )}
            </span>
          </div>

          {/* Categorie del video */}
          {video.categories && video.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {video.categories.map((cat, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[9px] md:text-[10px] font-medium rounded-full"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </a>

      {/* Pulsanti Azione */}
      <div className="flex gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
        <button
          onClick={() => onUpdateStatus(video.id, "approved")}
          disabled={updating === video.id}
          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:opacity-50 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer"
        >
          {updating === video.id ? "⏳" : "✓"} <span className="inline">Approva</span>
        </button>
        <button
          onClick={() => setIsRejectModalOpen(true)}
          disabled={updating === video.id}
          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-600/80 disabled:bg-neutral-600 disabled:opacity-50 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer"
        >
          {updating === video.id ? "⏳" : "✕"} <span className="inline">Rifiuta</span>
        </button>
      </div>

      {isRejectModalOpen && (
        <RejectionModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={handleReject}
          videoTitle={video.title || "Video senza titolo"}
        />
      )}
    </div>
  );
}
