import React, { useEffect, useState } from "react";
import { Megaphone, X, BellRing } from "lucide-react";
import api from "@/lib/api";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveAnnouncements = async () => {
      try {
        const res = await api.get("/announcements/active");
        setAnnouncements(res.data.data || []);
      } catch (err) {
        console.error("Banner fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAnnouncements();
  }, []);

  if (!isVisible || loading || announcements.length === 0) return null;

  return (
    <div className="relative bg-indigo-600 text-white overflow-hidden shadow-lg border-b border-indigo-500">
      
      <div className="flex items-center h-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 z-10 bg-indigo-600 pr-4 shrink-0 font-black italic uppercase tracking-tighter text-sm">
          <Megaphone size={18} className="animate-bounce" />
          <span>Noticeboard:</span>
        </div>

        <div className="flex-1 overflow-hidden relative group">
          <div className="flex whitespace-nowrap animate-marquee group-hover:pause gap-20">
            {announcements.map((note) => (
              <span key={note._id} className="text-sm font-bold tracking-tight">
                <span className="text-indigo-200 mr-2 uppercase text-[10px] font-black tracking-widest">
                  [{note.priority}]
                </span>
                {note.title}: {note.content}
              </span>
            ))}
            {announcements.map((note) => (
              <span key={`${note._id}-clone`} className="text-sm font-bold tracking-tight">
                <span className="text-indigo-200 mr-2 uppercase text-[10px] font-black tracking-widest">
                  [{note.priority}]
                </span>
                {note.title}: {note.content}
              </span>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="ml-4 hover:bg-indigo-700 p-1.5 rounded-full transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .pause {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}