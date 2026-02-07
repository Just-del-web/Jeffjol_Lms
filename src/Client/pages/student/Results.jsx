import React, { useState, useEffect } from "react";
import { Download, Award, TrendingUp, BookOpen, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [term, setTerm] = useState("First");
  const [session, setSession] = useState("2025/2026");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/result/my-history?term=${term}&session=${session}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setResults(res.data.data.history || []);
        setAnalytics(res.data.data.analytics);
      } catch (err) {
        console.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [term, session]);

  const handleDownload = async () => {
    window.open(`/api/v1/result/download-report?term=${term}&session=${session}`, "_blank");
  };

  if (loading) return <div className="p-10 text-center text-slate-500 italic">Compiling your scores...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Reports</h1>
          <p className="text-slate-500 text-sm">Official terminal results and performance analytics.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-[140px] border-slate-200">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="First">First Term</SelectItem>
              <SelectItem value="Second">Second Term</SelectItem>
              <SelectItem value="Third">Third Term</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* 2. ANALYTICS MINI-DASHBOARD */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 bg-slate-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <TrendingUp size={16} /> <span className="text-xs font-medium uppercase tracking-wider">Class Average</span>
              </div>
              <div className="text-2xl font-bold">{analytics.average}%</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Award size={16} /> <span className="text-xs font-medium uppercase tracking-wider">Best Subject</span>
              </div>
              <div className="text-2xl font-bold text-indigo-600 line-clamp-1">{analytics.bestSubject}</div>
            </CardContent>
          </Card>
          <Card className="border-indigo-100 bg-indigo-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <BookOpen size={16} /> <span className="text-xs font-medium uppercase tracking-wider">Total Assessments</span>
              </div>
              <div className="text-2xl font-bold text-indigo-900">{analytics.totalAssessments}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. DETAILED SCORES TABLE */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white">
          <CardTitle className="text-lg">Terminal Broad Sheet</CardTitle>
          <CardDescription>Breakdown of CA and Examination scores for {term} Term.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6">Subject</TableHead>
                <TableHead>CA (40%)</TableHead>
                <TableHead>Exam (60%)</TableHead>
                <TableHead>Total (100%)</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right pr-6">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length > 0 ? results.map((res) => (
                <TableRow key={res._id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium pl-6 text-slate-700">{res.subject}</TableCell>
                  <TableCell>{res.caScore}</TableCell>
                  <TableCell>{res.examScore}</TableCell>
                  <TableCell className="font-bold text-slate-900">{res.totalScore}</TableCell>
                  <TableCell>
                    <Badge className={getGradeColor(res.grade)} variant="outline">
                      {res.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 italic text-slate-500 text-sm">
                    {getRemark(res.grade)}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    No results have been published for this term yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// UI Helpers for Aesthetics
function getGradeColor(grade) {
  if (['A1', 'B2', 'B3'].includes(grade)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (['C4', 'C5', 'C6'].includes(grade)) return "border-blue-200 bg-blue-50 text-blue-700";
  if (['D7', 'E8'].includes(grade)) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function getRemark(grade) {
  const remarks = {
    'A1': 'Excellent', 'B2': 'Very Good', 'B3': 'Good',
    'C4': 'Credit', 'C5': 'Credit', 'C6': 'Credit',
    'D7': 'Pass', 'E8': 'Pass', 'F9': 'Fail'
  };
  return remarks[grade] || "N/A";
}