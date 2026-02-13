import React, { useState } from "react";
import { Save, Loader2, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
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

  // Full Class List following the Montessori & Nigerian curriculum structure
  const schoolClasses = [
    // Nursery Section
    "Playgroup", "Pre-Nursery", "Nursery 1", "Nursery 2", "Reception",
    // Primary Section
    "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
    // Junior Secondary
    "JSS 1", "JSS 2", "JSS 3",
    // Senior Secondary
    "SS 1", "SS 2", "SS 3"
  ];

  const fetchStudents = async (val) => {
    setClassName(val);
    try {
      const res = await api.get(`/result/class-list/${val}`);
      setStudents(res.data.data || []);
    } catch (err) {
      toast.error("Class list unavailable.");
    }
  };

  const handleScoreChange = (id, field, value) => {
    setGrades(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: Number(value) }
    }));
  };

  const handleSubmit = async () => {
    if (!subject || !className) return toast.error("Assign Subject/Class first.");
    setLoading(true);
    try {
      const payload = students.map(s => ({
        studentId: s._id,
        subject,
        caScore: grades[s._id]?.ca || 0,
        examScore: grades[s._id]?.exam || 0,
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
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
          Academic <span className="text-indigo-600">Compiler</span>
        </h1>
        <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 rounded-2xl font-black italic">
          {loading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} Sync Class Results
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select onValueChange={fetchStudents}>
          <SelectTrigger className="rounded-xl h-12 bg-white font-bold">
            <SelectValue placeholder="Target Class" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {schoolClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={setTerm} defaultValue="First">
          <SelectTrigger className="rounded-xl h-12 bg-white font-bold">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {['First', 'Second', 'Third'].map(t => <SelectItem key={t} value={t}>{t} Term</SelectItem>)}
          </SelectContent>
        </Select>

        <Input 
          placeholder="Session (e.g. 2025/2026)" 
          value={session} 
          className="h-12 rounded-xl bg-white font-bold border-slate-200" 
          onChange={(e) => setSession(e.target.value)} 
        />
        
        <Input 
          placeholder="Subject (e.g. Literacy)" 
          className="h-12 rounded-xl bg-white font-bold border-slate-200" 
          onChange={(e) => setSubject(e.target.value)} 
        />
      </div>

      <Card className="border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl bg-white">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow>
              <TableHead className="text-white font-black uppercase text-[10px] pl-8">Student Detail</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px]">CA (40)</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px]">Exam (60)</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px]">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const total = (grades[student._id]?.ca || 0) + (grades[student._id]?.exam || 0);
              return (
                <TableRow key={student._id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                         {student.profilePicture ? 
                           <img src={student.profilePicture} className="object-cover w-full h-full" alt="" /> : 
                           <Camera className="text-slate-300" size={20} />
                         }
                      </div>
                      <div>
                        <p className="font-black italic text-slate-800 uppercase tracking-tighter leading-none">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Adm: {student.admissionNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="w-24 h-11 rounded-xl font-bold text-center border-slate-200" 
                      onChange={(e) => handleScoreChange(student._id, 'ca', e.target.value)} 
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="w-24 h-11 rounded-xl font-bold text-center border-slate-200" 
                      onChange={(e) => handleScoreChange(student._id, 'exam', e.target.value)} 
                    />
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col">
                        <span className="font-black text-indigo-600 text-xl italic tracking-tighter">{total}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {total >= 50 ? 'Passed' : 'Pending'}
                        </span>
                     </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}