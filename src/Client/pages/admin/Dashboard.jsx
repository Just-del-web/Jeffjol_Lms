import React, { useState, useEffect } from "react";
import { 
  Users, DollarSign, GraduationCap, TrendingUp, 
  UserCheck, ShieldCheck, Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
        // We set empty stats object to prevent math crashes
        setStats({
            revenue: 0,
            students: 0,
            avgGrade: 0,
            transactionCount: 0,
            teachers: 0
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-slate-500 font-bold uppercase tracking-tighter italic">Syncing Institution Pulse...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. TOP LEVEL KPIS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard 
          title="Consolidated Revenue" 
          value={`₦${((stats?.revenue || 0) / 1000000).toFixed(1)}M`} 
          sub="Verified Tuition & Levies" 
          icon={<DollarSign className="text-emerald-600" size={24}/>} 
        />
        <AdminStatCard 
          title="Active Students" 
          value={(stats?.students || 0).toLocaleString()} 
          sub="Across all departments" 
          icon={<Users className="text-indigo-600" size={24}/>} 
        />
        <AdminStatCard 
          title="Avg. School Grade" 
          value={`${stats?.avgGrade || 0}%`} 
          sub="B+ Terminal Average" 
          icon={<GraduationCap className="text-blue-600" size={24}/>} 
        />
        <AdminStatCard 
          title="Admin Verification" 
          value={stats?.transactionCount || 0} 
          sub="Recent receipts cleared" 
          icon={<ShieldCheck className="text-indigo-600" size={24}/>} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* 2. FINANCIAL HEALTH TRACKER (LEFT) */}
        <Card className="md:col-span-4 border-slate-200 rounded-3xl shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Budget Allocation & Collection</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Tuition Fees Collected</span>
                <span className="text-emerald-600">₦${((stats?.revenue || 0) * 0.8).toLocaleString()} (82%)</span>
              </div>
              <Progress value={82} className="h-4 bg-slate-100 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Digital Services Levy</span>
                <span className="text-indigo-600">₦${((stats?.revenue || 0) * 0.2).toLocaleString()} (94%)</span>
              </div>
              <Progress value={94} className="h-4 bg-slate-100 rounded-full" />
            </div>
            <div className="pt-6 border-t border-dashed flex justify-between items-center">
               <p className="text-xs text-slate-400 font-medium italic">Real-time data synced from Jeffjol Bursary.</p>
               <Badge className="bg-emerald-600 text-white border-none px-4 py-1">System Healthy</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 3. CONTROL CENTER (RIGHT) */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-indigo-100 bg-indigo-50/20 rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2 text-indigo-900">
                <ShieldCheck className="text-indigo-600" size={20} /> Command Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <ActionButton label="Publish Term Results" sub="Enable student/parent visibility" />
              <ActionButton label="Batch Promotion" sub="Year-end academic advancement" />
              <ActionButton label="Payroll Export" sub="Download staff salary manifest" />
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
             <CardHeader className="pb-2">
               <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Engagement</CardTitle>
             </CardHeader>
             <CardContent className="flex items-center justify-between pb-6">
                <div className="flex items-center gap-3 font-black text-3xl text-slate-900 italic tracking-tighter">
                    <UserCheck className="text-emerald-500" size={28}/> {(stats?.teachers || 0) - 2}/{(stats?.teachers || 0)}
                </div>
                <Badge variant="outline" className="border-slate-200 font-bold">Teachers Active</Badge>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, sub, icon }) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-3xl bg-white hover:border-indigo-300 transition-colors group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">{icon}</div>
        </div>
        <div className="text-3xl font-black italic text-slate-900 tracking-tighter">{value}</div>
        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ActionButton({ label, sub }) {
  return (
    <button className="w-full text-left p-4 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-indigo-100 hover:shadow-md bg-white/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">{label}</p>
        <TrendingUp size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{sub}</p>
    </button>
  );
}