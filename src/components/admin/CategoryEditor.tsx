import { useState } from "react";
import { FiLink, FiX } from "react-icons/fi";

interface CategoryEditorProps {
  editedCategories: string[];
  setEditedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  toggleCategory: (category: string) => void;
  officialCategories: { value: string; label: string; aliases?: string[] }[];
  onAddAlias: (categoryId: string, newAlias: string) => Promise<void>;
  onClose: () => void;
}

export default function CategoryEditor({
  editedCategories,
  setEditedCategories,
  toggleCategory,
  officialCategories,
  onAddAlias,
  onClose,
}: CategoryEditorProps) {
  const [customCategory, setCustomCategory] = useState("");

  // Stati per la gestione degli Alias
  const [aliasTarget, setAliasTarget] = useState<{ originalName: string; categoryId: string } | null>(null);
  const [isSavingAlias, setIsSavingAlias] = useState(false);

  const addCustomCategory = () => {
    const nextCategory = customCategory.trim().toLowerCase();
    if (!nextCategory) return;

    setEditedCategories((current) =>
      current.some((item) => item.toLocaleLowerCase() === nextCategory) 
      ? current 
      : [...current, nextCategory]);
    setCustomCategory("");
  };

  const handleMergeToAlias = async () => {
    if (!aliasTarget) return;
    setIsSavingAlias(true);

    try {
      await onAddAlias(aliasTarget.categoryId, aliasTarget.originalName);

      const officialCat = officialCategories.find((c) => c.value === aliasTarget.categoryId);

      if (officialCat) {
        setEditedCategories((current) => {
          const filtered = current.filter((c) => c !== aliasTarget.originalName);
          if (!filtered.includes(officialCat.label)) {
            filtered.push(officialCat.label);
          }
          return filtered;
        });
      }

      setAliasTarget(null);
    } catch (error) {
      console.error("Errore salvataggio alias", error);
    } finally {
      setIsSavingAlias(false);
    }
  };

  return (
    <div
      className="relative rounded-2xl border border-white/10 bg-neutral-900/80 p-3 md:p-4 space-y-5"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Chiudi editor"
        className="absolute top-3 right-3 p-2 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg z-50"
      >
        <FiX className="w-4 h-4" />
      </button>
      {/* SEZIONE 1: Categorie Attuali */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Categorie del Video</h4>
        <div className="flex flex-wrap gap-2">
          {editedCategories.map((catName) => {
            const isOfficial = officialCategories.some((c) => c.label === catName || c.aliases?.includes(catName));

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
                        if (!aliasTarget) {
                          setAliasTarget({ originalName: catName, categoryId: "" });
                        } else {
                          setAliasTarget(null);
                        }
                      }}
                      className="p-1.5 rounded-md hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                    >
                      <FiLink className="text-[10px]" />
                    </button>

                    {aliasTarget?.originalName === catName && (
                      <div className="absolute top-full mt-1 right-0 translate-x-10 translate-y-1 z-50 w-48 bg-neutral-800 border border-white/10 rounded-xl shadow-xl p-2">
                        <p className="text-[10px] text-neutral-400 mb-2">Unisci "{catName}" a:</p>
                        <select
                          className="w-full bg-neutral-900 text-white text-xs p-2 rounded-lg border border-white/5 mb-2 focus:border-cyan-500 outline-none"
                          value={aliasTarget.categoryId}
                          onChange={(e) => setAliasTarget({ ...aliasTarget, categoryId: e.target.value })}
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
        <h4 className="text-xs font-bold text-neutral-400 tracking-wider">Aggiungi categorie ufficiali</h4>
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

      {/* SEZIONE 3: Aggiungi personalizzata */}
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
          Aggiungi
        </button>
      </div>
    </div>
  );
}
