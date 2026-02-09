import React, { useEffect, useState } from "react";
import { 
  BookOpen, CheckCircle2, AlertCircle, TrendingUp, Calendar, Clock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
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
        console.error("Dashboard failed to load", err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-slate-500">No profile data found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
    
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Welcome back, {data.profile?.fullName?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here is what's happening with your studies today.</p>
        </div>
        
        <div className="flex gap-3">
          <Badge className={data.profile?.isCleared ? "bg-emerald-500" : "bg-rose-500"}>
            {data.profile?.isCleared ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14}/> Exam Cleared</span>
            ) : (
              <span className="flex items-center gap-1.5"><AlertCircle size={14}/> Payment Required</span>
            )}
          </Badge>
          <Badge variant="outline" className="bg-white border-slate-200">
            {data.profile?.class || 'N/A'}
          </Badge>
        </div>
      </div>

      {/* 2. STATS GRID */}
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
        {/* ... other cards */}
      </div>

      {/* 3. MATERIALS & EXAMS */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-slate-200">
          <CardHeader>
            <CardTitle>Recent Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.libraryHighlights?.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-indigo-600" size={18} />
                  <div>
                    <p className="font-bold text-slate-800">{item.subject}</p>
                    <p className="text-xs text-slate-500">Teacher {item.uploadedBy?.lastName}</p>
                  </div>
                </div>
                <Badge variant="secondary">View</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-slate-200">
          <CardHeader><CardTitle>Upcoming CBTs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingExams?.length > 0 ? (
              data.upcomingExams.map(exam => (
                <div key={exam._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-900">{exam.title}</p>
                  <p className="text-xs text-slate-500">{new Date(exam.examDate).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8 italic">No exams scheduled.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between pb-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {icon}
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}