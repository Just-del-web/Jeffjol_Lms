import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, Video, Trash2, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api"; 

export default function ContentManager() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "", 
    subject: "", 
    targetClass: "", 
    contentType: "note", 
    isScannedNote: "false" 
  });
  const [myContent, setMyContent] = useState([]);

  const fetchMyContent = async () => {
    try {
      const res = await api.get("/academic/teacher-history");
      setMyContent(res.data.data);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  useEffect(() => { fetchMyContent(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file first.");
    if (!formData.title || !formData.targetClass) return toast.error("Fill all fields.");

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("subject", formData.subject);
    data.append("targetClass", formData.targetClass);
    data.append("contentType", formData.contentType);
    data.append("isScannedNote", formData.contentType === 'note' ? 'true' : 'false');

    try {
      await api.post("/academic/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Content live on LMS!");
      setFile(null);
      fetchMyContent();
    } catch (err) {
      toast.error("Upload failed. File might be too large.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-5 animate-in fade-in duration-700">
      <div className="md:col-span-2 space-y-6">
        <Card className="border-slate-200 shadow-xl rounded-3xl overflow-hidden sticky top-8">
          <CardHeader className="bg-slate-900 text-white pb-8">
            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <UploadCloud className="text-indigo-400" /> Dispatch Center
            </CardTitle>
            <CardDescription className="text-slate-400">OCR converts handwritten notes to digital text.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleUpload} className="space-y-4">
              <div 
                className={`group border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400'}`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <UploadCloud className={file ? "text-indigo-600" : "text-slate-300 group-hover:text-indigo-400"} size={48} />
                <p className="mt-4 text-xs text-slate-500 font-black uppercase tracking-widest text-center">
                  {file ? file.name : "Drop Scanned Note or Video"}
                </p>
                <input id="file-input" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <Input placeholder="Material Title" className="rounded-xl h-12" onChange={(e) => setFormData({...formData, title: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-3">
                <Select onValueChange={(v) => setFormData({...formData, contentType: v})}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Study Note (OCR)</SelectItem>
                    <SelectItem value="video">Lecture Video</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(v) => setFormData({...formData, targetClass: v})}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>
                    {['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl font-black uppercase italic tracking-tighter text-lg shadow-lg shadow-indigo-100" disabled={uploading}>
                {uploading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Digitizing...</> : "Publish to Library"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-3 space-y-4">
        <h3 className="text-xl font-black italic text-slate-900 tracking-tighter uppercase px-1">Your Publication History</h3>
        {myContent.length > 0 ? myContent.map((item) => (
          <Card key={item._id} className="border-slate-200 rounded-3xl overflow-hidden group hover:shadow-xl transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${item.contentType === 'video' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {item.contentType === 'video' ? <Video size={24}/> : <FileText size={24}/>}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tight">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.subject || 'General'}</Badge>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter italic">Targets {item.targetClass}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"><Eye size={20} /></Button>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-full"><Trash2 size={20} /></Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No materials published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}