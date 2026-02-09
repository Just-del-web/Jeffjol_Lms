import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role); 
      localStorage.setItem("userName", user.firstName);

      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-indigo-600 w-fit rounded-2xl text-white mb-4">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-2xl font-black italic text-indigo-900 tracking-tighter">JEFFJOL LMS</CardTitle>
          <CardDescription>Login to your portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
            <Button className="w-full bg-indigo-600 py-6" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
             <Link to="/signup" className="text-sm text-indigo-600 hover:underline">Don't have an account? Sign up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}