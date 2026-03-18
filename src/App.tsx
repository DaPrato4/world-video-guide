import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import { auth, db } from "./firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { video } from "./types";
import { collection, onSnapshot } from "firebase/firestore";

// App.tsx
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [videos, setVideos] = useState<video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Gestione Auth (UNA SOLA VOLTA QUI)
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    // 2. Caricamento Video (UNA SOLA VOLTA QUI)
    const unsubscribeVideos = onSnapshot(collection(db, "videos"), (snapshot) => {
      const vList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as video[];
      setVideos(vList);
    });

    return () => { unsubscribeAuth(); unsubscribeVideos(); };
  }, []);

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