import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, Video, Trash2, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

export default function ContentManager() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ title: "", subject: "", targetClass: "", type: "note" });
  const [myContent, setMyContent] = useState([]);

  // Fetch teacher's previously uploaded content
  const fetchMyContent = async () => {
    const res = await axios.get("/api/v1/academic/library", {
       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setMyContent(res.data.data);
  };

  useEffect(() => { fetchMyContent(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file first.");

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("subject", formData.subject);
    data.append("targetClass", formData.targetClass);
    data.append("type", formData.type);

    try {
      await axios.post("/api/v1/academic/upload", data, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Content uploaded and OCR processing started!");
      fetchMyContent();
    } catch (err) {
      toast.error("Upload failed. Check file size.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-5 animate-in fade-in duration-700">
      
      {/* 1. UPLOAD SECTION (LEFT) */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border-slate-200 shadow-sm sticky top-8">
          <CardHeader>
            <CardTitle>Upload New Material</CardTitle>
            <CardDescription>Upload scanned notes for OCR or lecture videos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <UploadCloud className={file ? "text-indigo-600" : "text-slate-400"} size={40} />
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  {file ? file.name : "Click to select or drag & drop"}
                </p>
                <Input 
                  id="file-input" 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files[0])} 
                />
              </div>

              <Input placeholder="Material Title (e.g. Intro to Algebra)" onChange={(e) => setFormData({...formData, title: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Subject" onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                <Select onValueChange={(v) => setFormData({...formData, targetClass: v})}>
                  <SelectTrigger><SelectValue placeholder="Target Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SS1">SS1</SelectItem>
                    <SelectItem value="SS2">SS2</SelectItem>
                    <SelectItem value="SS3">SS3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-indigo-600" disabled={uploading}>
                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing OCR...</> : "Publish to LMS"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 2. RECENT UPLOADS LIST (RIGHT) */}
      <div className="md:col-span-3 space-y-4">
        <h3 className="text-lg font-bold text-slate-800 px-1">Your Published Content</h3>
        {myContent.map((item) => (
          <Card key={item._id} className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${item.type === 'video' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                  {item.type === 'video' ? <Video size={20}/> : <FileText size={20}/>}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">{item.subject}</Badge>
                    <span className="text-xs text-slate-400">• For {item.targetClass}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600">
                  <Eye size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}