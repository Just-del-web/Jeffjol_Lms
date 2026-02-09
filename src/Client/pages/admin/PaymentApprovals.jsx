import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Download, Search, Filter, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

export default function PaymentApprovals() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get("/api/v1/admin/pending-payments");
      setPendingPayments(res.data.data);
    } catch (err) {
      toast.error("Could not fetch pending payments");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.patch(`/api/v1/admin/approve-payment/${id}`, { status });
      toast.success(`Payment ${status === 'verified' ? 'Approved' : 'Rejected'}`);
      fetchPending();
    } catch (err) {
      toast.error("Action failed. Try again.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Verification</h1>
          <p className="text-slate-500 text-sm">Review manual bank transfer receipts from parents.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-100">
          <ShieldCheck size={18} />
          <span className="text-sm font-bold">{pendingPayments.length} Pending Approval</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input className="pl-10 bg-white" placeholder="Search by name or reference..." />
        </div>
        <Button variant="outline" className="w-full sm:w-auto"><Filter size={18} className="mr-2"/> Filter</Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6">Student / Parent</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.map((payment) => (
                <TableRow key={payment._id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{payment.studentName}</span>
                      <span className="text-[10px] text-slate-400">Parent: {payment.parentName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-slate-700 whitespace-nowrap">
                    ₦{payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none">{payment.purpose}</Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                          <Eye size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Proof of Payment - {payment.studentName}</DialogTitle>
                          <DialogDescription>Review the uploaded bank transfer receipt for verification.</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 border rounded-xl overflow-hidden bg-slate-50 p-2">
                          <img src={payment.receiptUrl} alt="Receipt Proof" className="w-full h-auto object-contain max-h-[500px] rounded-lg" />
                        </div>
                        <div className="flex justify-between items-center mt-6">
                          <Button variant="outline" size="sm" onClick={() => window.open(payment.receiptUrl, '_blank')}>
                            <Download size={14} className="mr-2"/> Download
                          </Button>
                          <span className="text-[10px] font-mono text-slate-400 tracking-wider">REF: {payment.reference}</span>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="text-right pr-6 space-x-2 whitespace-nowrap">
                    <Button size="sm" variant="ghost" className="text-rose-500" onClick={() => handleAction(payment._id, 'rejected')}><XCircle size={18} /></Button>
                    <Button size="sm" className="bg-emerald-600" onClick={() => handleAction(payment._id, 'verified')}><CheckCircle size={18} className="mr-2" /> Approve</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}