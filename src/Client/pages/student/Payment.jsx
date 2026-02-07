import React, { useState, useEffect } from "react";
import { CreditCard, Receipt, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

export default function StudentPayments() {
  const [finances, setFinances] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const res = await axios.get("/api/v1/bursary/my-balance", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setFinances(res.data.data);
      } catch (err) {
        console.error("Failed to load financial data");
      } finally {
        setLoading(false);
      }
    };
    fetchFinances();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading ledger...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bursary & Fees</h1>
          <p className="text-slate-500">Manage your tuition, levies, and payment history.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <CreditCard className="mr-2 h-4 w-4" /> Pay Outstanding Fees
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Total Billed</p>
            <div className="text-2xl font-bold text-slate-900">₦{finances.totalBilled.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Total Paid</p>
            <div className="text-2xl font-bold text-emerald-600">₦{finances.totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-400">Balance Due</p>
            <div className="text-2xl font-bold">₦{finances.totalBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Reference</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finances.history.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell className="font-mono text-xs text-slate-500">{tx.reference}</TableCell>
                  <TableCell className="font-medium">{tx.purpose}</TableCell>
                  <TableCell>₦{tx.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'verified' ? 'success' : 'outline'}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}