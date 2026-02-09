import React, { useState, useEffect } from "react";
import { 
  Megaphone, Send, Users, Eye, Clock, Trash2, AlertCircle, Smartphone, Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

export default function Noticeboard() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal",
    expiresIn: "7"
  });
  const [target, setTarget] = useState({ students: true, parents: true, teachers: false });

  // 1. Fetch History
  const fetchNotices = async () => {
    try {
      const res = await api.get("/admin/announcements");
      setHistory(res.data.data);
    } catch (err) {
      console.error("Notice fetch error");
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  // 2. Dispatch Logic
  const handleDispatch = async () => {
    if (!form.title || !form.content) return toast.error("Announcement is empty.");
    
    setLoading(true);
    try {
      await api.post("/admin/announcements", {
        ...form,
        target,
        expiresAt: parseInt(form.expiresIn)
      });
      toast.success("Notice dispatched successfully!");
      setForm({ title: "", content: "", priority: "normal", expiresIn: "7" });
      fetchNotices();
    } catch (err) {
      toast.error("Failed to dispatch notice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5 animate-in fade-in duration-700">
      
      {/* 1. COMPOSE NOTICE */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-slate-200 shadow-xl rounded-[2rem] overflow-hidden sticky top-8">
          <CardHeader className="bg-slate-900 text-white border-b py-6">
            <CardTitle className="flex items-center gap-3 text-lg italic uppercase tracking-tighter">
              <Megaphone className="text-indigo-400" size={22} /> Broadcast Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Recipients</label>
              <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <TargetOption id="students" label="Students" checked={target.students} onChange={(v) => setTarget({...target, students: v})} />
                <TargetOption id="parents" label="Parents" checked={target.parents} onChange={(v) => setTarget({...target, parents: v})} />
                <TargetOption id="teachers" label="Teachers" checked={target.teachers} onChange={(v) => setTarget({...target, teachers: v})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Notice Title</label>
                <Input 
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="e.g. End of Term Resumption" 
                  className="rounded-xl border-slate-200 h-12" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Detailed Content</label>
                <Textarea 
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                  placeholder="Type official announcement here..." 
                  className="min-h-[150px] rounded-2xl border-slate-200 p-4 resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Urgency</label>
                  <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Lifespan</label>
                  <Select value={form.expiresIn} onValueChange={(v) => setForm({...form, expiresIn: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleDispatch}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-black uppercase italic tracking-tighter rounded-2xl shadow-lg shadow-indigo-100"
            >
              {loading ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2 h-5 w-5" />}
              Dispatch Notice
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2. HISTORY */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">Dispatch Log</h3>
          <Badge variant="outline" className="text-slate-500 font-bold border-slate-200 bg-white shadow-sm">
            {history.length} Announcements Sent
          </Badge>
        </div>

        <div className="space-y-4">
          {history.length > 0 ? history.map((notice) => (
            <NoticeHistoryCard 
              key={notice._id}
              title={notice.title} 
              target={Object.keys(notice.targetAudience).filter(k => notice.targetAudience[k]).join(", ")} 
              date={new Date(notice.createdAt).toLocaleDateString()} 
              priority={notice.priority} 
              views={notice.views || 0}
            />
          )) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
              <p className="text-slate-400 font-medium italic">No announcements have been dispatched yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TargetOption({ id, label, checked, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600" />
      <label htmlFor={id} className="text-xs font-bold text-slate-600 uppercase tracking-tighter cursor-pointer">{label}</label>
    </div>
  );
}

function NoticeHistoryCard({ title, target, date, priority, views }) {
  const isUrgent = priority === 'urgent' || priority === 'emergency';
  
  return (
    <Card className={`border-slate-200 hover:shadow-xl transition-all group overflow-hidden rounded-3xl bg-white ${isUrgent ? 'border-l-8 border-l-rose-500' : 'border-l-8 border-l-indigo-600'}`}>
      <CardContent className="p-6 flex justify-between items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm group-hover:text-indigo-600 transition-colors">{title}</h4>
            {isUrgent && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
            <span className="flex items-center gap-1.5"><Users size={12}/> {target}</span>
            <span className="flex items-center gap-1.5"><Clock size={12}/> {date}</span>
            <span className="flex items-center gap-1.5 text-indigo-500"><Eye size={12}/> {views} Reads</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="text-slate-300 hover:text-indigo-600 rounded-full">
             <Smartphone size={18} />
           </Button>
           <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500 rounded-full">
             <Trash2 size={18} />
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}