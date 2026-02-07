import React, { useState } from "react";
import { 
  Megaphone, 
  Send, 
  Users, 
  Eye, 
  Clock, 
  Trash2, 
  AlertCircle,
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Noticeboard() {
  const [target, setTarget] = useState({ students: true, parents: true, teachers: false });
  const [priority, setPriority] = useState("normal");

  return (
    <div className="grid gap-8 lg:grid-cols-5 animate-in fade-in duration-700">
      
      {/* 1. COMPOSE NOTICE (LEFT 2 COLUMNS) */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-slate-200 shadow-lg sticky top-8">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="text-indigo-600" size={20} /> Broadcast New Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* AUDIENCE TARGETING */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-400">Target Audience</label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="students" checked={target.students} onCheckedChange={(v) => setTarget({...target, students: !!v})} />
                  <label htmlFor="students" className="text-sm font-medium">Students</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="parents" checked={target.parents} onCheckedChange={(v) => setTarget({...target, parents: !!v})} />
                  <label htmlFor="parents" className="text-sm font-medium">Parents</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="teachers" checked={target.teachers} onCheckedChange={(v) => setTarget({...target, teachers: !!v})} />
                  <label htmlFor="teachers" className="text-sm font-medium">Teachers</label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Notice Title</label>
                <Input placeholder="e.g. Second Term Resumption Date" className="focus:ring-indigo-500" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Content</label>
                <Textarea placeholder="Write your announcement here..." className="min-h-[150px] resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Priority</label>
                  <Select onValueChange={setPriority} defaultValue="normal">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Expires In</label>
                  <Select defaultValue="7">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg font-bold">
              <Send className="mr-2 h-5 w-5" /> Dispatch Notice
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2. HISTORY & PREVIEW (RIGHT 3 COLUMNS) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-800">Sent Announcements</h3>
          <Badge variant="outline" className="text-slate-500">{12} Total Sent</Badge>
        </div>

        {/* RECENT NOTICES LIST */}
        <div className="space-y-4">
          <NoticeHistoryCard 
            title="School Bus Maintenance Notice" 
            target="Parents, Students" 
            date="2 hours ago" 
            priority="urgent" 
            views={412}
          />
          <NoticeHistoryCard 
            title="Congratulations to SS3 Graduands" 
            target="Everyone" 
            date="3 days ago" 
            priority="normal" 
            views={890}
          />
        </div>
      </div>
    </div>
  );
}

function NoticeHistoryCard({ title, target, date, priority, views }) {
  const isUrgent = priority === 'urgent' || priority === 'emergency';
  
  return (
    <Card className={`border-slate-200 hover:shadow-md transition-all group overflow-hidden ${isUrgent ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-indigo-500'}`}>
      <CardContent className="p-5 flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</h4>
            {isUrgent && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Users size={12}/> {target}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={12}/> {date}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Eye size={12}/> {views} views</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600">
             <Smartphone size={18} />
           </Button>
           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
             <Trash2 size={18} />
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}