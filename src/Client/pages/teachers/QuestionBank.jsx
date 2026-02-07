import React, { useState, useEffect } from "react";
import { Plus, Search, HelpCircle, Image as ImageIcon, Trash2, Edit3, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
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
      toast.success("Question added to the bank!");
      // Reset form and refresh list
    } catch (err) {
      toast.error("Failed to save question.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CBT Question Bank</h1>
          <p className="text-slate-500">Create and manage your subject assessment database.</p>
        </div>

        {/* ADD QUESTION DIALOG */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Create New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Question to Bank</DialogTitle>
              <DialogDescription>Define the question, options, and difficulty level.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <textarea 
                  className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  placeholder="e.g. What is the value of X in the equation..."
                  onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="Mathematics" onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select onValueChange={(v) => setNewQuestion({...newQuestion, difficulty: v})}>
                    <SelectTrigger><SelectValue placeholder="Medium" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Options & Correct Answer</Label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <Badge variant="outline" className="h-10 w-10 flex items-center justify-center font-bold bg-slate-50">
                      {opt.letter}
                    </Badge>
                    <Input 
                      placeholder={`Option ${opt.letter} text...`} 
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                    />
                    <input 
                      type="radio" 
                      name="correct" 
                      className="accent-indigo-600 h-5 w-5" 
                      onChange={() => setNewQuestion({...newQuestion, correctAnswer: opt.letter})}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={saveQuestion} className="w-full bg-indigo-600">Save to Bank</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input className="pl-10 bg-white" placeholder="Search questions by text or subject..." />
        </div>
        <Button variant="outline" className="border-slate-200">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {/* QUESTIONS LIST */}
      <div className="grid gap-4">
        {questions.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed rounded-3xl">
             <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium">No questions in the bank yet.</p>
             <p className="text-slate-400 text-sm">Start by creating your first question for a class assessment.</p>
          </div>
        ) : (
          questions.map((q) => (
            <Card key={q._id} className="border-slate-200 hover:border-indigo-200 transition-all">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge className={getDiffColor(q.difficulty)}>{q.difficulty}</Badge>
                    <p className="font-medium text-slate-800 leading-snug">{q.text}</p>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">{q.subject}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-slate-400"><Edit3 size={16}/></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function getDiffColor(diff) {
  if (diff === 'easy') return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50";
  if (diff === 'hard') return "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50";
  return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50";
}