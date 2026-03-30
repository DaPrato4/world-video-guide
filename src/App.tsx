import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import { auth, db } from "./firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { user, video } from "./types";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";


// App.tsx
export default function App() {
  const [user, setUser] = useState<user | null>(null);
  const [videos, setVideos] = useState<video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);

        // Ascolta i cambiamenti in tempo reale sul documento dell'utente
        unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: userData.displayName ?? "",
              role: (userData.role as "user" | "moderator" | "admin") ?? "user",
              photoURL: firebaseUser.photoURL ?? "",
              stats: userData.stats || { pendingVideos: 0, approvedVideos: 0, rejectedVideos: 0, suggestedVideos: 0 },
            });
          } else {
            // Se il documento non esiste, lo creiamo (fatto una sola volta)
            const newUser: user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
              role: "user",
              photoURL: firebaseUser.photoURL ?? "",
              stats: { pendingVideos: 0, approvedVideos: 0, rejectedVideos: 0, suggestedVideos: 0 },
            };
            setDoc(userDocRef, newUser);
            setUser(newUser);
          }
          setLoading(false);
        });
      } else {
        // L'utente ha fatto logout
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        setUser(null);
        setLoading(false);
      }
    });

    // 2. Caricamento Video
    const unsubscribeVideos = onSnapshot(collection(db, "videos"), (snapshot) => {
      const vList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as video[];
      setVideos(vList);
    });

    return () => { 
      unsubscribeAuth(); 
      unsubscribeVideos(); 
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
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
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home user={user} videos={videos} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="*" element={<div className="bg-black h-screen text-white flex items-center justify-center font-bold tracking-widest">404 - PAGE NOT FOUND</div>} />
        </Routes>
      </Router>
    </>
  );
}