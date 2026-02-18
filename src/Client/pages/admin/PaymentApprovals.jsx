import React, { useState, useEffect } from "react";
import { 
  CheckCircle, XCircle, Eye, Download, Search, Filter, ShieldCheck, Loader2 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api"; 

export default function PaymentApprovals() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { 
    fetchPending(); 
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get("/payment/pending");
      // res.data.data is the array returned by the controller
      setPendingPayments(res.data.data || []);
    } catch (err) {
      console.error("Payment Fetch Error:", err);
      toast.error("Could not fetch records.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.patch(`/payment/verify/${id}`, { status });
      toast.success(`Payment ${status === 'verified' ? 'Approved' : 'Rejected'}`);
      fetchPending();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  // UPDATED FILTER: Matches backend fields
  const filteredPayments = pendingPayments.filter(p => {
    const studentFullName = `${p.student?.firstName} ${p.student?.lastName}`.toLowerCase();
    return studentFullName.includes(searchTerm.toLowerCase()) ||
           p.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-slate-400 font-bold uppercase tracking-tighter italic">Scanning Bursary Records...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black italic text-slate-900 tracking-tighter uppercase">
            Bursary <span className="text-indigo-600">Verification</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium italic">Confirm manual bank transfer receipts.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl border border-amber-100">
          <ShieldCheck size={18} />
          <span className="text-sm font-black uppercase tracking-tighter">
            {pendingPayments.length} Pending
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            className="pl-10 bg-white rounded-xl border-slate-200" 
            placeholder="Search student or reference..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Student</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Amount</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Fee Type</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Proof</TableHead>
                <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                <TableRow key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 italic tracking-tighter uppercase">
                        {payment.student?.firstName} {payment.student?.lastName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Ref: {payment.transactionReference}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black italic text-slate-700 whitespace-nowrap text-sm">
                    ₦{payment.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold uppercase text-[9px] tracking-widest">
                      {payment.feeType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 rounded-xl">
                          <Eye size={18} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl rounded-3xl bg-white">
                        <DialogHeader>
                          <DialogTitle className="font-black uppercase italic tracking-tighter">Receipt Verification</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 border rounded-2xl overflow-hidden bg-slate-50 p-2">
                          <img 
                            src={payment.proofOfPayment} 
                            alt="Receipt" 
                            className="w-full h-auto object-contain max-h-[500px] rounded-xl" 
                          />
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button 
                            variant="outline" 
                            className="rounded-xl font-bold uppercase text-xs h-9" 
                            onClick={() => window.open(payment.proofOfPayment, '_blank')}
                          >
                            <Download size={14} className="mr-2"/> View Full Size
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="text-right pr-6 space-x-2 whitespace-nowrap">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-rose-500 hover:bg-rose-50 rounded-xl h-9" 
                      onClick={() => handleAction(payment._id, 'rejected')}
                    >
                      <XCircle size={20} />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold uppercase tracking-tighter italic h-9" 
                      onClick={() => handleAction(payment._id, 'verified')}
                    >
                      <CheckCircle size={16} className="mr-2" /> Approve
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">
                    No pending verifications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}