import React, { useState, useEffect } from "react";
import { 
  Banknote, Calculator, Search, FileDown, 
  Settings2, Users, ArrowRightLeft, Loader2, CheckCircle2, AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

const CLASSES = [
  "Playgroup", "Pre-Nursery", "Nursery 1", "Nursery 2", "Reception",
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"
];

export default function BursaryManagement() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for Filters
  const [filters, setFilters] = useState({
    className: "JSS1",
    term: "First",
    session: "2025/2026"
  });

  // State for Fee Configuration
  const [feeConfig, setFeeConfig] = useState({
    targetClass: "",
    amount: "",
    term: "First",
    session: "2025/2026"
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { className, term, session } = filters;
      const res = await api.get(`/bursary/class-report?className=${className}&term=${term}&session=${session}`);
      setReport(res.data.data);
    } catch (err) {
      toast.error(err.message || "Failed to load financial report.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = async () => {
    if(!feeConfig.amount || !feeConfig.targetClass) return toast.error("Complete fee details.");
    try {
      await api.post("/bursary/config", feeConfig);
      toast.success(`Fee updated for ${feeConfig.targetClass}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => { fetchReport(); }, [filters]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Bursary Control</h1>
          <p className="text-slate-500 text-sm font-medium italic">Monitor class-wide revenue and manage fee structures.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold border-slate-200">
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="reports" className="rounded-lg font-bold italic uppercase text-xs">Payment Reports</TabsTrigger>
          <TabsTrigger value="config" className="rounded-lg font-bold italic uppercase text-xs">Fee Configuration</TabsTrigger>
        </TabsList>

        {/* 1. FINANCIAL REPORTS CONTENT */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Class</label>
              <Select value={filters.className} onValueChange={(v) => setFilters({...filters, className: v})}>
                <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Term</label>
              <Select value={filters.term} onValueChange={(v) => setFilters({...filters, term: v})}>
                <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="First">First Term</SelectItem>
                  <SelectItem value="Second">Second Term</SelectItem>
                  <SelectItem value="Third">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchReport} className="bg-indigo-600 rounded-xl h-10 px-6 font-black uppercase italic">
              Refresh Data
            </Button>
          </div>

          <Card className="border-slate-200 rounded-[2rem] overflow-hidden shadow-sm bg-white">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-20 text-center flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-600" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Calculating Ledger...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest">Student / Admission</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Total Owed</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Total Paid</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                      <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.length > 0 ? report.map((row, i) => (
                      <TableRow key={i} className="hover:bg-slate-50/50 border-b border-slate-50">
                        <TableCell className="pl-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 uppercase italic tracking-tighter">{row.name}</span>
                            <span className="text-[10px] font-bold text-slate-400">{row.admissionNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-slate-600 text-sm">₦{row.requiredFee?.toLocaleString()}</TableCell>
                        <TableCell className="font-bold text-emerald-600 text-sm">₦{row.totalPaid?.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`rounded-lg px-2 py-0.5 border-none font-black italic text-[9px] uppercase ${
                            row.isFullyPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {row.isFullyPaid ? "Fully Paid" : "Partial"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <span className={`font-black text-sm italic ${row.balance > 0 ? "text-rose-600" : "text-slate-300"}`}>
                            ₦{row.balance?.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">
                          No financial records for this class criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. FEE CONFIGURATION CONTENT */}
        <TabsContent value="config">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200 rounded-[2rem] bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <Settings2 className="text-indigo-600" size={18} /> Configure Class Fee
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Target Class</label>
                    <Select onValueChange={(v) => setFeeConfig({...feeConfig, targetClass: v})}>
                      <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select Class" /></SelectTrigger>
                      <SelectContent className="bg-white">
                        {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Amount (₦)</label>
                    <Input 
                      type="number"
                      placeholder="e.g. 55000"
                      className="rounded-xl border-slate-200"
                      value={feeConfig.amount}
                      onChange={(e) => setFeeConfig({...feeConfig, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Academic Term</label>
                    <Select defaultValue="First" onValueChange={(v) => setFeeConfig({...feeConfig, term: v})}>
                      <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="First">First Term</SelectItem>
                        <SelectItem value="Second">Second Term</SelectItem>
                        <SelectItem value="Third">Third Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Session</label>
                    <Input 
                      className="rounded-xl border-slate-200"
                      value={feeConfig.session}
                      onChange={(e) => setFeeConfig({...feeConfig, session: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleUpdateFee} className="w-full bg-slate-900 rounded-xl h-12 font-black italic uppercase tracking-widest mt-4">
                  Deploy Fee Structure
                </Button>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 rounded-[2rem] bg-indigo-50/30 border-2 border-dashed flex flex-col items-center justify-center p-10 text-center">
              <Calculator className="text-indigo-600 mb-4" size={48} />
              <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Automatic Billing</h3>
              <p className="text-slate-500 text-sm max-w-[280px] mt-2 font-medium">
                Fees configured here are automatically applied to all students in the target class for the selected term.
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}