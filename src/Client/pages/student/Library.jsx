import React, { useState, useEffect } from "react";
import {
  Search,
  FileText,
  PlayCircle,
  BookOpen,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SubjectLibrary() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await api.get("/academic/library");
        setMaterials(res.data.data);
      } catch (err) {
        toast.error("Library sync failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const handleViewVideo = (url) => {
    if (!url) return toast.error("Asset link is missing.");
    window.open(url, "_blank");
  };

  const handleResourceClick = (item) => {
    if (item.contentType === "video") {
      handleViewVideo(item.fileUrl);
    } else {
      navigate(`/student/read/${item._id}`);
    }
  };

  const filtered = materials.filter((item) => {
    const matchesSearch =
      item.subject?.toLowerCase().includes(search.toLowerCase()) ||
      item.title?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || item.contentType === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto p-4 md:p-8">
      
      {/* 1. RESPONSIVE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="w-full lg:w-auto">
          <Badge className="bg-indigo-600 mb-2 uppercase font-black italic tracking-widest px-4 py-1 text-[10px]">
            Academic Vault
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Learning <span className="text-indigo-600">Resources</span>
          </h1>
          <p className="text-slate-400 font-bold italic mt-2 uppercase text-[9px] md:text-[10px] tracking-widest">
            Handwritten notes digitized for SS3 Class
          </p>
        </div>

        {/* SEARCH BAR - FULL WIDTH ON MOBILE */}
        <div className="relative w-full lg:w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"
            size={18}
          />
          <Input
            className="pl-12 border-none bg-white shadow-xl shadow-slate-200/50 rounded-2xl h-14 md:h-16 font-bold focus:ring-2 focus:ring-indigo-500 text-base md:text-lg"
            placeholder="Search notes or subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 2. RESPONSIVE TABS - HORIZONTAL SCROLL ON MOBILE */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-[1.5rem] md:rounded-3xl h-14 md:h-16 w-full flex overflow-x-auto no-scrollbar justify-start shadow-inner border border-slate-200/50">
          <TabsTrigger
            value="all"
            className="flex-shrink-0 rounded-xl md:rounded-2xl px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] tracking-widest h-full data-[state=active]:bg-white data-[state=active]:shadow-lg"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="document"
            className="flex-shrink-0 rounded-xl md:rounded-2xl px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] tracking-widest h-full text-indigo-600 data-[state=active]:bg-white data-[state=active]:shadow-lg"
          >
            Study Notes
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="flex-shrink-0 rounded-xl md:rounded-2xl px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] tracking-widest h-full text-amber-600 data-[state=active]:bg-white data-[state=active]:shadow-lg"
          >
            Videos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 3. GRID SYSTEM - ADAPTIVE COLUMNS */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
               <Skeleton className="h-48 md:h-64 w-full rounded-[2rem] md:rounded-[3rem]" />
               <Skeleton className="h-6 w-3/4 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <Card
                key={item._id}
                className="overflow-hidden border-none shadow-2xl shadow-slate-200/40 hover:shadow-indigo-200 transition-all duration-500 group cursor-pointer rounded-[2rem] md:rounded-[3rem] bg-white border-b-[6px] md:border-b-[8px] border-transparent hover:border-indigo-600"
                onClick={() => handleResourceClick(item)}
              >
                <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors" />
                  {item.contentType === "video" ? (
                    <PlayCircle
                      className="text-slate-200 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-700"
                      size={60}
                      md:size={80}
                      strokeWidth={1}
                    />
                  ) : (
                    <FileText
                      className="text-slate-200 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-700"
                      size={60}
                      md:size={80}
                      strokeWidth={1}
                    />
                  )}
                  <Badge
                    className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/90 backdrop-blur-md text-indigo-600 font-black border-none shadow-xl px-3 md:px-4 py-1.5 text-[8px] md:text-[10px] uppercase tracking-tighter italic"
                    variant="outline"
                  >
                    {item.subject}
                  </Badge>
                </div>
                
                <CardContent className="p-6 md:p-8">
                  <h3 className="font-black text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-lg md:text-xl leading-tight italic">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-3 md:mt-4">
                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ready for Review</p>
                  </div>
                </CardContent>

                <CardFooter className="px-6 py-4 md:px-8 md:py-6 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center group-hover:bg-indigo-50/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Instructor</span>
                    <span className="text-[10px] md:text-[12px] font-black text-slate-700 uppercase italic">
                      Teacher {item.uploadedBy?.lastName || "Admin"}
                    </span>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                    <ArrowRight size={18} md:size={22} />
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-24 md:py-40 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[4rem] opacity-60 px-6">
              <Search className="mx-auto text-slate-200 mb-6" size={60} md:size={80} strokeWidth={1} />
              <p className="text-slate-400 font-black uppercase italic text-xs md:text-sm tracking-[0.4em]">
                Vault currently empty
              </p>
            </div>
          )}
        </div>
      )}
    </div>
    
  );
}