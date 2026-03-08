import { useState } from "react";
import { motion } from "framer-motion";

interface SuggestVideoModalProps {
  onClose: () => void;
  onSubmit: (url: string) => void;
  countryName: string;
}

export default function SuggestVideoModal({  onClose, onSubmit, countryName }: SuggestVideoModalProps) {
  const [url, setUrl] = useState("");

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
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
        className="relative bg-neutral-800 border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl"
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

          {/* Feedback visivo se c'è un testo */}
          {url.includes("youtube.com") ? (
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
              onClick={() => {
                onSubmit(url);
                setUrl("");
              }}
              disabled={!url.includes("youtube.com")}
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