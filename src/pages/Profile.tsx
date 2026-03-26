import { useState } from "react";
import LoginOverlay from "../components/common/LoginOverlay";
import type { user } from "../types";
import Header from "../components/common/Header";

export default function Profile({ user, onLogOut }: { user: user | null; onLogOut: () => void }) {

    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
    <div className="flex flex-col w-screen h-screen bg-neutral-900 text-white overflow-hidden font-sans">
        <LoginOverlay isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <Header user={user} page="Profile" />
        <main className="grow p-4">
        {user ? (
            <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Informazioni Utente</h2>
            <p className="mb-2"><strong>Nome:</strong> {user.displayName}</p>
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
            <p className="mb-2"><strong>Ruolo:</strong> {user.role}</p>
            </div>
        ) : (
            <p>Utente non autenticato</p>
        )}
        {user ? (
            < button
                onClick={onLogOut}
                className="mt-6 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all border border-red-500/20 px-4 py-2"
            >
                Esci
            </button>
        ) : (
            <button
                onClick={() => setIsLoginOpen(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all border border-blue-500/20 px-4 py-2"
            >
                Accedi o Registrati
            </button>
         )
        }
        </main>
    </div>
    );
}