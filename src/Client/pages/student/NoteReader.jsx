import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Type, Download, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api"; 
import { toast } from "sonner";

export default function NoteReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/academic/read/${id}`);
        setNote(res.data.data);
      } catch (err) {
        toast.error(err.message);
        navigate("/student/library");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  if (loading) return (
    <div className="p-10 space-y-6">
      <Skeleton className="h-10 w-1/4" />
      <div className="grid md:grid-cols-2 gap-8 h-[70vh]">
        <Skeleton className="rounded-2xl" />
        <Skeleton className="rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500">
            <ChevronLeft size={20} /> Back
          </Button>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div>
            <h2 className="font-black text-slate-800 tracking-tight">{note.title}</h2>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tighter">{note.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFontSize(f => Math.min(32, f + 2))}>
              <ZoomIn size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFontSize(f => Math.max(12, f - 2))}>
              <ZoomOut size={16} />
            </Button>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Download size={16} className="mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* READING CANVAS */}
      <div className="flex-1 grid md:grid-cols-2 gap-6 min-h-0">
      
        <Card className="bg-slate-50 border-slate-200 rounded-3xl overflow-hidden relative group border-2 border-dashed">
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-500 border-slate-200">
              Scanned Source
            </Badge>
          </div>
          <img 
            src={note.fileUrl} 
            alt="Source Note" 
            className="w-full h-full object-contain p-6"
          />
        </Card>

        {/* RIGHT: TESSERACT EXTRACTED TEXT */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-y-auto p-10 prose prose-slate max-w-none">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <Badge className="bg-indigo-600 text-white border-none">
              Digital Transcript
            </Badge>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Processed via Tesseract OCR</span>
          </div>
          
          <div 
            style={{ fontSize: `${fontSize}px` }} 
            className="text-slate-800 leading-relaxed font-serif whitespace-pre-wrap"
          >
            {note.rawText || (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="italic">Extracting text from image...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function Card({ children, className }) {
  return <div className={`shadow-sm rounded-xl ${className}`}>{children}</div>;
}