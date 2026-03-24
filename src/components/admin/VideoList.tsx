import type { video } from "../../types/index";
import VideoCard from "./VideoCard";

interface VideoListProps {
  videos: video[];
  loading: boolean;
  updating: string | null;
  onUpdateStatus: (videoId: string, newStatus: "approved" | "rejected") => void;
}

export default function VideoList({ videos, loading, updating, onUpdateStatus }: VideoListProps) {
  return (
    <section className="bg-neutral-800/50 border border-white/5 rounded-3xl p-4 md:p-8 flex flex-col">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2 shrink-0">
        📂 Gestione Video <span className="text-neutral-500 text-sm font-normal">({videos.length})</span>
      </h2>
      
      {loading ? (
        <div className="border-2 border-dashed border-neutral-700 rounded-2xl h-64 flex items-center justify-center text-neutral-600">
          <p>Caricamento video...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-700 rounded-2xl h-64 flex items-center justify-center text-neutral-600">
          <p>Nessun video in attesa di approvazione</p>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              updating={updating} 
              onUpdateStatus={onUpdateStatus} 
            />
          ))}
        </div>
      )}
    </section>
  );
}
