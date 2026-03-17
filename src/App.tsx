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

  if (loading) return <div className="bg-black h-screen text-white flex items-center justify-center font-bold tracking-widest animate-pulse">CARICAMENTO...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} videos={videos} />} />
        <Route path="/admin" element={<Admin user={user} />} />
      </Routes>
    </Router>
  );
}