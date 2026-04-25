import type { user } from "../../types/index";
import UserMenu from "./UserMenu";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";
import LoginOverlay from "./LoginOverlay";
import { TbWorldSearch } from "react-icons/tb";
import { Link } from "react-router";
import { FiShield, FiUser } from "react-icons/fi";
import Alert from "./Alert";



export default function Header({ user, page }: { user: user | null; page: string }) {

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  

  return (
    <>

    {alert && (
      <Alert
        type={alert.type}
        message={alert.message}
        duration={4000}
        onClose={() => setAlert(null)}
      />
    )}

    <header className="bg-neutral-800 border-b border-white/5 p-4 md:p-6 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-4">
        <Link to="/">
          <div className="flex items-center gap-4">
            <div className="flex flex-col -tracking-tighter">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                  {page === "Profile" ? "Profile" : page === "Admin" ? "Admin" : "Home"} <span className="text-blue-500">Panel</span>
                </h1>
                {page === "Home" ? (
                  <TbWorldSearch className="w-6 h-6 text-blue-500" />
                  ) : page === "Profile" ? (
                    <FiUser className="w-6 h-6 text-blue-500"/>
                  ) : page === "Admin" ? (
                    <FiShield className="w-6 h-6 text-blue-500" />
                  ) : null
                }
              </div>
              {page === "Home" && (
                <p className="hidden md:block text-sm text-neutral-400">Esplora il mondo attraverso i video condivisi dagli utenti</p>
              )}
            </div>
            {page != "Home" && user && (
              <span className={`text-[10px] px-2 py-1 rounded font-bold border transition-colors ${
                user.role === "admin" 
                  ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" 
                  : user.role === "moderator" 
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300" 
                    : "bg-blue-500/20 border-blue-500/50 text-blue-300"
              }`}>
                {user.role === "admin" ? "AMMINISTRATORE" : user.role === "moderator" ? "MODERATORE" : "UTENTE"}
              </span>
            )}
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu user={user} onLogout={() => signOut(auth)} align="right" />
          ) : (
            <button 
              onClick={() => {
                if(navigator.onLine) setIsLoginOpen(true)
                else setAlert({ type: "error", message: "Sei offline. Connettiti a internet per accedere o registrarti." });
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all border border-blue-500/20 px-4 py-2"
            >
              Accedi o Registrati
            </button>
          )}
        </div>
      </div>

          {/* Login Overlay */}
    <LoginOverlay
      isOpen={isLoginOpen}
      onClose={() => setIsLoginOpen(false)}
    />

    </header>


    </>
  );
}
