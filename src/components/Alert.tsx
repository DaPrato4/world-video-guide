//genera il codice per un componente Alert che mostra un messaggio di errore o successo in alto alla pagina, con un'animazione di fade in/out e un'icona a seconda del tipo di messaggio (es. ✅ per successo, ⚠️ per errore). Il componente dovrebbe accettare props come "type" (success/error), "message" (testo da mostrare) e "duration" (durata in millisecondi prima di scomparire).

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AlertProps {
    type: "success" | "error";
    message: string;
    duration?: number; // Durata in millisecondi prima di scomparire
    onClose?: () => void; // callback opzionale chiamata dopo che l'alert si è nascosto
}

export default function Alert({ type, message, duration = 3000, onClose }: AlertProps) {
    const [visible, setVisible] = useState(true);

    // Timer che innesca la chiusura dell'alert (fa partire l'animazione di exit)
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    // Dopo che l'alert è passato a invisible, chiamiamo onClose dopo un piccolo delay
    // per dare il tempo all'animazione di exit di completarsi.
    useEffect(() => {
        if (!visible) {
            const t = setTimeout(() => {
                onClose?.();
            }, 300); // lascia 300ms per l'animazione di exit

            return () => clearTimeout(t);
        }
    }, [visible, onClose]);

    const icon = type === "success" ? "✅" : "⚠️";
    const bgColor = type === "success" ? "bg-green-500/20 border-green-500/40" : "bg-red-500/20 border-red-500/40";

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    role="status"
                    aria-live="polite"
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-9999 px-4 py-3 rounded-xl border ${bgColor} flex items-center gap-3 shadow-lg`}
                >
                    <span className="text-xl">{icon}</span>
                    <p className="text-sm text-white font-medium">{message}</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
