import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Loader2, ZoomIn, ZoomOut, 
  Printer, Type, FileDown, Maximize2, Smartphone 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; 
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function NoteReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [fontSize, setFontSize] = useState(16); // Slightly smaller default for mobile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/academic/read/${id}`);
        setNote(res.data.data);
      } catch (err) {
        toast.error("Resource inaccessible.");
        navigate("/student/library");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  const handleDownload = () => {
    if (!note?.fileUrl) return toast.error("File source not found.");
    window.open(note.fileUrl, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-1/2 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
        <Skeleton className="rounded-[2rem]" />
        <Skeleton className="rounded-[2rem]" />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto p-3 md:p-6 print:p-0">
      
      {/* 1. MOBILE-FIRST HEADER */}
      <div className="flex flex-col space-y-4 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-xl print:hidden sticky top-0 z-30">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)} 
              className="text-slate-500 h-9 px-2 md:px-4 font-bold"
            >
              <ChevronLeft size={18} /> <span className="hidden md:inline ml-1">Back</span>
            </Button>
            <div className="h-6 w-[1px] bg-slate-100" />
            <div>
              <h2 className="font-black text-slate-900 tracking-tight leading-none uppercase italic text-xs md:text-base line-clamp-1">
                {note.title}
              </h2>
              <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[7px] md:text-[9px] uppercase px-2 py-0 mt-1">
                 {note.subject}
              </Badge>
            </div>
          </div>

          {/* FONT CONTROLS */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 scale-90 md:scale-100">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFontSize(f => Math.min(40, f + 2))}>
              <ZoomIn size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFontSize(f => Math.max(12, f - 2))}>
              <ZoomOut size={16} />
            </Button>
          </div>
        </div>

        {/* ACTION BUTTONS: SWAP LOGIC FOR MOBILE */}
        <div className="flex gap-2 w-full">
          {/* Print is primary on mobile, Outline on desktop */}
          <Button 
            onClick={handlePrint}
            className="flex-1 md:flex-none bg-indigo-600 md:bg-transparent md:border md:border-slate-200 text-white md:text-slate-900 rounded-xl h-11 font-black uppercase italic text-[10px] tracking-widest shadow-lg shadow-indigo-100 md:shadow-none"
          >
            <Printer size={16} className="mr-2" /> Print Transcript
          </Button>

          {/* Download is secondary on mobile, Black on desktop */}
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="flex-1 md:flex-none md:bg-slate-900 md:text-white rounded-xl h-11 font-black uppercase italic text-[10px] tracking-widest border-slate-200 md:border-none"
          >
            <FileDown size={16} className="mr-2" /> <span className="hidden md:inline">Download</span> Source
          </Button>
        </div>
      </div>

      {/* 2. RESPONSIVE READING AREA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-10">
        
        {/* SOURCE VIEW (IMAGE) */}
        <Card className="bg-slate-50 border-none rounded-[2rem] md:rounded-[3rem] overflow-hidden relative shadow-inner flex flex-col print:hidden min-h-[300px] md:min-h-0">
          <div className="p-4 md:p-6 bg-slate-100/50 flex justify-between items-center border-b border-white">
             <Badge className="bg-white text-slate-400 font-black uppercase text-[8px] tracking-widest px-3 py-1 shadow-sm">Source Image</Badge>
             <Maximize2 size={14} className="text-slate-300" />
          </div>
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center bg-white/40">
            {note.contentType === 'video' ? (
              <video src={note.fileUrl} controls className="w-full h-auto rounded-2xl shadow-2xl" />
            ) : (
              <img 
                src={note.fileUrl} 
                alt="Source" 
                className="max-w-full h-auto rounded-lg shadow-xl" 
              />
            )}
          </div>
        </Card>

        {/* TRANSCRIPT VIEW (OCR TEXT) */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col h-full print:border-none print:shadow-none">
          <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between print:hidden">
            <div>
               <Badge className="bg-slate-900 text-white font-black uppercase text-[8px] tracking-[0.2em] px-3 italic">Digital Copy</Badge>
               <div className="flex items-center gap-2 mt-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Live Transcription</p>
               </div>
            </div>
            <Type className="text-slate-100 hidden md:block" size={40} />
          </div>
          
          <div className="flex-1 p-6 md:p-14 overflow-visible">
            <div 
              style={{ fontSize: `${fontSize}px` }} 
              className="text-slate-800 leading-relaxed font-serif whitespace-pre-wrap selection:bg-indigo-100 transition-all duration-300"
            >
              {note.rawText || (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                  <Loader2 className="animate-spin mb-4" size={28} />
                  <p className="font-black uppercase tracking-[0.3em] text-[9px]">Analyzing Pixels...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}