import React, { useState, useEffect } from "react";
import { CreditCard, Download, Loader2, UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function StudentPayments() {
  const [finances, setFinances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [term] = useState("First");
  const [session] = useState("2025/2026");

  const fetchFinances = async () => {
    try {
      const res = await api.get(`/bursary/my-balance?term=${term}&session=${session}`);
      setFinances(res.data.data);
    } catch (err) {
      toast.error("Failed to load financial records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, [term, session]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    
    formData.append("receipt", file);
    
    formData.append("studentId", finances?.studentId || ""); 
    formData.append("amount", finances?.totalBalance || 0);
    formData.append("term", term);
    formData.append("session", session);
    formData.append("feeType", "Tuition");
    formData.append("paymentMethod", "Bank Transfer");

    setIsUploading(true);
    try {
      await api.post("/payment/submit-proof", formData); 
      
      toast.success("Receipt uploaded! Verifying with Bursar...");
      fetchFinances(); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Upload failed.";
      toast.error(errorMsg);
      console.error("Payment Upload Error:", err.response?.data);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={24} />
      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic text-center">
        Syncing Ledger...
      </p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Bursary & Fees</h1>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
            Session: {session} | <span className="text-indigo-600">Term: {term}</span>
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <label className="flex-1 md:flex-none cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
            <Button variant="outline" asChild disabled={isUploading} className="w-full h-10 rounded-xl border-slate-200 text-xs font-bold shadow-sm bg-white">
              <span className="flex items-center justify-center gap-2">
                {isUploading ? <Loader2 className="animate-spin h-3.5 w-3.5"/> : <UploadCloud size={16}/>} 
                Submit Receipt
              </span>
            </Button>
          </label>
          <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6 rounded-xl text-xs shadow-md">
            <CreditCard className="mr-2 h-3.5 w-3.5" /> Pay Online
          </Button>
        </div>
      </div>

      {/* FINANCE CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white border-none">
          <CardContent className="pt-5 pb-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Billed</p>
            <div className="text-2xl font-black text-slate-900">₦{finances?.totalBilled?.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white border-none">
          <CardContent className="pt-5 pb-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Confirmed Paid</p>
            <div className="text-2xl font-black text-emerald-600">₦{finances?.totalPaid?.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white shadow-lg rounded-2xl border-none relative overflow-hidden">
          <CardContent className="pt-5 pb-5 relative z-10">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Outstanding Balance</p>
            <div className="text-2xl font-black italic">₦{finances?.totalBalance?.toLocaleString()}</div>
            {finances?.totalBalance <= 0 && (
              <CheckCircle2 className="absolute top-4 right-4 text-emerald-500 opacity-50" size={24}/>
            )}
          </CardContent>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mb-10 blur-2xl" />
        </Card>
      </div>

      {/* TABLE */}
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-white border-none">
        <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
          <CardTitle className="text-sm font-black uppercase italic tracking-tighter text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600"/> Ledger Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="pl-6 uppercase text-[9px] font-black h-12">Reference</TableHead>
                <TableHead className="uppercase text-[9px] font-black h-12">Description</TableHead>
                <TableHead className="uppercase text-[9px] font-black h-12">Amount</TableHead>
                <TableHead className="uppercase text-[9px] font-black h-12 text-center">Status</TableHead>
                <TableHead className="text-right pr-6 uppercase text-[9px] font-black h-12">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finances?.history?.length > 0 ? finances.history.map((tx) => (
                <TableRow key={tx._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                  <TableCell className="font-mono text-[10px] text-slate-400 pl-6 py-4 uppercase">
                    {tx.transactionReference?.slice(-8) || tx._id.slice(-8)}
                  </TableCell>
                  <TableCell className="font-bold text-slate-700 text-xs uppercase tracking-tight">
                    {tx.feeType}
                  </TableCell>
                  <TableCell className="font-black text-slate-900 text-sm">
                    ₦{tx.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      className={`rounded-lg px-2 py-0.5 font-black italic border-none text-[10px] uppercase ${
                        tx.status === 'verified' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : tx.status === 'rejected'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                      }`} 
                      variant="outline"
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-indigo-50 hover:text-indigo-600 rounded-full h-8 w-8 p-0"
                      onClick={() => window.open(tx.proofOfPayment, '_blank')}
                    >
                      <Download size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50/30">
                    Your financial history is empty.
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