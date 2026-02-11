import React, { useState } from "react";
import { Save, Loader2, Camera } from "lucide-react";
import { Card,  } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

export default function GradeEntry() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (val) => {
    setClassName(val);
    try {
      const res = await api.get(`/admin/users?role=student&class=${val}`);
      setStudents(res.data.data.users || []);
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
        term: "First",
        session: "2025/2026",
        className // This is vital for the Word Doc mapping
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
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Academic <span className="text-indigo-600">Compiler</span></h1>
        <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 rounded-2xl font-black italic">
          {loading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} Sync Class Results
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select onValueChange={fetchStudents}>
          <SelectTrigger className="rounded-xl h-12 bg-white font-bold"><SelectValue placeholder="Target Class" /></SelectTrigger>
          <SelectContent>
            {['Nursery 1', 'Primary 1', 'JSS1', 'SS1'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Subject (e.g. Literacy)" className="h-12 rounded-xl bg-white font-bold" onChange={(e) => setSubject(e.target.value)} />
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
                      {/* Fetched from User Profile Picture Logic */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                         {student.profile?.profilePicture ? 
                           <img src={student.profile.profilePicture} className="object-cover w-full h-full" alt="" /> : 
                           <Camera className="text-slate-300" size={20} />
                         }
                      </div>
                      <div>
                        <p className="font-black italic text-slate-800 uppercase tracking-tighter">{student.firstName} {student.lastName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Adm: {student._id.slice(-6)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Input type="number" className="w-24 h-11 rounded-xl font-bold text-center border-slate-200" onChange={(e) => handleScoreChange(student._id, 'ca', e.target.value)} /></TableCell>
                  <TableCell><Input type="number" className="w-24 h-11 rounded-xl font-bold text-center border-slate-200" onChange={(e) => handleScoreChange(student._id, 'exam', e.target.value)} /></TableCell>
                  <TableCell>
                     <div className="flex flex-col">
                        <span className="font-black text-indigo-600 text-xl italic tracking-tighter">{total}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{total >= 50 ? 'Passed' : 'Pending'}</span>
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