import React, { useState, useEffect } from "react";
import { TrendingUp, CreditCard, Bell, GraduationCap, UserCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function ParentDashboard() {
  const [childrenList, setChildrenList] = useState([]); 
  const [familyData, setFamilyData] = useState([]); 
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const res = await api.get("/parent/my-children");
        const data = res.data.data;
        
        setFamilyData(data);
        setChildrenList(data); 
        
        if (data.length > 0) {
          setSelectedChild(data[0]);
        }
      } catch (err) {
        toast.error("Failed to sync family records.");
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, []);

  const currentBalance = selectedChild?.financialHistory?.reduce((acc, curr) => {
    return curr.status !== 'verified' ? acc + curr.amount : acc;
  }, 0) || 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-slate-500 font-medium tracking-tight uppercase">Accessing Jeffjol Registry...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. CHILD SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-4 border-indigo-50 shadow-sm">
            <AvatarImage src={selectedChild?.profilePicture} />
            <AvatarFallback className="bg-indigo-600 text-white font-black text-xl uppercase italic">
              {selectedChild?.firstName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Parental Oversight</h1>
            <p className="text-sm text-slate-500">
              Monitoring: <span className="font-bold text-indigo-600">{selectedChild?.firstName} {selectedChild?.lastName}</span>
            </p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <Select 
            value={selectedChild?._id} 
            onValueChange={(id) => setSelectedChild(familyData.find(c => c._id === id))}
          >
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl font-bold">
              <SelectValue placeholder="Switch Ward" />
            </SelectTrigger>
            <SelectContent>
              {childrenList.map(child => (
                <SelectItem key={child._id} value={child._id}>
                  {child.firstName} ({child.currentClass})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. DYNAMIC STATS GRID */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 rounded-3xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <GraduationCap size={14} className="text-indigo-600"/> Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{selectedChild?.performanceAverage}%</div>
            <Badge className="bg-emerald-100 text-emerald-700 border-none mt-2 uppercase text-[10px]">Academic Standing</Badge>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={14} className="text-rose-600"/> Fees Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black italic ${currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ₦{currentBalance.toLocaleString()}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Current Debt Index</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <UserCheck size={14} className="text-emerald-600"/> Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">94%</div>
            <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-tighter">Engagement Health</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. RECENT ACTIVITY CARDS */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg font-bold">Recent Academic Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {selectedChild?.academicHistory?.length > 0 ? selectedChild.academicHistory.map((res) => (
              <div key={res._id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-all">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">{res.subject?.[0]}</div>
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{res.subject}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(res.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge className="bg-indigo-600 text-white border-none">{res.grade}</Badge>
              </div>
            )) : <p className="text-center text-slate-400 py-10 italic">No academic history available.</p>}
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Bell size={18} className="text-amber-500"/> School Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 font-medium text-slate-600">
            <div className="p-5 border-l-4 border-amber-400 bg-amber-50 rounded-r-2xl">
              <p className="text-sm font-black text-amber-900 italic uppercase">System Maintenance</p>
              <p className="text-xs text-amber-800 mt-1">LMS access might be limited on Feb 15th from 10 PM.</p>
            </div>
            <div className="p-5 border-l-4 border-indigo-400 bg-indigo-50 rounded-r-2xl">
              <p className="text-sm font-black text-indigo-900 italic uppercase">Fee Clearance</p>
              <p className="text-xs text-indigo-800 mt-1">Upload receipts early to avoid terminal login blocks.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}