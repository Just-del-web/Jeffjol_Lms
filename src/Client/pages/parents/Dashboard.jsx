import React, { useState, useEffect } from "react";
import { UserCircle, TrendingUp, CreditCard, Bell, ChevronRight, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

export default function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentData = async () => {
      const res = await axios.get("/api/v1/parent/my-children");
      setChildren(res.data.data);
      if (res.data.data.length > 0) setSelectedChild(res.data.data[0]);
      setLoading(false);
    };
    fetchParentData();
  }, []);

  if (loading) return <div className="p-10 text-center">Fetching family records...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. CHILD SELECTOR & WELCOME */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-indigo-100">
            <AvatarImage src={selectedChild?.profilePicture} />
            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">
              {selectedChild?.firstName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Parental Oversight</h1>
            <p className="text-sm text-slate-500">Currently viewing: <span className="font-semibold text-slate-700">{selectedChild?.firstName}'s</span> profile</p>
          </div>
        </div>

        <div className="w-full md:w-64">
          <Select 
            value={selectedChild?._id} 
            onValueChange={(id) => setSelectedChild(children.find(c => c._id === id))}
          >
            <SelectTrigger className="w-full bg-slate-50 border-slate-200">
              <SelectValue placeholder="Switch Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child._id} value={child._id}>{child.firstName} ({child.currentClass})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. THE OVERVIEW GRID */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* ACADEMIC SUMMARY */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <GraduationCap size={16}/> Termly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.4%</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">+2.1% from last term</p>
          </CardContent>
        </Card>

        {/* FINANCIAL SUMMARY */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CreditCard size={16}/> Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">₦14,500</div>
            <p className="text-xs text-slate-400 mt-1">Due for {selectedChild?.firstName}</p>
          </CardContent>
        </Card>

        {/* ATTENDANCE SUMMARY */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <UserCheck size={16}/> LMS Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">94%</div>
            <p className="text-xs text-slate-400 mt-1">Consistent engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. RECENT ACTIVITY & NOTICES */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Recent Academic Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* Map over child's recent scores or note views */}
             <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><TrendingUp size={18}/></div>
                  <div>
                    <p className="text-sm font-semibold">Mathematics Quiz Result</p>
                    <p className="text-xs text-slate-500">Scored 18/20 (90%)</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">Excellent</Badge>
             </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Bell size={18}/> School Notices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border-l-4 border-amber-400 bg-amber-50 rounded-r-xl">
                <p className="text-sm font-bold text-amber-900 italic">Mid-Term Break Announcement</p>
                <p className="text-xs text-amber-800 mt-1">School will be closed from Feb 15th to Feb 18th.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}