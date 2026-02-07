import React, { useState, useEffect } from "react";
import { Clock, ShieldAlert, Play, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    // Fetch available exams and clearance status
    // axios.get(...) logic here
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Computer Based Tests</h1>
        <Badge variant="outline">Session: 2025/2026</Badge>
      </div>

      {!isCleared && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Account Restricted</AlertTitle>
          <AlertDescription>
            You have an outstanding balance of ₦15,000. Please settle your fees to unlock your examinations.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {exams.map((exam) => (
          <Card key={exam._id} className="border-slate-200 group overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{exam.subject} - {exam.title}</CardTitle>
                <Badge className="bg-indigo-600">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={16} /> {exam.duration} Minutes
                </div>
                <div className="flex items-center gap-2">
                  <Info size={16} /> {exam.questions.length} Questions
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-slate-900 hover:bg-black" 
                  disabled={!isCleared}
                >
                  <Play className="mr-2 h-4 w-4" /> Start Exam
                </Button>
                <Button variant="outline">View Instructions</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}