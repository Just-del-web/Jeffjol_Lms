import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, UserPlus, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    currentClass: "", // Only for students
  });

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData, role };
      const res = await axios.post("/api/v1/auth/register", payload);
      
      toast.success("Account created! Please check your email for verification.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg border-slate-200 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-900">Join Jeffjol High</CardTitle>
          <CardDescription>Create your account to access the learning portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* ROLE SELECTOR */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
              >
                <GraduationCap size={24} className="mb-2" />
                <span className="text-xs font-bold uppercase">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${role === 'parent' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
              >
                <Users size={24} className="mb-2" />
                <span className="text-xs font-bold uppercase">Parent</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
                <Input required onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                <Input required onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
              <Input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Password</label>
              <Input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            {/* CONDITIONAL STUDENT FIELD */}
            {role === "student" && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold uppercase text-slate-500">Current Class</label>
                <Select onValueChange={(v) => setFormData({...formData, currentClass: v})}>
                  <SelectTrigger className="bg-slate-50/50">
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSS1">JSS 1</SelectItem>
                    <SelectItem value="JSS2">JSS 2</SelectItem>
                    <SelectItem value="SS1">SS 1</SelectItem>
                    <SelectItem value="SS2">SS 2</SelectItem>
                    <SelectItem value="SS3">SS 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 mt-4" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}