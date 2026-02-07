import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Maximize2, Type, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

export default function NoteReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const fetchNote = async () => {
      const res = await axios.get(`/api/v1/academic/read/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNote(res.data.data);
    };
    fetchNote();
  }, [id]);

  if (!note) return <div className="p-10"><Skeleton className="h-[600px] w-full" /></div>;

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-700">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> Back
          </Button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <h2 className="font-semibold text-slate-700">{note.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFontSize(f => f + 2)}>
            <Type size={16} />+
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFontSize(f => Math.max(12, f - 2))}>
            <Type size={16} />-
          </Button>
          <Button className="bg-indigo-600">
            <Download size={16} className="mr-2" /> Save PDF
          </Button>
        </div>
      </div>

      {/* SPLIT VIEW AREA */}
      <div className="flex-1 grid md:grid-cols-2 gap-6 overflow-hidden min-h-0">
        {/* LEFT: THE ORIGINAL SCAN */}
        <div className="bg-slate-200 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden relative group">
          <img 
            src={note.fileUrl} 
            alt="Original Scan" 
            className="w-full h-full object-contain p-4"
          />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge className="bg-black/50 text-white backdrop-blur-sm">Original Handwritten Note</Badge>
          </div>
        </div>

        {/* RIGHT: THE AI TRANSCRIPTION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto p-8 prose prose-slate max-w-none">
          <Badge className="mb-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none">
            AI-Transcribed Text
          </Badge>
          <div 
            style={{ fontSize: `${fontSize}px` }} 
            className="text-slate-800 leading-relaxed font-serif whitespace-pre-wrap"
          >
            {note.transcription || "Processing transcription..."}
          </div>
        </div>
      </div>
    </div>
  );
}