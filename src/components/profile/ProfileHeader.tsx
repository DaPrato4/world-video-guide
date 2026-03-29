import { FiUser } from "react-icons/fi";
import type { user } from "../../types";

interface ProfileHeaderProps {
  user: user | null;
  onEdit: () => void;
}

export default function ProfileHeader({ user, onEdit }: ProfileHeaderProps) {
  if (!user) return null;

  // Colore badge basato su role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
      case "moderator":
        return "bg-purple-500/20 border-purple-500/50 text-purple-300";
      default:
        return "bg-blue-500/20 border-blue-500/50 text-blue-300";
    }
  };

  // Traduzione ruolo
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Amministratore";
      case "moderator":
        return "Moderatore";
      default:
        return "Utente";
    }
  };

  return (
    <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800/50 rounded-2xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-2 border-neutral-700"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-neutral-700">
              <FiUser className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="grow text-center md:text-left">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">
            {user.displayName}
          </h1>
          <p className="text-sm md:text-base text-neutral-400 mb-3 md:mb-4 truncate md:truncate">
            {user.email}
          </p>

          {/* Role Badge */}
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span
              className={`inline-block px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold border ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="w-full md:w-auto shrink-0 px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200 border border-blue-500/30 text-sm md:text-base"
        >
          Modifica
        </button>
      </div>
    </div>
  );
}
