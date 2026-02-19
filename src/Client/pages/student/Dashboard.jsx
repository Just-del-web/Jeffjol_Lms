import React, { useEffect, useState } from "react";
import { 
  BookOpen, CheckCircle2, AlertCircle, TrendingUp, Calendar, Clock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api"; // This now uses your new "smart" interceptor
import { toast } from "sonner";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/student/dashboard-overview");
        setData(res.data.data);
      } catch (err) {
        // THE FIX:
        // 'err.message' is now automatically populated by our Axios interceptor
        // with the specific backend error (e.g., "Account suspended")
        console.error("Dashboard failed to load", err);
        toast.error(err.message); 
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-xs font-black uppercase italic tracking-tighter text-slate-400">Authenticating Session...</p>
      </div>
    );
  }

  // If the interceptor caught a 403, 'data' will be null and the toast will have fired
  if (!data) return (
    <div className="p-8 text-center text-slate-500 font-medium italic">
      Secure connection established. Please check notifications.
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
            Welcome back, {data.profile?.fullName?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Here is what's happening with your studies today.</p>
        </div>
        
        <div className="flex gap-3">
          <Badge className={`rounded-xl px-4 py-1 font-black uppercase italic ${data.profile?.isCleared ? "bg-emerald-500" : "bg-rose-500"}`}>
            {data.profile?.isCleared ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14}/> Exam Cleared</span>
            ) : (
              <span className="flex items-center gap-1.5"><AlertCircle size={14}/> Payment Required</span>
            )}
          </Badge>
          <Badge variant="outline" className="bg-white border-slate-200 rounded-xl px-4 py-1 font-black uppercase text-slate-600">
            {data.profile?.class || 'N/A'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Attendance" 
          value={data.profile?.attendanceRate || "0%"} 
          sub="Activity based" 
          icon={<TrendingUp className="text-indigo-600" size={20}/>} 
        />
        <StatCard 
          title="Current Fees" 
          value={`₦${data.finances?.totalBalance?.toLocaleString() || '0'}`} 
          sub="Jeffjol Bursary" 
          icon={<AlertCircle className="text-amber-500" size={20}/>} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="font-black italic uppercase tracking-tighter">Recent Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {data.libraryHighlights?.length > 0 ? data.libraryHighlights.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <BookOpen className="text-indigo-600" size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 uppercase italic text-xs tracking-tight">{item.subject}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Uploaded by Staff</p>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-lg cursor-pointer">View</Badge>
              </div>
            )) : (
              <p className="text-center py-6 text-slate-400 text-sm italic">No materials uploaded for your class yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="font-black italic uppercase tracking-tighter">Upcoming CBTs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {data.upcomingExams?.length > 0 ? (
              data.upcomingExams.map(exam => (
                <div key={exam._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-black text-slate-900 uppercase italic text-sm tracking-tighter">{exam.title}</p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase">{new Date(exam.examDate).toLocaleDateString()}</p>
                  </div>
                  <Clock className="text-slate-300" size={18} />
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Calendar className="mx-auto text-slate-200 mb-2" size={32} />
                <p className="text-slate-400 text-sm font-medium italic">No scheduled exams.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon }) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between pb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{value}</div>
        <p className="text-[10px] font-bold text-indigo-500 italic mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}