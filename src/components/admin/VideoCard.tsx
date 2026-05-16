import { useEffect, useState } from "react";
import { FaEdit, FaPlay } from "react-icons/fa";
import type { video } from "../../types/index";
import RejectionModal from "./RejectionModal";
import CategoryEditor from "./CategoryEditor";

interface VideoCardProps {
  video: video;
  updating: string | null;
  officialCategories: { value: string; label: string; aliases?: string[] }[];
  onUpdateStatus: (
    videoId: string,
    newStatus: "approved" | "rejected",
    reason?: string,
    updatedCategories?: string[],
    brandNewCategories?: string[]
  ) => void;
  onAddAlias: (categoryId: string, newAlias: string) => Promise<void>;
}

export default function VideoCard({ video, updating, officialCategories, onUpdateStatus, onAddAlias }: VideoCardProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [editedCategories, setEditedCategories] = useState<string[]>(video.categories || []);
  const [isEditingCategories, setIsEditingCategories] = useState(false);

  useEffect(() => {
    setEditedCategories(video.categories || []);
  }, [video.categories, video.id]);

  const handleReject = (reason: string) => {
    onUpdateStatus(video.id, "rejected", reason);
    setIsRejectModalOpen(false);
  };

  const handleApprove = () => {
    // 1. Filtriamo per trovare SOLO le categorie veramente nuove
    const brandNewCategories = editedCategories.filter((cat) => {
      const alreadyExists = officialCategories.some((officialCat) => {
        return officialCat.label === cat || officialCat.aliases?.includes(cat);
      });
      
      // Se non esiste (false), la teniamo nell'array restituendo true
      return !alreadyExists; 
    });

    onUpdateStatus(video.id, "approved", undefined, editedCategories, brandNewCategories);
  };

  const toggleCategory = (category: string) => {
    setEditedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 hover:border-white/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-neutral-700/70 transition-colors">
      {/* Video Info (image clickable only) */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0 w-full group">
        {video.thumbnail && (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            // MODIFICA: Aggiunto self-center per forzarla al centro verticale del div padre
            className="w-full sm:w-32 aspect-video sm:h-18 shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5 group-hover:border-blue-500/50 transition-colors relative block self-center"
          >
            <img
              src={video.thumbnail}
              alt="Thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 shadow-2xl group-hover:scale-100 transition-transform duration-300">
                <FaPlay className="text-white text-xl ml-1" />
              </div>
            </div>
          </a>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3
            className="font-bold text-sm md:text-base text-white truncate leading-tight group-hover:text-blue-400 transition-colors"
            title={video.title}
          >
            {video.title || "Video senza titolo"}
          </h3>
          <p className="text-[10px] md:text-xs text-neutral-500 mt-1 truncate opacity-60">
            {video.url}
          </p>
          <div className="flex items-center gap-2 sm:gap-4 mt-2 flex-wrap justify-around sm:justify-start">
            <span className="flex items-center gap-2 overflow-hidden">
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
            <span className="flex flex-col lg:flex-row lg:items-center lg:gap-3 min-w-0">
              <p className="text-[10px] md:text-xs text-neutral-400">
                Suggerito da: <span className="text-neutral-200 font-semibold truncate">{video.suggesterName || "Utente sconosciuto"}</span>
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

          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {editedCategories.length > 0 ? (
                editedCategories.map((cat, index) => (
                  <span
                    key={`${cat}-${index}`}
                    className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[9px] md:text-[10px] font-medium rounded-full"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-[10px] md:text-xs text-neutral-500">Nessuna categoria selezionata</span>
              )}

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsEditingCategories((current) => !current);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] md:text-xs font-semibold text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/10 transition-colors"
              >
                <FaEdit className="text-[10px]" />
                Modifica
              </button>
            </div>

            {isEditingCategories && (
              <CategoryEditor
                editedCategories={editedCategories}
                setEditedCategories={setEditedCategories}
                toggleCategory={toggleCategory}
                officialCategories={officialCategories}
                onAddAlias={onAddAlias}
                onClose={() => setIsEditingCategories(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Pulsanti Azione */}
      <div className="flex gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
        <button
          onClick={handleApprove}
          disabled={updating === video.id}
          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:opacity-50 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {updating === video.id ? "⏳" : "✓"} <span className="inline">Approva</span>
        </button>
        <button
          onClick={() => setIsRejectModalOpen(true)}
          disabled={updating === video.id}
          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-600/80 disabled:bg-neutral-600 disabled:opacity-50 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
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