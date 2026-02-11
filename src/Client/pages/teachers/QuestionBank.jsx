import React, { useState, useEffect } from "react";
import { Plus, Search, HelpCircle, Trash2, Edit3, Filter, Loader2, BookOpen } from "lucide-react";
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
      console.error("Failed to fetch question bank");
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
    if (!newQuestion.text || !newQuestion.subject) {
        return toast.error("Question text and Subject are required.");
    }
    
    setIsSaving(true);
    try {
      await api.post("/exam/questions", newQuestion);
      toast.success("Question successfully added to bank!");
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
          <p className="text-slate-500 text-sm font-medium italic">Construct terminal assessments and mid-term mocks.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-2xl font-black uppercase italic tracking-tighter text-sm">
              <Plus className="mr-2 h-5 w-5" /> New Assessment Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-black uppercase italic tracking-tighter text-xl">Construct Question</DialogTitle>
              <DialogDescription className="font-medium text-slate-400">Define the core content and distractors for this assessment item.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Stem Content</Label>
                <textarea 
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 min-h-[120px] font-medium text-slate-800"
                  placeholder="Type the question details here..."
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Subject Area</Label>
                  <Input 
                    placeholder="e.g. Mathematics" 
                    value={newQuestion.subject}
                    className="rounded-xl h-12 font-bold"
                    onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Cognitive Level</Label>
                  <Select value={newQuestion.difficulty} onValueChange={(v) => setNewQuestion({...newQuestion, difficulty: v})}>
                    <SelectTrigger className="rounded-xl h-12 font-bold"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (Recall)</SelectItem>
                      <SelectItem value="medium">Medium (Application)</SelectItem>
                      <SelectItem value="hard">Hard (Synthesis)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Options & Key</Label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center group">
                    <Badge variant="outline" className={`h-11 w-11 flex items-center justify-center rounded-xl transition-colors font-black ${newQuestion.correctAnswer === opt.letter ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                      {opt.letter}
                    </Badge>
                    <Input 
                        placeholder={`Option ${opt.letter} text...`} 
                        value={opt.text}
                        className="rounded-xl h-11"
                        onChange={(e) => handleOptionChange(idx, e.target.value)} 
                    />
                    <input 
                      type="radio" 
                      name="correct" 
                      checked={newQuestion.correctAnswer === opt.letter}
                      className="accent-indigo-600 h-6 w-6 cursor-pointer" 
                      onChange={() => setNewQuestion({...newQuestion, correctAnswer: opt.letter})}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={saveQuestion} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl font-black uppercase italic tracking-tighter text-lg shadow-lg shadow-indigo-100">
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : "Commit to Bank"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input className="pl-10 bg-white rounded-xl h-12 border-slate-200" placeholder="Filter bank by keyword..." />
        </div>
        <Button variant="outline" className="rounded-xl h-12 border-slate-200 font-bold uppercase text-xs tracking-widest"><Filter className="mr-2 h-4 w-4" /> Subjects</Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="animate-spin text-slate-300 mb-4" size={40} />
            <p className="text-slate-400 font-black uppercase italic tracking-widest text-xs">Scanning Bank...</p>
        </div>
      ) : (
        <div className="grid gap-4">
            {questions.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed rounded-[2.5rem] border-slate-100">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-black uppercase italic tracking-tighter">Your Question bank is empty.</p>
                <p className="text-slate-300 text-xs mt-2">Add your first assessment item to get started.</p>
            </div>
            ) : (
            questions.map((q) => (
                <Card key={q._id} className="border-slate-100 hover:border-indigo-100 group transition-all rounded-3xl overflow-hidden bg-white shadow-sm">
                <CardContent className="p-5 flex justify-between items-center">
                    <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-50 text-indigo-700 border-none capitalize font-bold text-[10px]">{q.difficulty}</Badge>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-slate-100">{q.subject}</Badge>
                    </div>
                    <p className="font-bold text-slate-800 leading-tight tracking-tight uppercase italic">{q.text}</p>
                    <div className="flex gap-4 mt-1">
                        {q.options?.map(opt => (
                            <span key={opt.letter} className={`text-[10px] font-black uppercase tracking-tighter ${q.correctAnswer === opt.letter ? 'text-emerald-500' : 'text-slate-300'}`}>
                                {opt.letter}: {opt.text}
                            </span>
                        ))}
                    </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-indigo-600 rounded-full"><Edit3 size={18}/></Button>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500 rounded-full"><Trash2 size={18}/></Button>
                    </div>
                </CardContent>
                </Card>
            ))
            )}
        </div>
      )}
    </div>
  );
}