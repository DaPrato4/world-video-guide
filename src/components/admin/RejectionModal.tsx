import { useState } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  videoTitle: string;
}

export default function RejectionModal({ isOpen, onClose, onConfirm, videoTitle }: RejectionModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason("");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              Motiva il rifiuto
            </h2>
            <button 
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <p className="text-neutral-400 text-sm mb-6">
            Stai rifiutando il video: <span className="text-white font-semibold">{videoTitle}</span>. 
            Inserisci una motivazione che verrà mostrata all'utente.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Esempio: Qualità video troppo bassa, Contenuto non pertinente, Link non funzionante..."
              className="w-full bg-neutral-900 border border-white/5 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 min-h-30 resize-none"
              required
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={!reason.trim()}
                className="flex-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
              >
                Conferma Rifiuto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
