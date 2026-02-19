import React, { useState, useEffect } from "react";
import { 
  CreditCard, Download, Loader2, UploadCloud, FileText, CheckCircle2, 
  Landmark, Wallet, History, ShieldCheck, Banknote, FileCheck 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function StudentPayments() {
  const [finances, setFinances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [term] = useState("First");
  const [session] = useState("2025/2026");

  const fetchFinances = async () => {
    try {
      const res = await api.get(`/bursary/my-balance?term=${term}&session=${session}`);
      setFinances(res.data.data);
      if (res.data.data?.totalBalance > 0) {
        setPaymentAmount(res.data.data.totalBalance.toString());
      }
    } catch (err) {
      toast.error(err.message || "Failed to load records.");
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
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      return toast.error("Please enter the specific amount on your receipt.");
    }

    const formData = new FormData();
    formData.append("receipt", file);
    formData.append("amount", paymentAmount);
    formData.append("term", term);
    formData.append("session", session);
    formData.append("feeType", "Tuition");
    formData.append("paymentMethod", "Bank Transfer");

    const uploadToast = toast.loading("Submitting teller to Bursary...");
    setIsUploading(true);

    try {
      await api.post("/payment/submit-proof", formData); 
      toast.success("Receipt submitted! Confirmed Paid will update once verified.", { id: uploadToast });
      setPaymentAmount(""); 
      fetchFinances(); 
    } catch (err) {
      toast.error(err.message || "Upload failed.", { id: uploadToast });
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  // NEW: HANDLE OFFICIAL RECEIPT DOWNLOAD
  const handleDownloadOfficialReceipt = async (paymentId) => {
    try {
      toast.info("Generating your official school receipt...");
      const response = await api.get(`/payment/receipt/${paymentId}`, {
        responseType: 'blob', // Important for PDF downloads
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Official_Receipt_${paymentId.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error("Receipt generation failed. Please contact the Bursar.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-slate-400 text-xs font-black uppercase tracking-tighter italic">Syncing Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Bursary <span className="text-indigo-600">Portal</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Official Financial Record — {session}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-end">
          <div className="relative w-full sm:w-48">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              type="number"
              placeholder="Enter Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="pl-10 h-12 rounded-2xl border-slate-200 font-bold"
            />
          </div>

          <label className="w-full sm:w-auto cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
            <Button variant="outline" asChild disabled={isUploading} className="w-full h-12 rounded-2xl border-slate-200 font-black italic uppercase text-xs tracking-tighter">
              <span className="flex items-center justify-center gap-2">
                {isUploading ? <Loader2 className="animate-spin h-4 w-4"/> : <UploadCloud size={18}/>} 
                Upload Teller
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* FINANCE CARDS GRID */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-100 shadow-sm rounded-[2rem] bg-white">
          <CardContent className="p-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Billed</p>
            <div className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
              ₦{finances?.totalBilled?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm rounded-[2rem] bg-emerald-50/20">
          <CardContent className="p-8">
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-2">Confirmed Paid</p>
            <div className="text-3xl font-black text-emerald-600 tracking-tighter italic uppercase">
              ₦{finances?.totalPaid?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white shadow-2xl rounded-[2rem] relative overflow-hidden">
          <CardContent className="p-8 relative z-10">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Outstanding Balance</p>
            <div className="text-3xl font-black italic tracking-tighter uppercase">
              ₦{finances?.totalBalance?.toLocaleString() || '0'}
            </div>
          </CardContent>
          <Wallet className="absolute -bottom-8 -right-8 text-white/5" size={160} />
        </Card>
      </div>

      {/* LEDGER TABLE */}
      <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b py-5 px-8">
          <CardTitle className="text-xs font-black uppercase italic tracking-widest text-slate-800 flex items-center gap-2">
            <History size={18} className="text-indigo-600"/> Terminal Ledger History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b bg-white">
                <TableHead className="pl-8 uppercase text-[10px] font-black h-14">Reference</TableHead>
                <TableHead className="uppercase text-[10px] font-black h-14">Category</TableHead>
                <TableHead className="uppercase text-[10px] font-black h-14 text-right">Amount</TableHead>
                <TableHead className="uppercase text-[10px] font-black h-14 text-center">Status</TableHead>
                <TableHead className="uppercase text-[10px] font-black h-14 text-center">Official Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finances?.history?.length > 0 ? finances.history.map((tx) => (
                <TableRow key={tx._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                  <TableCell className="pl-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-slate-400 uppercase">{tx.transactionReference}</span>
                      <span className="text-[9px] font-bold text-slate-300">{new Date(tx.createdAt).toDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-slate-700 text-xs uppercase italic tracking-tighter">
                    {tx.feeType}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-black text-slate-900 text-sm italic">₦{tx.amount?.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`rounded-lg px-2.5 py-1 font-black italic border-none text-[9px] uppercase ${
                        tx.status === 'verified' ? 'bg-emerald-50 text-emerald-700' : 
                        tx.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {tx.status === 'verified' ? (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDownloadOfficialReceipt(tx._id)}
                        className="text-indigo-600 hover:bg-indigo-50 font-black italic uppercase text-[10px] tracking-tighter h-8 rounded-xl"
                      >
                        <FileCheck size={14} className="mr-1.5" /> Get Receipt
                      </Button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase italic">Pending Auth</span>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest bg-slate-50/20">
                    No transactions recorded.
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