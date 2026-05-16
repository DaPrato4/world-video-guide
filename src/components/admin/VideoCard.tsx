import { useEffect, useState } from "react";
import { FaEdit, FaPlay } from "react-icons/fa";
import type { video } from "../../types/index";
import RejectionModal from "./RejectionModal";
import { FiLink } from "react-icons/fi";

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
  const [customCategory, setCustomCategory] = useState("");

  // Stati per la gestione degli Alias
  const [aliasTarget, setAliasTarget] = useState<{ originalName: string; categoryId: string } | null>(null);
  const [isSavingAlias, setIsSavingAlias] = useState(false);

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

  const addCustomCategory = () => {
    const nextCategory = customCategory.trim().toLowerCase();
    if (!nextCategory) return;

    setEditedCategories((current) => (current.includes(nextCategory) ? current : [...current, nextCategory]));
    setCustomCategory("");
  };

  const handleMergeToAlias = async () => {
    if (!aliasTarget) return;
    setIsSavingAlias(true);

    try {
      // 1. Aggiungiamo l'alias su Firestore tramite il componente padre
      await onAddAlias(aliasTarget.categoryId, aliasTarget.originalName);

      // 2. Troviamo il nome della categoria ufficiale scelta
      const officialCat = officialCategories.find((c) => c.value === aliasTarget.categoryId);

      if (officialCat) {
        // 3. Sostituiamo il vecchio nome con quello ufficiale
        setEditedCategories((current) => {
          const filtered = current.filter((c) => c !== aliasTarget.originalName);
          if (!filtered.includes(officialCat.label)) {
            filtered.push(officialCat.label);
          }
          return filtered;
        });
      }

      // 4. Chiudiamo il menu a tendina
      setAliasTarget(null);
    } catch (error) {
      console.error("Errore salvataggio alias", error);
    } finally {
      setIsSavingAlias(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 hover:border-white/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-neutral-700/70 transition-colors">
      {/* Video Info (image clickable only) */}
      <div className="flex gap-4 flex-1 min-w-0 w-full group">
        {video.thumbnail && (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-32 aspect-video shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5 group-hover:border-blue-500/50 transition-colors relative"
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
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="flex items-center gap-2 overflow-hidden">
              <p className="text-[10px] md:text-xs text-neutral-400">
                Paise: <span className="text-neutral-200 font-semibold">{video.country || video.countryCode}</span>
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
              <div
                className="rounded-2xl border border-white/10 bg-neutral-900/80 p-3 md:p-4 space-y-5"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {/* SEZIONE 1: Categorie Attuali */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Categorie del Video</h4>
                  <div className="flex flex-wrap gap-2">
                    {editedCategories.map((catName) => {
                      const isOfficial = officialCategories.some((c) => c.label === catName || c.aliases?.includes(catName));
                      //const officialCat = officialCategories.find(c => c.label === catName || c.aliases?.includes(catName));

                      return (
                        <div
                          key={catName}
                          className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 pr-1 overflow-visible"
                        >
                          <button
                            type="button"
                            onClick={() => toggleCategory(catName)}
                            className="px-3 py-2 text-xs font-semibold text-white hover:text-red-400 transition-colors"
                          >
                            
                            {catName} ✕
                          </button>

                          {!isOfficial && (
                            <div className="relative">
                              <button
                                type="button"
                                title="Aggiungi come Alias a una categoria esistente"
                                onClick={() => {
                                  if(!aliasTarget) {
                                    setAliasTarget({ originalName: catName, categoryId: "" })
                                  } else {
                                    setAliasTarget(null);
                                  }
                                }}
                                className="p-1.5 rounded-md hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                              >
                                <FiLink  className="text-[10px]" />
                              </button>

                              {aliasTarget?.originalName === catName && (
                                <div className="absolute top-full mt-1 right-0 translate-x-10 translate-y-1 z-50 w-48 bg-neutral-800 border border-white/10 rounded-xl shadow-xl p-2">
                                  <p className="text-[10px] text-neutral-400 mb-2">Unisci "{catName}" a:</p>
                                  <select
                                    className="w-full bg-neutral-900 text-white text-xs p-2 rounded-lg border border-white/5 mb-2 focus:border-cyan-500 outline-none"
                                    value={aliasTarget.categoryId}
                                    onChange={(e) =>
                                      setAliasTarget({ ...aliasTarget, categoryId: e.target.value })
                                    }
                                  >
                                    <option value="" disabled>
                                      Seleziona...
                                    </option>
                                    {officialCategories.map((c) => (
                                      <option key={c.value} value={c.value}>
                                        {c.label}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setAliasTarget(null)}
                                      className="flex-1 py-1 text-[10px] bg-neutral-700 hover:bg-neutral-600 rounded"
                                    >
                                      Annulla
                                    </button>
                                    <button
                                      onClick={handleMergeToAlias}
                                      disabled={!aliasTarget.categoryId || isSavingAlias}
                                      className="flex-1 py-1 text-[10px] bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded"
                                    >
                                      {isSavingAlias ? "..." : "Salva"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SEZIONE 2: Aggiungi Categoria Ufficiale */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Aggiungi Ufficiale</h4>
                  <div className="flex flex-wrap gap-2">
                    {officialCategories
                      .filter((c) => !editedCategories.includes(c.label))
                      .map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => toggleCategory(category.label)}
                          className="px-3 py-1.5 rounded-full text-[10px] md:text-xs font-semibold border bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          + {category.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* SEZIONE 3: Aggiungi Libera */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white/10">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Nuova categoria personalizzata"
                    className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                  />
                  <button
                    type="button"
                    onClick={addCustomCategory}
                    className="shrink-0 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCategories(false)}
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs md:text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Chiudi Editor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pulsanti Azione */}
      <div className="flex gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
        <button
          onClick={handleApprove}
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