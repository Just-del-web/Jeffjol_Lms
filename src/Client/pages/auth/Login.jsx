import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/v1/auth/login", { email, password });
      
      const { token, user } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role); 
      localStorage.setItem("userName", user.firstName);

      toast.success(`Welcome back, ${user.firstName}!`);

      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <ShieldCheck size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-black italic text-indigo-900 tracking-tighter">
            JEFFJOL LMS
          </CardTitle>
          <CardDescription>Enter your credentials to access the portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@jeffjol.com" 
                required 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                required 
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50/50"
              />
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-6" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In to Dashboard"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 italic">
              Forgot password? Contact the school administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}