import React from "react";
import { CreditCard, History, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FamilyBursary() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold">Family Financial Ledger</h1>
        <p className="text-slate-500">Consolidated fee management for all enrolled children.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CONSOLIDATED BILLING */}
        <Card className="bg-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120}/></div>
          <CardContent className="p-8">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Total Family Balance</p>
            <h2 className="text-4xl font-bold mt-2">₦42,500.00</h2>
            <div className="mt-8 flex gap-4">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 px-8">Pay Total Balance</Button>
              <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">History</Button>
            </div>
          </CardContent>
        </Card>

        {/* CHILD-BY-CHILD BREAKDOWN */}
        <div className="space-y-4">
          <FeeDetailCard name="Chidera Nmezi" class="SS3" amount="₦12,500" status="Partial" />
          <FeeDetailCard name="Kamsi Nmezi" class="JSS2" amount="₦30,000" status="Pending" />
        </div>
      </div>
    </div>
  );
}

function FeeDetailCard({ name, amount, status }) {
  return (
    <Card className="border-slate-200 hover:border-indigo-200 transition-colors group cursor-pointer">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="font-bold text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">Outstanding: <span className="font-semibold">{amount}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={status === 'Pending' ? 'destructive' : 'outline'}>{status}</Badge>
          <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}