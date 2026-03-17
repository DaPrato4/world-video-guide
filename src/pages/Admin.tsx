import { Link } from "react-router-dom";

export default function Admin({ user }: { user: any }) {
  // 1. Gestione caricamento/permessi
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 text-center">
        <div className="bg-neutral-800 p-8 rounded-3xl border border-white/5 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-4">Accesso Riservato</h1>
          <p className="text-neutral-400 mb-6">Effettua il login dalla Home per accedere alla moderazione.</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
            Torna alla Mappa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* HEADER ADMIN RESPONSIVE */}
      <header className="bg-neutral-800 border-b border-white/5 p-4 md:p-6 sticky top-0 z-10 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
              Admin <span className="text-blue-500">Panel</span>
            </h1>
            <span className="hidden md:block bg-blue-600/10 text-blue-400 text-[10px] px-2 py-1 rounded font-bold border border-blue-500/20">
              MODERATORE
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

      {/* CONTENUTO PRINCIPALE */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 gap-6">
          <section className="bg-neutral-800/50 border border-white/5 rounded-3xl p-6 md:p-10">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              📂 Gestione Video <span className="text-neutral-500 text-sm font-normal">(In arrivo)</span>
            </h2>
            
            {/* Placeholder per la tabella dei video */}
            <div className="border-2 border-dashed border-neutral-700 rounded-2xl h-64 flex items-center justify-center text-neutral-600">
              <p>Qui caricheremo la lista dei video da Firebase per approvarli o eliminarli.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}