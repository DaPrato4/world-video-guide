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
    <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800/50 rounded-2xl p-8 mb-6">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-24 h-24 rounded-full object-cover border-2 border-neutral-700"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-neutral-700">
              <FiUser className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="grow">
          <h1 className="text-3xl font-bold text-white mb-2">
            {user.displayName}
          </h1>
          <p className="text-neutral-400 mb-4">{user.email}</p>

          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getRoleBadgeColor(
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
          className="shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200 border border-blue-500/30"
        >
          Modifica
        </button>
      </div>
    </div>
  );
}
