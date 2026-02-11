import React, { useState, useEffect } from "react";
import { ShieldCheck, ListChecks, Loader2, CheckCircle, Search } from "lucide-react";
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
  });

  const [settings, setSettings] = useState({
    sebRequired: true,
    shuffleQuestions: true,
    allowBacktrack: false
  });

  // 1. Fetch Question Bank to populate picker
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await api.get("/exam/questions/all");
        setQuestionBank(res.data.data);
      } catch (err) {
        console.error("Failed to load questions");
      }
    };
    fetchBank();
  }, []);

  const toggleQuestion = (id) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  // 2. Publish Exam Logic
  const handlePublish = async () => {
    if (!formData.title || selectedQuestions.length === 0) {
      return toast.error("Please provide a title and select at least one question.");
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ...settings,
        questions: selectedQuestions,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      await api.post("/exam/create-paper", payload);
      toast.success("Examination has been scheduled and published!");
      
      // Reset Form
      setFormData({ title: "", subject: "", duration: 60, startTime: "", endTime: "", targetClass: "" });
      setSelectedQuestions([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase">
            Schedule <span className="text-indigo-600">Assessment</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Configure security, timing, and question selection.</p>
        </div>
        <Button 
            onClick={handlePublish} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 h-14 px-10 rounded-2xl font-black uppercase italic tracking-tighter shadow-lg shadow-indigo-100"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : "Publish Exam"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* BASIC INFO */}
        <Card className="md:col-span-2 border-slate-200 rounded-[2rem] overflow-hidden shadow-xl bg-white">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Examination Details</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Exam Title</Label>
                <Input className="rounded-xl h-12" placeholder="Mid-Term Assessment" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Subject</Label>
                <Input className="rounded-xl h-12" placeholder="Mathematics" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Duration (Mins)</Label>
                <Input type="number" className="rounded-xl h-12" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Target Class</Label>
                <Input className="rounded-xl h-12" placeholder="SS3" value={formData.targetClass} onChange={(e) => setFormData({...formData, targetClass: e.target.value})} />
              </div>
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Start Time</Label>
                <Input type="datetime-local" className="rounded-xl h-12" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Closure Time (Auto-Submit)</Label>
                <Input type="datetime-local" className="rounded-xl h-12" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        {/* SECURITY & PROCTORING */}
        <div className="space-y-6">
            <Card className="border-indigo-100 bg-indigo-50/20 rounded-[2rem] overflow-hidden">
            <CardHeader>
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-indigo-900">
                <ShieldCheck className="text-indigo-600" size={18} /> Proctoring Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-black text-slate-500">Safe Exam Browser</Label>
                <Switch checked={settings.sebRequired} onCheckedChange={(v) => setSettings({...settings, sebRequired: v})} />
                </div>
                <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-black text-slate-500">Shuffle Items</Label>
                <Switch checked={settings.shuffleQuestions} onCheckedChange={(v) => setSettings({...settings, shuffleQuestions: v})} />
                </div>
                <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-black text-slate-500">Allow Backtrack</Label>
                <Switch checked={settings.allowBacktrack} onCheckedChange={(v) => setSettings({...settings, allowBacktrack: v})} />
                </div>
            </CardContent>
            </Card>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Questions Selected</p>
                <p className="text-3xl font-black italic text-indigo-600">{selectedQuestions.length}</p>
            </div>
        </div>
      </div>

      {/* QUESTION PICKER DIALOG */}
      <Card className="border-slate-200 rounded-[2rem] overflow-hidden bg-white shadow-xl">
        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Question Selection</CardTitle>
            <CardDescription className="text-xs font-medium italic">Filter and pick items from the {formData.subject || 'Subject'} bank.</CardDescription>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl h-10 border-indigo-200 text-indigo-600 font-bold uppercase text-[10px] tracking-widest">
                    <ListChecks className="mr-2 h-4 w-4" /> Open Picker
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-black uppercase italic tracking-tighter">Question Picker</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {questionBank.map((q) => (
                        <div key={q._id} 
                             onClick={() => toggleQuestion(q._id)}
                             className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedQuestions.includes(q._id) ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200'}`}
                        >
                            <div className="space-y-1">
                                <Badge variant="outline" className="text-[9px] uppercase font-black">{q.subject}</Badge>
                                <p className="font-bold text-slate-800 italic uppercase tracking-tight">{q.text}</p>
                            </div>
                            {selectedQuestions.includes(q._id) && <CheckCircle className="text-indigo-600" size={20} />}
                        </div>
                    ))}
                </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-12 text-center bg-slate-50/30">
             {selectedQuestions.length === 0 ? (
                 <>
                    <ListChecks className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No questions have been attached to this paper.</p>
                 </>
             ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                    {selectedQuestions.map(id => (
                        <Badge key={id} className="bg-indigo-600 px-4 py-2 rounded-lg">Item {id.slice(-4)}</Badge>
                    ))}
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}