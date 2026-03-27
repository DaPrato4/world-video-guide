import type { user } from "../types";
import Header from "../components/common/Header";
import ProfileHeader from "../components/profile/ProfileHeader";
import StatsGrid from "../components/profile/StatsGrid";
import UserVideoList from "../components/profile/UserVideoList";

export default function Profile({ user, onLogOut }: { user: user | null; onLogOut: () => void }) {

    const handleSuggestVideo = () => {
        // Navigare alla pagina Home per suggerire un video
        // Questo richiederà react-router-dom
        window.location.href = "/";
    };

    const handleEditProfile = () => {
        // TODO: Aprire un modal o navigare a una pagina di modifica profilo
        console.log("Modifica profilo");
    };

    return (
        <div className="flex flex-col w-screen h-screen bg-neutral-950 text-white overflow-hidden font-sans">
            <Header user={user} page="Profile" />
            
            <main className="grow overflow-y-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {user ? (
                        <>
                            {/* Profile Header */}
                            <ProfileHeader user={user} onEdit={handleEditProfile} />

                            {/* Stats Grid */}
                            <StatsGrid user={user} />

                            {/* User Video List */}
                            <UserVideoList user={user} onSuggestVideo={handleSuggestVideo} />

                            {/* Logout Button */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={onLogOut}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors duration-200 border border-red-500/30"
                                >
                                    Esci
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-8 text-center max-w-md">
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    Accedi al Tuo Profilo
                                </h2>
                                <p className="text-neutral-400 mb-6">
                                    Devi essere autenticato per visualizzare il tuo profilo e i tuoi video.
                                </p>
                                <button
                                    onClick={handleEditProfile}
                                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200 border border-blue-500/30"
                                >
                                    Accedi
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}