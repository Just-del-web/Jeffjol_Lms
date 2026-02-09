import React, { useState, useEffect } from "react";
import { Plus, Search, HelpCircle, Trash2, Edit3, Filter, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    subject: "",
    difficulty: "medium",
    correctAnswer: "A",
    options: [{ letter: "A", text: "" }, { letter: "B", text: "" }, { letter: "C", text: "" }, { letter: "D", text: "" }]
  });

  const handleOptionChange = (index, text) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index].text = text;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const saveQuestion = async () => {
    try {
      await axios.post("/api/v1/exam/questions", newQuestion, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Question successfully added!");
    } catch (err) {
      toast.error("Failed to save. Ensure all fields are filled.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CBT Question Bank</h1>
          <p className="text-slate-500 text-sm">Build your subject assessment database.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Assessment Question</DialogTitle>
              <DialogDescription>Input the question text and define the four options below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-400">Question Content</Label>
                <textarea 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  placeholder="Type the question details here..."
                  onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-slate-400">Subject Area</Label>
                  <Input placeholder="e.g. Mathematics" onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-slate-400">Level</Label>
                  <Select onValueChange={(v) => setNewQuestion({...newQuestion, difficulty: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase font-bold text-slate-400">Options (Select the correct one)</Label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center group">
                    <Badge variant="outline" className={`h-10 w-10 flex items-center justify-center ${newQuestion.correctAnswer === opt.letter ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}>
                      {opt.letter}
                    </Badge>
                    <Input placeholder={`Option ${opt.letter} text...`} onChange={(e) => handleOptionChange(idx, e.target.value)} />
                    <input 
                      type="radio" 
                      name="correct" 
                      className="accent-indigo-600 h-5 w-5 cursor-pointer" 
                      onChange={() => setNewQuestion({...newQuestion, correctAnswer: opt.letter})}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={saveQuestion} className="w-full bg-indigo-600 py-6 font-bold">Save Question</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input className="pl-10 bg-white" placeholder="Search the bank..." />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter Subjects</Button>
      </div>

      <div className="grid gap-4">
        {questions.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-3xl">
            <HelpCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Question bank is empty.</p>
          </div>
        ) : (
          questions.map((q) => (
            <Card key={q._id} className="border-slate-200 hover:border-indigo-100 group transition-all">
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge className="bg-indigo-50 text-indigo-700 border-none capitalize">{q.difficulty}</Badge>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">{q.subject}</Badge>
                  </div>
                  <p className="font-semibold text-slate-800 leading-tight">{q.text}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon"><Edit3 size={16}/></Button>
                  <Button variant="ghost" size="icon" className="text-rose-500"><Trash2 size={16}/></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}