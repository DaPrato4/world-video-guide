import { useState } from "react";
import type { video } from "../../types/index";
import VideoCard from "./VideoCard";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaHistory, FaInbox } from "react-icons/fa";

interface VideoListProps {
  videos: video[];
  loading: boolean;
  updating: string | null;
  onUpdateStatus: (videoId: string, newStatus: "approved" | "rejected", reason?: string) => void;
}

export default function VideoList({ videos, loading, updating, onUpdateStatus }: VideoListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVideos = videos.filter(v => 
    v.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.suggesterName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header e Ricerca */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
            <FaInbox size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Gestione Video</h2>
            <p className="text-sm text-neutral-400 font-medium">
              {videos.length} video in attesa
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Cerca per titolo o autore..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-30 bg-[#1a1a1a] rounded-2xl border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border-2 border-dashed border-white/5 rounded-3xl py-24 flex flex-col items-center justify-center text-neutral-500"
        >
          <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
            <FaHistory size={32} className="text-neutral-700" />
          </div>
          <p className="text-lg font-bold text-neutral-400">Coda di revisione vuota</p>
          <p className="text-sm">Nessun video corrisponde alla tua ricerca</p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="flex flex-col gap-6 text-xs md:text-sm"
        >
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <VideoCard 
                  video={video} 
                  updating={updating} 
                  onUpdateStatus={onUpdateStatus} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
