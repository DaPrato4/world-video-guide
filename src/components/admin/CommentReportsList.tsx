
import { FaExclamationTriangle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { arrayRemove, collection, deleteDoc, doc, documentId, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase";

interface Reporter {
  uid: string;
  displayName?: string;
  email?: string;
}

interface ReportItem {
  commentId: string;
  commentText?: string;
  countryCode?: number | string;
  commenterName?: string;
  reporters: Reporter[];
  countryName?: string;
  countryFlagUrl?: string;
}

export default function CommentReportsList() {

    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const q = query(collection(db, "users"), where("reportedComments", "!=", []));
        const pendingReports = await getDocs(q);
        const fetchedReports: ReportItem[] = pendingReports.docs.map(doc => {
          const data = doc.data();
          return data.reportedComments.map((commentId: string) => ({
            commentId: commentId,
            reporters: [{ uid: doc.id, displayName: data.displayName }]
          }));
        }).flat();

        const reportPromises = fetchedReports.map(async (report) => {
          try {
            const q = query(collection(db, "comments"), where(documentId(), "==", report.commentId));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const commentData = snapshot.docs[0].data() as { userDisplayName: string; text: string; countryCode: number | string };
              return {
                ...report,
                commenterName: commentData.userDisplayName,
                commentText: commentData.text,
                countryCode: commentData.countryCode
              } as ReportItem;
            }
            return report;
          } catch (error) {
            console.error("Errore nel recupero dei dettagli del commento:", error);
            return report;
          }
        });

        const reportInfo: ReportItem[] = await Promise.all(reportPromises);

        const countryPromises = reportInfo.map(async (report) => {
          if (report.countryCode) {
            try {
                const countryCode = String(report.countryCode).padStart(3, '0');
                const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }
                const countryData = await res.json();
                return {
                  ...report,
                  countryName: countryData[0]?.name?.common || 'N/D',
                  countryFlagUrl: countryData[0]?.flags?.svg || null
                };
            } catch (error) {
                console.error("Errore nel recupero dei dettagli del paese:", error);
                return {
                  ...report,
                  countryName: 'N/D',
                  countryFlagUrl: null
                };
            }
          }
          return report;
        });

        const reportInfoWithCountries = await Promise.all(countryPromises);

        setReports(reportInfoWithCountries);
        setLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento delle segnalazioni commenti:", error);
        setLoading(false);
      }
    };

    loadReports();
  }, []);


  const handleRemoveComment = async (commentId: string) => {
    try {      
        await deleteDoc(doc(db, "comments", commentId));
        handleCancelReport(commentId);
    } catch (error) {
        console.error("Errore nella rimozione del commento:", error);
    }
  };

  const handleCancelReport = async (commentId: string) => {
    try {
        await getDocs(query(collection(db, "users"), where("reportedComments", "array-contains", commentId))).then(snapshot => {
            snapshot.forEach(doc => {
                const userRef = doc.ref;
                updateDoc(userRef, { reportedComments: arrayRemove(commentId) });
            });
        });
        setReports(prev => prev.filter(r => r.commentId !== commentId));
    } catch (error) {        
        console.error("Errore nell'annullamento della segnalazione:", error);
    }
    
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400">
            <FaExclamationTriangle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Segnalazioni Commenti</h2>
            <p className="text-sm text-neutral-400 font-medium">{reports.length} segnalazione{reports.length !== 1 ? 'i' : ''}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1,2].map(n => <div key={n} className="h-24 bg-[#1a1a1a] rounded-2xl border border-white/5 animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#1a1a1a] border-2 border-dashed border-white/5 rounded-3xl py-24 flex flex-col items-center justify-center text-neutral-500">
          <p className="text-lg font-bold text-neutral-400">Nessuna segnalazione</p>
          <p className="text-sm">Non ci sono commenti segnalati da revisionare</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <>
            {reports.map(r => (
              <div key={r.commentId} className="bg-neutral-900 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                  <div className="flex-1 text-left">
                    <div className="text-xs text-neutral-400 mb-1">Autore commento: <span className="text-sm text-white font-medium">{r.commenterName || 'Utente sconosciuto'}</span></div>
                    <div className="text-sm text-neutral-200 mb-2">{r.commentText}</div>
                    <div className="text-xs text-neutral-500 mb-2">Segnalato da: {r.reporters.map(p => p.displayName || p.uid).join(', ')}</div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                      <span className="flex items-center">
                        <img
                          src={r.countryFlagUrl}
                          alt={String(r.countryCode ?? '')}
                          className="w-6 h-4 object-cover rounded-sm"
                          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                        />
                      </span>
                      <span>Paese: {r.countryName ?? 'N/D'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 md:items-end items-center w-full md:w-auto">
                    <button onClick={() => handleRemoveComment(r.commentId)} className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold">Rimuovi Commento</button>
                    <button onClick={() => handleCancelReport(r.commentId)} className="w-full bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-xl">Annulla Segnalazione</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        </div>
      )}
    </div>
  );
}
