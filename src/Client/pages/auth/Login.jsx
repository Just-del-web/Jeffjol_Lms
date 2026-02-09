import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      
      const { token, user } = res.data.data;

      const firstName = user.name ? user.name.split(" ")[0] : "User";

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role); 
      localStorage.setItem("userName", user.name); 
      localStorage.setItem("firstName", firstName);

      toast.success(`Welcome back, ${firstName}!`);
      
      window.location.href = `/${user.role}`;
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto p-3 bg-indigo-600 w-fit rounded-2xl text-white mb-4">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-2xl font-black italic text-indigo-900 tracking-tighter uppercase">JEFFJOL LMS</CardTitle>
          <CardDescription className="font-medium">Access your educational portal</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              required 
              onChange={(e) => setEmail(e.target.value)} 
              className="rounded-xl border-slate-200 h-12"
            />
            <Input 
              type="password" 
              placeholder="Password" 
              required 
              onChange={(e) => setPassword(e.target.value)} 
              className="rounded-xl border-slate-200 h-12"
            />
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-xl font-bold uppercase tracking-tighter italic shadow-lg shadow-indigo-100" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center">
             <Link to="/signup" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">
                Don't have an account? Sign up
             </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}