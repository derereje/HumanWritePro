"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "~/lib/mockClerk";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Copy, Loader2, Trash2, PenSquare } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import ModernNavbar from "~/components/ModernNavbar";
import { mockGetHumanizerHistory } from "~/lib/mockApi";
const getHumanizerHistory = mockGetHumanizerHistory;

interface HistoryItem {
  id: string;
  originalText: string;
  humanizedText: string;
  preset: string;
  tokensUsed: number;
  aiScore: number | null;
  createdAt: Date;
}

export default function HistoryPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn) {
      fetchHistory();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getHumanizerHistory();
      if (res.success && Array.isArray(res.history)) {
        setHistory(res.history);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this history item?")) {
      return;
    }

    setDeletingId(itemId);
    try {
      const response = await fetch(`/api/humanizer/delete?id=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("History item deleted");
      setHistory(h => h.filter(x => x.id !== itemId));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete history item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = (item: HistoryItem) => {
    // Save to local storage to be picked up by the home page
    localStorage.setItem("restoreHistory", JSON.stringify(item));
    router.push("/");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (!isLoaded || (isSignedIn && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-white">
      <ModernNavbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} data-analytics-id="history-back-button">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">History</h1>
              <p className="text-slate-400">View and manage your past humanizations</p>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.03]">
            <div className="rounded-full bg-white/[0.04] p-6 mb-4">
              <Calendar className="h-12 w-12 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-white">No history yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Your humanized texts will appear here
            </p>
            <Button onClick={() => router.push("/")} className="mt-6" data-analytics-id="history-start-humanizing">
              Start Humanizing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-white/10 bg-card p-6  transition-all hover:shadow-xl shadow-black/50 shadow-black/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {item.preset}
                    </Badge>
                    {item.aiScore !== null && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        {Math.round((1) * 100)}% Human
                      </Badge>
                    )}
                    <span className="text-xs text-slate-400 ml-2">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2 text-slate-400"
                      onClick={() => handleRestore(item)}
                      data-analytics-id={`history-restore-${item.id}`}
                    >
                      <PenSquare className="h-3.5 w-3.5" />
                      Open in Editor
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      data-analytics-id={`history-delete-${item.id}`}
                    >
                      {deletingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Original</p>
                    <div className="relative rounded-lg bg-white/[0.02] p-3 text-sm text-slate-400 h-32 overflow-y-auto custom-scrollbar border border-white/5">
                      {item.originalText}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600/80">Humanized</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                        onClick={() => copyToClipboard(item.humanizedText)}
                        data-analytics-id={`history-copy-${item.id}`}
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                    <div className="relative rounded-lg bg-blue-50/50 p-3 text-sm text-slate-200 h-32 overflow-y-auto custom-scrollbar border border-blue-100/50">
                      {item.humanizedText}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-xs font-medium text-slate-400">
                    {item.tokensUsed} credits used
                  </span>
                  {/* Mobile Actions which are always visible */}
                  <div className="flex sm:hidden gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleRestore(item)}
                      data-analytics-id={`history-mobile-restore-${item.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-red-400"
                      onClick={(e) => handleDelete(item.id, e)}
                      data-analytics-id={`history-mobile-delete-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
