import React, { useState } from "react";
import { Mail, Send, Users, Info, Loader2, Paperclip, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import axios from "axios";

export default function MailCenter() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    targetClass: "all",
  });

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      return toast.error("Please fill in both subject and message.");
    }

    setLoading(true);
    try {
      // FEEDS INTO YOUR MailService.sendSchoolBroadcast
      await axios.post("/api/v1/admin/mail-broadcast", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success(`Email broadcast queued for ${formData.targetClass} students.`);
      setFormData({ ...formData, subject: "", message: "" });
    } catch (err) {
      toast.error("Failed to queue broadcast. Check Redis connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email Broadcast Center</h1>
          <p className="text-slate-500">Communicate directly with students, staff, and parents via email.</p>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-4 py-1">
          Connected to Redis Queue
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 1. COMPOSE SECTION (LEFT 2 COLUMNS) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-xl overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg">Compose School-wide Email</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Target Group</label>
                  <Select 
                    defaultValue="all" 
                    onValueChange={(v) => setFormData({...formData, targetClass: v})}
                  >
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students & Staff</SelectItem>
                      <SelectItem value="SS1">SS1 Students</SelectItem>
                      <SelectItem value="SS2">SS2 Students</SelectItem>
                      <SelectItem value="SS3">SS3 Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Priority</label>
                  <Select defaultValue="normal">
                    <SelectTrigger className="bg-slate-50/50">
                      <SelectValue placeholder="Normal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Subject Line</label>
                <Input 
                  placeholder="e.g. Important Update Regarding School Fees" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Message Body</label>
                   <span className="text-[10px] text-slate-400 italic">Supports HTML via Template</span>
                </div>
                <Textarea 
                  placeholder="Dear Students and Parents, we would like to inform you that..." 
                  className="min-h-[300px] bg-white resize-none border-slate-200"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleBroadcast} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg font-bold"
                disabled={loading}
              >
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Queuing Batch...</> : <><Send className="mr-2 h-5 w-5" /> Dispatch Broadcast</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 2. STATS & TIPS (RIGHT 1 COLUMN) */}
        <div className="space-y-6">
          <Alert className="bg-indigo-50 border-indigo-100 text-indigo-800">
            <Info className="h-4 w-4" />
            <AlertTitle>Broadcast Logic</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              Emails are sent in batches of 100 via the <strong>Bull.js</strong> background worker. 
              This prevents server timeouts and ensures 100% delivery rate even for large classes.
            </AlertDescription>
          </Alert>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users size={16}/> Audience Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Target Count:</span>
                    <span className="font-bold">~1,200 recipients</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Estimated Time:</span>
                    <span className="font-bold">~4 minutes</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Search size={16}/> Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[10px] text-slate-400">Your broadcast will be wrapped in the <strong>school_broadcast</strong> template automatically.</p>
              <Button variant="outline" className="w-full text-xs h-8">Preview Template</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}