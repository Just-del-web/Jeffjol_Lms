import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

export default function VerifyOtp() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId; // Passed from SignupPage

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userId) return toast.error("Session expired. Please signup again.");
    
    setLoading(true);
    try {
      await api.post("/auth/verify-email", { userId, otp });
      toast.success("Email verified! You can now login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP.");
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
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>Enter the 6-digit code sent to your inbox.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input 
              className="text-center text-2xl tracking-[1em] font-bold h-16"
              maxLength={6}
              placeholder="000000"
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <Button className="w-full bg-indigo-600 py-6" disabled={loading || otp.length < 6}>
              {loading ? <Loader2 className="animate-spin" /> : "Verify Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}