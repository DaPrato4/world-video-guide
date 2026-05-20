import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

interface SuggestVideoModalProps {
  onClose: () => void;
  onSubmit: (url: string, categories: string[]) => void;
  countryName: string;
}

export default function SuggestVideoModal({  onClose, onSubmit, countryName }: SuggestVideoModalProps) {
  const [url, setUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  // Fetch delle categorie alla creazione del componente
  useEffect(() => {
      const loadCategories = async () => {
        try {
          const snapshot = await getDocs(collection(db, "categories"));
          const firestoreCategories = snapshot.docs
            .map(doc => {
              const data = doc.data();
              return { value: doc.id, label: data.category };
            });

          setCategories(firestoreCategories);
        } catch (error) {
          setCategories([]);
          console.error("Errore caricamento categorie:", error);
        }
      };

      loadCategories();
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.some(item => item.toLocaleLowerCase() === category.toLocaleLowerCase())
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const addCustomCategory = () => {
    const nextCategory = customCategory.trim().toLocaleLowerCase();

    if (!nextCategory) return;

    setSelectedCategories((current) =>
      current.some((item) => item.toLocaleLowerCase() === nextCategory)
        ? current
        : [...current, nextCategory]
    );
    setCustomCategory("");
  };

  const handleSubmit = () => {
    onSubmit(url, selectedCategories);
    setUrl("");
    setSelectedCategories([]);
    setCustomCategory("");
    setIsCategoryDropdownOpen(false);
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-3 sm:p-4">
      {/* Sfondo scuro che chiude al click */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Box del Modale */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-neutral-800 border border-white/10 w-full max-w-md p-5 sm:p-8 rounded-3xl shadow-2xl max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar"
      >
        <h3 className="text-2xl font-bold text-white mb-2">Suggerisci Video</h3>
        <p className="text-neutral-400 text-sm mb-6">
          Hai trovato un bel contenuto per <span className="text-blue-400 font-bold">{countryName}</span>? Incolla il link qui sotto.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">YouTube URL</label>
            <input 
              autoFocus
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all mt-1"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Categorie</label>
              <span className="text-[10px] text-neutral-500">Selezione multipla</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen((value) => !value)}
                className="w-full flex items-center justify-between gap-3 bg-neutral-900 border border-white/5 rounded-2xl px-4 py-4 text-left text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                <span className="truncate">
                  {selectedCategories.length > 0
                    ? selectedCategories.join(", ")
                    : "Scegli una o più categorie"}
                </span>
                <span className="text-neutral-400">{isCategoryDropdownOpen ? "▲" : "▼"}</span>
              </button>

              {isCategoryDropdownOpen && (
                <div className="mt-2 z-10 rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/40 p-3">
                  <div className="max-h-44 sm:max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.label);
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => toggleCategory(cat.label)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-sm transition-all ${
                            isSelected
                              ? "bg-blue-600/20 text-white border-blue-500/40"
                              : "bg-white/0 text-neutral-300 border-white/5 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className="text-xs">{isSelected ? "✓" : ""}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Aggiungi categoria</label>
                    <div className="flex gap-2 sm:gap-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomCategory();
                          }
                        }}
                        placeholder="Es. architettura, sport, musica"
                        className="flex-1 min-w-0 bg-neutral-950 border border-white/5 rounded-2xl px-3 sm:px-4 py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addCustomCategory}
                        className="px-3 sm:px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10 shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="mt-3 max-h-20 overflow-y-auto flex flex-wrap gap-2 pr-1 custom-scrollbar">
                      {selectedCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25 text-xs font-medium"
                        >
                          {category} ×
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Feedback visivo se c'è un testo */}
          {(url.includes("youtube.com") || url.includes("youtu.be")) ? (
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-center gap-3">
              <span className="text-xl">🔗</span>
              <p className="text-xs text-blue-300 font-medium text-pretty">Link YouTube rilevato. Verrà inviato ai moderatori per l'approvazione.</p>
            </div>
          ) : url.length > 0 ? (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-xs text-red-300 font-medium text-pretty">Sembra che questo non sia un link YouTube valido.</p>
            </div>
          ) : null}

          

          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-2xl transition-all"
            >
              Annulla
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!url.includes("youtube.com") && !url.includes("youtu.be")}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"

            >
              Invia
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}