import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Download, Search, Filter, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

export default function PaymentApprovals() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

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
      fetchPending(); // Refresh list
    } catch (err) {
      toast.error("Action failed. Try again.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Verification</h1>
          <p className="text-slate-500 text-sm">Review and approve manual bank transfer receipts from parents.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-100">
          <ShieldCheck size={18} />
          <span className="text-sm font-bold">{pendingPayments.length} Pending Approval</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input className="pl-10 bg-white" placeholder="Search by student name or reference..." />
        </div>
        <Button variant="outline"><Filter size={18} className="mr-2"/> Filter</Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6">Student / Parent</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Proof of Payment</TableHead>
              <TableHead className="text-right pr-6">Decision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingPayments.map((payment) => (
              <TableRow key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="pl-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{payment.studentName}</span>
                    <span className="text-xs text-slate-500">Parent: {payment.parentName}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono font-bold text-slate-700">
                  ₦{payment.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none">
                    {payment.purpose}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                        <Eye size={16} className="mr-2" /> View Receipt
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Proof of Payment - {payment.studentName}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 border rounded-lg overflow-hidden bg-slate-100">
                        <img src={payment.receiptUrl} alt="Receipt" className="w-full h-auto object-contain max-h-[500px]" />
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={() => window.open(payment.receiptUrl, '_blank')}>
                          <Download size={16} className="mr-2"/> Download
                        </Button>
                        <p className="text-xs text-slate-400 self-end">Ref: {payment.reference}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell className="text-right pr-6 space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-rose-500 hover:bg-rose-50"
                    onClick={() => handleAction(payment._id, 'rejected')}
                  >
                    <XCircle size={18} />
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleAction(payment._id, 'verified')}
                  >
                    <CheckCircle size={18} className="mr-2" /> Approve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pendingPayments.length === 0 && (
          <div className="p-20 text-center text-slate-400 italic">No pending payments to verify.</div>
        )}
      </Card>
    </div>
  );
}