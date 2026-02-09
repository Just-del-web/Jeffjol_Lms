import React, { useState } from "react";
import { Send, Users, Megaphone, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SchoolBroadcast() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", targetClass: "all" });

  const handleSend = async () => {
    if (!form.subject || !form.message) return toast.error("Please fill all fields.");
    
    setLoading(true);
    try {
      await api.post("/admin/broadcast", form);
      toast.success("Broadcast queued successfully! Check logs for delivery status.");
      setForm({ subject: "", message: "", targetClass: "all" });
    } catch (err) {
      toast.error("Failed to initiate broadcast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl"><Megaphone size={24}/></div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase italic">School-Wide Broadcast</h1>
          <p className="text-slate-500 text-sm">Send bulk emails to students and parents via Redis Queue.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Target Audience</label>
            <Select value={form.targetClass} onValueChange={(val) => setForm({...form, targetClass: val})}>
              <SelectTrigger className="rounded-xl border-slate-200">
                <div className="flex items-center gap-2"><Users size={16}/> <SelectValue /></div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registered Users</SelectItem>
                <SelectItem value="SS3">SS3 Students Only</SelectItem>
                <SelectItem value="SS2">SS2 Students Only</SelectItem>
                <SelectItem value="SS1">SS1 Students Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Email Subject</label>
            <Input 
              value={form.subject}
              onChange={(e) => setForm({...form, subject: e.target.value})}
              placeholder="e.g. Resumption Date for Second Term" 
              className="rounded-xl border-slate-200" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Message Body</label>
            <Textarea 
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
              placeholder="Type your official message here..." 
              className="min-h-[200px] rounded-2xl border-slate-200 p-4" 
            />
          </div>

          <Button 
            onClick={handleSend} 
            disabled={loading}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold text-lg rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2" size={18}/>}
            Initiate Global Broadcast
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}