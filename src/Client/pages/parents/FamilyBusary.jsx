import React, { useState, useEffect } from "react";
import { CreditCard, History, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function FamilyBursary() {
  const [familyFinances, setFamilyFinances] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyFinances = async () => {
      try {
        const childrenRes = await api.get("/parent/linked-children");
        const children = childrenRes.data.data;

        const financePromises = children.map(child => 
          api.get(`/bursary/my-balance?studentId=${child._id}`)
        );
        
        const financeResults = await Promise.all(financePromises);
        
        const combinedData = children.map((child, index) => ({
          ...child,
          finance: financeResults[index].data.data
        }));

        // 4. Calculate total family debt
        const total = combinedData.reduce((acc, curr) => acc + curr.finance.totalBalance, 0);

        setFamilyFinances(combinedData);
        setTotalBalance(total);
      } catch (err) {
        toast.error("Failed to compile family financial records.");
      } finally {
        setLoading(false);
      }
    };
    fetchFamilyFinances();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-slate-500 font-medium">Consolidating Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Family Financial Ledger</h1>
          <p className="text-slate-500 text-sm">Consolidated fee management for all enrolled children.</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3">
          <ShieldCheck size={14} className="mr-1"/> All Accounts Secure
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CONSOLIDATED BILLING */}
        <Card className="bg-slate-900 text-white shadow-2xl relative overflow-hidden rounded-3xl border-none">
          <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={150}/></div>
          <CardContent className="p-10 relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Family Balance</p>
            <h2 className="text-5xl font-black mt-2 italic">₦{totalBalance.toLocaleString()}.00</h2>
            <div className="mt-10 flex gap-4">
              <Button className="bg-white text-slate-900 hover:bg-slate-200 px-8 font-bold rounded-xl">
                Clear Family Debt
              </Button>
              <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 rounded-xl">
                <History size={18} className="mr-2"/> Global History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CHILD-BY-CHILD BREAKDOWN */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Breakdown by Child</p>
          {familyFinances.map((item) => (
            <FeeDetailCard 
              key={item._id}
              name={`${item.firstName} ${item.lastName}`} 
              currentClass={item.finance.targetClass || "N/A"} 
              amount={`₦${item.finance.totalBalance.toLocaleString()}`} 
              status={item.finance.totalBalance === 0 ? "Cleared" : "Outstanding"} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeeDetailCard({ name, currentClass, amount, status }) {
  return (
    <Card className="border-slate-200 hover:border-indigo-200 transition-all group cursor-pointer rounded-2xl shadow-sm hover:shadow-md">
      <CardContent className="p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${status === 'Cleared' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {name[0]}
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm uppercase tracking-tighter">{name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{currentClass} • {amount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={status === 'Cleared' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}
          >
            {status}
          </Badge>
          <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
}