import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { user } from "../../types";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { FiUser } from "react-icons/fi";

interface EditProfileOverlayProps {
  user: user | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileOverlay({ user, isOpen, onClose }: EditProfileOverlayProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [collectionSize] = useState(20); // Numero di variazioni per collezione
  const [currentCollectionIdx, setCurrentCollectionIdx] = useState(0);
  const [currentSeedIdx, setCurrentSeedIdx] = useState(0);

  const diceBearCollections = [
    "adventurer",
    "adventurer-neutral",
    "avataaars",
    "avataaars-neutral",
    "big-ears",
    "big-ears-neutral",
    "big-smile",
    "bottts",
    "bottts-neutral",
    "croodles",
    "croodles-neutral",
    "fun-emoji",
    "icons",
    "identicon",
    "lorelei",
    "lorelei-neutral",
    "micah",
    "miniavs",
    "notionists",
    "open-peeps",
    "personas",
    "pixel-art",
    "pixel-art-neutral",
    "rings",
    "shapes",
    "thumbs"
  ];

  const totalTypes = diceBearCollections.length; // Collezioni

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShouldRender(false);
    setTimeout(onClose, 300);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (backdropRef.current && e.target === backdropRef.current) {
      handleClose();
    }
  };

  const updateAvatar = (typeIdx: number, seedIdx: number) => {
    const collection = diceBearCollections[typeIdx];
    const newAvatarUrl = `https://api.dicebear.com/7.x/${collection}/svg?seed=seed-${seedIdx}`;
    setPhotoURL(newAvatarUrl);
  };

  const nextAvatar = () => {
    const nextSeed = (currentSeedIdx + 1) % collectionSize;
    setCurrentSeedIdx(nextSeed);
    updateAvatar(currentCollectionIdx, nextSeed);
  };

  const prevAvatar = () => {
    const prevSeed = (currentSeedIdx - 1 + collectionSize) % collectionSize;
    setCurrentSeedIdx(prevSeed);
    updateAvatar(currentCollectionIdx, prevSeed);
  };

  const nextCollection = () => {
    const nextIdx = (currentCollectionIdx + 1) % totalTypes;
    setCurrentCollectionIdx(nextIdx);
    updateAvatar(nextIdx, currentSeedIdx);
  };

  const prevCollection = () => {
    const prevIdx = (currentCollectionIdx - 1 + totalTypes) % totalTypes;
    setCurrentCollectionIdx(prevIdx);
    updateAvatar(prevIdx, currentSeedIdx);
  };

const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!user || !auth.currentUser) return;

    setLoading(true);
    setError(null);

    try {
        await updateProfile(auth.currentUser, {
            displayName,
            photoURL,
        });

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            displayName,
            photoURL,
        });

        handleClose();
    } catch (err) {
        console.error("Error updating profile:", err);
        setError("Si è verificato un errore durante l'aggiornamento.");
    } finally {
        setLoading(false);
    }
};

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
          ref={backdropRef}
          onClick={handleClickOutside}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-linear-to-b from-neutral-800 to-neutral-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-white overflow-hidden"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Modifica Profilo</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm border border-red-500/30 text-center italic">
                  {error}
                </div>
              )}

              <div className="text-left">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                  Nome visualizzato
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium"
                  placeholder="Il tuo nome"
                  required
                />
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                  Immagine Profilo
                </label>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-6 w-full justify-center">
                    <button
                      type="button"
                      onClick={prevAvatar}
                      className="p-2 bg-neutral-800 border border-neutral-700 rounded-full hover:bg-neutral-700 text-cyan-400 transition-colors shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="relative w-28 h-28 rounded-full overflow-hidden bg-neutral-800 border-2 border-cyan-500/30 shadow-2xl shrink-0">
                      {photoURL ? (
                        <img src={photoURL} alt="Anteprima Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <FiUser className="scale-300"/>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={nextAvatar}
                      className="p-2 bg-neutral-800 border border-neutral-700 rounded-full hover:bg-neutral-700 text-cyan-400 transition-colors shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <div className="px-1 pt-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-1 font-bold">
                        <span>Collezione</span>
                        <span className="text-cyan-400">
                          {currentCollectionIdx + 1} / {totalTypes}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-neutral-800 border border-neutral-700 rounded-xl p-2 shadow-inner">
                        <button
                          type="button"
                          onClick={prevCollection}
                          className="p-1.5 hover:bg-neutral-700 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <span className="text-xs font-bold text-gray-200 truncate px-2">
                          {diceBearCollections[currentCollectionIdx].replace(/-/g, ' ')}
                        </span>
                        
                        <button
                          type="button"
                          onClick={nextCollection}
                          className="p-1.5 hover:bg-neutral-700 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="w-full text-center pb-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Variante #{currentSeedIdx + 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-transform shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    "Salva Modifiche"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-transparent border border-gray-600 hover:border-gray-500 hover:bg-neutral-700 text-white py-2.5 px-6 rounded-xl transition-colors text-sm font-medium"
                >
                  Chiudi
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}