import React, { useState } from "react";
import { Link2, Search, User, Baby, Loader2, CheckCircle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";

export default function FamilyLinker() {
  const [loading, setLoading] = useState(false);
  const [ids, setIds] = useState({ studentId: "", parentId: "" });

  const handleLink = async () => {
    if (!ids.studentId || !ids.parentId) {
      return toast.error("Please provide both Student and Parent IDs.");
    }

    setLoading(true);
    try {
      const res = await api.patch("/admin/link-family", ids);
      toast.success(res.data.message || "Family connection established!");
      setIds({ studentId: "", parentId: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Linking failed. Check IDs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-200">
          <Link2 size={28}/>
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Family Linker</h1>
          <p className="text-slate-500 text-sm font-semibold">Establish legal pairings between students and guardians.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-400"/> Relationship Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Guardian / Parent ID</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <Input 
                value={ids.parentId}
                onChange={(e) => setIds({...ids, parentId: e.target.value})}
                placeholder="Paste Parent unique ID here..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-indigo-600 text-slate-700 font-mono text-sm" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Student / Ward ID</label>
            <div className="relative group">
              <Baby className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <Input 
                value={ids.studentId}
                onChange={(e) => setIds({...ids, studentId: e.target.value})}
                placeholder="Paste Student unique ID here..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-indigo-600 text-slate-700 font-mono text-sm" 
              />
            </div>
          </div>

          <Button 
            onClick={handleLink} 
            disabled={loading}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 font-black text-xl rounded-2xl transition-all shadow-lg shadow-indigo-200 uppercase italic tracking-tight"
          >
            {loading ? <Loader2 className="animate-spin mr-2"/> : <Link2 className="mr-2" size={22}/>}
            Link Family Profiles
          </Button>

          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <HelpCircle size={18} className="text-slate-400 shrink-0 mt-0.5"/>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
              Establishment of this link grants the designated parent read-access to the student's **academic broadsheets, financial ledgers, and terminal reports.** Ensure IDs are verified before linking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}