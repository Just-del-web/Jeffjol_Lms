import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, ListChecks, Loader2, CheckCircle, 
  Settings2, Calendar, Layout, Trash2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";

export default function ScheduleExam() {
  const [loading, setLoading] = useState(false);
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    duration: 60,
    startTime: "",
    endTime: "",
    targetClass: "",
    term: "First",      
    session: "2025/2026"
  });

  const [settings, setSettings] = useState({
    sebRequired: false, 
    shuffleQuestions: true,
    allowBacktrack: true
  });

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await api.get("/exam/questions/all");
        setQuestionBank(res.data.data);
      } catch (err) {
        toast.error("Failed to load question bank");
      }
    };
    fetchBank();
  }, []);

  const toggleQuestion = (id) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    // 1. Rigorous Validation
    if (!formData.title || !formData.targetClass || selectedQuestions.length === 0) {
      return toast.error("Provide Title, Target Class, and at least one Question.");
    }

    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();

    if (end <= start) {
      return toast.error("Closure time must be later than the Start time.");
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ...settings,
        targetClass: formData.targetClass.trim().toUpperCase(), // Sanitization
        questionIds: selectedQuestions, // Mapping to backend expectation
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        status: 'published' // Auto-publish
      };

      await api.post("/exam/create-paper", payload);
      toast.success(`${formData.title.toUpperCase()} is now LIVE for ${formData.targetClass.toUpperCase()}`);
      
      // Reset Form for next paper
      setFormData({ title: "", subject: "", duration: 60, startTime: "", endTime: "", targetClass: "" });
      setSelectedQuestions([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Internal server error during scheduling.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-1000">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Badge className="bg-indigo-600 mb-2 uppercase italic font-black">Admin Panel</Badge>
          <h1 className="text-4xl font-black italic text-slate-900 tracking-tighter uppercase leading-none">
            Schedule <span className="text-indigo-600">Exam</span>
          </h1>
          <p className="text-slate-400 font-medium italic mt-1 uppercase text-[10px] tracking-widest">
            Jeffjol CBT Proctoring Engine v2.0
          </p>
        </div>
        <Button 
          onClick={handlePublish} 
          disabled={loading}
          className="bg-slate-900 hover:bg-indigo-700 h-14 px-12 rounded-2xl font-black uppercase italic tracking-tighter shadow-xl transition-all"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : "Deploy Paper"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* LEFT: BASIC CONFIG */}
        <Card className="md:col-span-8 border-none rounded-[2.5rem] shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <div className="flex items-center gap-2">
              <Layout className="text-indigo-600" size={20} />
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Core Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Exam Title</Label>
                <Input 
                  className="rounded-2xl h-14 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                  placeholder="e.g., First Term Examination" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject Category</Label>
                <Input 
                  className="rounded-2xl h-14 bg-slate-50 border-none font-bold" 
                  placeholder="Mathematics" 
                  value={formData.subject} 
                  onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Minutes</Label>
                <Input type="number" className="rounded-2xl h-14 bg-slate-50 border-none font-bold" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Class</Label>
                <Input className="rounded-2xl h-14 bg-slate-50 border-none font-bold" placeholder="SS3" value={formData.targetClass} onChange={(e) => setFormData({...formData, targetClass: e.target.value})} />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Exam Start Window</Label>
                <Input type="datetime-local" className="rounded-2xl h-14 bg-slate-50 border-none font-bold" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-rose-400 tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Auto-Submit Deadline (End Time)
              </Label>
              <Input type="datetime-local" className="rounded-2xl h-14 bg-rose-50/50 border-rose-100 font-bold text-rose-900" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: PROCTORING & STATS */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-100 overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 opacity-80">
                <ShieldCheck size={18} /> Proctoring & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                <Label className="text-[11px] uppercase font-black italic">SEB Required</Label>
                <Switch checked={settings.sebRequired} onCheckedChange={(v) => setSettings({...settings, sebRequired: v})} className="data-[state=checked]:bg-white" />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                <Label className="text-[11px] uppercase font-black italic">Shuffle Items</Label>
                <Switch checked={settings.shuffleQuestions} onCheckedChange={(v) => setSettings({...settings, shuffleQuestions: v})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                <Label className="text-[11px] uppercase font-black italic">Allow Backtrack</Label>
                <Switch checked={settings.allowBacktrack} onCheckedChange={(v) => setSettings({...settings, allowBacktrack: v})} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center justify-center text-center group">
              <div className="p-5 bg-indigo-50 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                <ListChecks size={32} className="text-indigo-600" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Items Added</p>
              <h2 className="text-5xl font-black italic text-slate-900 mt-1">{selectedQuestions.length}</h2>
          </Card>
        </div>
      </div>

      {/* SELECTION AREA */}
      <Card className="border-none rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-slate-200/50">
        <CardHeader className="bg-slate-50/50 border-b p-8 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Settings2 className="text-indigo-600" size={20} />
             </div>
             <div>
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Question Selection</CardTitle>
                <CardDescription className="font-bold italic text-slate-400 text-[10px] uppercase">Review active items in this paper.</CardDescription>
             </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-12 px-8 border-slate-200 font-black uppercase italic text-xs tracking-tighter hover:bg-slate-50 transition-all">
                Add Questions From Bank
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-slate-900 text-white">
                <DialogTitle className="font-black uppercase italic text-2xl tracking-tighter">Question Selector</DialogTitle>
                <p className="text-slate-400 text-xs font-medium italic mt-1">Select questions to attach to {formData.title || 'Untitled Paper'}</p>
              </DialogHeader>
              <div className="p-8 max-h-[60vh] overflow-y-auto bg-slate-50 grid gap-4">
                {questionBank.length > 0 ? questionBank.map((q) => (
                  <div key={q._id} 
                       onClick={() => toggleQuestion(q._id)}
                       className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${selectedQuestions.includes(q._id) ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-transparent bg-white hover:border-slate-200'}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-indigo-100 text-indigo-500">{q.subject}</Badge>
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-100 text-slate-400">{q.difficulty || 'Normal'}</Badge>
                      </div>
                      <p className="font-bold text-slate-800 text-sm leading-relaxed">{q.text}</p>
                    </div>
                    {selectedQuestions.includes(q._id) ? (
                      <CheckCircle className="text-indigo-600 fill-indigo-50" size={28} />
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-slate-100 group-hover:border-indigo-200" />
                    )}
                  </div>
                )) : (
                  <p className="text-center py-10 font-black uppercase italic text-slate-300">Question Bank is Empty</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-12 text-center bg-slate-50/20">
             {selectedQuestions.length === 0 ? (
                <div className="opacity-20 flex flex-col items-center">
                  <Layout className="mb-4" size={60} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Paper Canvas Empty</p>
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {selectedQuestions.map((id, index) => (
                    <div key={id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                      <span className="font-black italic text-indigo-600 text-xs">#{index + 1}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleQuestion(id)}
                        className="h-8 w-8 p-0 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}