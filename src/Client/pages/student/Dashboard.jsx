import React, { useEffect, useState } from "react";
import { 
  BookOpen, CheckCircle2, AlertCircle, TrendingUp, Calendar, Clock, 
  Wallet, Landmark, ArrowRight, ShieldCheck 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api"; 
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [finances, setFinances] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Academic Context (Synced with your frontend state)
  const term = "First";
  const session = "2025/2026";

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Parallel fetch for overview and real-time bursary calculations
        const [overviewRes, financeRes] = await Promise.all([
          api.get("/student/dashboard-overview"),
          api.get(`/bursary/my-balance?term=${term}&session=${session}`)
        ]);

        setData(overviewRes.data.data);
        setFinances(financeRes.data.data);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
        toast.error(err.message); 
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-[10px] font-black uppercase italic tracking-tighter text-slate-400">Syncing Academic Ledger...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="p-8 text-center text-slate-500 font-medium italic">
      Secure connection established. Re-authenticating session...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
            Welcome, {data.profile?.fullName?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic text-sm">
            Portal Active for <span className="text-indigo-600 font-bold">{term} Term</span> | {session}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Badge className={`rounded-xl px-4 py-1.5 font-black uppercase italic border-none ${finances?.isCleared ? "bg-emerald-500" : "bg-rose-500"}`}>
            {finances?.isCleared ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14}/> Exam Cleared</span>
            ) : (
              <span className="flex items-center gap-1.5"><AlertCircle size={14}/> Fee Pending</span>
            )}
          </Badge>
          <Badge variant="outline" className="bg-white border-slate-200 rounded-xl px-4 py-1.5 font-black uppercase text-slate-400 text-[10px] tracking-widest">
            {data.profile?.class || 'N/A'}
          </Badge>
        </div>
      </div>

      {/* 2. REAL-TIME STATS GRID (Mapped to BursaryService) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Attendance" 
          value={data.profile?.attendanceRate || "0%"} 
          sub="Activity Rating" 
          icon={<TrendingUp className="text-indigo-600" size={20}/>} 
        />
        <StatCard 
          title="Terminal Bill" 
          value={`₦${finances?.totalBilled?.toLocaleString() || '0'}`} 
          sub="Configured Fee" 
          icon={<Landmark className="text-slate-400" size={20}/>} 
        />
        <StatCard 
          title="Verified Paid" 
          value={`₦${finances?.totalPaid?.toLocaleString() || '0'}`} 
          sub="Confirmed Receipts" 
          icon={<ShieldCheck className="text-emerald-500" size={20}/>} 
        />
        <StatCard 
          title="Outstanding" 
          value={`₦${finances?.totalBalance?.toLocaleString() || '0'}`} 
          sub="Current Balance" 
          icon={<Wallet className="text-rose-500" size={20}/>} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* 3. MATERIALS LIST */}
        <Card className="md:col-span-4 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b py-5 px-6">
            <CardTitle className="text-xs font-black italic uppercase tracking-widest flex items-center gap-2">
               <BookOpen size={16} className="text-indigo-600"/> Subject Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {data.libraryHighlights?.length > 0 ? data.libraryHighlights.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3.5 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:bg-white transition-colors">
                    <BookOpen className="text-indigo-600" size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 uppercase italic text-xs tracking-tight">{item.subject}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Unit: {item.title}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50">Open</Button>
              </div>
            )) : (
              <p className="text-center py-10 text-slate-300 text-[10px] font-black uppercase tracking-widest italic">Inventory Empty for Class</p>
            )}
          </CardContent>
        </Card>

        {/* 4. FINANCIAL CTA & EXAMS */}
        <div className="md:col-span-3 space-y-6">
          {/* BURSARY ADVISORY CARD */}
          <Card className="border-indigo-100 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-100 overflow-hidden relative">
            <CardContent className="p-7">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                   <ShieldCheck size={14} className="text-indigo-300" />
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-200">Financial Security</p>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Account Status</h3>
                <p className="text-xs text-indigo-100 mt-2 font-medium leading-relaxed">
                  {finances?.isCleared 
                    ? "Your account is fully settled. terminal examinations and results are unlocked." 
                    : "Outstanding balance detected. Settle your terminal fees to avoid CBT restrictions."
                  }
                </p>
                <Button 
                  onClick={() => navigate("/student/payments")}
                  className="mt-6 w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black uppercase italic rounded-2xl h-12 text-xs tracking-widest"
                >
                  {finances?.isCleared ? "View Ledger" : "Clear Balance"} <ArrowRight size={16} className="ml-2"/>
                </Button>
              </div>
              <Wallet className="absolute -bottom-6 -right-6 text-white/10" size={140} />
            </CardContent>
          </Card>

          <Card className="border-slate-100 rounded-[2rem] shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b py-5 px-6">
              <CardTitle className="text-xs font-black italic uppercase tracking-widest">Upcoming CBTs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {data.upcomingExams?.length > 0 ? (
                data.upcomingExams.map(exam => (
                  <div key={exam._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                    <div>
                      <p className="font-black text-slate-900 uppercase italic text-xs tracking-tight">{exam.title}</p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase mt-0.5">{new Date(exam.examDate).toLocaleDateString()}</p>
                    </div>
                    <Clock className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={18} />
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                   <Calendar size={24} className="mx-auto text-slate-200 mb-2" />
                   <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">No Exams Slated</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon }) {
  return (
    <Card className="border-slate-100 shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:border-indigo-100 transition-all">
      <CardContent className="p-7">
        <div className="flex items-center justify-between pb-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">{icon}</div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{value}</div>
        <p className="text-[9px] font-bold text-indigo-500 italic mt-1 uppercase tracking-tighter">{sub}</p>
      </CardContent>
    </Card>
  );
}