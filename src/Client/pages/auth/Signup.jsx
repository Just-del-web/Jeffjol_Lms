import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    currentClass: "",
    gender: "" 
  });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!formData.gender) return toast.error("Please select your gender.");
    if (role === "student" && !formData.currentClass) return toast.error("Please select your class level.");

    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { ...formData, role });
      navigate("/verify-otp", { state: { userId: res.data.data.userId } });
      toast.success("Signup successful! Check your terminal for the OTP.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center bg-white border-b pb-8 pt-8">
          <CardTitle className="text-3xl font-black italic text-indigo-900 tracking-tighter uppercase">Join Jeffjol High</CardTitle>
          <CardDescription className="font-medium text-slate-500">Create your account to access the learning portal</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setRole("student")} className={`p-4 rounded-2xl border-2 transition-all ${role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                <GraduationCap size={24} className="mx-auto mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Student</span>
              </button>
              <button type="button" onClick={() => setRole("parent")} className={`p-4 rounded-2xl border-2 transition-all ${role === 'parent' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                <Users size={24} className="mx-auto mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Parent</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="First Name" required onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="rounded-xl border-slate-200 h-12" />
              <Input placeholder="Last Name" required onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="rounded-xl border-slate-200 h-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input type="email" placeholder="Email Address" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-xl border-slate-200 h-12" />
              
              <Select onValueChange={(v) => setFormData({...formData, gender: v})}>
                <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                {/* Fixed transparency by adding bg-white and z-index */}
                <SelectContent className="bg-white border-slate-200 shadow-xl z-[100]">
                  <SelectItem value="Male" className="cursor-pointer">Male</SelectItem>
                  <SelectItem value="Female" className="cursor-pointer">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input type="password" placeholder="Password" required onChange={(e) => setFormData({...formData, password: e.target.value})} className="rounded-xl border-slate-200 h-12" />
            
            {role === "student" && (
              <Select onValueChange={(v) => setFormData({...formData, currentClass: v})}>
                <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
                  <SelectValue placeholder="Select Class Level" />
                </SelectTrigger>
                {/* Fixed transparency by adding bg-white and z-index */}
                <SelectContent className="bg-white border-slate-200 shadow-xl z-[100]">
                  <SelectItem value="JSS1">JSS 1</SelectItem>
                  <SelectItem value="JSS2">JSS 2</SelectItem>
                  <SelectItem value="JSS3">JSS 3</SelectItem>
                  <SelectItem value="SS1">SS 1</SelectItem>
                  <SelectItem value="SS2">SS 2</SelectItem>
                  <SelectItem value="SS3">SS 3</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl font-black uppercase italic tracking-tighter text-lg shadow-lg shadow-indigo-100 mt-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Initialize Account"}
            </Button>

            <div className="text-center mt-4 pb-2">
              <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-tighter transition-colors">Already have an account? Login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}