import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  ZoomIn,
  ZoomOut,
  Printer,
  Type,
  FileDown,
  Maximize2,
} from "lucide-react";
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
        toast.error("Resource inaccessible.");
        navigate("/student/library");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="p-10 space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid lg:grid-cols-2 gap-8 h-[70vh]">
          <Skeleton className="rounded-[3rem]" />
          <Skeleton className="rounded-[3rem]" />
        </div>
      </div>
    );

  const isVideo = note.contentType === "video";

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 p-2 md:p-0">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-500 font-bold"
          >
            <ChevronLeft size={20} /> Back
          </Button>
          <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
          <div>
            <h2 className="font-black text-slate-800 tracking-tight uppercase italic text-sm md:text-base">
              {note.title}
            </h2>
            <p className="text-[10px] text-indigo-600 font-bold uppercase">
              {note.subject}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setFontSize((f) => Math.min(32, f + 2))}
            >
              <ZoomIn size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setFontSize((f) => Math.max(12, f - 2))}
            >
              <ZoomOut size={16} />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl h-10 border-slate-200 font-bold text-xs"
              onClick={() => window.print()}
            >
              <Printer size={16} className="md:mr-2" />{" "}
              <span className="hidden md:inline">Print</span>
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 h-10 rounded-xl px-6 font-black uppercase italic text-xs tracking-tighter"
              onClick={() => window.open(note.fileUrl, "_blank")}
            >
              <FileDown size={16} className="mr-2" /> Download
            </Button>
          </div>
        </div>
      </div>

      {/* READING CANVAS */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 pb-10">
        {/* SOURCE VIEW */}
        <div
          className={`rounded-[2.5rem] overflow-hidden relative shadow-inner border-2 border-dashed flex flex-col ${isVideo ? "bg-slate-900" : "bg-slate-50 border-slate-200"}`}
        >
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-white/90 backdrop-blur-sm text-slate-500 font-black uppercase text-[8px] tracking-widest">
              {isVideo ? "Lecture Media" : "Original Source"}
            </Badge>
          </div>
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
            {isVideo ? (
              <video
                src={note.fileUrl}
                controls
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={note.fileUrl}
                alt="Source"
                className="max-w-full max-h-full object-contain p-2"
              />
            )}
          </div>
        </div>

        {/* TRANSCRIPT VIEW */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col print:border-none print:shadow-none min-h-[400px]">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between print:hidden">
            <Badge className="bg-indigo-600 text-white font-black uppercase text-[9px]">
              Jeffjol Transcript
            </Badge>
            <Type className="text-slate-100" size={32} />
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div
              style={{ fontSize: `${fontSize}px` }}
              className="text-slate-800 leading-relaxed font-serif whitespace-pre-wrap"
            >
              {note.rawText || (
                <div className="text-center py-20 text-slate-300 italic">
                  No transcript available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
