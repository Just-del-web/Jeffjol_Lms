import React, { useState, useEffect } from "react";
import { Users, Eye, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

export default function ClassAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await axios.get("/api/v1/teacher/engagement-stats");
      setStats(res.data.data);
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400">Analyzing class activity...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-bold">Class Engagement</h1>
        <p className="text-slate-500">Track which students are interacting with your learning materials.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Active Students" value="88%" sub="Logged in this week" icon={<Users className="text-indigo-600"/>} />
        <MetricCard title="Avg. Reading Time" value="24m" sub="Per student/day" icon={<Clock className="text-emerald-600"/>} />
        <MetricCard title="Content Reach" value="412" sub="Total note views" icon={<Eye className="text-blue-600"/>} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* TOP PERFORMING CONTENT */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Most Read Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.topContent.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.title}</span>
                  <span className="text-slate-500">{item.views} views</span>
                </div>
                <Progress value={(item.views / stats.totalStudents) * 100} className="h-2 bg-slate-100" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AT-RISK STUDENTS (LOW ENGAGEMENT) */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} /> Inactive Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.inactiveStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{student.lastSeen}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="cursor-pointer hover:bg-slate-50">Nudge</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, icon }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="pt-6">
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