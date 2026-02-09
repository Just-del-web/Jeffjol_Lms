import React, { useState, useEffect } from "react";
import { Download, Loader2, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function ChildResults() {
  const [children, setChildren] = useState([]); 
  const [selectedChild, setSelectedChild] = useState("");
  const [results, setResults] = useState([]);
  const [term, setTerm] = useState("First");
  const [session] = useState("2025/2026");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkedChildren = async () => {
      try {
        const res = await api.get("/parent/linked-children"); 
        setChildren(res.data.data);
        if (res.data.data.length > 0) setSelectedChild(res.data.data[0]._id);
      } catch (err) {
        console.error("Failed to load children list");
      }
    };
    fetchLinkedChildren();
  }, []);

  useEffect(() => {
    if (!selectedChild) return;

    const fetchChildPerformance = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/result/my-history?childId=${selectedChild}&term=${term}&session=${session}`);
      
        setResults(res.data.data.history || res.data.data); 
      } catch (err) {
        toast.error("Could not retrieve academic records.");
      } finally {
        setLoading(false);
      }
    };
    fetchChildPerformance();
  }, [selectedChild, term, session]);

  const handleDownloadPDF = async () => {
    try {
      toast.info("Generating report card...");
      const res = await api.get(`/result/download-report?childId=${selectedChild}&term=${term}&session=${session}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report_Card_${term}_Term.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error("PDF generation failed.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">ACADEMIC PERFORMANCE</h1>
          <p className="text-slate-500 text-sm font-medium">Monitoring terminal progress and reports.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[200px] bg-white border-slate-200">
              <SelectValue placeholder="Select Ward" />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child._id} value={child._id}>{child.firstName} {child.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="First">First Term</SelectItem>
              <SelectItem value="Second">Second Term</SelectItem>
              <SelectItem value="Third">Third Term</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleDownloadPDF} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
            <Download size={16} className="mr-2" /> Download
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg font-bold">Terminal Broadsheet View</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="animate-spin text-indigo-600" />
              <p className="text-slate-400 italic text-sm">Fetching records from archive...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="pl-6 font-bold text-[10px] uppercase">Subject</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase">CA (40)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase">Exam (60)</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase">Total</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase">Grade</TableHead>
                  <TableHead className="text-right pr-6 font-bold text-[10px] uppercase">Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length > 0 ? results.map((res) => (
                  <TableRow key={res._id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-slate-700 pl-6">{res.subject}</TableCell>
                    <TableCell>{res.caScore}</TableCell>
                    <TableCell>{res.examScore}</TableCell>
                    <TableCell className="font-black text-indigo-600">{res.totalScore}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        {res.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 italic text-slate-500 text-xs">
                      {res.remark || "Satisfactory"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <FileWarning className="mb-2 opacity-20" size={32}/>
                        No results published for this term yet.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}