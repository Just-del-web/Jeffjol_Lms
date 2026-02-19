import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Timer, ChevronRight, ChevronLeft, Send, 
  AlertCircle, Loader2, ShieldCheck, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";

export default function LiveExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initExam = async () => {
      try {
        const res = await api.get(`/exam/start/${examId}`);
        const data = res.data.data;
        
        setExam(data);
        setAnswers(data.questions.map(q => ({ questionId: q._id, selectedOption: "" })));
        
        const end = new Date(data.endTime).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.floor((end - now) / 1000));
        
      } catch (err) {
        toast.error(err.message || "Failed to initialize exam environment.");
        navigate("/student/exams");
      } finally {
        setLoading(false);
      }
    };
    initExam();
  }, [examId, navigate]);

  const submitExam = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Processing submission & grading...");

    try {
      const res = await api.post("/exam/submit", {
        examId,
        answers: answers.filter(a => a.selectedOption !== "") 
      });
      
      toast.success("Exam submitted successfully!", { id: toastId });
      
      navigate("/student/results", { state: { recentResult: res.data.data } });
    } catch (err) {
      toast.error(err.message || "Submission failed. Please contact invigilator.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [examId, answers, navigate, isSubmitting]);

  useEffect(() => {
    if (timeLeft <= 0 && exam) {
      submitExam(); 
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, exam, submitExam]);

  const handleSelect = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx].selectedOption = option;
    setAnswers(newAnswers);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
      <p className="font-black italic uppercase tracking-tighter text-slate-400">Loading Secure Terminal...</p>
    </div>
  );

  const currentQuestion = exam.questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${timeLeft < 300 ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Time Remaining</p>
              <h2 className={`text-2xl font-black italic tracking-tighter ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                {formatTime(timeLeft)}
              </h2>
            </div>
          </div>

          <div className="text-right">
             <p className="text-[10px] font-black uppercase text-slate-400">Question Progress</p>
             <h2 className="text-xl font-black italic text-slate-900">
                {currentIdx + 1} <span className="text-slate-300">/</span> {exam.questions.length}
             </h2>
          </div>
        </div>

        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white min-h-[400px] flex flex-col">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-start">
              <Badge className="bg-indigo-500 border-none uppercase font-black italic mb-2">
                Question {currentIdx + 1}
              </Badge>
              <div className="flex items-center gap-1 text-slate-400">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Mode Active</span>
              </div>
            </div>
            <CardTitle className="text-xl md:text-2xl leading-relaxed font-bold tracking-tight mt-4">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-8">
            <RadioGroup 
              value={answers[currentIdx]?.selectedOption} 
              onValueChange={handleSelect}
              className="grid gap-4"
            >
              {['A', 'B', 'C', 'D'].map((opt) => (
                <Label
                  key={opt}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    answers[currentIdx]?.selectedOption === opt 
                    ? "border-indigo-600 bg-indigo-50/50" 
                    : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <RadioGroupItem value={opt} className="sr-only" />
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black italic ${
                    answers[currentIdx]?.selectedOption === opt ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {opt}
                  </div>
                  <span className="font-bold text-slate-700">{currentQuestion[`option${opt}`]}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>

          <CardFooter className="bg-slate-50 p-6 flex justify-between items-center border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentIdx(prev => prev - 1)}
              disabled={currentIdx === 0}
              className="rounded-xl font-black italic uppercase text-xs h-12 px-6"
            >
              <ChevronLeft className="mr-2" size={16} /> Previous
            </Button>

            {currentIdx === exam.questions.length - 1 ? (
              <Button 
                onClick={submitExam}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black italic uppercase text-xs h-12 px-8 shadow-lg shadow-emerald-100"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" size={16} /> Final Submission</>}
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black italic uppercase text-xs h-12 px-8 shadow-lg shadow-indigo-100"
              >
                Next Question <ChevronRight className="ml-2" size={16} />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* QUICK NAVIGATION DOTS */}
        <div className="flex flex-wrap justify-center gap-2">
          {answers.map((ans, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                currentIdx === idx ? "bg-slate-900 text-white scale-110 shadow-lg" : 
                ans.selectedOption !== "" ? "bg-indigo-100 text-indigo-600" : "bg-white text-slate-300 border border-slate-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}