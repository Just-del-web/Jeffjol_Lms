import React, { useState, useEffect } from "react";
import { Clock, ShieldAlert, Play, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from "@/lib/api"; 
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [isCleared, setIsCleared] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/exam/my-exams");
        setExams(res.data.data.exams || []);
        setIsCleared(res.data.data.isCleared);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleStartExam = (examId) => {
    navigate(`/exam/live/${examId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Syncing with Exam Server...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Computer Based Tests</h1>
          <p className="text-slate-500 text-sm">Active terminal examinations and quizzes.</p>
        </div>
        <Badge variant="outline" className="border-indigo-100 text-indigo-700 bg-indigo-50/50">
          Session: 2025/2026
        </Badge>
      </div>

      {!isCleared && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 shadow-sm">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="font-bold">Account Restricted</AlertTitle>
          <AlertDescription>
            You have an outstanding balance. Please settle your terminal fees at the Bursary to unlock your examinations.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <Card key={exam._id} className="border-slate-200 hover:border-indigo-200 transition-all group overflow-hidden shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b py-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-slate-800">
                    {exam.subject} - {exam.title}
                  </CardTitle>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Available</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" /> {exam.duration} Minutes
                  </div>
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-indigo-500" /> {exam.questionCount || 0} Questions
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleStartExam(exam._id)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100" 
                    disabled={!isCleared}
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" /> Start Exam
                  </Button>
                  <Button variant="outline" className="border-slate-200">Instructions</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <Info className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-400 font-medium italic">No exams are scheduled for your class at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}