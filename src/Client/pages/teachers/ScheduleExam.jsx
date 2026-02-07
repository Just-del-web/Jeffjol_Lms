import React, { useState } from "react";
import { Calendar as CalendarIcon, ShieldCheck, Settings, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function ScheduleExam() {
  const [settings, setSettings] = useState({
    sebRequired: true,
    shuffleQuestions: true,
    allowBacktrack: false
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Setup New Examination</h1>
          <p className="text-slate-500">Configure security, timing, and question selection.</p>
        </div>
        <Button className="bg-indigo-600 px-8">Publish Exam</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* BASIC INFO */}
        <Card className="md:col-span-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Examination Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exam Title</Label>
                <Input placeholder="Mid-Term Assessment" />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Further Mathematics" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Duration (Mins)</Label>
                <Input type="number" placeholder="60" />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label>Target Class</Label>
                <Input placeholder="SS3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECURITY & PROCTORING */}
        <Card className="border-indigo-100 bg-indigo-50/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={18} /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold text-slate-500">Safe Exam Browser</Label>
              <Switch checked={settings.sebRequired} onCheckedChange={(v) => setSettings({...settings, sebRequired: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold text-slate-500">Shuffle Questions</Label>
              <Switch checked={settings.shuffleQuestions} onCheckedChange={(v) => setSettings({...settings, shuffleQuestions: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold text-slate-500">Allow Backtrack</Label>
              <Switch checked={settings.allowBacktrack} onCheckedChange={(v) => setSettings({...settings, allowBacktrack: v})} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUESTION SELECTION (Simplified for now) */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Select Questions from Bank</CardTitle>
          <CardDescription>Choose the specific questions to include in this paper.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-slate-50/50">
             <ListChecks className="mx-auto text-slate-300 mb-2" size={40} />
             <Button variant="outline" className="border-slate-200">Open Question Picker</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}