import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Clock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("/api/v1/student/dashboard-overview", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error("Dashboard failed to load", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your profile...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. WELCOME & STATUS HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {data.profile.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here is what's happening with your studies today.</p>
        </div>
        
        <div className="flex gap-3">
          <Badge variant={data.profile.isCleared ? "success" : "destructive"} className="px-4 py-1.5 text-sm">
            {data.profile.isCleared ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14}/> Exam Cleared</span>
            ) : (
              <span className="flex items-center gap-1.5"><AlertCircle size={14}/> Payment Required</span>
            )}
          </Badge>
          <Badge variant="outline" className="bg-white px-4 py-1.5 text-sm border-slate-200">
            {data.profile.class}
          </Badge>
        </div>
      </div>

      {/* 2. TOP STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="LMS Attendance" 
          value={data.profile.attendanceRate} 
          sub="Activity based" 
          icon={<TrendingUp className="text-indigo-600" size={20}/>} 
        />
        <StatCard 
          title="Total Subjects" 
          value="12" 
          sub="Current Term" 
          icon={<BookOpen className="text-blue-600" size={20}/>} 
        />
        <StatCard 
          title="Outstanding Fees" 
          value={`₦${data.finances.totalBalance.toLocaleString()}`} 
          sub="Jeffjol Bursary" 
          icon={<AlertCircle className="text-amber-500" size={20}/>} 
        />
        <StatCard 
          title="Upcoming Exams" 
          value={data.upcomingExams.length} 
          sub="Active CBTs" 
          icon={<Clock className="text-emerald-600" size={20}/>} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* 3. RECENT LEARNING MATERIALS (LEFT) */}
        <Card className="md:col-span-4 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Materials</CardTitle>
            <CardDescription>Latest uploads for your class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.libraryHighlights.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-50 rounded-md text-indigo-600">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{item.subject}</p>
                    <p className="text-xs text-slate-500">By Teacher {item.uploadedBy.lastName}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="group-hover:bg-indigo-100 cursor-pointer">View Note</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 4. UPCOMING EXAMS & CALENDAR (RIGHT) */}
        <Card className="md:col-span-3 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={18}/> Upcoming CBTs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.upcomingExams.length > 0 ? (
              data.upcomingExams.map(exam => (
                <div key={exam._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-slate-900">{exam.title}</p>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{exam.duration}m</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(exam.examDate).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8 italic">No exams scheduled yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, sub, icon }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {icon}
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}