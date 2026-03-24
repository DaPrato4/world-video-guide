// Genera un componente React chiamato LoginOverlay che mostri un overlay con un messaggio di benvenuto e un pulsante per il login. Il componente dovrebbe accettare una prop "onLogin" che viene chiamata quando l'utente clicca sul pulsante di login. L'overlay dovrebbe essere centrato verticalmente e orizzontalmente nella pagina, con uno sfondo semi-trasparente che copre l'intera finestra. Il messaggio di benvenuto dovrebbe essere personalizzabile tramite una prop "welcomeMessage".

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../firebase";
import {
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    OAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaApple } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import Alert from "./Alert";


interface LoginOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginOverlay({ isOpen, onClose }: LoginOverlayProps) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [mode, setMode] = useState<"choose" | "email-login" | "email-register">("choose");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(isOpen);

    // Chiudi l'overlay se si clicca fuori dal pannello
    const handleClickOutside = (e: MouseEvent) => {
        if (backdropRef.current && e.target === backdropRef.current) {
            setShouldRender(false);
            setTimeout(onClose, 300); // Attendi il completamento dell'animazione
        }
    };

    useEffect(() => {
        setError(null);
    }, [mode]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setMode('choose');
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleProviderSignIn = async (providerName: "google" | "github" | "apple") => {
        setError(null);
        try {
            if (providerName === "google") {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            } else if (providerName === "github") {
                const provider = new GithubAuthProvider();
                await signInWithPopup(auth, provider);
            } else if (providerName === "apple") {
                const provider = new OAuthProvider("apple.com");
                provider.addScope("email");
                provider.addScope("name");
                await signInWithPopup(auth, provider);
            }
            setAlert({ type: "success", message: "Login effettuato con successo!" });
            setShouldRender(false);
            setTimeout(onClose, 300);
        } catch (err: any) {
            console.error("Auth provider error:", err);
            setError(err?.message || "Errore durante il login");
            setAlert({ type: "error", message: "Errore durante il login" });
        }
    };

    const handleEmailLogin = async () => {
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setShouldRender(false);
            setTimeout(onClose, 300);
            setAlert({ type: "success", message: "Login effettuato con successo!" });
        } catch (err: any) {
            console.error("Email login error:", err);
            setError(err?.message || "Errore login con email");
            setAlert({ type: "error", message: "Errore durante il login" });
        }
    };

    const handleEmailRegister = async () => {
        setError(null);
        try {
            if (password !== confirmPassword) {
                setError("Le password non corrispondono");
                return;
            }
            await createUserWithEmailAndPassword(auth, email, password);
            setShouldRender(false);
            setTimeout(onClose, 300);
        } catch (err: any) {
            console.error("Email register error:", err);
            setError(err?.message || "Errore registrazione");
        }
    };

    return (<>
        <AnimatePresence>
            {alert && (
                <Alert
                    key="global-alert"
                    type={alert.type}
                    message={alert.message}
                    duration={4000}
                    onClose={() => setAlert(null)}
                />
            )}
        </AnimatePresence>
        <AnimatePresence>
            {shouldRender && (
                <motion.div 
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-99 backdrop-blur-md"
                    ref={backdropRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div 
                        className="bg-linear-to-b from-neutral-800 to-neutral-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-white text-center"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.5 , type: "spring", bounce: 0.6}}
                    >
                        <h2 className="text-xl font-bold">Accedi al tuo account</h2>

                        {/* Provider buttons */}
                        {(mode === 'choose') &&
                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                className="w-full bg-white text-black font-semibold py-3 px-6 rounded-xl transition-shadow flex items-center justify-center gap-2 border border-gray-200 shadow-sm hover:shadow-md"
                                onClick={() => handleProviderSignIn('google')}
                            >
                                <FcGoogle size={20} /> Accedi con Google
                            </button>

                            <button
                                className="w-full bg-linear-to-r from-slate-700 to-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-transform flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
                                onClick={() => handleProviderSignIn('github')}
                            >
                                <FaGithub size={20} /> Accedi con GitHub
                            </button>

                            <button
                                className="w-full bg-black/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 ring-1 ring-white/10 hover:bg-black"
                                onClick={() => handleProviderSignIn('apple')}
                            >
                                <FaApple size={20} /> Accedi con Apple
                            </button>

                            <div className="w-full">
                                <button
                                    className="w-full bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-transform flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
                                    onClick={() => setMode('email-login')}
                                >
                                    <IoIosMail size={20} /> Accedi con Email
                                </button>
                                <div className="mt-2 flex gap-2 justify-center">
                                    <button onClick={() => setMode('email-register')} className="text-cyan-300 hover:text-cyan-200 transition-colors">Registrati</button>
                                </div>
                            </div>
                        </div>}

                        {(mode === 'email-login' || mode === 'email-register') && (
                            <form onSubmit={(e) => { e.preventDefault(); mode === 'email-login' ? handleEmailLogin() : handleEmailRegister(); }} className="mt-6 flex flex-col gap-3">
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    type="email"
                                    className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                                />
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    type="password"
                                    className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                                />
                                {mode === 'email-register' && (
                                    <input
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Conferma Password"
                                        type="password"
                                        className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                                    />
                                )}
                                <button
                                    type="submit"
                                    className="mt-3 bg-linear-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-transform shadow-lg"
                                >
                                    {mode === 'email-login' ? 'Accedi' : 'Registrati'}
                                </button>
                                <button type="button" onClick={() => setMode('choose')} className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm">Torna indietro</button>
                                {error && <div className="text-red-400 text-sm">{error}</div>}
                            </form>
                        )}

                        <div className="mt-6">
                            <button onClick={() => { setShouldRender(false); setTimeout(onClose, 300); }} className="bg-transparent border border-gray-600 hover:border-gray-500 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg transition-colors">Chiudi</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
    );
}