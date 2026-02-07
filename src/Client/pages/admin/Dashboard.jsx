import React from "react";
import { 
  Users, 
  DollarSign, 
  GraduationCap, 
  TrendingUp, 
  AlertTriangle,
  UserCheck,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. TOP LEVEL KPIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard 
          title="Total Revenue" 
          value="₦12.4M" 
          sub="+12% from last term" 
          icon={<DollarSign className="text-emerald-600" size={20}/>} 
        />
        <AdminStatCard 
          title="Total Students" 
          value="1,240" 
          sub="Across 18 classes" 
          icon={<Users className="text-indigo-600" size={20}/>} 
        />
        <AdminStatCard 
          title="Avg. School Grade" 
          value="72.4%" 
          sub="B+ Average" 
          icon={<GraduationCap className="text-blue-600" size={20}/>} 
        />
        <AdminStatCard 
          title="Pending Debts" 
          value="₦1.8M" 
          sub="42 Students owe" 
          icon={<AlertTriangle className="text-rose-500" size={20}/>} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* 2. REVENUE TRACKER (LEFT) */}
        <Card className="md:col-span-4 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Revenue vs. Outstanding Debt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Tuition Fees Collected</span>
                <span className="text-emerald-600">₦10.2M (82%)</span>
              </div>
              <Progress value={82} className="h-3 bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>LMS & Library Levies</span>
                <span className="text-blue-600">₦2.2M (94%)</span>
              </div>
              <Progress value={94} className="h-3 bg-slate-100" />
            </div>
            <div className="pt-4 border-t border-dashed flex justify-between items-center">
               <p className="text-sm text-slate-500 italic">Financial health is currently stable.</p>
               <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">System Healthy</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 3. QUICK ACTIONS & SECURITY (RIGHT) */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-indigo-100 bg-indigo-50/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={18} /> Admin Control Center
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <ActionButton label="Publish Term Results" sub="Toggle school-wide visibility" />
              <ActionButton label="Promote All Students" sub="Year-end class advancement" />
              <ActionButton label="Generate Staff Payroll" sub="Process monthly teacher salaries" />
            </CardContent>
          </Card>
          
          <Card className="border-slate-200">
             <CardHeader className="pb-2"><CardTitle className="text-sm">Staff Attendance</CardTitle></CardHeader>
             <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-2xl">
                   <UserCheck className="text-emerald-500" size={24}/> 38/40
                </div>
                <Badge variant="outline">Teachers Logged In</Badge>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, sub, icon }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ActionButton({ label, sub }) {
  return (
    <button className="w-full text-left p-3 rounded-xl hover:bg-white transition-all group border border-transparent hover:border-indigo-100 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <TrendingUp size={14} className="text-slate-300 group-hover:text-indigo-500" />
      </div>
      <p className="text-[11px] text-slate-500">{sub}</p>
    </button>
  );
}