import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiShield, FiLogOut, FiHome } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import type { user as UserType } from "../../types";

interface Props {
  user: UserType;
  onLogout: () => void;
  // optional alignment if the nav places it to the left
  align?: "right" | "left";
}

export default function UserMenu({ user, onLogout, align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const initials = (user.displayName || user.email || "").split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase();

  const containerPosition = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-neutral-700 hover:ring-2 hover:ring-white/10 transition"
        title={user.displayName || user.email}
      >
        {user.photoURL && !imgError ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || "avatar"} 
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-sm font-medium text-white">{initials || <FiUser />}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.14 }}
            className={`absolute top-full mt-2 w-64 ${containerPosition} z-50`}
          >
            <div className="rounded-md bg-neutral-900/90 backdrop-blur border border-white/10 text-white divide-y divide-white/5 shadow-lg overflow-hidden">
              <div >
                <div className="px-4 py-3 flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center">
                    {user.photoURL && !imgError ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || "avatar"} 
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="text-sm font-medium text-white">{initials || <FiUser />}</span>
                    )}
                    </div>
                    <div className="flex flex-col min-w-0 align-bottom">
                    <div className="font-medium truncate">{user.displayName || user.email}</div>
                    <div className="text-xs text-white/70 truncate mt-1">{user.email}</div>
                    </div>
                </div>

                
                <div className="relative inline-block mt-2 mb-3 w-full px-5">
                    <span
                        className={`pointer-events-none absolute -inset-1 rounded-full blur-xl filter opacity-70 transition-all duration-300
                            ${user.role === "admin" ? "bg-yellow-400/70" : user.role === "moderator" ? "bg-violet-500/70" : "bg-cyan-500/70"}`}
                    />
                    <div
                        className={`relative z-10 text-[11px] w-full py-1 rounded-full text-center ${
                            user.role === "admin"
                                ? "bg-yellow-400/95 text-black"
                                : user.role === "moderator"
                                ? "bg-violet-500/90 text-white"
                                : "bg-cyan-500/90 text-white"
                        }`}
                    >
                        {user.role}
                    </div>
                </div>


              </div>

              <div className="py-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition text-sm mt-3 ml-3 mr-3 rounded-full"
                  onClick={() => setOpen(false)}
                >
                  <FiHome className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition text-sm ml-3 mr-3 mb-3 rounded-full"
                  onClick={() => setOpen(false)}
                >
                  <FiUser className="w-4 h-4" />
                  <span>Il mio Profilo</span>
                </Link>

                {(user.role === "admin" || user.role === "moderator") && (
                <div className="relative m-3 group">
                    <span className="pointer-events-none absolute -inset-1 rounded-2xl bg-cyan-400/60 blur-xl filter opacity-60 transition-all duration-300 group-hover:opacity-95"></span>
                    <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="relative z-10 flex items-center gap-3 px-4 py-2 text-sm rounded-2xl bg-cyan-500/90 hover:bg-cyan-500 transition"
                    >
                        <FiShield className="w-4 h-4" />
                        <span>Admin Panel</span>
                    </Link>
                </div>
                )}
              </div>

              <div className="py-2 px-3">
                <button
                  onClick={() => { setOpen(false); onLogout(); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 transition"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Esci</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
