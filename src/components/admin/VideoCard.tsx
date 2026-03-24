import { FaPlay } from "react-icons/fa";
import type { video } from "../../types/index";

interface VideoCardProps {
  video: video;
  updating: string | null;
  onUpdateStatus: (videoId: string, newStatus: "approved" | "rejected") => void;
}

export default function VideoCard({ video, updating, onUpdateStatus }: VideoCardProps) {
  return (
    <div
      className="bg-neutral-700/50 border border-neutral-600 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-neutral-700/70 transition-colors"
    >
      {/* Video Info (Linkabile) */}
      <a 
        href={video.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex gap-4 flex-1 min-w-0 w-full cursor-pointer group/link"
      >
          {video.thumbnail && (
          <div className="aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5 group-hover/link:border-blue-500/50 transition-colors relative">
            <img
              src={video.thumbnail}
              alt="Thumbnail"
              className="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-500"
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
            <span className="flex items-center gap-2">
              <p className="text-[10px] md:text-xs text-neutral-400">
                Paese: <span className="text-neutral-200 font-semibold">{video.country || video.countryCode}</span>
              </p>
              {video.flag && (
              <img
                src={video.flag}
                alt="Flag"
                className="h-3 w-5 md:h-4 md:w-6 rounded-sm object-contain"
              />
              )}
            </span>
            <span>
              <p className="text-[10px] md:text-xs text-neutral-400">
                Suggerito da: <span className="text-neutral-200 font-semibold">{video.suggesterName || "Utente sconosciuto"}</span>
              </p>
            </span>
                                    
          </div>
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
          onClick={() => onUpdateStatus(video.id, "rejected")}
          disabled={updating === video.id}
          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-600/80 disabled:bg-neutral-600 disabled:opacity-50 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer"
        >
          {updating === video.id ? "⏳" : "✕"} <span className="inline">Rifiuta</span>
        </button>
      </div>
    </div>
  );
}
