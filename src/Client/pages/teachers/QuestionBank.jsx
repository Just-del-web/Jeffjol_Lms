import React, { useState, useEffect } from "react";
import { Plus, Search, HelpCircle, Trash2, Edit3, Filter, Loader2, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api"; 

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    subject: "",
    difficulty: "medium",
    correctAnswer: "A",
    options: [
      { letter: "A", text: "" }, 
      { letter: "B", text: "" }, 
      { letter: "C", text: "" }, 
      { letter: "D", text: "" }
    ]
  });

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/exam/questions/all");
      setQuestions(res.data.data);
    } catch (err) {
      toast.error("Failed to sync with Question Bank");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleOptionChange = (index, text) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index].text = text;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const saveQuestion = async () => {
    // 1. FRONTEND VALIDATION
    if (!newQuestion.text || !newQuestion.subject) {
        return toast.error("Stem Content and Subject Area are mandatory.");
    }
    
    const hasEmptyOptions = newQuestion.options.some(opt => !opt.text.trim());
    if (hasEmptyOptions) return toast.error("All four options (A, B, C, D) must be filled.");

    setIsSaving(true);
    try {
      // 2. DATA FLATTENING (Convert Array to Backend Format)
      const payload = {
        text: newQuestion.text,
        subject: newQuestion.subject,
        difficulty: newQuestion.difficulty,
        correctAnswer: newQuestion.correctAnswer,
        optionA: newQuestion.options.find(o => o.letter === "A").text,
        optionB: newQuestion.options.find(o => o.letter === "B").text,
        optionC: newQuestion.options.find(o => o.letter === "C").text,
        optionD: newQuestion.options.find(o => o.letter === "D").text,
      };

      await api.post("/exam/questions", payload);
      toast.success("Assessment item committed to bank.");
      
      // RESET
      setNewQuestion({
        text: "",
        subject: newQuestion.subject, 
        difficulty: "medium",
        correctAnswer: "A",
        options: [{ letter: "A", text: "" }, { letter: "B", text: "" }, { letter: "C", text: "" }, { letter: "D", text: "" }]
      });
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save question.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase">
            CBT <span className="text-indigo-600">Question Bank</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium italic">Constructing high-integrity assessments.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-2xl font-black uppercase italic tracking-tighter">
              <Plus className="mr-2 h-5 w-5" /> New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-black uppercase italic text-xl">Construct Item</DialogTitle>
              <DialogDescription>Define the core stem and distractor options.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Stem Content</Label>
                <textarea 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] font-bold text-slate-800"
                  placeholder="Type the question here..."
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Subject</Label>
                  <Input value={newQuestion.subject} className="rounded-xl h-12 font-bold bg-slate-50 border-none" onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Difficulty</Label>
                  <Select value={newQuestion.difficulty} onValueChange={(v) => setNewQuestion({...newQuestion, difficulty: v})}>
                    <SelectTrigger className="rounded-xl h-12 font-bold bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Options (Select the correct key)</Label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center group">
                    <Badge className={`h-10 w-10 flex items-center justify-center rounded-xl font-black ${newQuestion.correctAnswer === opt.letter ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {opt.letter}
                    </Badge>
                    <Input 
                        placeholder={`Option ${opt.letter}`} 
                        value={opt.text}
                        className="rounded-xl h-12 border-slate-100"
                        onChange={(e) => handleOptionChange(idx, e.target.value)} 
                    />
                    <input 
                      type="radio" 
                      name="correct" 
                      checked={newQuestion.correctAnswer === opt.letter}
                      className="accent-emerald-500 h-5 w-5" 
                      onChange={() => setNewQuestion({...newQuestion, correctAnswer: opt.letter})}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={saveQuestion} disabled={isSaving} className="w-full bg-indigo-600 h-14 rounded-2xl font-black uppercase italic text-lg shadow-xl shadow-indigo-100">
              {isSaving ? <Loader2 className="animate-spin" /> : "Commit to Bank"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center"><Loader2 className="animate-spin text-slate-200" size={48} /></div>
      ) : (
        <div className="grid gap-4">
            {questions.length === 0 ? (
                <div className="text-center py-24 bg-white border-2 border-dashed rounded-[3rem] border-slate-100">
                   <BookOpen className="mx-auto text-slate-100 mb-4" size={64} />
                   <p className="text-slate-400 font-black uppercase italic tracking-widest">Vault is empty</p>
                </div>
            ) : questions.map((q) => (
                <Card key={q._id} className="border-none hover:shadow-xl transition-all rounded-[2rem] bg-white overflow-hidden shadow-sm">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-50 text-indigo-600 border-none uppercase font-black text-[8px]">{q.subject}</Badge>
                        <Badge className="bg-slate-50 text-slate-400 border-none uppercase font-black text-[8px]">{q.difficulty}</Badge>
                      </div>
                      <p className="font-black text-slate-800 uppercase italic tracking-tight">{q.text}</p>
                      
                      <div className="flex flex-wrap gap-4">
                        {['A', 'B', 'C', 'D'].map(letter => (
                          <span key={letter} className={`text-[10px] font-bold uppercase ${q.correctAnswer === letter ? 'text-emerald-500' : 'text-slate-300'}`}>
                            {letter}: {q[`option${letter}`]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500"><Trash2 size={18}/></Button>
                    </div>
                  </CardContent>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}