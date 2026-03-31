import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { user } from '../../types';
import { motion } from 'framer-motion';
import ConfirmModal from '../common/ConfirmModal';
import { 
  FaShieldAlt, 
  FaUser, 
  FaTrashAlt, 
  FaEnvelope,
  FaSearch,
  FaChevronDown,
  FaLock
} from 'react-icons/fa';
import Alert from '../common/Alert';

export default function UserList({ currentUser }: { currentUser: user | null }) {
  const [users, setUsers] = useState<user[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ uid: string, displayName: string } | null>(null);
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setLoading(true);
      const usersData: user[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ ...doc.data() } as user);
      });
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (uid: string, newRole: "user" | "moderator" | "admin") => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      setAlert({ message: `Ruolo aggiornato a ${newRole}`, type: "success" });
    } catch (error) {
      console.error("Error updating role:", error);
      setAlert({ message: "Errore nell'aggiornamento del ruolo", type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, 'users', userToDelete.uid));
      setAlert({ message: `Utente ${userToDelete.displayName} rimosso dal database`, type: "success" });
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setAlert({ message: "Errore nella rimozione dell'utente", type: "error" });
    }
  };

  const filteredUsers = users.filter(u => 
    (u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    u.uid !== currentUser?.uid
  );

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'moderator': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaLock className="w-5 h-5 text-blue-400" />
            Gestione Utenti
          </h2>
          <p className="text-sm text-gray-400">Visualizza e modifica i permessi della community</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Cerca per utente o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ): null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => (
            <motion.div 
              key={u.uid}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} 
                      alt={u.displayName}
                      className="w-12 h-12 rounded-full bg-black/50 border border-white/10 object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-[#1a1a1a] ${
                      u.role === 'admin' ? 'bg-yellow-500' : u.role === 'moderator' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      <FaShieldAlt className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{u.displayName}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                      <FaEnvelope className="w-3 h-3 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setUserToDelete({ uid: u.uid, displayName: u.displayName })}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                  title="Elimina dal database"
                >
                  <FaTrashAlt className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <div className="text-[10px] text-gray-500 uppercase font-bold shrink-0">Ruolo:</div>
                <div className="flex-1 relative group">
                  <select 
                    value={u.role}
                    onChange={(e) => handleUpdateRole(u.uid, e.target.value as any)}
                    className={`w-full appearance-none bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all ${getRoleStyle(u.role)}`}
                  >
                    <option value="user" className="bg-[#1a1a1a] text-white">Utente Base</option>
                    <option value="moderator" className="bg-[#1a1a1a] text-white">Moderatore</option>
                    <option value="admin" className="bg-[#1a1a1a] text-white">Amministratore</option>
                  </select>
                  <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50 text-white" />
                </div>
              </div>

              {u.stats && (
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Suggeriti</div>
                    <div className="text-sm font-bold text-white">{u.stats.suggestedVideos || 0}</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Approvati</div>
                    <div className="text-sm font-bold text-green-400">{u.stats.approvedVideos || 0}</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Rifiutati</div>
                    <div className="text-sm font-bold text-red-400">{u.stats.rejectedVideos || 0}</div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <FaUser className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nessun utente trovato per "{searchTerm}"</p>
          </div>
        )}

        <ConfirmModal 
          isOpen={!!userToDelete}
          title="Elimina Utente"
          message={`Sei sicuro di voler eliminare l'utente ${userToDelete?.displayName}? Questa azione rimuoverà il suo profilo dal database, ma non eliminerà il suo account di autenticazione.`}
          confirmText="Elimina definitivamente"
          cancelText="Annulla"
          onConfirm={confirmDelete}
          onCancel={() => setUserToDelete(null)}
          variant="danger"
        />
        {alert && (
              <Alert
                  message={alert?.message || ""}
                  type={alert?.type || "error"}
                  onClose={() => setAlert(null)}
              />
        )}

      </div>
    );
}
