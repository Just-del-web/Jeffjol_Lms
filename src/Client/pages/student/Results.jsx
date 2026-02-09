import React, { useState, useEffect } from "react";
import { Download, Award, TrendingUp, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      toast.info("Preparing your PDF...");
      const response = await api.get(`/result/download-report?term=${term}&session=${session}`, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${term}_Term_Report_${session}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("Download started!");
    } catch (err) {
      toast.error("Could not generate PDF. Please contact admin.");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 italic">Processing results...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Results</h1>
          <p className="text-slate-500">Official terminal reports and class analytics.</p>
        </div>
        <div className="flex gap-3">
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="First">First Term</SelectItem>
              <SelectItem value="Second">Second Term</SelectItem>
              <SelectItem value="Third">Third Term</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} className="bg-indigo-600"><Download className="mr-2 h-4 w-4" /> PDF</Button>
        </div>
      </div>

      {analytics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-slate-400 uppercase">Average Score</p>
              <p className="text-2xl font-black text-indigo-600">{analytics.average}%</p>
            </CardContent>
          </Card>
          {/* ... Add other analytic cards as needed */}
        </div>
      )}

      <Card className="border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6">Subject</TableHead>
              <TableHead>CA (40)</TableHead>
              <TableHead>Exam (60)</TableHead>
              <TableHead>Total (100)</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((res) => (
              <TableRow key={res._id}>
                <TableCell className="font-bold pl-6">{res.subject}</TableCell>
                <TableCell>{res.caScore}</TableCell>
                <TableCell>{res.examScore}</TableCell>
                <TableCell className="font-black text-indigo-600">{res.totalScore}</TableCell>
                <TableCell><Badge variant="outline">{res.grade}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}