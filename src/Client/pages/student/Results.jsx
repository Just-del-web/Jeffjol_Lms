import React, { useState, useEffect } from "react";
import { Download, Award, TrendingUp, BookOpen, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [term, setTerm] = useState("First");
  const [session, setSession] = useState("2025/2026");
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Backend now respects term/session query params
      const res = await api.get(`/result/my-history?term=${term}&session=${session}`);
      setResults(res.data.data.history || []);
      setAnalytics(res.data.data.analytics);
    } catch (err) {
      toast.error("Failed to load academic records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); }, [term, session]);

  const handleDownload = async () => {
    try {
      toast.info("Preparing official report...");
      const response = await api.get(`/result/download-report?term=${term}&session=${session}`, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${term}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("Downloaded.");
    } catch (err) {
      toast.error("Generation failed.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={24} />
      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Syncing Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER SECTION - Standardized Sizes */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Academic Vault</h1>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
            {session} Session | <span className="text-indigo-600">{term} Term</span>
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="flex-1 md:w-[140px] h-10 rounded-xl font-bold bg-white border-slate-200 text-xs shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="First">First Term</SelectItem>
              <SelectItem value="Second">Second Term</SelectItem>
              <SelectItem value="Third">Third Term</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 h-10 rounded-xl text-xs shadow-md">
            <Download className="mr-2 h-3.5 w-3.5" /> PDF Export
          </Button>
        </div>
      </div>

      {/* ANALYTICS CARDS - Reduced Padding */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 text-white shadow-lg rounded-2xl border-none">
          <CardContent className="pt-5 pb-5">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Term Average</p>
            <div className="text-2xl font-black italic">{analytics?.average || 0}%</div>
            <TrendingUp className="absolute top-4 right-4 opacity-10" size={24}/>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="pt-5 pb-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Subjects</p>
            <div className="text-2xl font-black text-slate-900">{results.length}</div>
            <BookOpen className="absolute top-4 right-4 text-slate-50" size={24}/>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardContent className="pt-5 pb-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
            <div className={`text-2xl font-black italic ${analytics?.average >= 50 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {analytics?.average >= 50 ? 'PASSED' : 'PENDING'}
            </div>
            <Award className="absolute top-4 right-4 text-slate-50" size={24}/>
          </CardContent>
        </Card>
      </div>

      {/* RESULTS TABLE - Precise Typography */}
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-white">
        <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
          <CardTitle className="text-sm font-black uppercase italic tracking-tighter text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600"/> Terminal Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="pl-6 uppercase text-[9px] font-black h-12">Subject</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-center h-12">CA (40)</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-center h-12">Exam (60)</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-center h-12">Total</TableHead>
                <TableHead className="text-right pr-6 uppercase text-[9px] font-black h-12">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length > 0 ? results.map((res) => (
                <TableRow key={res._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                  <TableCell className="font-bold text-slate-700 pl-6 py-4 uppercase italic tracking-tight text-xs">
                    {res.subject}
                  </TableCell>
                  <TableCell className="text-center text-xs font-bold text-slate-400">{res.caScore}</TableCell>
                  <TableCell className="text-center text-xs font-bold text-slate-400">{res.examScore}</TableCell>
                  <TableCell className="text-center">
                    <div className={`text-base font-black italic ${res.totalScore >= 50 ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {res.totalScore}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Badge 
                      className={`rounded-lg px-2 py-0.5 font-black italic border-none text-[10px] ${
                        res.totalScore >= 50 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                      }`} 
                      variant="outline"
                    >
                      {res.grade}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    No verified records.
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