import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import { auth, db } from "./firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { user, video } from "./types";
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

// App.tsx
export default function App() {
  const [user, setUser] = useState<user | null>(null);
  const [videos, setVideos] = useState<video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. L'utente è loggato, andiamo a prendere il suo profilo su Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);

        try {
          const userDocSnap = await getDoc(userDocRef);
          console.log("User document snapshot:", userDocSnap);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // 2. Uniamo i dati di Auth con quelli di Firestore (Role, stats, ecc.)
            console.log("userData:", userData);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? "",
              role: (userData as any).role ?? "user",
              photoURL: firebaseUser.photoURL ?? "",
            });
          } else {
            // Caso limite: l'utente esiste in Auth ma non ha ancora un documento in Firestore
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? "",
              role: "user",
              photoURL: firebaseUser.photoURL ?? "",
            });
            //aggiungiamo user su firestore
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
              role: "user",
            });
          }
        } catch (error) {
          console.error("Errore nel recupero del ruolo:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName ?? "",
            role: "user",
          });
        }
      } else {
        // L'utente ha fatto logout
        setUser(null);
      }
      setLoading(false);
    });

    // 2. Caricamento Video (UNA SOLA VOLTA QUI)
    const unsubscribeVideos = onSnapshot(collection(db, "videos"), (snapshot) => {
      const vList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as video[];
      setVideos(vList);
    });

    return () => { unsubscribeAuth(); unsubscribeVideos(); };
  }, []);

  useEffect(() => {
    if (user) {
      console.log(user);
    }
  }, [user]);

  if (loading) return (
  <div className="bg-black h-screen text-white flex items-center justify-center font-bold tracking-widest">
    <div className="flex items-center space-x-4">
      <svg
        className="w-10 h-10 text-white animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span>CARICAMENTO...</span>
    </div>
  </div>);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} videos={videos} />} />
        <Route path="/admin" element={<Admin user={user} />} />
      </Routes>
    </Router>
  );
}