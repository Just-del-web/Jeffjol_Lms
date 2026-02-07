import React, { useState } from "react";
import { Save, UploadCloud, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

export default function GradeEntry() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState([]); // Fetched based on className
  const [grades, setGrades] = useState({}); // { studentId: { caScore, examScore } }
  const [loading, setLoading] = useState(false);

  // Fetch students when class is selected
  const fetchStudents = async (val) => {
    setClassName(val);
    const res = await axios.get(`/api/v1/teacher/my-students?className=${val}`);
    setStudents(res.data.data);
  };

  const handleScoreChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Number(value)
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = students.map(s => ({
        studentId: s._id,
        subject,
        caScore: grades[s._id]?.caScore || 0,
        examScore: grades[s._id]?.examScore || 0,
        term: "First", // Defaulting for now
        session: "2025/2026",
        className
      }));

      await axios.post("/api/v1/result/bulk-upload", { results: payload, className });
      toast.success("Grades uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload grades. Check data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Grade Entry Portal</h1>
          <p className="text-slate-500">Input Continuous Assessment and Exam scores.</p>
        </div>
        <Button onClick={handleSubmit} disabled={loading || !subject} className="bg-indigo-600">
          <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save All Grades"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select onValueChange={fetchStudents}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Select Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="SS1">SS1</SelectItem>
            <SelectItem value="SS2">SS2</SelectItem>
          </SelectContent>
        </Select>

        <Input 
          placeholder="Subject (e.g. Mathematics)" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-white"
        />
        
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 p-2 rounded-md">
          <Users size={16}/> {students.length} Students Loaded
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[300px]">Student Name</TableHead>
              <TableHead>CA Score (40)</TableHead>
              <TableHead>Exam Score (60)</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const ca = grades[student._id]?.caScore || 0;
              const exam = grades[student._id]?.examScore || 0;
              return (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                    <p className="text-xs text-slate-400">{student.admissionNumber}</p>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      max="40" 
                      className="w-24 h-8" 
                      onChange={(e) => handleScoreChange(student._id, 'caScore', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      max="60" 
                      className="w-24 h-8" 
                      onChange={(e) => handleScoreChange(student._id, 'examScore', e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="font-bold text-indigo-600">{ca + exam}</TableCell>
                  <TableCell className="text-right">
                    {ca + exam > 0 ? <CheckCircle className="ml-auto text-emerald-500" size={16}/> : null}
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