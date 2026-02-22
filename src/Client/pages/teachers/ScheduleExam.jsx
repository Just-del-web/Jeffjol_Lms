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
  console.log("🛠 COMPONENT RENDERED: ScheduleExam");

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
        setQuestionBank(res.data.data || []);
      } catch (err) {
        console.error("Failed to load bank", err);
      }
    };
    fetchBank();
  }, []);

  const toggleQuestion = (id) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handlePublish = async (e) => {
    // Prevent default form behavior if applicable
    if(e) e.preventDefault();
    
    console.log("⚡ BUTTON CLICKED: handlePublish");

    // Basic internal check
    if (selectedQuestions.length === 0) {
      alert("Error: No questions selected.");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      alert("Error: Start or End time is missing.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ...settings,
        questionIds: selectedQuestions,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        status: 'published'
      };

      console.log("📡 SENDING PAYLOAD:", payload);

      const res = await api.post("/exam/create-paper", payload);
      
      console.log("✅ SERVER RESPONSE:", res.data);
      toast.success("Exam Deployed Successfully!");
      
      // Cleanup
      setSelectedQuestions([]);
      setFormData({ ...formData, title: "", startTime: "", endTime: "" });

    } catch (err) {
      console.error("❌ API ERROR:", err);
      const msg = err.response?.data?.message || "Check server console for errors.";
      toast.error(msg);
      alert("API Failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Badge className="bg-indigo-600 mb-2 uppercase italic font-black">Teacher Panel</Badge>
          <h1 className="text-4xl font-black italic text-slate-900 tracking-tighter uppercase leading-none">
            Deploy <span className="text-indigo-600">Exam</span>
          </h1>
        </div>
        <Button 
          type="button"
          onClick={handlePublish} 
          disabled={loading}
          className="bg-slate-900 hover:bg-indigo-700 h-14 px-12 rounded-2xl font-black uppercase italic shadow-xl transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Deploy Now"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* CONFIG CARD */}
        <Card className="md:col-span-8 border-none rounded-[2.5rem] shadow-2xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b p-8">
             <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Exam Parameters</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Title</Label>
                <Input className="rounded-xl h-12 bg-slate-50 border-none font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Class</Label>
                <Input className="rounded-xl h-12 bg-slate-50 border-none font-bold" placeholder="SS3" value={formData.targetClass} onChange={(e) => setFormData({...formData, targetClass: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Start Time</Label>
                <Input type="datetime-local" className="rounded-xl h-12 bg-slate-50 border-none font-bold" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-rose-400">End Time</Label>
                <Input type="datetime-local" className="rounded-xl h-12 bg-rose-50 border-none font-bold" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Subject</Label>
                <Input className="rounded-xl h-12 bg-slate-50 border-none font-bold" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
              </div>
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Term</Label>
                <Input className="rounded-xl h-12 bg-slate-50 border-none font-bold" value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})} />
              </div>
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Duration (Min)</Label>
                <Input type="number" className="rounded-xl h-12 bg-slate-50 border-none font-bold" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECURITY CARD */}
        <Card className="md:col-span-4 border-none bg-indigo-600 text-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100">
           <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-6"><ShieldCheck size={18} /> Proctoring</CardTitle>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                <Label className="text-[10px] uppercase font-black">SEB Required</Label>
                <Switch checked={settings.sebRequired} onCheckedChange={(v) => setSettings({...settings, sebRequired: v})} />
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[2rem] mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Items Selected</p>
                <h3 className="text-5xl font-black text-indigo-600">{selectedQuestions.length}</h3>
              </div>
           </div>
        </Card>
      </div>

      {/* BANK SELECTION */}
      <Card className="border-none rounded-[2.5rem] bg-white shadow-2xl overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8 flex flex-row items-center justify-between">
           <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Question Selector</CardTitle>
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl bg-white/10 border-white/20 text-white font-bold text-[10px] uppercase">Browse Question Bank</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="p-8 bg-slate-900 text-white"><h2 className="text-2xl font-black uppercase italic">Pick Questions</h2></div>
                <div className="p-8 max-h-[60vh] overflow-y-auto bg-slate-50 space-y-3">
                   {questionBank.map(q => (
                     <div key={q._id} onClick={() => toggleQuestion(q._id)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedQuestions.includes(q._id) ? 'border-indigo-600 bg-white' : 'border-transparent bg-white'}`}>
                        <p className="font-bold text-slate-800 text-sm">{q.text}</p>
                        {selectedQuestions.includes(q._id) && <CheckCircle className="text-indigo-600" />}
                     </div>
                   ))}
                </div>
            </DialogContent>
           </Dialog>
        </CardHeader>
      </Card>
    </div>
  );
}