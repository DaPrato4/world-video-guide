import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiMessageCircle, FiX, FiTrash2 } from "react-icons/fi";
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import type { user } from "../../types";

interface CountryChatProps {
    countryId: number;
    countryName: string;
    user: user | null;
    onClose: () => void;
    onAlert: (message: string, isSuccess: boolean) => void;
}

export default function CountryChat({ countryId, countryName, user, onClose, onAlert}: CountryChatProps) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    
    // Per far scorrere la chat in basso in automatico
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
            const q = query(
                collection(db, "comments"),
                where("countryCode", "==", countryId),
                orderBy("createdAt", "asc")
            );
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(fetched);
        } catch (error) {
            console.error("Errore caricamento commenti:", error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [countryId]);

    // Scroll automatico verso il basso quando i commenti cambiano
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const handleAddComment = async (e: any) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        try {
            await addDoc(collection(db, "comments"), {
                countryCode: countryId,
                userId: user.uid,
                userDisplayName: user.displayName || "Utente Anonimo",
                text: newComment.trim(),
                createdAt: serverTimestamp()
            });
            setNewComment("");
            fetchComments(); // Ricarica la lista per vedere il nuovo commento
            onAlert("Commento inviato con successo!", true);
        } catch (error) {
            console.error("Errore invio commento:", error);
            onAlert("Errore nell'invio del commento.", false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteDoc(doc(db, "comments", commentId));
            fetchComments();
            onAlert("Commento eliminato con successo!", true);
        } catch (error) {
            console.error("Errore eliminazione commento:", error);
            onAlert("Errore nell'eliminazione del commento.", false);
        }
    };

    const handleReportComment = async (commentId: string) => {
        if (!user) {
            onAlert("Devi essere loggato per segnalare un commento.", false);
            return;
        }

        try {            
            const reportedComments = user.reportedComments ?? [];

            if (reportedComments.length >= 5) {
                onAlert("Hai raggiunto il limite di segnalazioni. Per favore, attendi prima di segnalare altri commenti.", false);
                return;
            }

            if (reportedComments.includes(commentId)) {
                onAlert("Hai già segnalato questo commento.", false);
                return;
            }

            const commentRef = doc(db, "users", user.uid);
            await updateDoc(commentRef, {
                reportedComments: arrayUnion(commentId)
            });
            onAlert("Commento segnalato. Grazie per il tuo feedback!", true);
        } catch (error) {
            console.error("Errore segnalazione commento:", error);
            onAlert("Errore nella segnalazione del commento.", false);
        }
    };

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full h-full sm:w-100 bg-neutral-950 border-l border-white/10 shadow-2xl flex flex-col z-50 rounded-2xl"
            onClick={(e) => e.stopPropagation()} 
        >
            {/* Header Chat */}
            <header className="p-4 border-b border-white/10 flex justify-between items-center bg-neutral-900 shrink-0">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <FiMessageCircle className="text-blue-400" /> Commenti {countryName}
                </h3>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors 2xl:hidden"
                >
                    <FiX />
                </button>
            </header>

            {/* Lista Commenti */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-neutral-950/50">
                {isLoadingComments ? (
                    <div className="text-center text-neutral-500 text-sm mt-10 animate-pulse">Caricamento commenti...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-neutral-500 text-sm mt-10 opacity-70">
                        <FiMessageCircle className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>Ancora nessun commento.<br/>Rompi il ghiaccio!</p>
                    </div>
                ) : (
                    comments.map(c => (
                        <div key={c.id} className="flex gap-2">
                            {user ? (
                                <div className={`w-9 flex shrink-0 ${c.userId === user?.uid ? 'items-end' : 'items-start'} pt-4`}>
                                    {user?.role === "admin" || user?.role === "moderator" ? (
                                        <button 
                                            className="text-neutral-500 border border-red-500/10 hover:bg-red-500/10 transition-colors rounded-full h-9 w-9 flex items-center justify-center" 
                                            onClick={() => handleDeleteComment(c.id)}
                                            title="Elimina commento"
                                        >
                                            <FiTrash2 className="text-red-500"/>
                                        </button>
                                    ) : <button 
                                            className={`text-neutral-500 border border-yellow-500/10 ${user?.reportedComments?.includes(c.id) ? 'bg-yellow-500/10' : 'hover:bg-yellow-500/10'} transition-colors rounded-full h-9 w-9 flex items-center justify-center`}
                                            onClick={() => handleReportComment(c.id)}
                                            title="Segnala commento"
                                        >
                                            <FiAlertTriangle className="text-yellow-500"/>
                                        </button>
                                    }
                                </div>
                            ) : null }
                            
                            <div className={`flex flex-col ${c.userId === user?.uid ? 'items-end' : 'items-start'} w-full`}>
                                <span className="text-[10px] text-neutral-500 mb-1 px-3">{c.userDisplayName}</span>
                                <div className={`px-3 py-2 text-sm rounded-2xl max-w-[85%] text-pretty wrap-break-words overflow-hidden shadow-md ${c.userId === user?.uid ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-neutral-800 text-neutral-200 rounded-bl-sm border border-white/5'}`}>
                                    {c.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {/* Elemento invisibile per forzare lo scroll in basso */}
                <div ref={chatEndRef} />
            </div>

            {/* Form Inserimento Commento */}
            <div className="p-4 border-t border-white/10 bg-neutral-900 shrink-0">
                {user ? (
                    <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Scrivi un messaggio..."
                            className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button 
                            type="submit"
                            disabled={!newComment.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-neutral-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors"
                        >
                            Invia
                        </button>
                    </form>
                ) : (
                    <div className="text-center text-xs text-neutral-400 bg-neutral-950 py-3 rounded-xl border border-white/5">
                        Devi accedere per partecipare alla discussione.
                    </div>
                )}
            </div>
        </motion.div>
    );
}