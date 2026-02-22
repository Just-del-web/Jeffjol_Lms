import React, { useState } from "react";
import { Save, Loader2, Camera, Activity, BookOpen, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

export default function GradeEntry() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("First");
  const [session, setSession] = useState("2025/2026");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [view, setView] = useState("cognitive");

  const schoolClasses = [
    "Playgroup", "Pre-Nursery", "Nursery 1", "Nursery 2", "Reception",
    "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
    "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"
  ];

  const fetchStudents = async (val) => {
    if (!subject) return toast.error("Enter a Subject first to check for existing scores.");
    setClassName(val);
    setIsFetching(true);
    try {
      const res = await api.get(`/result/class-list/${val}`);
      const studentData = res.data.data || [];
      
      const existingRes = await api.get(`/result/fetch-existing?subject=${subject}&className=${val}&term=${term}&session=${session}`);
      const existingScores = existingRes.data.data || [];

      const initialGrades = {};
      existingScores.forEach(res => {
        initialGrades[res.student] = {
          ca: res.caScore || 0,
          exam: res.examScore || res.score || 0, 
          writingSkill: res.behavioralData?.writingSkill || "Good",
          punctuality: res.behavioralData?.punctuality || "Good",
          neatness: res.behavioralData?.neatness || "Good",
        };
      });

      setGrades(initialGrades);
      setStudents(studentData);
    } catch (err) {
      toast.error("Error syncing scores.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleScoreChange = (id, field, value) => {
    const isNumberField = field === 'ca' || field === 'exam';
    const formattedValue = isNumberField ? (value === "" ? 0 : Number(value)) : value;
    
    setGrades(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: formattedValue }
    }));
  };

  const handleSubmit = async () => {
    if (!subject || !className) return toast.error("Assign Subject and Class first.");
    setLoading(true);
    try {
      const payload = students.map(s => ({
        studentId: s._id,
        subject,
        caScore: Number(grades[s._id]?.ca) || 0,
        examScore: Number(grades[s._id]?.exam) || 0,
        behavioralData: {
          writingSkill: grades[s._id]?.writingSkill || "Good",
          punctuality: grades[s._id]?.punctuality || "Good",
          neatness: grades[s._id]?.neatness || "Good",
        },
        term,
        session,
        className 
      }));

      await api.post("/result/bulk-upload", { results: payload, className });
      toast.success("Grades synced to Cloud.");
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
          Academic <span className="text-indigo-600">Compiler</span>
        </h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button onClick={() => setView(view === "cognitive" ? "behavioral" : "cognitive")} className="flex-1 md:flex-none bg-slate-900 text-white rounded-2xl font-black italic h-12 px-6 shadow-xl">
            {view === "cognitive" ? <Activity className="mr-2 w-4 h-4"/> : <BookOpen className="mr-2 w-4 h-4"/>}
            {view === "cognitive" ? "Behavioral Mode" : "Cognitive Mode"}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || students.length === 0} className="flex-1 md:flex-none bg-indigo-600 text-white rounded-2xl font-black italic h-12 px-6 shadow-xl">
            {loading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} Sync Results
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select onValueChange={fetchStudents}><SelectTrigger className="rounded-xl h-14 bg-white font-bold border-slate-200"><SelectValue placeholder="Target Class" /></SelectTrigger>
          <SelectContent className="bg-white">{schoolClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select onValueChange={setTerm} defaultValue="First"><SelectTrigger className="rounded-xl h-14 bg-white font-bold border-slate-200"><SelectValue placeholder="Term" /></SelectTrigger>
          <SelectContent className="bg-white">
            {["First", "Second", "Third"].map(t => <SelectItem key={t} value={t}>{t} Term</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Session" value={session} className="h-14 rounded-xl bg-white font-bold" onChange={(e) => setSession(e.target.value)} />
        <Input placeholder="Subject Name" className="h-14 rounded-xl bg-white font-bold" onChange={(e) => setSubject(e.target.value)} />
      </div>

      {isFetching ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
      ) : students.length > 0 ? (
        <Card className="border-none rounded-[2.5rem] overflow-hidden shadow-2xl bg-white">
          <Table>
            <TableHeader className="bg-slate-900 h-16">
              <TableRow className="border-none">
                <TableHead className="text-white font-black uppercase text-[10px] pl-10">Student Detail</TableHead>
                {view === "cognitive" ? (
                  <>
                    <TableHead className="text-white font-black uppercase text-[10px] text-center">CA (40)</TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] text-center">Exam (60)</TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] text-right pr-10">Total</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-white font-black uppercase text-[10px] text-center">Writing</TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] text-center">Punctuality</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                // VISUAL MATH FIX: Ensure Number addition here
                const ca = Number(grades[student._id]?.ca) || 0;
                const exam = Number(grades[student._id]?.exam) || 0;
                const total = ca + exam;

                return (
                  <TableRow key={student._id} className="hover:bg-slate-50 transition-colors border-slate-100">
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                          {student.profilePicture ? <img src={student.profilePicture} className="object-cover w-full h-full" alt="" /> : <Camera className="text-slate-300" size={20} />}
                        </div>
                        <div>
                          <p className="font-black italic text-slate-800 uppercase tracking-tighter">{student.firstName} {student.lastName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Adm: {student.studentId}</p>
                        </div>
                      </div>
                    </TableCell>
                    {view === "cognitive" ? (
                      <>
                        <TableCell className="text-center"><Input type="number" className="w-20 mx-auto rounded-xl font-bold text-center h-11" onChange={(e) => handleScoreChange(student._id, 'ca', e.target.value)} /></TableCell>
                        <TableCell className="text-center"><Input type="number" className="w-20 mx-auto rounded-xl font-bold text-center h-11" onChange={(e) => handleScoreChange(student._id, 'exam', e.target.value)} /></TableCell>
                        <TableCell className="text-right pr-10">
                          <span className={`font-black text-xl italic ${total >= 50 ? 'text-indigo-600' : 'text-slate-300'}`}>{total}</span>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-center"><Select onValueChange={(v) => handleScoreChange(student._id, 'writingSkill', v)}><SelectTrigger className="w-28 mx-auto"><SelectValue placeholder="Grade"/></SelectTrigger><SelectContent><SelectItem value="Excellent">Excellent</SelectItem><SelectItem value="Good">Good</SelectItem></SelectContent></Select></TableCell>
                        <TableCell className="text-center"><Select onValueChange={(v) => handleScoreChange(student._id, 'punctuality', v)}><SelectTrigger className="w-28 mx-auto"><SelectValue placeholder="Grade"/></SelectTrigger><SelectContent><SelectItem value="Excellent">Excellent</SelectItem><SelectItem value="Good">Good</SelectItem></SelectContent></Select></TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="rounded-[2.5rem] border-dashed border-2 border-slate-200 bg-slate-50/50 h-80 flex flex-col items-center justify-center text-center p-10">
          <UserCheck className="text-slate-200 mb-4" size={40} />
          <h3 className="text-xl font-black italic uppercase text-slate-400 tracking-tighter">Grading Sheet Empty</h3>
        </Card>
      )}
    </div>
  );
}