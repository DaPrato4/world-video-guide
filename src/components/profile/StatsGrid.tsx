import { FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import type { user } from "../../types";



export default function StatsGrid({ user }: { user: user | null }) {
  const stats = user?.stats || { pendingVideos: 0, approvedVideos: 0, rejectedVideos: 0 };

  const statCards = [
    {
      label: "In Sospeso",
      value: stats.pendingVideos,
      icon: FiClock,
      color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
      iconColor: "text-yellow-400",
    },
    {
      label: "Approvati",
      value: stats.approvedVideos,
      icon: FiCheckCircle,
      color: "bg-green-500/20 border-green-500/50 text-green-300",
      iconColor: "text-green-400",
    },
    {
      label: "Rifiutati",
      value: stats.rejectedVideos,
      icon: FiXCircle,
      color: "bg-red-500/20 border-red-500/50 text-red-300",
      iconColor: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.color} border rounded-xl p-6 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75 mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <Icon className={`w-12 h-12 ${stat.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
