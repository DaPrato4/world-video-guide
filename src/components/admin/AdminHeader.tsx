import { Link } from "react-router-dom";
import type { user } from "../../types/index";

interface AdminHeaderProps {
  user: user;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-neutral-800 border-b border-white/5 p-4 md:p-6 sticky top-0 z-10 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
            Admin <span className="text-blue-500">Panel</span>
          </h1>
          <span className="bg-blue-600/10 text-blue-400 text-[10px] px-2 py-1 rounded font-bold border border-blue-500/20">
            {user.role === "moderator" ? "MODERATORE" : "ADMIN"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold">{user.displayName}</p>
            <p className="text-[10px] text-neutral-500">{user.email}</p>
          </div>
          <Link to="/" className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-lg text-xs font-bold transition-all">
            ← Esci
          </Link>
        </div>
      </div>
    </header>
  );
}
