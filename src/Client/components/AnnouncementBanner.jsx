import React, { useState, useEffect } from "react";
import { Megaphone, X, AlertTriangle, Bell } from "lucide-react";
import api from "@/lib/api";

export default function AnnouncementBanner() {
  const [notices, setNotices] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get("/announcements/active");
        setNotices(res.data.data);
      } catch (err) {
        console.error("Banner fetch failed");
      }
    };
    fetchNotices();
  }, []);

  if (!visible || notices.length === 0) return null;

  const activeNotice = notices[currentIdx];
  const isEmergency = activeNotice.priority === 'emergency';

  return (
    <div className={`w-full py-2 px-6 flex items-center justify-between transition-all animate-in slide-in-from-top duration-500 ${
      isEmergency ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
    }`}>
      <div className="flex items-center gap-3 overflow-hidden">
        {isEmergency ? <AlertTriangle size={18} className="animate-pulse" /> : <Megaphone size={18} />}
        
        <p className="text-sm font-black italic uppercase tracking-tighter truncate">
          <span className="opacity-70 mr-2">[{activeNotice.priority}]</span>
          {activeNotice.title}: <span className="font-medium normal-case ml-1">{activeNotice.content}</span>
        </p>
      </div>

      <div className="flex items-center gap-4 ml-4">
        {notices.length > 1 && (
          <button 
            onClick={() => setCurrentIdx((prev) => (prev + 1) % notices.length)}
            className="text-[10px] font-bold uppercase underline decoration-2 underline-offset-4 opacity-80 hover:opacity-100"
          >
            Next ({currentIdx + 1}/{notices.length})
          </button>
        )}
        <button onClick={() => setVisible(false)} className="hover:rotate-90 transition-transform">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}