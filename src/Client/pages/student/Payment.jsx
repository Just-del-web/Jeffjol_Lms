import React, { useState, useEffect } from "react";
import { CreditCard, Download, Loader2, UploadCloud } from "lucide-react";
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

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const res = await api.get(`/bursary/my-balance?term=${term}&session=${session}`);
        setFinances(res.data.data);
      } catch (err) {
        toast.error("Failed to load your financial ledger.");
      } finally {
        setLoading(false);
      }
    };
    fetchFinances();
  }, [term, session]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("receipt", file);
    formData.append("purpose", `School Fees ${term} Term`);

    setIsUploading(true);
    try {
      await api.post("/payment/submit-proof", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Receipt uploaded! Awaiting Bursar verification.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-slate-500 font-medium tracking-tight">Accessing Jeffjol Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Bursary & Fees</h1>
          <p className="text-slate-500 text-sm">Session: {session} | Term: {term}</p>
        </div>
        
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
            <Button variant="outline" asChild disabled={isUploading} className="border-slate-300">
              <span className="flex items-center gap-2">
                {isUploading ? <Loader2 className="animate-spin h-4 w-4"/> : <UploadCloud size={18}/>} 
                Submit Receipt
              </span>
            </Button>
          </label>
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6">
            <CreditCard className="mr-2 h-4 w-4" /> Instant Pay
          </Button>
        </div>
      </div>

      {/* FINANCE OVERVIEW CARDS */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Billed</p>
            <div className="text-3xl font-black text-slate-900">₦{finances.totalBilled?.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmed Paid</p>
            <div className="text-3xl font-black text-emerald-600">₦{finances.totalPaid?.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white shadow-xl shadow-slate-200 rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Current Balance</p>
            <div className="text-3xl font-black italic">₦{finances.totalBalance?.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* TRANSACTION HISTORY TABLE */}
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg font-bold">Ledger Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 uppercase text-[10px] font-black">Ref No.</TableHead>
                <TableHead className="uppercase text-[10px] font-black">Description</TableHead>
                <TableHead className="uppercase text-[10px] font-black">Amount</TableHead>
                <TableHead className="uppercase text-[10px] font-black">Status</TableHead>
                <TableHead className="text-right pr-6 uppercase text-[10px] font-black">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finances.history?.length > 0 ? finances.history.map((tx) => (
                <TableRow key={tx._id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono text-[10px] text-slate-400 pl-6 uppercase">{tx.reference}</TableCell>
                  <TableCell className="font-bold text-slate-700">{tx.purpose}</TableCell>
                  <TableCell className="font-black text-slate-900">₦{tx.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={tx.status === 'verified' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'} variant="outline">
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="hover:bg-indigo-50 hover:text-indigo-600 rounded-full h-8 w-8 p-0">
                      <Download size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-400 italic">Your financial history is empty for this period.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}